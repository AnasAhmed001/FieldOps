import Notification from "../models/Notification.js";

// GET /api/notifications  (current user's notifications)
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("jobRef", "title status")
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    res.status(200).json({ success: true, data: { notifications, unreadCount } });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id, // ownership check
    });

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({ success: true, data: notification });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/notifications/read-all  (mark all as read for current user)
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });

    res.status(200).json({ success: true, data: null, message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
};
