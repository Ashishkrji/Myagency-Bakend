import mongoose from "mongoose";

const cvSchema = new mongoose.Schema(
  {
    // Local: file path on disk
    path: { type: String },

    // Common fields
    originalName: { type: String },
    mimeType: { type: String },
    size: { type: Number },

    // Vercel / Prod: store file as buffer in DB
    buffer: { type: Buffer },
  },
  { _id: false }
);

const careerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    cv: cvSchema,
  },
  { timestamps: true }
);

const Career = mongoose.model("Career", careerSchema);

export default Career;
