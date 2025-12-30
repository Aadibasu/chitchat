import {sendWelcomeEmail} from "../email/emailHandlers.js";
import {generateToken} from "../lib/utlis.js"
import User from "../models/User.js"
import bcrypt from "bcryptjs"
import {ENV} from "../lib/env.js";


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