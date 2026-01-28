export type ExtractedCommand = {
  tool: string;
  raw: string;
  jsonText?: string;
};

const COMMANDS = [
  "CREATE_TASK",
  "CREATE_CHECKLIST",
  "ROLLING_TASKS",
  "PRINT_REQUEST",
  "SUMMARIZE_REQUEST",
  "TEMPLATE_REQUEST",
  "HIGH_PRIORITY_REQUEST",
  "SHARE_SCHEDULE",
] as const;

export function extractFirstCommand(text: string): ExtractedCommand | null {
  if (!text) return null;
  
  const hits = COMMANDS
    .map(cmd => ({ cmd, idx: text.indexOf(cmd + ":") }))
    .filter(h => h.idx >= 0)
    .sort((a, b) => a.idx - b.idx);

  if (!hits.length) return null;

  const { cmd, idx } = hits[0];
  const afterColon = text.slice(idx + cmd.length + 1).trim();
  
  // For non-JSON commands (PRINT_REQUEST, simple values), take first word/line
  const firstLine = afterColon.split('\n')[0].trim();
  
  // Use bracket counting for more robust JSON extraction
  const jsonText = extractBalancedJson(afterColon);

  return {
    tool: cmd,
    raw: firstLine,
    jsonText: jsonText || undefined,
  };
}

function extractBalancedJson(text: string): string | null {
  const trimmed = text.trim();
  const startChar = trimmed[0];
  
  if (startChar !== '{' && startChar !== '[') {
    const jsonStart = trimmed.search(/[\[{]/);
    if (jsonStart === -1) return null;
    return extractBalancedJson(trimmed.slice(jsonStart));
  }
  
  const closeChar = startChar === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escape = false;
  
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    
    if (escape) {
      escape = false;
      continue;
    }
    
    if (char === '\\' && inString) {
      escape = true;
      continue;
    }
    
    if (char === '"') {
      inString = !inString;
      continue;
    }
    
    if (inString) continue;
    
    if (char === startChar) depth++;
    if (char === closeChar) depth--;
    
    if (depth === 0) {
      return trimmed.slice(0, i + 1);
    }
  }
  
  return null;
}

export function extractAllCommands(text: string): ExtractedCommand[] {
  if (!text) return [];
  
  const results: ExtractedCommand[] = [];
  
  for (const cmd of COMMANDS) {
    const pattern = new RegExp(`${cmd}:\\s*`, 'g');
    let match;
    
    while ((match = pattern.exec(text)) !== null) {
      const afterColon = text.slice(match.index + match[0].length);
      const endIdx = COMMANDS.reduce((minIdx, otherCmd) => {
        if (otherCmd === cmd) return minIdx;
        const nextIdx = afterColon.indexOf(otherCmd + ":");
        return nextIdx >= 0 && nextIdx < minIdx ? nextIdx : minIdx;
      }, afterColon.length);
      
      const segment = afterColon.slice(0, endIdx).trim();
      const jsonMatch = segment.match(/^[\s]*([\[{][\s\S]*?[\]}])/);
      
      results.push({
        tool: cmd,
        raw: segment,
        jsonText: jsonMatch ? jsonMatch[1] : undefined,
      });
    }
  }
  
  return results;
}

export function safeJsonParse<T = any>(s?: string): T | null {
  if (!s) return null;
  
  try {
    return JSON.parse(s) as T;
  } catch {
    try {
      const cleaned = s
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/'/g, '"');
      return JSON.parse(cleaned) as T;
    } catch {
      return null;
    }
  }
}

export function parseToolPayload(tool: string, raw: string, jsonText?: string): any {
  if (tool === "PRINT_REQUEST") {
    return raw.split(/\s+/)[0]?.trim().toLowerCase();
  }
  
  if (tool === "SUMMARIZE_REQUEST") {
    const parts = raw.split("|").map(s => s.trim());
    if (parts.length >= 2) {
      return { mode: parts[0] || "summary", url: parts[1] };
    }
    const urlMatch = raw.match(/https?:\/\/[^\s]+/);
    if (urlMatch) {
      return { mode: "summary", url: urlMatch[0] };
    }
    return null;
  }
  
  if (tool === "TEMPLATE_REQUEST") {
    const name = raw.replace(/^\[|\]$/g, "").trim();
    return { template_name: name || raw.trim() };
  }
  
  if (tool === "HIGH_PRIORITY_REQUEST") {
    return { value: raw.toLowerCase().includes("true") };
  }
  
  // For ROLLING_TASKS, handle both array and object formats
  if (tool === "ROLLING_TASKS") {
    const parsed = safeJsonParse(jsonText);
    if (Array.isArray(parsed)) {
      return { tasks: parsed };
    }
    return parsed;
  }
  
  return safeJsonParse(jsonText);
}
