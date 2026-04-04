import mongoose from "mongoose";

const { MONGO_USER, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT, MONGO_DB } = process.env;

const DATABASE_URL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}?authSource=admin`;

export async function connectDB(): Promise<void> {
  try {
    const database_connection = await mongoose.connect(DATABASE_URL);
    console.log(`MongoDB connected: ${database_connection.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
}
