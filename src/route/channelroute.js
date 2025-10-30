import express from "express";
import getChannelChat from "../controller/channelcontroller.js";

const router = express.Router();

router.get("/channel/:channelName", getChannelChat);

export default router;