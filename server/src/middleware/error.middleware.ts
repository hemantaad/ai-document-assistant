import type { Request, Response, NextFunction } from "express";
import multer from "multer";

const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  console.error("API Error:", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        message: "File size exceeds the 10 MB limit",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "Only one file can be uploaded at a time",
      });
    }

    return res.status(400).json({
      message: "File upload failed",
    });
  }

  if (error instanceof Error) {
    if (error.message === "Only PDF, DOCX, and TXT files are allowed") {
      return res.status(400).json({
        message: error.message,
      });
    }
  }

  return res.status(500).json({
    message: "Internal server error",
  });
};

export default errorHandler;
