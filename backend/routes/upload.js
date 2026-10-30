
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const uploadPath = path.resolve(__dirname, "../uploads");

fs.mkdirSync(uploadPath, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const extension = EXTENSIONS[file.mimetype];

    if (!extension) {
      return cb(new Error("Unsupported image format."));
    }

    cb(null, `${crypto.randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 10,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      return cb(
        new Error("Only JPEG, PNG, WebP, and GIF images are allowed.")
      );
    }

    cb(null, true);
  },
});

router.post("/", protect, (req, res) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      const isUploadError = error instanceof multer.MulterError;

      return res.status(isUploadError ? 400 : 415).json({
        success: false,
        message: isUploadError
          ? error.code === "LIMIT_FILE_SIZE"
            ? "Image must be 5 MB or smaller."
            : "Invalid upload. Please upload one image at a time."
          : error.message || "Unsupported image format.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image to upload.",
      });
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    return res.status(201).json({
      success: true,
      message: "Image uploaded successfully.",
      imageUrl,
    });
  });
});

module.exports = router;
