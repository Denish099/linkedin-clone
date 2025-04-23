import express from "express";
import { config } from "dotenv";
import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notication.route.js";
import connectionsRoutes from "./routes/connection.route.js";
import cors from "cors";
import { connectDb } from "./lib/db.js";
import cookieParser from "cookie-parser";

config();

const app = express();

app.use(express.json({ limit: "5mb" })); //for large images
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionsRoutes);

const Port = process.env.Port || 5000;

app.listen(Port, () => {
  console.log(`server running on this port ${Port}`);
  connectDb();
});
