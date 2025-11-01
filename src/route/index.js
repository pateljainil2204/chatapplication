import express from "express";
import userRoutes from "./userroute.js";
import messageRoutes from "./channelchatroute.js";
import privateRoutes from "./privatemessageroute.js";
import adminloginRoutes from "./adminloginroute.js";
import adminuserRoutes from "./adminuserroute.js";
import createchannelRoute from "./createchannelroute.js";
import channelmemberRoute from "./channelmemberroute.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/channel", messageRoutes);
router.use("/createchannel", createchannelRoute);
router.use("/channelmember", channelmemberRoute);
router.use("/private", privateRoutes);
router.use("/admin", adminloginRoutes);
router.use("/admin/manage", adminuserRoutes);

export default router;