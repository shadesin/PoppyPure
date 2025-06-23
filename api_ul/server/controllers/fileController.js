const File = require("../models/fileModel");
const cloudinary = require("../lib/cloudinary").v2;
const fs = require("fs").promises;
const path = require("path");

const uploadFile = async (req, res) => {
  try {
    console.log("Uploaded file object:", req.file); // Debug

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" }); //If no user is authenticated, it returns a 401 Unauthorized.
    }

    if (!req.file || !req.file.path) {
      return res
        .status(400)
        .json({ message: "No file uploaded or Cloudinary URL missing." });
    }

    const { originalname, mimetype, size, path: cloudinaryUrl } = req.file;
    const publicId =
      req.file.filename || req.file.path.split("/").pop().split(".")[0];

    //new added base64
    //This section is designed to generate a Base64 string for uploaded images. 
    // This is useful for displaying image previews on the frontend without needing to make another network request, 
    // especially for small images.
    let base64 = null;
    if (mimetype.startsWith("image/")) { //Only attempts Base64 conversion if the uploaded file is an image.
      const filePath = cloudinaryUrl; // Local path if using multer temp storage
      if (filePath.startsWith("http")) {
        // If Cloudinary URL, fetch the image
        const response = await fetch(filePath);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        base64 = buffer.toString("base64");
        base64 = `data:${mimetype};base64,${base64}`;
      } else {
        // If local file, read it
        const buffer = await fs.readFile(filePath);
        base64 = buffer.toString("base64");
        base64 = `data:${mimetype};base64,${base64}`;
        // Clean up local file if using temp storage
        await fs
          .unlink(filePath)
          .catch((err) => console.error("Failed to delete temp file:", err));
      }
    }

    const file = new File({
      originalname,
      mimetype,
      size,
      filename: publicId,
      path: cloudinaryUrl, // ✅ Cloudinary URL
      status: "uploaded",
      user: req.user._id,
    });

    await file.save();

    res.status(201).json({
      message: "File uploaded successfully.",
      file: {
        //CHANGED SECTION
        _id: file._id,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        user: file.user,
        base64,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};



// @route GET /api/files
// @desc Get all uploaded files (for user/admin)
// @access Private (or public if needed)
const getAllFiles = async (req, res) => {
  try {
    //WHOLE TRY BLOCK IS CHANGED
    const files = await File.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    const filesWithBase64 = await Promise.all(
      files.map(async (file) => {
        let base64 = null;
        if (file.mimetype.startsWith("image/")) {
          try {
            const response = await fetch(file.path);
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            base64 = buffer.toString("base64");
            base64 = `data:${file.mimetype};base64,${base64}`;
          } catch (error) {
            console.error(
              `Failed to fetch base64 for file ${file._id}:`,
              error
            );
          }
        }
        return {
          _id: file._id,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          user: file.user,
          base64,
        };
      })
    );
    res.status(200).json(filesWithBase64);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Failed to fetch files." });
  }
};



// @desc Get single file         NEWLY ADDED
// @route GET /api/files/:id
// @access Private
// backend controller designed to retrieve a specific file's metadata and,
// for images, its Base64 representation, for an authenticated user.
const getFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }
    if (file.user.toString() !== req.user._id.toString()) {
      //It compares the user ID associated with the retrieved file (from the database) 
      // to the _id of the currently authenticated user (req.user._id).
      return res
        .status(403)
        .json({ message: "Not authorized to access this file" });
    }
    let base64 = null;
    if (file.mimetype.startsWith("image/")) {
      const response = await fetch(file.path);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64 = buffer.toString("base64");
      base64 = `data:${file.mimetype};base64,${base64}`;
    }
    res.status(200).json({
      _id: file._id,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      path: file.path,
      user: file.user,
      base64,
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// @desc Delete file
// @route DELETE /api/files/:id
// @access Private
const deleteFile = async (req, res) => {
  try {
    console.log("Attempting to delete file:", req.params.id); // Debug
    const file = await File.findById(req.params.id);
    if (!file) {
      console.log("File not found:", req.params.id); // Debug
      return res.status(404).json({ message: "File not found" });
    }
    if (file.user.toString() !== req.user._id.toString()) {
      console.log(
        "Unauthorized attempt by user:",
        req.user._id,
        "for file:",
        req.params.id
      ); // Debug
      return res
        .status(403)
        .json({ message: "Not authorized to delete this file" });
    }



    // Delete from Cloudinary
    if (file.filename) {
      try {
        await cloudinary.uploader.destroy(file.filename);
        console.log("Deleted from Cloudinary:", file.filename); // Debug
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        // Continue with MongoDB deletion even if Cloudinary fails
      }
    } else {
      console.warn("No Cloudinary public_id found for file:", req.params.id);
    }
    // Delete from MongoDB
    await File.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "File deleted" });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  uploadFile,
  getAllFiles,
  getFile,
  deleteFile,
};
