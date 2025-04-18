const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Test connection endpoint - no auth required
router.get('/test', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  res.json({
    status: 'success',
    message: 'Connection test successful',
    timestamp: new Date().toISOString(),
    clientIp,
    headers: req.headers
  });
});

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
