import mongoose from "mongoose";

let connectionPromise: Promise<typeof mongoose> | null = null;

const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(mongoURI).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  try {
    await connectionPromise;

    // Clear the completed promise. Future requests will use the
    // established connection or create a new one if disconnected.
    connectionPromise = null;

    console.log("MongoDB connected successfully");
  } catch (error) {
    connectionPromise = null;
    console.error("MongoDB connection failed:", error);
    throw error;
  }
};

export default connectDB;
