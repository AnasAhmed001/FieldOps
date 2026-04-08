import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const activityLogSchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: true }
);

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "on_hold", "completed", "cancelled"],
      default: "pending",
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Client is required"],
    },
    assignedTechnician: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    notes: [noteSchema],
    activityLog: [activityLogSchema],
  },
  { timestamps: true }
);

// Indexes for common query patterns
jobSchema.index({ status: 1 });
jobSchema.index({ client: 1 });
jobSchema.index({ assignedTechnician: 1 });

const Job = mongoose.model("Job", jobSchema);
export default Job;
