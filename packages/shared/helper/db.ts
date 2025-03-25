import mongoose from "mongoose";

export const connectToDb = async (key: string) => {
  let url;
  if (Bun.env.NODE_ENV === "development") {
    url = `mongodb://${Bun.env.MONGO_URI}/${key}?authSource=admin`;
  } else {
    url = `mongodb://${Bun.env.MONGO_USERNAME}:${Bun.env.MONGO_PASSWORD}@${Bun.env.MONGO_URI}/${key}?authSource=admin`;
  }
  console.log("Connecting to db " + url);

  try {
    const connection = await mongoose.connect(url);
    console.log(`Connected to ${key} db`);
    return connection;
  } catch (err) {
    console.error("Failed to connect to db " + url, err);
  }
};
