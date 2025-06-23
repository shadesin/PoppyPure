//DONE DON'T TOUCH THIS FILE!!!!! je touch krbe tar duto baba

const jwt = require("jsonwebtoken");
const User = require("../models/userModel.js");

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select("-password");
      console.log("Protect middleware - req.user:", req.user); // Debug
      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }
      return next();
    } catch (error) {
      console.error("Token verification failed:", error.message, error.stack);
      return res.status(401).json({
        message: "Not authorized, token failed",
        error: error.message,
      });
    }
  }
  return res.status(401).json({ message: "Not authorized, no token" });
};

module.exports = { protect };
