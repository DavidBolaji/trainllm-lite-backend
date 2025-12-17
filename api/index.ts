import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "../src/routes/api";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", apiRouter);

// Health check
app.get("/health", (_req:Request, res: Response) => {
  res.json({ status: "ok" });
});

export default app;



// Start server
// app.listen(PORT, () => {
//   console.log(`Backend server running on port ${PORT}`);
// });