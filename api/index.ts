import express from "express";
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
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Start server
// app.listen(PORT, () => {
//   console.log(`Backend server running on port ${PORT}`);
// });

export default app;
