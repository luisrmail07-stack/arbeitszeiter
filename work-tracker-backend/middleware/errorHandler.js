const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Database errors
    if (err.code === '23505') {
        return res.status(409).json({
            success: false,
            error: 'Resource already exists',
            details: err.detail
        });
    }

    if (err.code === '23503') {
        return res.status(400).json({
            success: false,
            error: 'Referenced resource does not exist',
            details: err.detail
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Token expired'
        });
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: err.message
        });
    }

    // Custom application errors
    if (err.statusCode) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message
        });
    }

    // Default error
    res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
};

// 404 handler
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route ${req.method} ${req.originalUrl} not found`
    });
};

module.exports = { errorHandler, notFoundHandler };
