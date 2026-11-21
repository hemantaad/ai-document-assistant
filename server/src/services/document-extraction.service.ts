import fs from "node:fs/promises";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import mammoth from "mammoth";
import path from "node:path";

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
  filePath: string,
): Promise<PdfExtractionResult> => {
  const fileBuffer = await fs.readFile(filePath);

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(fileBuffer),
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

export const extractDocxText = async (filePath: string): Promise<string> => {
  const result = await mammoth.extractRawText({
    path: filePath,
  });

  return result.value.trim();
};

export const extractTxtText = async (filePath: string): Promise<string> => {
  const content = await fs.readFile(filePath, "utf-8");

  return content.trim();
};

export const extractDocumentText = async (
  filePath: string,
): Promise<string | PdfExtractionResult> => {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".pdf":
      return extractPdfText(filePath);

    case ".docx":
      return extractDocxText(filePath);

    case ".txt":
      return extractTxtText(filePath);

    default:
      throw new Error("Unsupported document format");
  }
};
