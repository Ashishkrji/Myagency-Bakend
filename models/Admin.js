import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // hashed password
    },
  },
  { timestamps: true }
);

// Hot-reload safe (Next.js / Vercel me helpful)
const Admin =
  mongoose.models.Admin || mongoose.model("Admin", adminSchema);

export default Admin;
