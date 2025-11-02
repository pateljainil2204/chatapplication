import jwt from "jsonwebtoken";
import Admin from "../modules/admin/adminmodel.js"

const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);

    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

export default verifyAdmin;
