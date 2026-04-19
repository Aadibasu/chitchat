import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  email:{
    type:String,
    required:true,
    unique:true,
  },
  fullName:{
    type:String,
    required:true,
  },
  password:{
    type:String,
    required:true,
    minlength:6
  },
  profilePic:{
    type:String,
    default:""
  },
  // fields for password recovery
  resetOtp: {
    type: String,
  },
  resetOtpExpiry: {
    type: Date,
  },
},{timestamps:true}//created at when
);
const User = mongoose.model("User",userSchema)
export default User;