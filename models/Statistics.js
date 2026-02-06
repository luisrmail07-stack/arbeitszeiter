const { query } = require('../config/database');

class Statistics {
    // Get today's total work time
    static async getTodayTotal(userId) {
        const today = new Date().toISOString().split('T')[0];

        const result = await query(
            `SELECT 
        COALESCE(total_minutes, 0) as total_minutes,
        COALESCE(session_count, 0) as session_count
       FROM daily_stats
       WHERE user_id = $1 AND date = $2`,
            [userId, today]
        );

        // If no stats yet, check for active session
        if (result.rows.length === 0 || result.rows[0].total_minutes === 0) {
            const activeResult = await query(
                `SELECT 
          COALESCE(EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time)) / 60, 0) as active_minutes
         FROM work_sessions
         WHERE user_id = $1 AND status = 'active'`,
                [userId]
            );

            const activeMinutes = activeResult.rows[0]?.active_minutes || 0;
            return {
                total_minutes: (result.rows[0]?.total_minutes || 0) + activeMinutes,
                session_count: result.rows[0]?.session_count || 0,
                has_active_session: activeMinutes > 0
            };
        }

        return {
            total_minutes: result.rows[0].total_minutes,
            session_count: result.rows[0].session_count,
            has_active_session: false
        };
    }

    // Get weekly progress
    static async getWeeklyProgress(userId) {
        const weekStart = this.getWeekStart();

        // Get weekly goal
        const goalResult = await query(
            'SELECT target_hours FROM weekly_goals WHERE user_id = $1 AND week_start_date = $2',
            [userId, weekStart]
        );
        const targetHours = goalResult.rows[0]?.target_hours || 40;

        // Get total minutes for the week
        const statsResult = await query(
            `SELECT COALESCE(SUM(total_minutes), 0) as total_minutes
       FROM daily_stats
       WHERE user_id = $1 AND date >= $2 AND date < $2::date + 7`,
            [userId, weekStart]
        );

        const totalMinutes = parseFloat(statsResult.rows[0].total_minutes);
        const totalHours = totalMinutes / 60;
        const percentage = Math.min(100, (totalHours / targetHours) * 100);

        return {
            total_hours: totalHours,
            target_hours: targetHours,
            percentage: Math.round(percentage),
            remaining_hours: Math.max(0, targetHours - totalHours)
        };
    }

    // Get active streak (consecutive days with work)
    static async getActiveStreak(userId) {
        const result = await query(
            `WITH daily_work AS (
        SELECT date, total_minutes
        FROM daily_stats
        WHERE user_id = $1 AND total_minutes > 0
        ORDER BY date DESC
      ),
      streak_calc AS (
        SELECT 
          date,
          date - (ROW_NUMBER() OVER (ORDER BY date DESC))::integer AS streak_group
        FROM daily_work
      )
      SELECT COUNT(*) as streak_days
      FROM streak_calc
      WHERE streak_group = (
        SELECT streak_group 
        FROM streak_calc 
        ORDER BY date DESC 
        LIMIT 1
      )`,
            [userId]
        );

        return result.rows[0]?.streak_days || 0;
    }

    // Get complete dashboard data
    static async getDashboardData(userId) {
        const [todayTotal, weeklyProgress, activeStreak] = await Promise.all([
            this.getTodayTotal(userId),
            this.getWeeklyProgress(userId),
            this.getActiveStreak(userId)
        ]);

        return {
            today: todayTotal,
            weekly: weeklyProgress,
            streak: activeStreak
        };
    }

    // Get statistics for date range
    static async getDateRangeStats(userId, startDate, endDate) {
        const result = await query(
            `SELECT 
        date,
        total_minutes,
        session_count
       FROM daily_stats
       WHERE user_id = $1 AND date >= $2 AND date <= $3
       ORDER BY date ASC`,
            [userId, startDate, endDate]
        );

        return result.rows;
    }

    // Update or create weekly goal
    static async setWeeklyGoal(userId, targetHours, weekStartDate = null) {
        const weekStart = weekStartDate || this.getWeekStart();

        const result = await query(
            `INSERT INTO weekly_goals (user_id, week_start_date, target_hours)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, week_start_date)
       DO UPDATE SET target_hours = $3
       RETURNING *`,
            [userId, weekStart, targetHours]
        );

        return result.rows[0];
    }

    // Helper: Get start of current week (Monday)
    static getWeekStart() {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        const monday = new Date(now.setDate(diff));
        return monday.toISOString().split('T')[0];
    }
}

module.exports = Statistics;
