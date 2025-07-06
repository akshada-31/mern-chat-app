const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const colors = require("colors");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");
const path = require("path");
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());



// Routes
app.use("/api/user", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/message", messageRoutes);
// -----------DEPLOYMENT-------------
const __dirname1 = path.resolve();
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname1, "/frontend/build")));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"));
    });
} else {
    app.get('/', (req, res) => {
        res.send("API is running successfully");
    });
}


// -----------DEPLOYMENT-------------

// Middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT;
const server = app.listen(PORT, () =>
    console.log(`🚀 Server started on port ${PORT}`.yellow.bold)
);

// ✅ Setup Socket.IO
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("✅ Socket.IO connected");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
        console.log("🧩 User setup:", userData._id);
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("📥 User joined chat room:", room);
    });

    socket.on('typing', (room) => socket.in(room).emit("typing"));
    socket.on('stop typing', (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageRecieved) => {
        const chat = newMessageRecieved.chat;
        if (!chat.users) return console.log("❌ chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id === newMessageRecieved.sender._id) return;

            // Send to all other users in the chat
            socket.to(user._id).emit("message recieved", newMessageRecieved);
            console.log("📤 Sent message to:", user._id);
        });
    });

    socket.on("disconnect", () => {
        console.log("❌ User disconnected");
    });
});
