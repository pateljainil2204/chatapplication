import express from "express";
import { getgroupmessages, getgroupmembers } from "../controller/channelcontroller.js";

const router = express.Router();
router.get("/:channelId/messages", getgroupmessages);
router.get("/:channelId/members", getgroupmembers);

export default router;