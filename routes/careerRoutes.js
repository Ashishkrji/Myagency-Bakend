import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import Career from "../models/Career.js";
import { verifyAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------- ENV check: Vercel / Prod vs Local ----------
const isVercel = !!process.env.VERCEL || process.env.NODE_ENV === "production";

// ---------- Storage setup ----------
let storage;

if (isVercel) {
  // Vercel: No persistent disk → memory storage
  storage = multer.memoryStorage();
  console.log("Career Upload: Using memoryStorage (Vercel/Prod)");
} else {
  // Local: save file in uploads/career
  const uploadDir = path.join(process.cwd(), "uploads", "career");

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) =>
      cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
  });

  console.log("Career Upload: Using diskStorage (Local), dir:", uploadDir);
}

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

// ---------- POST /api/career ----------
// FormData fields: name, email, phone, position, message, cv (file)
router.post("/", upload.single("cv"), async (req, res) => {
  try {
    const { name, email, phone, position, message } = req.body;
    const file = req.file;

    if (!name || !email || !phone || !position || !message || !file) {
      return res
        .status(400)
        .json({ message: "All fields and CV are required!" });
    }

    let cv = {};

    if (!isVercel) {
      // Local: file system path + meta
      cv = {
        path: file.path,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      };
    } else {
      // Vercel: buffer + meta (stored in Mongo)
      cv = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        buffer: file.buffer, // Career schema me type: Buffer hai
      };
    }

    const newCareer = new Career({
      name,
      email,
      phone,
      position,
      message,
      cv,
    });

    await newCareer.save();

    return res
      .status(201)
      .json({ message: "Application submitted successfully!" });
  } catch (error) {
    console.error("Error saving career:", error);
    return res.status(500).json({ message: "Failed to submit application!" });
  }
});

// ---------- GET /api/career (Admin only, list) ----------
router.get("/", verifyAdmin, async (req, res) => {
  try {
    const careers = await Career.find()
      .sort({ createdAt: -1 })
      .select("-cv.buffer"); // list ke time heavy buffer mat bhejna

    return res.json(careers);
  } catch (error) {
    console.error("Error fetching careers:", error);
    return res.status(500).json({ message: "Failed to fetch applications!" });
  }
});

// ---------- GET /api/career/:id/cv (Admin only, download/view) ----------
router.get("/:id/cv", verifyAdmin, async (req, res) => {
  try {
    const career = await Career.findById(req.params.id);
    if (!career || !career.cv) {
      return res.status(404).json({ message: "CV not found" });
    }

    const { cv } = career;

    // Local: use file path
    if (!isVercel && cv.path) {
      return res.download(cv.path, cv.originalName || "cv.pdf");
    }

    // Vercel / Prod: send buffer
    if (isVercel && cv.buffer) {
      res.setHeader("Content-Type", cv.mimeType || "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${cv.originalName || "cv.pdf"}"`
      );
      return res.send(cv.buffer);
    }

    return res.status(404).json({ message: "CV data not available" });
  } catch (error) {
    console.error("Error fetching CV:", error);
    return res.status(500).json({ message: "Failed to fetch CV!" });
  }
});

// ---------- Multer + other error handler ----------
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error("Multer error:", err);
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    console.error("Career route error:", err);
    return res.status(500).json({ message: err.message || "Server error" });
  }
  return next();
});

export default router;
