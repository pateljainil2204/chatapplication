import express from "express";
import userRoutes from "./userroute.js";
import messageRoutes from "./channelroute.js";
import privateRoutes from "./privatemessageroute.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/channels", messageRoutes);
router.use("/private", privateRoutes);

export default router;