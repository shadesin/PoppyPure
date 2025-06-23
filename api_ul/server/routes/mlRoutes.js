const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { predictML } = require("../controllers/mlController");

router.get("/predict/:fileId", protect, predictML);

module.exports = router;
