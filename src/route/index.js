import express from "express";
import userRoutes from "./userroute.js";
import messageRoutes from "./channelchatroute.js";
import privateRoutes from "./privatemessageroute.js";
import channelRoute from "./channelroute.js"
import adminloginRoutes from "./adminloginroute.js"
import adminuserRoutes from "./adminuserroute.js"

const router = express.Router();

router.use("/users", userRoutes);
router.use("/channel", messageRoutes);
router.use("/private", privateRoutes);
router.use("/channel",channelRoute);
router.use("/admin", adminloginRoutes);
router.use("/admin/manage", adminuserRoutes);

export default router;