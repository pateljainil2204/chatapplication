import express from "express";
import { registerUser, getAllUsers, onlineUsers } from "./usercontroller.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/", getAllUsers);
router.get("/online", onlineUsers );

export default router;