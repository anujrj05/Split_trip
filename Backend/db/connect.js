import mongoose from "mongoose";

const mongoUri =
  process.env.MongoDBURI ||
  process.env.MONGODB_URI ||
  (process.env.NODE_ENV !== "production"
    ? "mongodb://127.0.0.1:27017/TRiP"
    : null);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const getMongoUri = () => mongoUri;

export const isMongoConfigured = () => Boolean(mongoUri);

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!mongoUri) {
    throw new Error("MongoDBURI environment variable is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(mongoUri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 10000,
      })
      .then((connection) => {
        console.log("MongoDB connected");
        return connection;
      })
      .catch((error) => {
        cached.promise = null;
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
