import type { Request, Response } from "express";
import mongoose from "mongoose";
import path from "node:path";
import { randomUUID } from "node:crypto";

import DocumentModel from "../models/document.model.js";
import DocumentChunk from "../models/document-chunk.model.js";
import { processDocument } from "../services/document-processing.service.js";
import { storeFile, deleteStoredFile } from "../config/gridfs.js";

type SupportedFileType = "pdf" | "docx" | "txt";

// POST /api/documents
export const uploadDocument = async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({
      message: "Please upload a file",
    });
  }

  if (!req.userId) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const extension = path.extname(file.originalname).toLowerCase();

  if (extension !== ".pdf" && extension !== ".docx" && extension !== ".txt") {
    return res.status(400).json({
      message: "Unsupported file extension",
    });
  }

  const fileType: SupportedFileType = extension.slice(1) as SupportedFileType;
  const storedName = `${randomUUID()}${extension}`;

  let fileId: string | undefined;
  let documentId: string | undefined;

  try {
    // Store the original file in MongoDB GridFS.
    fileId = await storeFile(file.buffer, storedName, req.userId);

    // Create the document metadata record.
    const document = await DocumentModel.create({
      userId: new mongoose.Types.ObjectId(req.userId),
      originalName: file.originalname,
      storedName,
      fileId,
      fileType,
      mimeType: file.mimetype,
      fileSize: file.size,
      status: "processing",
    });

    documentId = document._id.toString();

    // Extract text and generate document chunks and embeddings.
    const chunkCount = await processDocument({
      documentId,
      userId: req.userId,
      buffer: file.buffer,
      fileType,
    });

    document.status = "ready";
    await document.save();

    return res.status(201).json({
      message: "Document uploaded and processed successfully",
      document: {
        id: document._id,
        originalName: document.originalName,
        fileType: document.fileType,
        fileSize: document.fileSize,
        status: document.status,
        chunkCount,
        createdAt: document.createdAt,
      },
    });
  } catch (error) {
    // Clean up partially created records and stored files.
    if (documentId) {
      await DocumentChunk.deleteMany({
        documentId,
      }).catch((deleteError) => {
        console.error("Document chunks cleanup error:", deleteError);
      });

      await DocumentModel.findByIdAndDelete(documentId).catch((deleteError) => {
        console.error("Document metadata cleanup error:", deleteError);
      });
    }

    if (fileId) {
      await deleteStoredFile(fileId).catch((deleteError) => {
        console.error("Stored file cleanup error:", deleteError);
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
      .select("-fileId -storedName -extractedText -__v")
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
    }).select("-fileId -storedName -extractedText -__v");

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

    const document = await DocumentModel.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    // Remove associated chunks and the original GridFS file.
    await DocumentChunk.deleteMany({
      documentId: document._id,
      userId: req.userId,
    });

    await deleteStoredFile(document.fileId);

    await DocumentModel.deleteOne({
      _id: document._id,
      userId: req.userId,
    });

    return res.status(200).json({
      message: "Document and associated files deleted successfully",
    });
  } catch (error) {
    console.error("Document deletion error:", error);

    return res.status(500).json({
      message: "Unable to delete document",
    });
  }
};
