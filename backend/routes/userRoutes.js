const express = require('express');
const { registerUser, authUser, allUsers } = require('../controllers/userControllers');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/').post(registerUser).get(allUsers); // Removed `protect`

router.post('/login', authUser);


module.exports = router;