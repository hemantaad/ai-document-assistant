import type { RequestHandler } from "express";
import { fileTypeFromFile } from "file-type";
import { readFile, unlink } from "node:fs/promises";
import path from "node:path";

const validateUpload: RequestHandler = async (req, res, next) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      message: "Please upload a file",
    });
  }

  const removeFile = async () => {
    await unlink(file.path).catch(() => undefined);
  };

  try {
    const extension = path.extname(file.originalname).toLowerCase();

    const allowedExtensions = [".pdf", ".docx", ".txt"];

    if (!allowedExtensions.includes(extension)) {
      await removeFile();

      return res.status(400).json({
        message: "Only PDF, DOCX, and TXT files are allowed",
      });
    }

    const detectedType = await fileTypeFromFile(file.path);

    if (extension === ".pdf") {
      if (detectedType?.mime !== "application/pdf") {
        await removeFile();

        return res.status(400).json({
          message: "The uploaded file is not a valid PDF",
        });
      }
    }

    if (extension === ".docx") {
      if (
        detectedType?.mime !==
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        await removeFile();

        return res.status(400).json({
          message: "The uploaded file is not a valid DOCX document",
        });
      }
    }

    if (extension === ".txt") {
      const content = await readFile(file.path);

      try {
        const text = new TextDecoder("utf-8", {
          fatal: true,
        }).decode(content);

        if (text.includes("\0")) {
          throw new Error("Binary content detected");
        }
      } catch {
        await removeFile();

        return res.status(400).json({
          message: "The uploaded file must contain valid UTF-8 text",
        });
      }
    }

    next();
  } catch (error) {
    await removeFile();

    console.error("File validation error:", error);

    return res.status(400).json({
      message: "Unable to validate the uploaded file",
    });
  }
};

export default validateUpload;
