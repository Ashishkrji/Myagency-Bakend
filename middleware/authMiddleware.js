import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js"; // make sure this path is correct

export const verifyAdmin = async (req, res, next) => {
  try {
    let token;

    // 1) From Authorization header: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // (Optional fallback) 2) From query ?token=...
    if (!token && req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access Denied: No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optional: check in DB
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    // Attach admin to request if needed later
    req.admin = admin;

    next();
  } catch (error) {
    console.error("verifyAdmin error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
