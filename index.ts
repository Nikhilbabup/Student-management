import express, { Application, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import adminRoutes from "./routes/admin";
import studentRoutes from "./routes/student";
import mongoose from "mongoose";

const MONGO_URL =
  "mongodb+srv://nikhilbabup:42MhvcOiuFzledxo@cluster0.mcjga.mongodb.net/studemnt-mgmnt";
// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json()); // For parsing JSON payloads
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/admin", adminRoutes);
app.use("/student", studentRoutes);

// Default route
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Route not found" });
});

mongoose
  .connect(MONGO_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err: any) => console.error("Error connecting to MongoDB:", err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
