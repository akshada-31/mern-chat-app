const express = require('express');
const { registerUser, authUser, allUsers } = require('../controllers/userControllers');
const { protect } = require('../middleware/authMiddleware');
const User = require("../models/userModel");

const router = express.Router();

router.route('/').post(registerUser).get(allUsers);
router.post('/login', authUser);

// 👇 Add this
router.get('/:id', protect, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('name email pic online lastSeen');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
