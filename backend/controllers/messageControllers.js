const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");

// @desc    Send new message
// @route   POST /api/message
// @access  Protected
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;

    if (!content || !chatId) {
        console.log("❌ Invalid data passed into request");
        return res.sendStatus(400);
    }

    let message = await Message.create({
        sender: req.user._id,
        content,
        chat: chatId,
    });

    // ✅ Populate sender first
    message = await message.populate("sender", "name pic");

    // ✅ Deep-populate chat -> users
    message = await message.populate({
        path: "chat",
        populate: {
            path: "users",
            select: "name pic email",
        },
    });

    // ✅ Update latest message in chat
    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
});

// @desc    Get all messages for a chat
// @route   GET /api/message/:chatId
// @access  Protected
const allMessages = asyncHandler(async (req, res) => {
    const messages = await Message.find({ chat: req.params.chatId })
        .populate("sender", "name pic email")
        .populate("chat");

    res.json(messages);
});
// Edit Message
const editMessage = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    if (message.sender.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to edit this message');
    }

    message.content = content;
    const updatedMessage = await message.save();
    res.json(updatedMessage);
});

// Delete Message
const deleteMessage = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
        res.status(404);
        throw new Error('Message not found');
    }

    if (message.sender.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to delete this message');
    }

    await message.deleteOne();
    res.json({ message: 'Message deleted' });
});

module.exports = { sendMessage, allMessages, editMessage, deleteMessage };
