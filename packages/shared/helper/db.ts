import mongoose from "mongoose";

export const connectToDb = async (key: string) => {
  try {
    await mongoose.connect(Bun.env.MONGO_URI + key);
    console.log(`Connected to ${key} db`);
  } catch (err) {
    console.error("Failed to connect to db", err);
  }
};
