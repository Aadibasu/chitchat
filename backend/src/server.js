//const express = require('express');
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import { createServer } from "http";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDB } from "./lib/db.js";
import { ENV } from "./lib/env.js";
import { initSocket } from "./lib/socket.js";

const app = express();
const __dirname = path.resolve();
const PORT = ENV.PORT || 3001;

// standard middleware
app.use(express.json({ limit: '10mb' })); // req.body in auth.controller

// configure CORS depending on environment
const corsOptions = {
  origin: ENV.NODE_ENV === "development" ? true : ENV.CLIENT_URL,
  credentials: true,
};
app.use(cors(corsOptions));
// handle preflight requests explicitly
app.options("*", cors(corsOptions));

app.use(cookieParser()); // to read cookies from req.cookie

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// make ready for the deployment
// making backend and frontend in a single url
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/vite-project/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/vite-project/dist/index.html"));
  });
}

// create http server instead of letting express listen directly
const httpServer = createServer(app);

// initialize socket.io with the http server
const io = initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log("server is running on port " + PORT);
  connectDB();
});