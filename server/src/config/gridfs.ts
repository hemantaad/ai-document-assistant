import mongoose from "mongoose";

const getBucket = () => {
  const database = mongoose.connection.db;

  if (!database) {
    throw new Error("MongoDB connection is not established");
  }

  return new mongoose.mongo.GridFSBucket(database, {
    bucketName: "documents",
  });
};

export const storeFile = async (
  buffer: Buffer,
  filename: string,
  userId: string,
): Promise<string> => {
  const bucket = getBucket();

  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        userId,
      },
    });

    uploadStream.once("error", reject);

    uploadStream.once("finish", () => {
      resolve(uploadStream.id.toString());
    });

    uploadStream.end(buffer);
  });
};

export const deleteStoredFile = async (fileId: string): Promise<void> => {
  const bucket = getBucket();

  await bucket.delete(new mongoose.Types.ObjectId(fileId));
};
