import express from "express";
import { config } from "dotenv";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notication.route.js";

import cookieParser from "cookie-parser";
import { connectDb } from "./lib/db.js";

config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notications", notificationRoutes);

const Port = process.env.Port || 5000;

app.listen(Port, () => {
  console.log(`server running on this port ${Port}`);
  connectDb();
});
