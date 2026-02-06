const { body, param, query, validationResult } = require('express-validator');

// Middleware to check validation results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Validation rules for user registration
const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('fullName')
        .trim()
        .notEmpty()
        .withMessage('Full name is required')
        .isLength({ min: 2, max: 255 })
        .withMessage('Full name must be between 2 and 255 characters'),
    validate
];

// Validation rules for login
const loginValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    validate
];

// Validation rules for creating a project
const createProjectValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Project name is required')
        .isLength({ max: 255 })
        .withMessage('Project name must not exceed 255 characters'),
    body('description')
        .optional()
        .trim(),
    body('color')
        .optional()
        .isString()
        .withMessage('Color must be a string'),
    body('icon')
        .optional()
        .isString()
        .withMessage('Icon must be a string'),
    validate
];

// Validation rules for updating a project
const updateProjectValidation = [
    param('id')
        .isUUID()
        .withMessage('Invalid project ID'),
    body('name')
        .optional()
        .trim()
        .notEmpty()
        .withMessage('Project name cannot be empty')
        .isLength({ max: 255 })
        .withMessage('Project name must not exceed 255 characters'),
    body('description')
        .optional()
        .trim(),
    body('color')
        .optional()
        .isString(),
    body('icon')
        .optional()
        .isString(),
    body('is_active')
        .optional()
        .isBoolean()
        .withMessage('is_active must be a boolean'),
    validate
];

// Validation rules for punch in
const punchInValidation = [
    body('projectId')
        .optional()
        .isUUID()
        .withMessage('Invalid project ID'),
    body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters'),
    validate
];

// Validation rules for session history query
const sessionHistoryValidation = [
    query('startDate')
        .optional()
        .isISO8601()
        .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
        .optional()
        .isISO8601()
        .withMessage('End date must be a valid ISO 8601 date'),
    query('projectId')
        .optional()
        .isUUID()
        .withMessage('Invalid project ID'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    query('offset')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Offset must be a non-negative integer'),
    validate
];

// Validation rules for weekly goal
const weeklyGoalValidation = [
    body('targetHours')
        .isInt({ min: 1, max: 168 })
        .withMessage('Target hours must be between 1 and 168 (hours in a week)'),
    body('weekStartDate')
        .optional()
        .isISO8601()
        .withMessage('Week start date must be a valid ISO 8601 date'),
    validate
];

// Validation for UUID params
const uuidParamValidation = [
    param('id')
        .isUUID()
        .withMessage('Invalid ID format'),
    validate
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    createProjectValidation,
    updateProjectValidation,
    punchInValidation,
    sessionHistoryValidation,
    weeklyGoalValidation,
    uuidParamValidation
};
