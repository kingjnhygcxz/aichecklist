import { Express } from "express";
import { storage } from "./storage";

export function setupSEORoutes(app: Express) {
  // XML Sitemap generation
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const baseUrl = "https://aichecklist.io";
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Static pages with priority and frequency
      const staticPages = [
        { url: "", priority: "1.0", changefreq: "daily" },
        { url: "/calendar", priority: "0.9", changefreq: "weekly" },
        { url: "/templates", priority: "0.9", changefreq: "weekly" },
        { url: "/reports", priority: "0.8", changefreq: "weekly" },
        { url: "/statistics", priority: "0.8", changefreq: "weekly" },
        { url: "/achievements", priority: "0.7", changefreq: "weekly" },
        { url: "/gantt", priority: "0.8", changefreq: "monthly" },
        { url: "/pert", priority: "0.8", changefreq: "monthly" },
        { url: "/projects", priority: "0.8", changefreq: "weekly" },
        { url: "/help", priority: "0.7", changefreq: "weekly" },
        { url: "/auth", priority: "0.6", changefreq: "monthly" },
        { url: "/subscription", priority: "0.7", changefreq: "monthly" },
        { url: "/schedule", priority: "0.7", changefreq: "weekly" },
        { url: "/feedback", priority: "0.5", changefreq: "monthly" },
        { url: "/privacy", priority: "0.3", changefreq: "yearly" },
        { url: "/terms", priority: "0.3", changefreq: "yearly" }
      ];

      // Generate template-specific pages
      const templates = await storage.getTemplates();
      const templatePages = templates.map(template => ({
        url: `/template/${template.id}`,
        priority: "0.7",
        changefreq: "weekly",
        lastmod: template.updatedAt || currentDate
      }));

      // SEO landing pages for programmatic SEO
      const industryPages = [
        "startup", "healthcare", "education", "finance", "manufacturing", 
        "retail", "technology", "construction", "consulting", "marketing"
      ].map(industry => ({
        url: `/checklists/${industry}`,
        priority: "0.6",
        changefreq: "monthly"
      }));

      const allPages = [...staticPages, ...templatePages, ...industryPages];

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod || currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

      res.set('Content-Type', 'application/xml');
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  // Robots.txt
  app.get("/robots.txt", (req, res) => {
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/
Disallow: /shared/
Disallow: /share/
Disallow: /auth/reset-password
Disallow: /*?*
Allow: /api/stats/downloads

# Sitemap
Sitemap: https://aichecklist.io/sitemap.xml

# Crawl delay
Crawl-delay: 1

# Specific bot instructions
User-agent: Googlebot
Allow: /
Crawl-delay: 0

User-agent: Bingbot
Allow: /
Crawl-delay: 1

# Block AI training bots
User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: anthropic-ai
Disallow: /

User-agent: Claude-Web
Disallow: /`;

    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  // Google Search Console verification
  app.get("/google*.html", (req, res) => {
    res.send(`google-site-verification: ${req.params[0]}.html`);
  });

  // Bing Webmaster verification
  app.get("/BingSiteAuth.xml", (req, res) => {
    const bingAuth = `<?xml version="1.0"?>
<users>
  <user>BING_VERIFICATION_CODE_HERE</user>
</users>`;
    res.set('Content-Type', 'application/xml');
    res.send(bingAuth);
  });
}