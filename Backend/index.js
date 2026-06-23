import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./route/user.route.js";
import createtripRoute from "./route/trip.route.js";
import transactionroute from "./route/transaction.route.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection (safe for Vercel)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MongoDBURI, {
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
      message: "Backend is running but database is unavailable",
    });
  }
};

// 🔹 CONNECT DB ONLY WHEN API HIT
app.use("/user", withDB(userRoute));

app.use("/trip", withDB(createtripRoute));

app.use("/transaction", withDB(transactionroute));


export default app;