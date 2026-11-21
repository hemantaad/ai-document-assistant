import "dotenv/config";

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeAll, afterAll, describe, expect, it } from "vitest";

import app from "../src/app.js";

const userId = new mongoose.Types.ObjectId().toString();

const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
  algorithm: "HS256",
  expiresIn: "1d",
});

const authHeader = `Bearer ${token}`;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI!);
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Document API", () => {
  it("should reject document uploads without authentication", async () => {
    const response = await request(app).post("/api/documents/upload");

    expect(response.status).toBe(401);
  });

  it("should reject document listing without authentication", async () => {
    const response = await request(app).get("/api/documents");

    expect(response.status).toBe(401);
  });

  it("should reject document retrieval without authentication", async () => {
    const response = await request(app).get(
      "/api/documents/6b01bbd28109a4864ff1ddd8",
    );

    expect(response.status).toBe(401);
  });

  it("should reject document deletion without authentication", async () => {
    const response = await request(app).delete(
      "/api/documents/6b01bbd28109a4864ff1ddd8",
    );

    expect(response.status).toBe(401);
  });

  it("should allow authenticated users to list documents", async () => {
    const response = await request(app)
      .get("/api/documents")
      .set("Authorization", authHeader);

    expect(response.status).toBe(200);
  });

  it("should return 404 for a document that does not belong to the user", async () => {
    const response = await request(app)
      .get("/api/documents/6b01bbd28109a4864ff1ddd8")
      .set("Authorization", authHeader);

    expect(response.status).toBe(404);
  });

  it("should return 404 when deleting a document that does not belong to the user", async () => {
    const response = await request(app)
      .delete("/api/documents/6b01bbd28109a4864ff1ddd8")
      .set("Authorization", authHeader);

    expect(response.status).toBe(404);
  });
});
