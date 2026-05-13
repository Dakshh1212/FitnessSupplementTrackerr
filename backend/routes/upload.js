const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

/* =======================
   📁 CREATE UPLOAD DIR SAFELY
======================= */
const uploadPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/* =======================
   📦 MULTER CONFIG
======================= */
const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {

    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  }

});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit (IMPORTANT)
  }
});

/* =======================
   🖼️ UPLOAD IMAGE (FIXED)
======================= */
router.post("/", upload.single("image"), (req, res) => {

  try {

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded ❌"
      });
    }

    return res.json({
      success: true,
      imageUrl: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
    });

  } catch (err) {

    console.log("UPLOAD ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Upload failed ❌"
    });

  }

});

module.exports = router;