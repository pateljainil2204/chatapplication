import express from "express";
import getPrivateChat from "./privatemessagecontroller.js";

const router = express.Router();

router.get("/private/:user1/:user2", getPrivateChat);

export default router;