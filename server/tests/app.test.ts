import "dotenv/config";

import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";

describe("API Health Checks", () => {
  it("should return API health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "ok",
      message: "AI Document Assistant API is running",
    });
  });

  it("should return database connection status", async () => {
    const response = await request(app).get("/api/health/db");

    expect([200, 503]).toContain(response.status);
    expect(["connected", "disconnected"]).toContain(response.body.database);
  });
});
