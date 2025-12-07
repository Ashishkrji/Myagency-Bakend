import express from "express";
import axios from "axios";
import Contact from "../models/ContactModel.js";

const router = express.Router();

const GOOGLE_SHEET_WEBHOOK_URL =
  "https://script.google.com/macros/s/AKfycbzIL4-hG7KcmHUNCiHvQzyAOhWb9emiv9E-B6FhA9RwqwC75RjPO_TWxp0Dh2fi4alKOw/exec";

router.post("/", async (req, res) => {
  try {
    const { name, email, phone, service, message } = req.body;

    if (!name || !email || !phone || !service || !message) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    // 1) MongoDB me save
    const contact = new Contact({
      name,
      email,
      phone,
      service,
      message,
    });

    await contact.save();

    // 2) Google Sheet me bhejo
    axios
      .post(GOOGLE_SHEET_WEBHOOK_URL, {
        name,
        email,
        phone,
        service,
        message,
      })
      .then(() => {
        console.log("Data sent to Google Sheet");
      })
      .catch((err) => {
        console.error(
          "Google Sheet webhook error:",
          err.response?.data || err.message
        );
      });

    return res.status(200).json({
      success: true,
      message: "Thank you! We will contact you soon.",
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      data: contacts,
    });
  } catch (error) {
    console.error("Get contacts error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
});

export default router;
