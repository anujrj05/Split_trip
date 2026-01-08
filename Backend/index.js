import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoute from "./route/user.route.js";
import createtripRoute from "./route/trip.route.js";
import transactionroute from "./route/transaction.route.js";

dotenv.config();

const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "OPTIONS"],
};

app.use(cors(corsOptions));
app.use(express.json());

// MongoDB connection (safe for Vercel)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MongoDBURI);
  isConnected = true;
  console.log("MongoDB connected");
};

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

// routes
app.get("/", (req, res) => {
  res.send("Trip Split Backend is running 🚀");
});

app.use("/user", userRoute);
app.use("/trip", createtripRoute);
app.use("/transaction", transactionroute);

// ❌ app.listen REMOVED
export default app;