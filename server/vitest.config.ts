import { defineConfig } from "vitest/config";
import dotenv from "dotenv";

dotenv.config({
  path: ".env.test",
  override: true,
});

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 15000,
    hookTimeout: 15000,
    fileParallelism: false,
  },
});
