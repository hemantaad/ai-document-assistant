import type { RequestHandler } from "express";
import connectDB from "../config/database.js";

const databaseMiddleware: RequestHandler = async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
};

export default databaseMiddleware;
