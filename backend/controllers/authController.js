import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";

// Helper: sign tokens
const signAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "15m" });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    // Directly compare candidate password against stored bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const accessToken = signAccessToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, cookieOptions);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      success: true,
      data: { accessToken, user: userObj },
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: "No refresh token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "User not found or deactivated." });
    }

    const accessToken = signAccessToken(user._id);
    res.status(200).json({ success: true, data: { accessToken } });
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid or expired refresh token." });
    }
    next(err);
  }
};

// POST /api/auth/logout
export const logout = async (req, res, next) => {
  try {
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "strict" });
    res.status(200).json({ success: true, data: null, message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me  (protected)
export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
};
