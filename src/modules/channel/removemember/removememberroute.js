import express from "express";
import removeMember from "./removemembercontroller.js";

const router = express.Router();

router.patch("/removemember/:channel", removeMember);

export default router;