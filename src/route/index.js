import express from "express";
import privateMessageRoute from "./privatemessageroute.js";
import channelRoute from "./channelroute.js";

const router = express.Router();

router.use("/private", privateMessageRoute);
router.use("/channel", channelRoute);

export default router;