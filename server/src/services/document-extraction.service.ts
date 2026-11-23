import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";

interface ExtractedPage {
  pageNumber: number;
  text: string;
}

interface PdfExtractionResult {
  text: string;
  pages: ExtractedPage[];
  totalPages: number;
}

export const extractPdfText = async (
  buffer: Buffer,
): Promise<PdfExtractionResult> => {
  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;

  const pages: ExtractedPage[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .filter((item) => "str" in item)
      .map((item) => item.str)
      .join(" ")
      .trim();

    pages.push({
      pageNumber,
      text: pageText,
    });

    page.cleanup();
  }

  return {
    text: pages.map((page) => page.text).join("\n\n"),
    pages,
    totalPages: pdf.numPages,
  };
};

export const extractDocxText = async (buffer: Buffer): Promise<string> => {
  const result = await mammoth.extractRawText({
    buffer,
  });

  return result.value.trim();
};

export const extractTxtText = async (buffer: Buffer): Promise<string> => {
  return buffer.toString("utf-8").trim();
};

export const extractDocumentText = async (
  buffer: Buffer,
  fileType: "pdf" | "docx" | "txt",
): Promise<string | PdfExtractionResult> => {
  switch (fileType) {
    case "pdf":
      return extractPdfText(buffer);

    case "docx":
      return extractDocxText(buffer);

    case "txt":
      return extractTxtText(buffer);

    default:
      throw new Error("Unsupported document format");
  }
};
