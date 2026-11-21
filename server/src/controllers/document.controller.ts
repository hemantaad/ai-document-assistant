import type { Request, Response } from "express";
import { unlink } from "node:fs/promises";
import mongoose from "mongoose";

import DocumentModel from "../models/document.model.js";
import DocumentChunk from "../models/document-chunk.model.js";
import { processDocument } from "../services/document-processing.service.js";

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

    const chunkCount = await processDocument({
      documentId: document._id.toString(),
      userId: req.userId,
      filePath: file.path,
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
    await unlink(file.path).catch(() => undefined);

    if (documentId) {
      await DocumentChunk.deleteMany({
        documentId,
      }).catch((deleteError) => {
        console.error("Document chunks cleanup error:", deleteError);
      });

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
    const id = req.params.id;

    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid document ID",
      });
    }

    // Find the document belonging to the authenticated user.
    const document = await DocumentModel.findOne({
      _id: id,
      userId: req.userId,
    });

    if (!document) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    // Remove all chunks and embeddings associated with this document.
    await DocumentChunk.deleteMany({
      documentId: document._id,
      userId: req.userId,
    });

    // Remove the document record.
    await DocumentModel.deleteOne({
      _id: document._id,
      userId: req.userId,
    });

    // Remove the physical file from local storage.
    try {
      await unlink(document.filePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }

    return res.status(200).json({
      message: "Document and associated chunks deleted successfully",
    });
  } catch (error) {
    console.error("Document deletion error:", error);

    return res.status(500).json({
      message: "Unable to delete document",
    });
  }
};
