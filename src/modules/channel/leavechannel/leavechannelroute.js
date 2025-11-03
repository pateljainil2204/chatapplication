import express from "express";
import leaveChannel from "./leavechannelcontroller.js";

const router = express.Router();

router.patch("/leave/:channel", leaveChannel);

export default router;