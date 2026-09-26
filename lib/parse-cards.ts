// Turns pasted text into cards. One card per line, term and definition split
// by the first tab, " - ", " – ", " — ", ":", or "=". Lines without a
// separator are skipped.

const separators = ["\t", " - ", " – ", " — ", ":", "="];

export function parseCards(text: string) {
  const cards: { front: string; back: string }[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "").trim(); // strip bullets / numbering
    if (!line) continue;
    for (const sep of separators) {
      const i = line.indexOf(sep);
      if (i > 0) {
        const front = line.slice(0, i).trim();
        const back = line.slice(i + sep.length).trim();
        if (front && back) cards.push({ front, back });
        break;
      }
    }
  }
  return cards;
}
