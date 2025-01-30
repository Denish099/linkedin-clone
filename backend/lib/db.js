import mongoose from "mongoose";
import { config } from "dotenv";
config();
export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MongoDb_url);
    console.log(`mongoDb connected :${conn.connection.host}`);
  } catch (error) {
    console.error(`error connection to mongoDb :${error.message}`);
    process.exit(1);
  }
};
