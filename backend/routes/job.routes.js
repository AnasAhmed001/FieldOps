import { Router } from "express";
import {
  getJobs,
  getJobById,
  createJob,
  assignJob,
  updateStatus,
  addNote,
} from "../controllers/jobController.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = Router();

// All job routes require authentication
router.use(protect);

router.get("/", getJobs);                                          // all roles (scoped internally)
router.post("/", authorize("admin"), createJob);                   // admin only
router.get("/:id", getJobById);                                    // all roles (scoped internally)
router.patch("/:id/assign", authorize("admin"), assignJob);        // admin only
router.patch("/:id/status", authorize("admin", "technician"), updateStatus); // admin + technician
router.post("/:id/notes", authorize("admin", "technician"), addNote);        // admin + technician

export default router;
