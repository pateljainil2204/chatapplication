import express from "express";
import { getprivatechat } from "../controller/privatemessagecontroller.js";

const router = express.Router();
router.get("/:userId", getprivatechat);

export default router;