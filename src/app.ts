import express, { Express, Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./routes/api";
import { keepAliveService } from "./services/keepAlive";

dotenv.config();


const app:Express = express();


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api", apiRouter);

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ 
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Keep-alive service status
app.get("/keep-alive/status", (_req: Request, res: Response) => {
  const status = keepAliveService.getStatus();
  res.json({
    ...status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default app;