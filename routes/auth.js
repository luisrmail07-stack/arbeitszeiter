const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');
const { registerValidation, loginValidation } = require('../middleware/validation');

// Public routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);
router.post('/refresh', AuthController.refreshToken);

// Protected routes
router.get('/me', authMiddleware, AuthController.getProfile);
router.put('/profile', authMiddleware, AuthController.updateProfile);

module.exports = router;
