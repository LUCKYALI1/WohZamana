import mongoose from "mongoose";

let isConnecting = false;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (isConnecting) {
    return;
  }

  try {
    isConnecting = true;

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error(
      "❌ MongoDB connection error:",
      error.message
    );

    throw error;
  } finally {
    isConnecting = false;
  }
};

export default connectDB;