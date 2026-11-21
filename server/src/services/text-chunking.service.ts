export interface TextChunk {
  index: number;
  content: string;
  startChar: number;
  endChar: number;
}

const CHUNK_SIZE = 4000;
const CHUNK_OVERLAP = 500;

export const splitTextIntoChunks = (
  text: string,
  chunkSize: number = CHUNK_SIZE,
  overlap: number = CHUNK_OVERLAP,
): TextChunk[] => {
  const normalizedText = text.trim();

  if (!normalizedText) {
    return [];
  }

  if (chunkSize <= 0 || overlap < 0 || overlap >= chunkSize) {
    throw new Error("Invalid chunk size or overlap configuration");
  }

  const chunks: TextChunk[] = [];

  let start = 0;

  while (start < normalizedText.length) {
    let end = Math.min(start + chunkSize, normalizedText.length);

    if (end < normalizedText.length) {
      const paragraphBoundary = normalizedText.lastIndexOf("\n\n", end);
      const sentenceBoundary = normalizedText.lastIndexOf(". ", end);
      const wordBoundary = normalizedText.lastIndexOf(" ", end);

      const boundary = Math.max(
        paragraphBoundary,
        sentenceBoundary,
        wordBoundary,
      );

      if (boundary > start + chunkSize * 0.7) {
        end = boundary;
      }
    }

    const rawContent = normalizedText.slice(start, end);
    const content = rawContent.trim();

    if (content) {
      const leadingWhitespace =
        rawContent.length - rawContent.trimStart().length;
      const trailingWhitespace =
        rawContent.length - rawContent.trimEnd().length;

      chunks.push({
        index: chunks.length,
        content,
        startChar: start + leadingWhitespace,
        endChar: end - trailingWhitespace,
      });
    }

    if (end >= normalizedText.length) {
      break;
    }

    // Calculate the next starting position while preserving overlap.
    let nextStart = Math.max(start + 1, end - overlap);

    // Advance to the next word boundary if the position is inside a word.
    while (
      nextStart < normalizedText.length &&
      !/\s/.test(normalizedText[nextStart - 1] ?? "")
    ) {
      nextStart++;
    }

    start = nextStart;
  }

  return chunks;
};
