import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import User from "../models/userModel.js";
import bcrypt from "bcrypt";

const seedAdmin = async () => {
  await connectDB();

  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const AdminUser = {
    fullName: "Admin User",
    email: "admin@mywebsite.com",
    password: adminPassword,
    phone: "9431897901",
    photo: "https://placehold.co/600x400?text=A",
    gender: "Male",
    representing: "N/A",
    occupation: "N/A",
    address: "N/A",
    city: "N/A",
    district: "N/A",
    state: "N/A",
    role: "Admin",
    status: "Active",
  };

  const existingAdmin = await User.findOne({ role: "Admin" });

  let admin;
  if (existingAdmin) {
    admin = await User.findByIdAndUpdate(existingAdmin._id, AdminUser, {
      new: true,
    });
    console.log("Admin User Updated Successfully", admin.email);
  } else {
    admin = await User.create(AdminUser);
    console.log("Admin User Created Successfully", admin.email);
  }

  process.exit(1);
};

seedAdmin();
