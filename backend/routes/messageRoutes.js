const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    sendMessage,
    allMessages,
    editMessage,
    deleteMessage,
} = require('../controllers/messageControllers'); // ✅ ensure these are exported

const router = express.Router();

// Send and get messages
router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, allMessages);

// Edit and delete a message
router.route('/:id')
    .put(protect, editMessage)      // Edit message by ID
    .delete(protect, deleteMessage) // Delete message by ID

module.exports = router;
