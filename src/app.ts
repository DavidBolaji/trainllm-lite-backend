import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes/api";

dotenv.config();


const app:Express = express();


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