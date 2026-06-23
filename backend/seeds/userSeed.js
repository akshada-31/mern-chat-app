const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/userModel");

dotenv.config();

const seedGuestUser = async () => {
    try {
        await connectDB();

        const email = "guest@example.com";

        // check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            console.log("✅ Guest user already exists");
            process.exit();
        }

        // create hashed password
        const hashedPassword = await bcrypt.hash("123456", 10);

        // create user
        await User.create({
            name: "Guest User",
            email,
            password: hashedPassword,
            pic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
        });

        console.log("🎉 Guest user created successfully");
        process.exit();
    } catch (err) {
        console.error("❌ Seed error:", err);
        process.exit(1);
    }
};

seedGuestUser();