import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes.js";
import documentRoutes from "./routes/document.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import errorHandler from "./middleware/error.middleware.js";

const app = express();

// Security-related HTTP headers
app.use(helmet());

// Cross-origin request configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  }),
);

// Parse incoming JSON requests
app.use(express.json({ limit: "1mb" }));

// Basic API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);

// Health-check endpoint
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "AI Document Assistant API is running",
  });
});

app.get("/api/health/db", (_req, res) => {
  const isConnected = mongoose.connection.readyState === 1;

  res.status(isConnected ? 200 : 503).json({
    database: isConnected ? "connected" : "disconnected",
    readyState: mongoose.connection.readyState,
  });
});

app.use(errorHandler);

export default app;
