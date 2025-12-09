import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import Admin from "../models/Admin.js";

dotenv.config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Mongo connected");

    const email = "ashish@myagency.com";
    const plainPassword = "Maajanki@2025";

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      console.log("Admin already exists with this email.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    await Admin.create({
      email,
      password: hashedPassword,
    });

    console.log("Admin created successfully");
    console.log("Login email:", email);
    console.log("Login password:", plainPassword);

    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
}

createAdmin();
