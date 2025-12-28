import {generateToken} from "../lib/utlis.js"
import User from "../models/User.js"
import bcrypt from "bcryptjs"


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
      generateToken(newUser._id,res)
      await newUser.save();

      res.status(201).json({
        _id:newUser._id,
        fullName:newUser.fullName,
        email:newUser.email,
        profilePic:newUser.profilePic,
      });
      //send a welcome email user
    }else{
      res.status(400).json({message:"Invalid user data"})
    }
  }catch(error){
    console.log("error in signup controller",error);
    res.status(500).json({message:"internal server error"});
  }
 
};