import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import connectDB from "../config/dbConfig.js";

dotenv.config();

const seed = async () => {
  await connectDB();

  const existing = await User.findOne({ role: "admin" });

  if (existing) {
    console.log("✅ Admin user already exists:", existing.email);
    process.exit(0);
  }

  const admin = await User.create({
    name: "Admin",
    email: "admin@fieldops.com",
    password: "Admin@123",
    role: "admin",
  });

  console.log("✅ Default admin created:");
  console.log("   Email:   ", admin.email);
  console.log("   Password: Admin@123");
  console.log("   Role:    ", admin.role);

  process.exit(0);
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
