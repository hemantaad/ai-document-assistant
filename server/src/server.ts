import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/database.js";

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Application startup failed:", error);
    process.exit(1);
  }
};

// Run the traditional server only during local development.
// Vercel will use the exported Express application.
if (!process.env.VERCEL) {
  void startServer();
}

export default app;
