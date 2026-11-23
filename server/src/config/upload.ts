import multer from "multer";

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
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: 4 * 1024 * 1024,
    files: 1,
    fields: 0,
    parts: 1,
  },
});

export default upload;
