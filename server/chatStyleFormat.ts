export function chatStyleFormat(input: string): string {
  if (!input) return "";

  let s = input.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").trim();

  s = s.replace(/^(sure|absolutely|of course|no problem)[,!\s]+/i, "");

  s = s.replace(/[ \t]{2,}/g, " ");

  s = s
    .split("\n")
    .map((line) => {
      const commaCount = (line.match(/,/g) || []).length;
      if (commaCount >= 2 && line.length > 60) {
        const parts = line.split(",").map(p => p.trim()).filter(Boolean);
        if (parts.length >= 2) {
          return parts
            .map((p) => (/[.!?]$/.test(p) ? p : p + "."))
            .join("\n");
        }
      }
      return line;
    })
    .join("\n");

  s = s
    .split("\n")
    .map((line) => {
      const words = line.trim().split(/\s+/).filter(Boolean);
      if (words.length <= 22) return line;

      if (line.includes(". ")) return line.replace(/\. +/g, ".\n");

      const splitAt = Math.min(Math.max(18, Math.floor(words.length / 2)), 24);
      const left = words.slice(0, splitAt).join(" ");
      const right = words.slice(splitAt).join(" ");
      return [left + (/[.!?]$/.test(left) ? "" : "."), right].join("\n");
    })
    .join("\n");

  s = s
    .split(/\n{2,}/)
    .map((para) => {
      const sentences = para
        .split(/(?<=[.!?])\s+/)
        .map(x => x.trim())
        .filter(Boolean);

      if (sentences.length <= 2) return para.trim();

      const first = sentences.slice(0, 2).join(" ");
      const rest = sentences.slice(2).join(" ");
      return first.trim() + "\n\n" + rest.trim();
    })
    .join("\n\n");

  const qCount = (s.match(/\?/g) || []).length;
  if (qCount >= 2) {
    s = s.replace(/\? +/g, "?\n");
  }

  s = s.replace(/\n{3,}/g, "\n\n").trim();

  return s;
}

export function appendConfirmation(text: string, confirmation?: string): string {
  if (!confirmation) return text;
  const t = text.trim();
  return `${t}\n\n${confirmation}`;
}
