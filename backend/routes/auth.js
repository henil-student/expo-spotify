const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/signup
router.post('/signup', authController.signup);

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/logout (protected route)
router.post('/logout', authenticate, authController.logout);

// GET /api/auth/profile (protected route)
router.get('/profile', authenticate, authController.getProfile);

// PUT /api/auth/profile (protected route)
router.put('/profile', authenticate, authController.updateProfile);

// For testing auth middleware
router.get('/protected', authenticate, (req, res) => {
  res.json({ message: 'You have access to this protected route', user: req.user });
});

module.exports = router;
