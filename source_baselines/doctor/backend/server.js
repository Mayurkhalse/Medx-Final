import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import doctorRoutes from "./routes/doctorRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import emergencyRoutes from "./routes/emergencyRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { seedDatabaseIfEmpty } from "./seed.js";

// =====================================================
// Resolve __dirname in ES Modules
// =====================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================================================
// Load backend/.env
// =====================================================

dotenv.config({
  path: path.join(__dirname, ".env"),
});

// =====================================================
// App Configuration
// =====================================================

const app = express();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// =====================================================
// Check MongoDB configuration
// =====================================================

console.log("");
console.log("========================================");
console.log("     DOCTOR DASHBOARD BACKEND");
console.log("========================================");

console.log(`📁 Backend directory: ${__dirname}`);
console.log(`🌐 Port: ${PORT}`);

if (!MONGODB_URI) {
  console.error("");
  console.error("❌ MONGODB_URI is missing!");
  console.error("");
  console.error("Please create:");
  console.error(`${path.join(__dirname, ".env")}`);
  console.error("");
  console.error("Example:");
  console.error(
    "MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/doctordashboard"
  );
  console.error("");

  process.exit(1);
}

// =====================================================
// Middleware
// =====================================================

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Log every request
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.originalUrl}`);
  next();
});

// =====================================================
// Root Route
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    message: "Doctor Dashboard Backend is running!",
    server: "Express",
    port: PORT,
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// Health Check
// =====================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    message: "Doctor Dashboard Express Backend API is running",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected",
    databaseName: mongoose.connection.name || null,
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// API Routes
// =====================================================

app.use("/api/doctor", doctorRoutes);

app.use("/api/patients", patientRoutes);

app.use("/api/appointments", appointmentRoutes);

app.use("/api/emergency", emergencyRoutes);

app.use("/api/messages", messageRoutes);

// =====================================================
// 404 Handler
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// =====================================================
// Global Error Handler
// =====================================================

app.use((err, req, res, next) => {
  console.error("❌ API ERROR:");
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

// =====================================================
// Start Server
// =====================================================

const startServer = async () => {
  try {
    // -------------------------------------------------
    // Connect to MongoDB FIRST
    // -------------------------------------------------

    console.log("");
    console.log("🔄 Connecting to MongoDB...");
    console.log("");

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("========================================");
    console.log("✅ MongoDB connected successfully!");
    console.log(`🗄️ Database: ${mongoose.connection.name}`);
    console.log("========================================");

    // -------------------------------------------------
    // Seed database
    // -------------------------------------------------

    try {
      await seedDatabaseIfEmpty();

      console.log("✅ Database seed check completed");
    } catch (seedError) {
      console.error(
        "⚠️ Database seeding error:",
        seedError.message
      );
    }

    // -------------------------------------------------
    // Start Express Server
    // -------------------------------------------------

    app.listen(PORT, () => {
      console.log("");
      console.log("========================================");
      console.log("🚀 DOCTOR DASHBOARD BACKEND STARTED");
      console.log("========================================");
      console.log(`🌐 Server: http://localhost:${PORT}`);
      console.log(`❤️ Health: http://localhost:${PORT}/api/health`);
      console.log(`🗄️ Database: ${mongoose.connection.name}`);
      console.log("========================================");
      console.log("");
      console.log("Available API routes:");
      console.log("➡️  /api/doctor");
      console.log("➡️  /api/patients");
      console.log("➡️  /api/appointments");
      console.log("➡️  /api/emergency");
      console.log("➡️  /api/messages");
      console.log("");
    });
  } catch (error) {
    // -------------------------------------------------
    // MongoDB connection failed
    // -------------------------------------------------

    console.error("");
    console.error("========================================");
    console.error("❌ MONGODB CONNECTION FAILED");
    console.error("========================================");
    console.error("");
    console.error(error.message);
    console.error("");

    console.error("Please check:");
    console.error("1. backend/.env exists");
    console.error("2. MONGODB_URI is correct");
    console.error("3. MongoDB Atlas username is correct");
    console.error("4. MongoDB Atlas password is correct");
    console.error("5. MongoDB Atlas Network Access allows your IP");
    console.error("6. Your MongoDB cluster is running");
    console.error("7. Special characters in password are URL encoded");
    console.error("");

    // Do NOT start Express without MongoDB.
    process.exit(1);
  }
};

// =====================================================
// Start Application
// =====================================================

startServer();