import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import { initSocket } from "./Socket.ts";
import authRoutes from "./Routers/auth.routes.ts";
import userRoutes from "./Routers/user.routes.ts";
import chatRoutes from "./Routers/chat.routes.ts";
import { searchSysteme } from "./Controllers/search.ts";
import messageRouter from "./Routers/message.routes.ts";

dotenv.config();

const PORT: string | number = process.env.PORT || 5135;
const MONGODB_URL: string | undefined = process.env.MONGODB_URL;

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

initSocket(server);

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/search", searchSysteme);
app.use("/chat", chatRoutes);
app.use("/messages", messageRouter);

if (!MONGODB_URL) {
  console.error("Error: MONGODB_URL is not defined in .env");
  process.exit(1);
}

const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URL as string);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});

// --- GRACEFUL SHUTDOWN MANAGEMENT ---

const gracefulShutdown = (signal: string) => {
  console.log(`\n${signal} received. Closing server...`);

  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed.");
      process.exit(0);
    } catch (err) {
      console.error("Error during MongoDB closure:", err);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("Forced shutdown after safety timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
