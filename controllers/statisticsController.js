const Statistics = require('../models/Statistics');
const WorkSession = require('../models/WorkSession');

class StatisticsController {
    // Get today's total work time
    static async getTodayTotal(req, res, next) {
        try {
            const stats = await Statistics.getTodayTotal(req.userId);

            // Format response
            const hours = Math.floor(stats.total_minutes / 60);
            const minutes = Math.floor(stats.total_minutes % 60);

            res.json({
                success: true,
                data: {
                    total_minutes: Math.floor(stats.total_minutes),
                    formatted: `${hours}h ${minutes}m`,
                    session_count: stats.session_count,
                    has_active_session: stats.has_active_session
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get weekly progress
    static async getWeeklyProgress(req, res, next) {
        try {
            const progress = await Statistics.getWeeklyProgress(req.userId);

            res.json({
                success: true,
                data: {
                    total_hours: Math.round(progress.total_hours * 10) / 10,
                    target_hours: progress.target_hours,
                    percentage: progress.percentage,
                    remaining_hours: Math.round(progress.remaining_hours * 10) / 10,
                    formatted: `${Math.floor(progress.total_hours)}h / ${progress.target_hours}h`
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get active streak
    static async getActiveStreak(req, res, next) {
        try {
            const streak = await Statistics.getActiveStreak(req.userId);

            res.json({
                success: true,
                data: {
                    streak_days: streak,
                    formatted: `${streak} ${streak === 1 ? 'Day' : 'Days'}`
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get complete dashboard data
    static async getDashboard(req, res, next) {
        try {
            const [dashboardData, activeSession, recentSessions] = await Promise.all([
                Statistics.getDashboardData(req.userId),
                WorkSession.getActiveSession(req.userId),
                WorkSession.getRecentSessions(req.userId, 3)
            ]);

            // Calculate current duration for active session
            let currentSessionDuration = 0;
            if (activeSession) {
                const startTime = new Date(activeSession.start_time);
                currentSessionDuration = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60);
            }

            res.json({
                success: true,
                data: {
                    today: {
                        total_minutes: Math.floor(dashboardData.today.total_minutes),
                        hours: Math.floor(dashboardData.today.total_minutes / 60),
                        minutes: Math.floor(dashboardData.today.total_minutes % 60),
                        session_count: dashboardData.today.session_count,
                        formatted: `${Math.floor(dashboardData.today.total_minutes / 60)}h ${Math.floor(dashboardData.today.total_minutes % 60)}m`
                    },
                    weekly: {
                        total_hours: Math.round(dashboardData.weekly.total_hours * 10) / 10,
                        target_hours: dashboardData.weekly.target_hours,
                        percentage: dashboardData.weekly.percentage,
                        remaining_hours: Math.round(dashboardData.weekly.remaining_hours * 10) / 10
                    },
                    streak: {
                        days: dashboardData.streak,
                        formatted: `${dashboardData.streak} ${dashboardData.streak === 1 ? 'Day' : 'Days'}`
                    },
                    active_session: activeSession ? {
                        ...activeSession,
                        current_duration_minutes: currentSessionDuration,
                        formatted_duration: `${Math.floor(currentSessionDuration / 60)}h ${currentSessionDuration % 60}m`
                    } : null,
                    recent_sessions: recentSessions
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get statistics for date range
    static async getDateRangeStats(req, res, next) {
        try {
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    error: 'startDate and endDate are required'
                });
            }

            const stats = await Statistics.getDateRangeStats(req.userId, startDate, endDate);

            res.json({
                success: true,
                data: {
                    stats,
                    count: stats.length,
                    date_range: { startDate, endDate }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Set weekly goal
    static async setWeeklyGoal(req, res, next) {
        try {
            const { targetHours, weekStartDate } = req.body;

            const goal = await Statistics.setWeeklyGoal(req.userId, targetHours, weekStartDate);

            res.json({
                success: true,
                message: 'Weekly goal updated successfully',
                data: { goal }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = StatisticsController;
