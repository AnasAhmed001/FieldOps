import Job from "../models/Job.js";
import { createNotification } from "../utils/notify.js";

// Allowed status transitions per role
const TECHNICIAN_TRANSITIONS = {
  assigned: ["in_progress"],
  in_progress: ["on_hold", "completed"],
  on_hold: ["in_progress"],
};

const LOCKED_STATUSES = ["completed", "cancelled"];

// GET /api/jobs  (scoped by role)
export const getJobs = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};

    // Scope by role
    if (req.user.role === "technician") filter.assignedTechnician = req.user._id;
    if (req.user.role === "client") filter.client = req.user._id;
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Job.countDocuments(filter);

    const jobs = await Job.find(filter)
      .populate("client", "name email")
      .populate("assignedTechnician", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: jobs,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/jobs/:id  (scoped by role)
export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("client", "name email")
      .populate("assignedTechnician", "name email")
      .populate("notes.addedBy", "name role")
      .populate("activityLog.performedBy", "name role");

    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    // Access control
    if (req.user.role === "technician" && job.assignedTechnician?._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }
    if (req.user.role === "client" && job.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// POST /api/jobs  (admin only)
export const createJob = async (req, res, next) => {
  try {
    const { title, description, client, scheduledDate } = req.body;

    if (!title || !description || !client) {
      return res.status(400).json({ success: false, message: "title, description and client are required." });
    }

    const job = await Job.create({
      title,
      description,
      client,
      scheduledDate: scheduledDate || null,
      activityLog: [
        {
          action: "Job created",
          performedBy: req.user._id,
          timestamp: new Date(),
        },
      ],
    });

    await job.populate("client", "name email");

    // Notify the client
    await createNotification({
      recipient: client,
      message: `A new service job "${title}" has been created for you.`,
      type: "general",
      jobRef: job._id,
    });

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/jobs/:id/assign  (admin only)
export const assignJob = async (req, res, next) => {
  try {
    const { technicianId } = req.body;

    if (!technicianId) {
      return res.status(400).json({ success: false, message: "technicianId is required." });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    if (LOCKED_STATUSES.includes(job.status)) {
      return res.status(400).json({ success: false, message: `Cannot assign a ${job.status} job.` });
    }

    job.assignedTechnician = technicianId;
    job.status = "assigned";
    job.activityLog.push({
      action: `Job assigned to technician`,
      performedBy: req.user._id,
      timestamp: new Date(),
    });

    await job.save();
    await job.populate("client assignedTechnician", "name email");

    // Notify the technician
    await createNotification({
      recipient: technicianId,
      message: `You have been assigned to job "${job.title}".`,
      type: "job_assigned",
      jobRef: job._id,
    });

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/jobs/:id/status  (admin + technician with restrictions)
export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: "status is required." });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    // Technician access check
    if (req.user.role === "technician" && job.assignedTechnician?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // Locked status check (admin included)
    if (LOCKED_STATUSES.includes(job.status)) {
      return res.status(400).json({ success: false, message: `Job is ${job.status} and cannot be updated.` });
    }

    // Technician transition validation
    if (req.user.role === "technician") {
      const allowed = TECHNICIAN_TRANSITIONS[job.status] || [];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Technicians cannot transition from '${job.status}' to '${status}'.`,
        });
      }
    }

    const prevStatus = job.status;
    job.status = status;
    job.activityLog.push({
      action: `Status changed from '${prevStatus}' to '${status}'`,
      performedBy: req.user._id,
      timestamp: new Date(),
    });

    await job.save();
    await job.populate("client assignedTechnician", "name email");

    // Notify client and admin about status change
    await createNotification({
      recipient: job.client,
      message: `Your job "${job.title}" status changed to: ${status.replace("_", " ")}.`,
      type: "status_changed",
      jobRef: job._id,
    });

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// POST /api/jobs/:id/notes  (admin + technician)
export const addNote = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: "Note text is required." });
    }

    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found." });

    // Technician access check
    if (req.user.role === "technician" && job.assignedTechnician?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    job.notes.push({ text, addedBy: req.user._id, addedAt: new Date() });
    job.activityLog.push({
      action: `Note added by ${req.user.role}`,
      performedBy: req.user._id,
      timestamp: new Date(),
    });

    await job.save();
    await job.populate("client assignedTechnician notes.addedBy", "name email role");

    res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};
