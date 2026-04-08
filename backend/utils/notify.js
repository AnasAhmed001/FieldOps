import Notification from "../models/Notification.js";

/**
 * Create an in-app notification.
 * Silently fails — notification errors should never break the main request.
 *
 * @param {Object} params
 * @param {string} params.recipient - User ObjectId
 * @param {string} params.message   - Human-readable message
 * @param {string} params.type      - job_assigned | status_changed | note_added | general
 * @param {string} [params.jobRef]  - Job ObjectId (optional)
 */
export const createNotification = async ({ recipient, message, type = "general", jobRef = null }) => {
  try {
    await Notification.create({ recipient, message, type, jobRef });
  } catch (err) {
    // Log but don't propagate — notifications are best-effort
    console.error("[Notify] Failed to create notification:", err.message);
  }
};
