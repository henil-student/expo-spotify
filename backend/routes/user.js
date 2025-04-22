const express = require('express');
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth'); // Correctly import the named export

const router = express.Router();

// Apply authentication middleware to all routes in this file
router.use(authenticate); // Use the imported function directly

// GET /api/user/likes - Get liked song IDs for the current user
router.get('/likes', userController.getLikedSongs);

// POST /api/user/likes - Like a song
router.post('/likes', userController.likeSong);

// DELETE /api/user/likes/:songId - Unlike a song
router.delete('/likes/:songId', userController.unlikeSong);

module.exports = router;
