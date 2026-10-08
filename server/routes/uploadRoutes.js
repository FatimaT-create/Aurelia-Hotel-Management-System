const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const fileFilter = (req, file, cb) => {
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG, PNG, WEBP or GIF images are allowed"));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 }, // 5MB per file, 10 files per request
});

// @route  POST /api/uploads  (admin/manager only)
// Accepts up to 10 files under the field name "images", saves them to
// /server/uploads, and returns the public URLs to store on the room.
router.post("/", protect, authorize("admin", "manager"), upload.array("images", 10), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }
  const urls = req.files.map((f) => `/api/uploads/${f.filename}`);
  res.status(201).json({ urls });
});

// Handle multer errors (file too large, wrong type, etc.) with a clean JSON message
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err) {
    return res.status(400).json({ message: err.message });
  }
  next();
});

module.exports = router;
