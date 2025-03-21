import mongoose from "mongoose";

export const connectToDb = async (key: string) => {
  const url = `mongodb://${Bun.env.MONGO_USERNAME}:${Bun.env.MONGO_PASSWORD}@${Bun.env.MONGO_URI}/${key}?authSource=admin`;
  try {
    await mongoose.connect(url);
    console.log(`Connected to ${key} db`);
  } catch (err) {
    console.error("Failed to connect to db " + url, err);
  }
};
