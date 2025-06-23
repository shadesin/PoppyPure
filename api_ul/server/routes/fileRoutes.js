const express = require("express");
const router = express.Router();
const multer = require("multer");
// const { handleFileUpload } = require("../middlewares/upload");
const {
  uploadFile,
  getAllFiles,
  getFile,
  deleteFile,
} = require("../controllers/fileController");
const { storage } = require("../lib/cloudinary");
const { protect } = require("../middlewares/authMiddleware");

// Upload files
const upload = multer({ storage });
router.post("/upload", protect, upload.single("file"), uploadFile); //middleware protect

// Get all files
router.get("/files", protect, getAllFiles);

// // Get single file
// router.get("/:id", getFile);

// // Delete file
// router.delete("/:id", deleteFile);

// Get single file
router.get("/files/:id", protect, getFile);

// Delete file
router.delete("/files/:id", protect, deleteFile);

module.exports = router;
