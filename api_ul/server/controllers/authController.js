//DONE DON'T TOUCH THIS FILE!!!!! je touch krbe tar duto baba -->(AMI MAYUKH BOLCHI. AMI KINTU JORE JORE TOUCH KORECHI)

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const File = require("../models/fileModel");
const generateToken = require("../lib/utils");

// @desc Register a new user
// @route POST /api/auth/register
// @access Public
const registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    //check for mandatory fields
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

    if (user) {
      // Generate JWT token
      const token = generateToken(user._id);
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        token,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    //Error Handling:
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



// @desc Authenticate user
// @route POST /api/auth/login
// @access Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    //check for mandatory fields
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill in all fields" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT (token or cookie)
    const token = generateToken(user._id); // or generateToken(user._id, res) if using cookies

    // Send response
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      token, // remove this if using cookie-based JWT
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



// @desc Get logged-in user info
// @route GET /api/auth/me
// @access Private
// backend controller designed to retrieve the details of the currently authenticated user.
const getMe = async (req, res) => {
  try {
    // req.user should be set by protect middleware
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



// @desc Delete user account and associated files
// @route.DELETE /api/auth/delete
// @access Private
const deleteUser = async (req, res) => {
  try {
    // req.user should be set by protect middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user's files from MongoDB
    await File.deleteMany({ user: req.user.id });

    // Delete user
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete account" });
  }
};

//new logout FOR WHAT IDK
// const logoutUser = async (req, res) => {
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "Not authenticated" });
//     }
//     // Optional: Implement token blacklisting or session cleanup if needed
//     console.log(`User ${req.user.email} logged out`);
//     res.status(200).json({ message: "Logged out successfully" });
//   } catch (error) {
//     console.error("Logout error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

module.exports = {
  registerUser,
  loginUser,
  getMe,
  // logoutUser,
  deleteUser,
};
