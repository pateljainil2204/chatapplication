import express from "express";
import createchannel from "./createchannelcontroller.js";

const router = express.Router();

router.post("/", createchannel);

export default router;