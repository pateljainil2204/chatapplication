import express from "express";
import getGroupMembers from "../controller/channelcontroller.js";

const router = express.Router();

router.get("/member/:channelName/", getGroupMembers);

export default router;