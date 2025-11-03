import express from "express";
import userRoutes from "../modules/user/userroute.js";
import messageRoutes from "../modules/channel/channelchat/channelchatroute.js";
import privateRoutes from "../modules/privatemessage/privatemessageroute.js";
import adminloginRoutes from "../modules/admin/adminlogin/adminloginroute.js";
import adminuserRoutes from "../modules/admin/adminuser/adminuserroute.js";
import createchannelRoute from "../modules/channel/createchannel/createchannelroute.js";
import channelmemberRoute from "../modules/channel/channelsearch/channelmemberroute.js";
import removeChannelMemberRoute from "../modules/channel/removemember/removememberroute.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/channel", messageRoutes);
router.use("/channel", createchannelRoute);
router.use("/channelmember", channelmemberRoute);
router.use("/private", privateRoutes);
router.use("/admin", adminloginRoutes);
router.use("/admin/manage", adminuserRoutes);
router.use("/channel", removeChannelMemberRoute);

export default router;