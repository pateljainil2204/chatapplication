import express from "express";
import { registerUser, getAllUsers } from "../controller/usercontroller.js";

const router = express.Router();

router.post("/register", registerUser);
router.get("/", getAllUsers);

export default router;