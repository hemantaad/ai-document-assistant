import "dotenv/config";

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

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

describe("Chat API", () => {
  it("should reject chat requests without authentication", async () => {
    const response = await request(app)
      .post("/api/chat")
      .send({ question: "Test question" });

    expect(response.status).toBe(401);
  });

  it("should reject invalid chat requests", async () => {
    const response = await request(app)
      .post("/api/chat")
      .set("Authorization", authHeader)
      .send({});

    expect(response.status).toBe(400);
  });
});

describe("Conversation API", () => {
  it("should reject conversation listing without authentication", async () => {
    const response = await request(app).get("/api/conversations");

    expect(response.status).toBe(401);
  });

  it("should allow authenticated users to list conversations", async () => {
    const response = await request(app)
      .get("/api/conversations")
      .set("Authorization", authHeader);

    expect(response.status).toBe(200);
  });

  it("should reject conversation retrieval without authentication", async () => {
    const response = await request(app).get(
      "/api/conversations/6b01bbd28109a4864ff1ddd8",
    );

    expect(response.status).toBe(401);
  });

  it("should reject conversation deletion without authentication", async () => {
    const response = await request(app).delete(
      "/api/conversations/6b01bbd28109a4864ff1ddd8",
    );

    expect(response.status).toBe(401);
  });
});
