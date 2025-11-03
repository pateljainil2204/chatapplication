import express from "express";
import { createchannel, deleteChannel} from "./createchannelcontroller.js";

const router = express.Router();

router.post("/create", createchannel);
router.delete("/delete", deleteChannel);

export default router;