import express from "express";
import { registerUser, 
         getAllUsers, 
         onlineUsers , 
         onlineusersinchannel, 
         deleteUser } from "./usercontroller.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/", getAllUsers);
router.get("/online", onlineUsers );
router.get("/online/:channel", onlineusersinchannel);
router.delete("/delete/:username", deleteUser);

export default router;