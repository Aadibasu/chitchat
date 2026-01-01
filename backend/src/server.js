//const express = require('express');
import express from "express";
import cookieParser from "cookie-parser";
import path from "path"; 
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import {connectDB} from "./lib/db.js";
import {ENV} from "./lib/env.js";


const app = express();` `
const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;

app.use(express.json());//req.body in auth.conntroller
app.use(cookieParser());//to read cookies from req.cookie

app.use("/api/auth",authRoutes);
app.use("/api/messages",messageRoutes);

//make ready for the deployment
// making backend and frontend in a single url
if(ENV.NODE_ENV === "production"){
  app.use(express.static(path.join(__dirname,"../frontend/vite-project/dist")))

  app.get("*",(req,res)=>{
    res.sendFile(path.join(__dirname,"../frontend/vite-project/dist/index.html"))
  })
}

app.listen(PORT,() =>{
  console.log("server is running in the port number:"+PORT )
  connectDB();
})