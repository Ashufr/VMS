import express from "express";
import { registerUser, loginUser, registerAdmin, loginAdmin, logoutUser, logoutAdmin } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser)
.post("/login", loginUser)
.post("/register/admin", registerAdmin)
.post("/login/admin", loginAdmin)
.post("/logout", logoutUser)
.post("/logout/admin", logoutAdmin);

export default router