import User from "../models/User.js";

// GET /api/users  (admin only)
export const getUsers = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.role) filter.role = req.query.role;

    const users = await User.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

// POST /api/users  (admin only)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "name, email, password and role are required." });
    }

    const user = await User.create({ name, email, password, role });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, data: userObj });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/technicians  (admin only)
export const getTechnicians = async (req, res, next) => {
  try {
    const technicians = await User.find({ role: "technician", isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: technicians });
  } catch (err) {
    next(err);
  }
};

// GET /api/users/clients  (admin only)
export const getClients = async (req, res, next) => {
  try {
    const clients = await User.find({ role: "client", isActive: true }).sort({ name: 1 });
    res.status(200).json({ success: true, data: clients });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/:id/deactivate  (admin only) — soft delete
export const deactivateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: "You cannot deactivate yourself." });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};
