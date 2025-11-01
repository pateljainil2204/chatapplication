import express from "express";
import getAllUsersForAdmin  from "../controller/adminusercontroller.js";
import verifyAdmin from "../middleware/adminauth.js";

const router = express.Router();

router.get("/users", verifyAdmin, getAllUsersForAdmin);

export default router;