const http = require("http");
const colors = require("colors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const app = require("./app");
const User = require("./models/userModel");
const { getAIReply } = require("./config/ai");

const path = require("path");
dotenv.config({ path: path.join(__dirname, ".env") });
console.log("MONGO_URI =", process.env.MONGO_URI);
connectDB();

const server = http.createServer(app);
const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`.yellow.bold);
});

// ✅ Socket.IO setup
const io = require("socket.io")(server, {
    pingTimeout: 60000,
    cors: {
        origin: [
            "http://localhost:3000",
            "https://talk-a-tive-g20h.onrender.com"
        ],
        credentials: true,
    },
});

app.set("socketio", io);

const onlineUsers = new Map(); // userId -> socketId

io.on("connection", (socket) => {
    console.log("✅ Socket.IO connected");

    socket.on("setup", async (userData) => {
        socket.join(userData._id);
        onlineUsers.set(userData._id, socket.id);

        // ✅ Mark user as online
        await User.findByIdAndUpdate(userData._id, {
            online: true,
        });

        io.emit("onlineUsers", Array.from(onlineUsers.keys())); // Notify all users
        socket.emit("connected");
    });

    socket.on("join chat", (room) => socket.join(room));
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", async (msg) => {
        console.log("🔥 MESSAGE RECEIVED:", msg.content || msg.message);
        const chat = msg.chat;
        if (!chat?.users) return;

        // 1. Send normal message (your existing logic)
        chat.users.forEach((user) => {
            if (user._id === msg.sender._id) return;
            socket.to(user._id).emit("message recieved", msg);
        });

        // 2. AI TRIGGER (NEW PART)
        const text = msg.content || msg.message || "";

        const isAIMessage =
            text.startsWith("@ai") ||
            chat.isAIChat === true; // optional future use

        if (isAIMessage) {
            const cleanText = text.replace("@ai", "").trim();

            const aiReply = await getAIReply(cleanText);

            const aiMessage = {
                chat: msg.chat,
                sender: {
                    _id: "ai-bot",
                    name: "AI Assistant",
                    email: "ai@bot.com",
                },
                content: aiReply,
            };

            chat.users.forEach((user) => {
                socket.to(user._id).emit("message recieved", aiMessage);
            });
        }
    });

    socket.on("disconnect", async () => {
        try {
            for (let [userId, socketId] of onlineUsers.entries()) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    await User.findByIdAndUpdate(userId, {
                        online: false,
                        lastSeen: new Date(),
                    });
                    break;
                }
            }
            io.emit("onlineUsers", Array.from(onlineUsers.keys()));
            console.log("❌ User disconnected");
        } catch (err) {
            console.error("Error updating user status on disconnect:", err);
        }
    });

});
