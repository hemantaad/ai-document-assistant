import type { Request, Response, NextFunction } from "express";
import multer from "multer";

const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void | Response => {
  if (res.headersSent) {
    return next(error);
  }

  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    console.error("API Error:", error);
  } else {
    console.error(
      "API Error:",
      error instanceof Error ? error.message : "Unknown error",
    );
  }

  // Handle Multer upload errors.
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case "LIMIT_FILE_SIZE":
        return res.status(413).json({
          message: "File size exceeds the 10 MB limit",
        });

      case "LIMIT_FILE_COUNT":
      case "LIMIT_UNEXPECTED_FILE":
        return res.status(400).json({
          message: "Only one file can be uploaded at a time",
        });

      case "LIMIT_FIELD_COUNT":
        return res.status(400).json({
          message: "Additional form fields are not allowed",
        });

      case "LIMIT_PART_COUNT":
        return res.status(400).json({
          message: "Invalid number of upload parts",
        });

      default:
        return res.status(400).json({
          message: "File upload failed",
        });
    }
  }

  // Handle unsupported MIME types from the upload filter.
  if (
    error instanceof Error &&
    error.message === "Only PDF, DOCX, and TXT files are allowed"
  ) {
    return res.status(400).json({
      message: error.message,
    });
  }

  // Handle malformed JSON request bodies.
  if (
    error instanceof SyntaxError &&
    "status" in error &&
    error.status === 400 &&
    "body" in error
  ) {
    return res.status(400).json({
      message: "Invalid JSON request body",
    });
  }

  return res.status(500).json({
    message: "Internal server error",
  });
};

export default errorHandler;
