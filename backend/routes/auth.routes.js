import { Router } from "express";
import { login, refresh, logout, getMe } from "../controllers/authController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
