const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


// Register User
const registerUser = async (req, res) => {
  try {

    const {
      firstName,
      lastName,
      email,
      password,
    } = req.body;


    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success:false,
        message:"Email already registered",
      });
    }


    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );


    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });


    res.status(201).json({
      success:true,
      message:"User registered successfully",
      user:{
        id:user._id,
        firstName:user.firstName,
        lastName:user.lastName,
        email:user.email,
      },
    });


  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};



// Login User
const loginUser = async (req,res)=>{
  try {

    const {
      email,
      password
    } = req.body;


    const user = await User.findOne({ email });


    if(!user){
      return res.status(401).json({
        success:false,
        message:"Invalid credentials",
      });
    }


    const isMatch = await bcrypt.compare(
      password,
      user.password
    );


    if(!isMatch){
      return res.status(401).json({
        success:false,
        message:"Invalid credentials",
      });
    }


    const token = jwt.sign(
      {
        id:user._id,
        role:user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn:"7d",
      }
    );


    res.json({
      success:true,
      token,
      user:{
        id:user._id,
        firstName:user.firstName,
        lastName:user.lastName,
        email:user.email,
      },
    });


  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};



// Forgot Password
const forgotPassword = async(req,res)=>{
  try {

    const { email } = req.body;


    const user = await User.findOne({ email });


    if(!user){
      return res.status(404).json({
        success:false,
        message:"User not found",
      });
    }


    const resetToken =
      crypto.randomBytes(32).toString("hex");


    const hashedToken =
      crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");


    user.resetToken = hashedToken;

    user.resetTokenExpire =
      Date.now() + 15 * 60 * 1000;


    await user.save();


    res.json({
      success:true,
      message:"Reset token generated",
      resetToken,
    });


  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};



// Reset Password
const resetPassword = async(req,res)=>{
  try {

    const {
      token,
      password,
      confirmPassword,
    } = req.body;


    if(password !== confirmPassword){

      return res.status(400).json({
        success:false,
        message:"Passwords do not match",
      });

    }


    const hashedToken =
      crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");



    const user = await User.findOne({
      resetToken:hashedToken,
      resetTokenExpire:{
        $gt:new Date(),
      },
    });



    if(!user){

      return res.status(400).json({
        success:false,
        message:"Invalid or expired reset token",
      });

    }



    const salt = await bcrypt.genSalt(10);

    user.password =
      await bcrypt.hash(password,salt);


    user.resetToken = null;
    user.resetTokenExpire = null;


    await user.save();


    res.json({
      success:true,
      message:"Password reset successfully",
    });



  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};



// Get Current User
const getMe = async(req,res)=>{
  try {

    const user = await User.findById(req.user.id)
      .select("-password");


    res.json({
      success:true,
      user,
    });


  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};



module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getMe,
};