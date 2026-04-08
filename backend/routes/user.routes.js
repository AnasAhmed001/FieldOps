import { Router } from "express";
import {
  getUsers,
  createUser,
  getTechnicians,
  getClients,
  deactivateUser,
} from "../controllers/userController.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// All user routes are admin-only
router.use(protect, authorize("admin"));

router.get("/", getUsers);
router.post("/", createUser);
router.get("/technicians", getTechnicians);
router.get("/clients", getClients);
router.patch("/:id/deactivate", deactivateUser);

export default router;
