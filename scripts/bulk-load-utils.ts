export function parseOptionalPositiveInt(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function chunkText(text: string): string[] {
  const chunkSize = 600;
  const chunkOverlap = 60;
  const paragraphs = text.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const clean = para.trim().replace(/\s+/g, " ");
    if (!clean || clean.length < 30) continue;

    if ((current + " " + clean).length > chunkSize) {
      if (current) chunks.push(current.trim());
      const overlapText = current.slice(-chunkOverlap);
      current = `${overlapText} ${clean}`;
    } else {
      current += `${current ? " " : ""}${clean}`;
    }
  }

  if (current.trim().length > 50) chunks.push(current.trim());
  return chunks;
}

export function selectChunksForBook(text: string, maxChunks = 300) {
  const generatedChunks = chunkText(text);
  return {
    generatedChunks,
    selectedChunks: generatedChunks.slice(0, maxChunks),
  };
}
