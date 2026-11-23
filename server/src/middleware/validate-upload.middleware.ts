import type { RequestHandler } from "express";
import { fileTypeFromBuffer } from "file-type";
import path from "node:path";

const validateUpload: RequestHandler = async (req, res, next) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      message: "Please upload a file",
    });
  }

  try {
    const extension = path.extname(file.originalname).toLowerCase();

    const allowedExtensions = [".pdf", ".docx", ".txt"];

    if (!allowedExtensions.includes(extension)) {
      return res.status(400).json({
        message: "Only PDF, DOCX, and TXT files are allowed",
      });
    }

    if (extension === ".pdf" || extension === ".docx") {
      const detectedType = await fileTypeFromBuffer(file.buffer);

      const expectedMimeType =
        extension === ".pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

      if (detectedType?.mime !== expectedMimeType) {
        return res.status(400).json({
          message:
            extension === ".pdf"
              ? "The uploaded file is not a valid PDF"
              : "The uploaded file is not a valid DOCX document",
        });
      }
    }

    if (extension === ".txt") {
      try {
        const text = new TextDecoder("utf-8", {
          fatal: true,
        }).decode(file.buffer);

        if (text.includes("\0")) {
          throw new Error("Binary content detected");
        }
      } catch {
        return res.status(400).json({
          message: "The uploaded file must contain valid UTF-8 text",
        });
      }
    }

    next();
  } catch (error) {
    console.error("File validation error:", error);

    return res.status(400).json({
      message: "Unable to validate the uploaded file",
    });
  }
};

export default validateUpload;
