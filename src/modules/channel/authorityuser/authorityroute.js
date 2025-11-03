import express from "express";
import giveAuthority from "./authoritycontroller.js";

const router = express.Router();

router.patch("/giveauthority/:channel", giveAuthority);

export default router;