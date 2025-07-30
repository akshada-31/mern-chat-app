// server.js
const http = require("http");
const colors = require("colors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const app = require("./app");

dotenv.config();
connectDB();

const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`.yellow.bold);
});

// ✅ Socket.IO setup
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: "http://localhost:3000",
        credentials: true,
    },
});

// ✅ Make io accessible in request handlers
app.set("socketio", io);

io.on("connection", (socket) => {
    console.log("✅ Socket.IO connected");

    socket.on("setup", (userData) => {
        socket.join(userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => socket.join(room));
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (msg) => {
        const chat = msg.chat;
        if (!chat?.users) return;

        chat.users.forEach((user) => {
            if (user._id === msg.sender._id) return;
            socket.to(user._id).emit("message recieved", msg);
        });
    });

    socket.on("disconnect", () => {
        console.log("❌ User disconnected");
    });
});
