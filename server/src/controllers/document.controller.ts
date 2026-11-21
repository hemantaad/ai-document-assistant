import type { Request, Response } from "express";
import { unlink } from "node:fs/promises";
import mongoose from "mongoose";

import DocumentModel from "../models/document.model.js";
import { extractDocumentText } from "../services/document-extraction.service.js";

export const uploadDocument = async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      message: "Please upload a file",
    });
  }

  let documentId: string | undefined;

  try {
    if (!req.userId) {
      await unlink(file.path).catch(() => undefined);

      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const extension = file.originalname.split(".").pop()?.toLowerCase();

    if (extension !== "pdf" && extension !== "docx" && extension !== "txt") {
      await unlink(file.path).catch(() => undefined);

      return res.status(400).json({
        message: "Unsupported file extension",
      });
    }

    const document = await DocumentModel.create({
      userId: req.userId,
      originalName: file.originalname,
      storedName: file.filename,
      fileType: extension,
      mimeType: file.mimetype,
      fileSize: file.size,
      filePath: file.path,
      status: "processing",
    });

    documentId = document._id.toString();

    const extractedContent = await extractDocumentText(file.path);

    const extractedText =
      typeof extractedContent === "string"
        ? extractedContent
        : extractedContent.text;

    if (!extractedText.trim()) {
      throw new Error("The uploaded document contains no extractable text");
    }

    document.extractedText = extractedText;
    document.status = "ready";

    await document.save();

    return res.status(201).json({
      message: "Document uploaded successfully",
      document: {
        id: document._id,
        originalName: document.originalName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        status: document.status,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    await unlink(file.path).catch(() => undefined);

    if (documentId) {
      await DocumentModel.findByIdAndDelete(documentId).catch((deleteError) => {
        console.error("Document cleanup error:", deleteError);
      });
    }

    console.error("Document upload error:", error);

    return res.status(500).json({
      message: "Unable to process document",
    });
  }
};

// GET /api/documents
export const getDocuments = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const documents = await DocumentModel.find({
      userId: req.userId,
    })
      .select("-filePath -storedName -extractedText -__v")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("Get documents error:", error);

    return res.status(500).json({
      message: "Unable to retrieve documents",
    });
  }
};

// GET /api/documents/:id
export const getDocumentById = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const id = req.params.id;

    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid document ID",
      });
    }

    const document = await DocumentModel.findOne({
      _id: id,
      userId: req.userId,
    }).select("-filePath -storedName -__v");

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    return res.status(200).json({
      document,
    });
  } catch (error) {
    console.error("Get document error:", error);

    return res.status(500).json({
      message: "Unable to retrieve document",
    });
  }
};

// DELETE /api/documents/:id
export const deleteDocument = async (req: Request, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const id = req.params.id;

    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid document ID",
      });
    }

    const document = await DocumentModel.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    await unlink(document.filePath).catch((error) => {
      if (error.code !== "ENOENT") {
        console.error("Uploaded file cleanup error:", error);
      }
    });

    return res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);

    return res.status(500).json({
      message: "Unable to delete document",
    });
  }
};
