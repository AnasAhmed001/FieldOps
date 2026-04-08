import { Router } from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect);

router.get("/", getNotifications);
router.patch("/read-all", markAllAsRead);         // must come before /:id to avoid conflict
router.patch("/:id/read", markAsRead);

export default router;
