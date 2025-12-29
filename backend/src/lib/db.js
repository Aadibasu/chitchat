import mongoose from "mongoose"
import {ENV} from "./env.js";

export const connectDB = async () =>{
  try{
    const {MONGO_URI} =ENV;
    if(!MONGO_URI) throw new Error("Mongo_uri is not set")
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log("MONGODB CONNECTED:",conn.connection.host)
  }catch(error){
    console.log("Error connection to MONGODB:",error)
    process.exit(1); // 1 status code means fails,0 means success
  }
}