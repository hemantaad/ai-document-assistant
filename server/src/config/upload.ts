import multer from "multer";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";

const uploadDirectory = path.resolve("uploads/documents");

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    mkdir(uploadDirectory, { recursive: true })
      .then(() => callback(null, uploadDirectory))
      .catch((error: Error) => callback(error, uploadDirectory));
  },

  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    callback(null, `${randomUUID()}${extension}`);
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

const fileFilter: multer.Options["fileFilter"] = (_req, file, callback) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return callback(new Error("Only PDF, DOCX, and TXT files are allowed"));
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
    fields: 0,
    parts: 1,
  },
});

export default upload;
