//DONE DON'T TOUCH THIS FILE!!!!! je touch krbe tar duto baba. Later make logout route

const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  deleteUser,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
// const { body, validationResult } = require("express-validator");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);

const logoutUser = (req, res) => {
  res.json({ message: "Logged out successfully" });
};
router.post("/logout", logoutUser);
router.delete("/delete", protect, deleteUser);

// newly added sanitization(for injection attacks)
// router.post(
//   "/register",
//   [
//     body("email").isEmail().normalizeEmail(),
//     body("fullName").trim().notEmpty(),
//     body("password").isLength({ min: 6 }),
//   ],
//   (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
//     registerUser(req, res);
//   }
// );

module.exports = router;
