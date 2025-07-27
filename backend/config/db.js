const mongoose = require("mongoose");

const connectDB = async () => {
    if (process.env.NODE_ENV === 'test') {
        console.log("🧪 Test environment detected. Skipping DB connection.");
        return;
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline);
    } catch (error) {
        console.log(`Error: ${error.message}`.red.bold);
        throw new Error("Database connection failed");
    }
};

module.exports = connectDB;
