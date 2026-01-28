import * as cheerio from "cheerio";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { chatWithGemini } from "./gemini";
import { URL } from "url";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = "gpt-4o";

const FETCH_TIMEOUT_MS = 30000; // 30 seconds timeout

export interface SummarizationResult {
  summary: string;
  accessible?: string;
  highlighted?: string;
  pdfToken?: string;
  downloadUrl?: string;
}

export class WebSummarizer {
  /**
   * Validates URL to prevent SSRF attacks
   * Blocks private IP ranges, localhost, IPv6, alternate encodings, and non-HTTP(S) protocols
   */
  private validateUrl(urlString: string): void {
    let parsedUrl: URL;
    
    try {
      parsedUrl = new URL(urlString);
    } catch (error) {
      throw new Error('Invalid URL format');
    }

    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Only HTTP and HTTPS protocols are allowed');
    }

    const hostname = parsedUrl.hostname.toLowerCase();

    // Block localhost variations (including IPv6)
    const localhostPatterns = [
      'localhost',
      '127.0.0.1',
      '0.0.0.0',
      '::1',
      '0:0:0:0:0:0:0:1',
      '::ffff:127.0.0.1',
      '0000:0000:0000:0000:0000:0000:0000:0001'
    ];
    
    if (localhostPatterns.includes(hostname)) {
      throw new Error('Access to localhost is not allowed');
    }

    // Check for IPv6 addresses (in brackets like [::1] or without)
    if (hostname.includes(':') || hostname.startsWith('[')) {
      // Remove brackets if present
      const ipv6Host = hostname.replace(/^\[|\]$/g, '');
      
      // Block IPv6 private/local ranges
      const ipv6PrivatePatterns = [
        /^::1$/,                          // Loopback
        /^::ffff:127\./,                  // IPv4-mapped loopback
        /^fe80:/i,                        // Link-local (fe80::/10)
        /^fc[0-9a-f]{2}:/i,               // Unique local (fc00::/7)
        /^fd[0-9a-f]{2}:/i,               // Unique local (fd00::/8)
        /^ff[0-9a-f]{2}:/i,               // Multicast (ff00::/8)
        /^::$/,                           // Unspecified
        /^::/,                            // Any address starting with ::
      ];

      for (const pattern of ipv6PrivatePatterns) {
        if (pattern.test(ipv6Host)) {
          throw new Error('Access to private/local IPv6 addresses is not allowed');
        }
      }
    }

    // Block alternate IP encodings and numeric IPs
    // Check for decimal IP encoding (e.g., 2130706433 = 127.0.0.1)
    if (/^\d+$/.test(hostname)) {
      throw new Error('Numeric IP addresses are not allowed');
    }

    // Check for octal encoding (e.g., 0177.0.0.1)
    if (/^0[0-7]+/.test(hostname) || hostname.split('.').some(part => /^0[0-7]+/.test(part))) {
      throw new Error('Octal IP encoding is not allowed');
    }

    // Check for hex encoding (e.g., 0x7f.0.0.1)
    if (/^0x/i.test(hostname) || hostname.split('.').some(part => /^0x/i.test(part))) {
      throw new Error('Hexadecimal IP encoding is not allowed');
    }

    // Block IPv4 private ranges (including shortened forms like 127.1)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const shortenedIpv4Regex = /^(\d{1,3})\.(\d{1,3})$/;  // e.g., 127.1
    
    // Check for shortened IPv4 first
    if (shortenedIpv4Regex.test(hostname) && !ipv4Regex.test(hostname)) {
      throw new Error('Shortened IP addresses are not allowed');
    }

    const ipv4Match = hostname.match(ipv4Regex);
    
    if (ipv4Match) {
      const [, a, b, c, d] = ipv4Match.map(Number);
      
      // Validate IP octets
      if (a > 255 || b > 255 || c > 255 || d > 255) {
        throw new Error('Invalid IP address');
      }
      
      // Block private IP ranges
      if (
        a === 10 || // 10.0.0.0/8
        (a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12
        (a === 192 && b === 168) || // 192.168.0.0/16
        (a === 169 && b === 254) || // 169.254.0.0/16 (link-local)
        a === 127 || // 127.0.0.0/8 (loopback)
        a === 0 || // 0.0.0.0/8 (current network)
        a >= 224 // 224.0.0.0/4 (multicast and reserved)
      ) {
        throw new Error('Access to private IP addresses is not allowed');
      }
    }

    // Block common internal domain patterns
    const internalDomainPatterns = [
      /\.local$/,
      /\.internal$/,
      /\.lan$/,
      /\.intranet$/,
      /^metadata\.google\.internal$/,
      /^169\.254\.169\.254$/, // AWS metadata endpoint
      /^metadata\.azure\.com$/, // Azure metadata endpoint
      /^metadata\.packet\.net$/, // Packet metadata endpoint
    ];

    for (const pattern of internalDomainPatterns) {
      if (pattern.test(hostname)) {
        throw new Error('Access to internal domains is not allowed');
      }
    }
  }

  /**
   * Fetch with timeout to prevent hanging requests
   */
  private async fetchWithTimeout(url: string, timeoutMs: number = FETCH_TIMEOUT_MS): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': 'AIChecklist-WebSummarizer/1.0'
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout: URL took too long to respond');
      }
      throw error;
    }
  }

  async extractTextFromUrl(url: string): Promise<string> {
    try {
      // Validate URL for SSRF protection
      this.validateUrl(url);
      
      const response = await this.fetchWithTimeout(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch URL: ${response.statusText}`);
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      // Remove script, style, and nav elements
      $('script, style, nav, header, footer').remove();

      // Get text from body
      const text = $('body').text()
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
        .trim();

      if (!text || text.length < 100) {
        throw new Error('Extracted text is too short or empty');
      }

      // Limit text length to avoid token limits (approximately 50k characters = ~12k tokens)
      return text.substring(0, 50000);
    } catch (error) {
      throw new Error(`Failed to extract text from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateSummary(text: string): Promise<string> {
    const prompt = `Provide a comprehensive cliff-notes summary with:
1. Main topic and purpose
2. Key points and insights (bullet format)
3. Important takeaways
4. Any actionable items or conclusions

TEXT TO SUMMARIZE:
${text}`;

    let openaiError: string | null = null;

    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "Unable to generate summary.";
    } catch (error) {
      openaiError = error instanceof Error ? error.message : 'Unknown error';
      console.error('OpenAI summary failed, trying Gemini fallback...', error);
      
      try {
        const geminiResponse = await chatWithGemini(
          [{ role: "user", content: prompt }],
          "You are an expert at creating concise, insightful summaries of web content."
        );
        console.log('✓ Gemini fallback successful for summary generation');
        return geminiResponse;
      } catch (geminiError) {
        const geminiErrorMsg = geminiError instanceof Error ? geminiError.message : 'Unknown error';
        throw new Error(
          `Failed to generate summary. OpenAI error: ${openaiError}. Gemini error: ${geminiErrorMsg}. ` +
          `Please try again or check if the AI services are available.`
        );
      }
    }
  }

  async generateAccessibleVersion(summary: string): Promise<string> {
    const prompt = `Rewrite this summary in a dyslexia and ADHD-friendly style:

REQUIREMENTS:
- Use short, simple sentences (max 15 words each)
- Break into clear bullet points
- Use concrete, specific language
- Avoid jargon unless necessary
- High readability (6th-8th grade level)
- Group related ideas together

SUMMARY TO MAKE ACCESSIBLE:
${summary}`;

    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content || summary;
    } catch (error) {
      console.error('OpenAI accessible version failed, trying Gemini fallback...', error);
      
      try {
        const geminiResponse = await chatWithGemini(
          [{ role: "user", content: prompt }],
          "You are an expert at making content accessible for people with dyslexia and ADHD."
        );
        console.log('✓ Gemini fallback successful for accessible version');
        return geminiResponse;
      } catch (geminiError) {
        console.error('Both AI services failed for accessible version, using original summary', geminiError);
        return summary; // Fallback to original summary
      }
    }
  }

  async generateHighlightedVersion(summary: string): Promise<string> {
    const prompt = `Review this summary and mark the 10 most important sentences or phrases with **HIGHLIGHT** at the start of each line.

Focus on:
- Key insights and conclusions
- Critical facts or data
- Actionable items
- Main arguments or themes

SUMMARY TO HIGHLIGHT:
${summary}`;

    try {
      const response = await openai.chat.completions.create({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.5,
      });

      return response.choices[0].message.content || summary;
    } catch (error) {
      console.error('OpenAI highlighting failed, trying Gemini fallback...', error);
      
      try {
        const geminiResponse = await chatWithGemini(
          [{ role: "user", content: prompt }],
          "You are an expert at identifying and highlighting the most important information in text."
        );
        console.log('✓ Gemini fallback successful for highlighting');
        return geminiResponse;
      } catch (geminiError) {
        console.error('Both AI services failed for highlighting, using original summary', geminiError);
        return summary; // Fallback to original summary
      }
    }
  }

  async generatePdf(content: string, filename: string = `summary-${Date.now()}.pdf`): Promise<string> {
    return new Promise((resolve, reject) => {
      let docEnded = false;
      let streamFinished = false;
      let hasError = false;
      
      try {
        // Ensure pdfs directory exists
        const pdfDir = path.join(process.cwd(), 'pdfs');
        if (!fs.existsSync(pdfDir)) {
          fs.mkdirSync(pdfDir, { recursive: true });
        }

        const filePath = path.join(pdfDir, filename);
        
        // Professional margins: 72 points (1 inch) on all sides
        const doc = new PDFDocument({ 
          margin: 72,
          size: 'LETTER',
          bufferPages: true // Enable page numbering
        });
        
        const stream = fs.createWriteStream(filePath);

        // Handle stream errors
        stream.on('error', (error) => {
          if (!hasError) {
            hasError = true;
            reject(new Error(`PDF write stream failed: ${error.message}`));
          }
        });

        // Track when stream finishes
        stream.on('finish', () => {
          streamFinished = true;
          
          // Only resolve when both doc.end() and stream finish
          if (docEnded && !hasError) {
            // Verify file was written successfully
            if (fs.existsSync(filePath)) {
              resolve(filePath);
            } else {
              reject(new Error('PDF file was not written to disk'));
            }
          }
        });

        doc.pipe(stream);

        // Professional color palette
        const colors = {
          primary: '#1e40af',      // Dark blue for headings
          secondary: '#6b7280',    // Gray for secondary text
          text: '#1f2937',         // Dark gray for body text
          highlight: '#f3f4f6',    // Light gray background for highlights
          divider: '#d1d5db'       // Light gray for divider lines
        };

        // Helper function to clean markdown formatting and convert to proper formatting
        const cleanMarkdown = (text: string): string => {
          return text
            .replace(/\*\*\*(.+?)\*\*\*/g, '$1')  // Remove triple asterisks (bold+italic)
            .replace(/\*\*(.+?)\*\*\*/g, '$1')    // Remove double asterisks at start with triple at end
            .replace(/\*\*(.+?)\*\*/g, '$1')      // Remove bold markers
            .replace(/\*(.+?)\*/g, '$1')          // Remove italic markers
            .replace(/^(\s*)\* /gm, '$1• ')       // Convert asterisk bullets to bullet points (preserves indentation)
            .replace(/\*/g, '');                   // Remove any remaining asterisks
        };

        // Clean the content before processing
        const cleanedContent = cleanMarkdown(content);

        // Parse content to extract sections
        const lines = cleanedContent.split('\n');
        let url = '';
        let isWebpage = false;
        let summaryContent = '';
        let accessibleContent = '';
        let highlightedContent = '';
        
        let currentSection = 'summary';
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          if (line.startsWith('WEBPAGE SUMMARY')) {
            isWebpage = true;
            currentSection = 'url';
            continue;
          } else if (line.startsWith('TEXT SUMMARY')) {
            isWebpage = false;
            currentSection = 'summary';
            continue;
          } else if (line.includes('ACCESSIBLE VERSION')) {
            currentSection = 'accessible';
            continue;
          } else if (line.includes('HIGHLIGHTED IMPORTANT POINTS') || line.includes('KEY INSIGHTS')) {
            currentSection = 'highlighted';
            continue;
          }
          
          if (currentSection === 'url' && line.trim() && !url) {
            url = line.trim();
            currentSection = 'summary';
          } else if (currentSection === 'summary') {
            summaryContent += line + '\n';
          } else if (currentSection === 'accessible') {
            accessibleContent += line + '\n';
          } else if (currentSection === 'highlighted') {
            highlightedContent += line + '\n';
          }
        }

        // Helper function to add horizontal divider
        const addDivider = () => {
          const y = doc.y + 15;
          doc.strokeColor(colors.divider)
             .lineWidth(1)
             .moveTo(72, y)
             .lineTo(doc.page.width - 72, y)
             .stroke();
          doc.moveDown(1.5);
        };

        // Helper function to add page header (not on cover page)
        const addPageHeader = () => {
          const currentPage = doc.bufferedPageRange().start + doc.bufferedPageRange().count;
          
          if (currentPage > 1) {
            doc.fontSize(9)
               .font('Helvetica')
               .fillColor(colors.secondary)
               .text('AIChecklist.io Web Analysis Report', 72, 40, {
                 align: 'left',
                 width: doc.page.width - 144
               });
            
            // Header divider line
            doc.strokeColor(colors.divider)
               .lineWidth(0.5)
               .moveTo(72, 55)
               .lineTo(doc.page.width - 72, 55)
               .stroke();
          }
        };

        // Helper function to check if we need a new page
        const checkPageBreak = (neededSpace: number = 100) => {
          if (doc.y > doc.page.height - 120) {
            doc.addPage();
            addPageHeader();
          }
        };

        // Helper function to add section heading
        const addSectionHeading = (title: string, level: number = 1) => {
          checkPageBreak(80);
          
          const sizes = [20, 16, 14];
          const fontSize = sizes[level - 1] || 12;
          
          doc.moveDown(level === 1 ? 1.5 : 1)
             .fontSize(fontSize)
             .font('Helvetica-Bold')
             .fillColor(colors.primary)
             .text(title, {
               align: 'left'
             })
             .moveDown(0.8);
          
          // Add subtle underline for H1
          if (level === 1) {
            const y = doc.y;
            doc.strokeColor(colors.primary)
               .lineWidth(2)
               .moveTo(72, y)
               .lineTo(200, y)
               .stroke();
            doc.moveDown(0.5);
          }
        };

        // Helper function to add body text
        const addBodyText = (text: string) => {
          checkPageBreak();
          
          doc.fontSize(11)
             .font('Helvetica')
             .fillColor(colors.text)
             .text(text.trim(), {
               align: 'left',
               lineGap: 4
             })
             .moveDown(0.8);
        };

        // Helper function to add bullet point
        const addBulletPoint = (text: string, indent: number = 0) => {
          checkPageBreak();
          
          const x = 72 + (indent * 20);
          const bulletX = x;
          const textX = x + 15;
          
          // Draw bullet
          doc.fontSize(11)
             .font('Helvetica')
             .fillColor(colors.primary)
             .text('•', bulletX, doc.y);
          
          // Add text
          doc.fillColor(colors.text)
             .text(text.trim().replace(/^[-•]\s*/, ''), textX, doc.y - 11, {
               width: doc.page.width - textX - 72,
               lineGap: 3
             })
             .moveDown(0.5);
        };

        // Helper function to add highlighted text box
        const addHighlightedText = (text: string) => {
          checkPageBreak(60);
          
          const boxPadding = 12;
          const textWidth = doc.page.width - 144 - (boxPadding * 2);
          const textY = doc.y;
          
          // Prepare text options
          const textOptions = {
            width: textWidth,
            lineGap: 4
          };
          
          const cleanedText = text.trim().replace('HIGHLIGHT', '').trim();
          
          // Calculate text height using heightOfString (without drawing)
          doc.fontSize(11).font('Helvetica-Bold');
          const textHeight = doc.heightOfString(cleanedText, textOptions);
          
          const boxHeight = textHeight + 10;
          
          // Save the graphics state
          doc.save();
          
          // Draw the background rectangle FIRST
          doc.rect(72, textY - 5, doc.page.width - 144, boxHeight)
             .fillAndStroke(colors.highlight, colors.divider);
          
          // Restore graphics state
          doc.restore();
          
          // Now draw the text ON TOP of the background
          doc.fontSize(11)
             .font('Helvetica-Bold')
             .fillColor(colors.text)
             .text(cleanedText, 72 + boxPadding, textY, textOptions);
          
          doc.moveDown(0.8);
        };

        // ===================
        // COVER PAGE
        // ===================
        
        // Add vertical space
        doc.moveDown(8);
        
        // Main title
        doc.fontSize(32)
           .font('Helvetica-Bold')
           .fillColor(colors.primary)
           .text('AIChecklist.io', { align: 'center' })
           .moveDown(0.3);
        
        doc.fontSize(24)
           .font('Helvetica')
           .fillColor(colors.text)
           .text('Web Analysis Report', { align: 'center' })
           .moveDown(3);
        
        // Decorative line
        const centerY = doc.y;
        doc.strokeColor(colors.primary)
           .lineWidth(3)
           .moveTo(doc.page.width / 2 - 100, centerY)
           .lineTo(doc.page.width / 2 + 100, centerY)
           .stroke();
        
        doc.moveDown(3);
        
        // URL if present
        if (url) {
          doc.fontSize(12)
             .font('Helvetica-Bold')
             .fillColor(colors.secondary)
             .text('Source URL:', { align: 'center' })
             .moveDown(0.5);
          
          doc.fontSize(11)
             .font('Helvetica')
             .fillColor(colors.text)
             .text(url, { align: 'center', width: doc.page.width - 144 })
             .moveDown(3);
        }
        
        // Generation date
        const generationDate = new Date().toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor(colors.secondary)
           .text(`Generated: ${generationDate}`, { align: 'center' })
           .moveDown(8);
        
        // Branding footer on cover
        doc.fontSize(10)
           .font('Helvetica-Oblique')
           .fillColor(colors.secondary)
           .text('Powered by AIDOMO AI Assistant', { align: 'center' });

        // ===================
        // CONTENT PAGES
        // ===================
        
        // Start new page for content
        doc.addPage();
        addPageHeader();
        
        // Executive Summary Section
        addSectionHeading('Executive Summary', 1);
        
        const summaryLines = summaryContent.trim().split('\n');
        let currentIndent = 0;
        
        for (const line of summaryLines) {
          const trimmed = line.trim();
          
          if (!trimmed) continue;
          
          if (trimmed.startsWith('###')) {
            addSectionHeading(trimmed.replace(/###/g, '').trim(), 2);
          } else if (trimmed.startsWith('##')) {
            addSectionHeading(trimmed.replace(/##/g, '').trim(), 3);
          } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
            // Detect indentation level
            const leadingSpaces = line.search(/\S/);
            currentIndent = Math.floor(leadingSpaces / 2);
            addBulletPoint(trimmed, currentIndent);
          } else if (trimmed.startsWith('HIGHLIGHT')) {
            addHighlightedText(trimmed);
          } else {
            addBodyText(trimmed);
          }
        }
        
        // ADHD & Dyslexia-Friendly Section
        if (accessibleContent.trim()) {
          doc.addPage();
          addPageHeader();
          
          addDivider();
          addSectionHeading('ADHD & Dyslexia-Friendly Version', 1);
          
          doc.fontSize(10)
             .font('Helvetica-Oblique')
             .fillColor(colors.secondary)
             .text('Simplified for easy reading with short sentences and clear structure', {
               align: 'left'
             })
             .moveDown(1);
          
          const accessibleLines = accessibleContent.trim().split('\n');
          
          for (const line of accessibleLines) {
            const trimmed = line.trim();
            
            if (!trimmed) continue;
            
            if (trimmed.startsWith('###')) {
              addSectionHeading(trimmed.replace(/###/g, '').trim(), 2);
            } else if (trimmed.startsWith('##')) {
              addSectionHeading(trimmed.replace(/##/g, '').trim(), 3);
            } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
              const leadingSpaces = line.search(/\S/);
              currentIndent = Math.floor(leadingSpaces / 2);
              addBulletPoint(trimmed, currentIndent);
            } else {
              addBodyText(trimmed);
            }
          }
        }
        
        // Key Insights Section
        if (highlightedContent.trim()) {
          doc.addPage();
          addPageHeader();
          
          addDivider();
          addSectionHeading('Key Insights & Highlights', 1);
          
          doc.fontSize(10)
             .font('Helvetica-Oblique')
             .fillColor(colors.secondary)
             .text('The most important points extracted from the analysis', {
               align: 'left'
             })
             .moveDown(1);
          
          const highlightLines = highlightedContent.trim().split('\n');
          
          for (const line of highlightLines) {
            const trimmed = line.trim();
            
            if (!trimmed) continue;
            
            if (trimmed.startsWith('HIGHLIGHT')) {
              addHighlightedText(trimmed);
            } else if (trimmed.startsWith('###')) {
              addSectionHeading(trimmed.replace(/###/g, '').trim(), 2);
            } else if (trimmed.startsWith('##')) {
              addSectionHeading(trimmed.replace(/##/g, '').trim(), 3);
            } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
              const leadingSpaces = line.search(/\S/);
              currentIndent = Math.floor(leadingSpaces / 2);
              addBulletPoint(trimmed, currentIndent);
            } else {
              addBodyText(trimmed);
            }
          }
        }

        // ===================
        // ADD PAGE NUMBERS
        // ===================
        
        const range = doc.bufferedPageRange();
        const totalPages = range.count;
        
        for (let i = 0; i < totalPages; i++) {
          doc.switchToPage(i);
          
          // Skip page numbers on cover page
          if (i === 0) continue;
          
          const pageNumber = i + 1;
          const footerY = doc.page.height - 50;
          
          // Footer divider
          doc.strokeColor(colors.divider)
             .lineWidth(0.5)
             .moveTo(72, footerY - 10)
             .lineTo(doc.page.width - 72, footerY - 10)
             .stroke();
          
          // Page number
          doc.fontSize(9)
             .font('Helvetica')
             .fillColor(colors.secondary)
             .text(
               `Page ${pageNumber} of ${totalPages}`,
               72,
               footerY,
               {
                 align: 'center',
                 width: doc.page.width - 144
               }
             );
          
          // Footer text
          doc.fontSize(8)
             .font('Helvetica-Oblique')
             .fillColor(colors.secondary)
             .text(
               'Generated by AIChecklist.io | Confidential',
               72,
               footerY + 15,
               {
                 align: 'center',
                 width: doc.page.width - 144
               }
             );
        }

        // End the document
        doc.end();
        docEnded = true;

        // If stream already finished, resolve now
        if (streamFinished && !hasError) {
          if (fs.existsSync(filePath)) {
            resolve(filePath);
          } else {
            reject(new Error('PDF file was not written to disk'));
          }
        }
      } catch (error) {
        hasError = true;
        reject(new Error(`PDF setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  }

  async summarizeWebpage(url: string, userId: number, options: {
    includeAccessible?: boolean;
    includeHighlights?: boolean;
    generatePdf?: boolean;
  } = {}): Promise<SummarizationResult> {
    try {
      // Extract text from URL
      const text = await this.extractTextFromUrl(url);

      // Generate summary
      const summary = await this.generateSummary(text);

      const result: SummarizationResult = { summary };

      // Generate accessible version if requested
      if (options.includeAccessible) {
        result.accessible = await this.generateAccessibleVersion(summary);
      }

      // Generate highlighted version if requested
      if (options.includeHighlights) {
        result.highlighted = await this.generateHighlightedVersion(summary);
      }

      // Generate PDF if requested
      if (options.generatePdf) {
        const pdfContent = `WEBPAGE SUMMARY
${url}

${summary}

${result.accessible ? `\n\nACCESSIBLE VERSION (ADHD & Dyslexia-Friendly)\n\n${result.accessible}` : ''}

${result.highlighted ? `\n\nHIGHLIGHTED IMPORTANT POINTS\n\n${result.highlighted}` : ''}`;

        const filePath = await this.generatePdf(pdfContent);
        
        // Import and use PDF download manager
        const { pdfDownloadManager } = await import('./pdfDownloadManager');
        const token = await pdfDownloadManager.registerPdf(filePath, userId);
        
        result.pdfToken = token;
        result.downloadUrl = `/api/pdfs/${token}`;
      }

      return result;
    } catch (error) {
      throw new Error(`Webpage summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async summarizeRawText(text: string, userId: number, options: {
    includeAccessible?: boolean;
    includeHighlights?: boolean;
    generatePdf?: boolean;
  } = {}): Promise<SummarizationResult> {
    try {
      // Generate summary
      const summary = await this.generateSummary(text);

      const result: SummarizationResult = { summary };

      // Generate accessible version if requested
      if (options.includeAccessible) {
        result.accessible = await this.generateAccessibleVersion(summary);
      }

      // Generate highlighted version if requested
      if (options.includeHighlights) {
        result.highlighted = await this.generateHighlightedVersion(summary);
      }

      // Generate PDF if requested
      if (options.generatePdf) {
        const pdfContent = `TEXT SUMMARY

${summary}

${result.accessible ? `\n\nACCESSIBLE VERSION (ADHD & Dyslexia-Friendly)\n\n${result.accessible}` : ''}

${result.highlighted ? `\n\nHIGHLIGHTED IMPORTANT POINTS\n\n${result.highlighted}` : ''}`;

        const filePath = await this.generatePdf(pdfContent);
        
        // Import and use PDF download manager
        const { pdfDownloadManager } = await import('./pdfDownloadManager');
        const token = await pdfDownloadManager.registerPdf(filePath, userId);
        
        result.pdfToken = token;
        result.downloadUrl = `/api/pdfs/${token}`;
      }

      return result;
    } catch (error) {
      throw new Error(`Text summarization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const webSummarizer = new WebSummarizer();
