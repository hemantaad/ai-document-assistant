import { Router } from "express";

import protect from "../middleware/auth.middleware.js";
import upload from "../config/upload.js";
import validateUpload from "../middleware/validate-upload.middleware.js";

import {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
} from "../controllers/document.controller.js";

const router = Router();

router.use(protect);

router.post("/upload", upload.single("file"), validateUpload, uploadDocument);

router.get("/", getDocuments);
router.get("/:id", getDocumentById);
router.delete("/:id", deleteDocument);

export default router;
