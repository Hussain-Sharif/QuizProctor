import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.substring(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth error", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default auth;
