import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

import authConfig from "../config/auth.js";

// Extend Express Request to include authenticated user information
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

const protect = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    // Check whether the Authorization header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Invalid authorization format",
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, authConfig.jwtSecret, {
      algorithms: ["HS256"],
    });

    if (
      typeof decoded === "string" ||
      typeof decoded.userId !== "string" ||
      !decoded.userId
    ) {
      return res.status(401).json({
        message: "Invalid token payload",
      });
    }

    // Attach authenticated user ID to the request
    req.userId = decoded.userId;

    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default protect;
