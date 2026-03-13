import {sendWelcomeEmail, sendOtpEmail} from "../email/emailHandlers.js";
import {generateToken} from "../lib/utlis.js"
import User from "../models/User.js"
import bcrypt from "bcryptjs"
import {ENV} from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";


export const signup = async(req,res) =>{
  const {fullName,email,password} = req.body
  try{
    if(!fullName || !email || !password){
      return res.status(400).json({message:"All fields are required"})
    }

    if(password.length < 6){
      return res.status(400).json({message:"password must be 6 characters"});
    }

    //check if email is valid:regex
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if(!emailRegex.test(email)){
      return res.status(400).json({message:"Invalid email format"});
    } 

    const user = await User.findOne({email});
    if(user) return res.status(400).json({message:"Email already exist"})

    // hash the passowrd and save in the db
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password,salt)

    const newUser = new User({
      fullName,
      email,
      password:hashPassword
    })

    if(newUser){
  
      //before genratetoken save in db
      const saveUser = await newUser.save();
      generateToken(saveUser._id,res)

      res.status(201).json({
        _id:newUser._id,
        fullName:newUser.fullName,
        email:newUser.email,
        profilePic:newUser.profilePic,
      });

      //send welcome email to user
      try{
        await sendWelcomeEmail(saveUser.email,saveUser.fullName,ENV.CLIENT_URL);
      }catch(error){
        console.log("Failed to send welcome email:",error);
      }
    
    }else{
      res.status(400).json({message:"Invalid user data"})
    }
  }catch(error){
    console.log("error in signup controller",error);
    res.status(500).json({message:"internal server error"});
  }
 
};

export const login = async(req,res)=>{
  const {email,password} = req.body

  if(!email || !password){
    return res.status(400).json({message:"All fields are required"})
  }
  try{
    const user = await User.findOne({email:email})
    //never tell a client which one is incorrect pass or email
    if(!user){
      return res.status(400).json({
        message:"Invalid credential"
      })
    }
    const isPasswordCorrect = await bcrypt.compare(password,user.password)
    if(!isPasswordCorrect){
      return res.status(400).json({
        message:"Invalid credential"
      })
    }

    generateToken(user._id,res)
    res.status(200).json({
      _id:user._id,
      fullName:user.fullName,
      email:user.email,
      profilePic:user.profilePic,
    });

  }catch(error){
    console.log("Error in login controller",error)
    res.status(500).json({message:"internal server error"})
  }
  
};

export const logout = (_,res)=>{
  res.cookie("jwt","",{maxAge:0})
  res.status(200).json({message:"Logout out successfully"})
};

export const updateProfile = async (req,res) =>{
  try{
    const {profilePic} = req.body;
    if(!profilePic){
      return res.status(400).json({message:"profilePic is required"});
      const userId = req.user._id;  
      const uploadedResponse = await cloudinary.uploader.upload(profilePic)

      const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadedResponse.secure_url},{new:true});
      res.status(200).json({message:"Profile picture updated successfully"});
    };
  }catch(error){
    console.log("Error in updateProfile controller:",error);
    res.status(500).json({message:"Internal server error"});
  }
}

// forgot password: send OTP to email
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      // do not reveal that email doesn't exist
      return res.status(200).json({ message: "If the account exists, an OTP has been sent" });
    }

    // generate 6 digit otp
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    // send email
    try {
      await sendOtpEmail(user.email, user.fullName, otp);
    } catch (err) {
      console.log("failed to send otp email", err);
    }

    res.status(200).json({ message: "If the account exists, an OTP has been sent" });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// reset using otp
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP and new password are required" });
  }
  try {
    const user = await User.findOne({ email });
    if (
      !user ||
      !user.resetOtp ||
      user.resetOtp !== otp ||
      !user.resetOtpExpiry ||
      user.resetOtpExpiry < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetOtp = undefined;
    user.resetOtpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// change password when logged in
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user._id;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Old and new password are required" });
  }
  try {
    const user = await User.findById(userId);
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error in changePassword:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};