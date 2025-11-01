import express from "express";
import searchChannelMembers from "../controller/channelcontroller.js"

const router = express.Router();


router.get("/:channelName", searchChannelMembers);
router.get("/:channelName/:username", searchChannelMembers);

export default router;