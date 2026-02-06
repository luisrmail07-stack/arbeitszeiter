const express = require('express');
const router = express.Router();
const StatisticsController = require('../controllers/statisticsController');
const { authMiddleware } = require('../middleware/auth');
const { weeklyGoalValidation } = require('../middleware/validation');

// All statistics routes require authentication
router.use(authMiddleware);

// Statistics endpoints
router.get('/today', StatisticsController.getTodayTotal);
router.get('/weekly', StatisticsController.getWeeklyProgress);
router.get('/streak', StatisticsController.getActiveStreak);
router.get('/dashboard', StatisticsController.getDashboard);
router.get('/range', StatisticsController.getDateRangeStats);

// Weekly goal management
router.post('/weekly-goal', weeklyGoalValidation, StatisticsController.setWeeklyGoal);

module.exports = router;
