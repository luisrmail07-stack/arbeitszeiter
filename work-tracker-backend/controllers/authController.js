const jwt = require('jsonwebtoken');
const User = require('../models/User');

class AuthController {
    // Generate JWT token
    static generateToken(userId) {
        return jwt.sign(
            { userId },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );
    }

    // Generate refresh token
    static generateRefreshToken(userId) {
        return jwt.sign(
            { userId },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
        );
    }

    // Register new user
    static async register(req, res, next) {
        try {
            const { email, password, fullName, profileImageUrl } = req.body;

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'User with this email already exists'
                });
            }

            // Create user
            const user = await User.create({
                email,
                password,
                fullName,
                profileImageUrl
            });

            // Generate tokens
            const token = AuthController.generateToken(user.id);
            const refreshToken = AuthController.generateRefreshToken(user.id);

            res.status(201).json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        fullName: user.full_name,
                        profileImageUrl: user.profile_image_url
                    },
                    token,
                    refreshToken
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Login user
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            // Verify password
            const isValidPassword = await User.verifyPassword(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }

            // Update last login
            await User.updateLastLogin(user.id);

            // Generate tokens
            const token = AuthController.generateToken(user.id);
            const refreshToken = AuthController.generateRefreshToken(user.id);

            res.json({
                success: true,
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        fullName: user.full_name,
                        profileImageUrl: user.profile_image_url,
                        lastLogin: user.last_login
                    },
                    token,
                    refreshToken
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get current user profile
    static async getProfile(req, res, next) {
        try {
            res.json({
                success: true,
                data: {
                    user: {
                        id: req.user.id,
                        email: req.user.email,
                        fullName: req.user.full_name,
                        profileImageUrl: req.user.profile_image_url,
                        createdAt: req.user.created_at,
                        lastLogin: req.user.last_login
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Refresh token
    static async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    error: 'Refresh token is required'
                });
            }

            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            // Generate new tokens
            const newToken = AuthController.generateToken(decoded.userId);
            const newRefreshToken = AuthController.generateRefreshToken(decoded.userId);

            res.json({
                success: true,
                data: {
                    token: newToken,
                    refreshToken: newRefreshToken
                }
            });
        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid or expired refresh token'
                });
            }
            next(error);
        }
    }

    // Update profile
    static async updateProfile(req, res, next) {
        try {
            const { fullName, profileImageUrl } = req.body;

            const updatedUser = await User.updateProfile(req.userId, {
                fullName,
                profileImageUrl
            });

            res.json({
                success: true,
                data: {
                    user: {
                        id: updatedUser.id,
                        email: updatedUser.email,
                        fullName: updatedUser.full_name,
                        profileImageUrl: updatedUser.profile_image_url
                    }
                }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
