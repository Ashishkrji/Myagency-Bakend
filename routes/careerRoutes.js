import express from "express";
import multer from "multer";
import storage from "../config/cloudinaryStorage.js";

const router = express.Router();
const upload = multer({ storage });

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    res.json({
      success: true,
      url: req.file.path   // Cloudinary image URL
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
