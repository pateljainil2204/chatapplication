import express from "express";
import getChannelChat from "../controller/channelchatcontroller.js";

const router = express.Router();

router.get("/:channelName", getChannelChat);

export default router;