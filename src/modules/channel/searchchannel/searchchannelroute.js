import express from "express";
import searchChannel from "./searchchannelcontroller.js";

const router = express.Router();

router.get("/search/:channel", searchChannel);

export default router;