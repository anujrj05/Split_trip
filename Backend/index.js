import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import userRoute from "./route/user.route.js";
import createtripRoute from "./route/trip.route.js";
import transactionroute from "./route/transaction.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Always resolve backend .env even when command runs from repo root.
dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection (safe for Vercel)
let isConnected = false;
const mongoUri = process.env.MongoDBURI || "mongodb://127.0.0.1:27017/TRiP";

const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  isConnected = true;
  console.log("MongoDB connected");
};

// 🔹 ROOT ROUTE (NO DB REQUIRED)
app.get("/", (req, res) => {
  res.send("Backend running successfully 🚀");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Backend is running",
    mongoUriConfigured: Boolean(process.env.MongoDBURI),
    databaseConnected: isConnected,
    timestamp: new Date().toISOString(),
  });
});

const withDB = (router) => async (req, res, next) => {
  try {
    await connectDB();
    router(req, res, next);
  } catch (error) {
    console.error("Database connection error:", error.message);
    res.status(503).json({
      message:
        "Backend is running but database is unavailable. Start MongoDB or set MongoDBURI in Backend/.env",
    });
  }
};

// 🔹 CONNECT DB ONLY WHEN API HIT
app.use("/user", withDB(userRoute));

app.use("/trip", withDB(createtripRoute));

app.use("/transaction", withDB(transactionroute));


export default app;