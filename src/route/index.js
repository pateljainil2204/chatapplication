import express from "express";
import userRoutes from "./userroute.js";
import messageRoutes from "./channelroute.js";
import privateRoutes from "./privatemessageroute.js";
import adminloginRoutes from "./adminloginroute.js"
import adminuserRoutes from "./adminuserroute.js"

const router = express.Router();

router.use("/users", userRoutes);
router.use("/channels", messageRoutes);
router.use("/private", privateRoutes);
router.use("/admin", adminloginRoutes);
router.use("/admin/manage", adminuserRoutes);

export default router;