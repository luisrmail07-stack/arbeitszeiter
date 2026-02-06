require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { pool } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const projectRoutes = require('./routes/projects');
const statisticsRoutes = require('./routes/statistics');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Work Tracker API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/stats', statisticsRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Work Tracker API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            sessions: '/api/sessions',
            projects: '/api/projects',
            statistics: '/api/stats'
        }
    });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
    console.log('=================================');
    console.log('  Work Tracker API Server');
    console.log('=================================');
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Server running on port ${PORT}`);
    console.log(`API URL: http://localhost:${PORT}`);
    console.log('=================================');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        pool.end(() => {
            console.log('Database pool closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        pool.end(() => {
            console.log('Database pool closed');
            process.exit(0);
        });
    });
});

module.exports = app;
