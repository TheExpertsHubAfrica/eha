export type LegalBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

function isSectionHeading(line: string) {
  if (/^\d+\.\s+/.test(line)) {
    if (/:\s*$/.test(line)) return true;
    if (line.length < 90 && !/\.\s/.test(line)) return true;
  }
  return false;
}

export function parseLegalBody(body: string): LegalBlock[] {
  const blocks: LegalBlock[] = [];
  let paragraph: string[] = [];
  let listItems: string[] = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ type: "p", text: paragraph.join(" ") });
    paragraph = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push({ type: "ul", items: listItems });
    listItems = [];
  };

  for (const raw of body.replace(/\r\n/g, "\n").split("\n")) {
    const line = raw.trim();
    if (!line) {
      flushList();
      flushParagraph();
      continue;
    }

    if (line.startsWith("- ") || line.startsWith("• ")) {
      flushParagraph();
      listItems.push(line.replace(/^[-•]\s+/, ""));
      continue;
    }

    if (listItems.length) flushList();

    if (line.startsWith("# ")) {
      flushParagraph();
      blocks.push({ type: "h2", text: line.slice(2).trim() });
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      blocks.push({ type: "h3", text: line.slice(3).trim() });
      continue;
    }

    if (isSectionHeading(line)) {
      flushParagraph();
      blocks.push({ type: "h3", text: line });
      continue;
    }

    paragraph.push(line);
  }

  flushList();
  flushParagraph();
  return blocks;
}
