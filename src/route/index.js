import express from "express";
const router = express.Router();

// example test route
router.get("/test", (req, res) => {
  res.json({ message: "Router working fine" });
});

export default router;