import "dotenv/config";

import mongoose from "mongoose";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import app from "../src/app.js";

const TEST_MONGODB_URI = process.env.MONGODB_URI!;

const testUser = {
  name: "Test User",
  email: `test-${Date.now()}@example.com`,
  password: "TestPassword123!",
};

beforeAll(async () => {
  await mongoose.connect(TEST_MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe("Authentication API", () => {
  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("message");
  });

  it("should reject duplicate registration", async () => {
    const response = await request(app)
      .post("/api/auth/register")
      .send(testUser);

    expect(response.status).toBe(409);
  });

  it("should reject invalid registration data", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "",
      email: "invalid-email",
      password: "123",
    });

    expect(response.status).toBe(400);
  });

  it("should log in with valid credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  it("should reject incorrect login credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "WrongPassword123!",
    });

    expect(response.status).toBe(401);
  });
});
