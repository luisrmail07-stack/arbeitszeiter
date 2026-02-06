const { query, getClient } = require('../config/database');

class WorkSession {
    // Start a new work session (punch in)
    static async punchIn({ userId, projectId, notes = null }) {
        // Check if there's already an active session
        const activeSession = await this.getActiveSession(userId);
        if (activeSession) {
            throw new Error('You already have an active session. Please punch out first.');
        }

        const result = await query(
            `INSERT INTO work_sessions (user_id, project_id, start_time, notes, status)
       VALUES ($1, $2, CURRENT_TIMESTAMP, $3, 'active')
       RETURNING *`,
            [userId, projectId, notes]
        );

        return result.rows[0];
    }

    // End a work session (punch out)
    static async punchOut(userId) {
        const client = await getClient();

        try {
            await client.query('BEGIN');

            // Get active session
            const sessionResult = await client.query(
                `UPDATE work_sessions 
         SET end_time = CURRENT_TIMESTAMP, 
             status = 'completed',
             duration_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time)) / 60
         WHERE user_id = $1 AND status = 'active'
         RETURNING *`,
                [userId]
            );

            if (sessionResult.rows.length === 0) {
                throw new Error('No active session found');
            }

            const session = sessionResult.rows[0];

            // Update daily stats
            await client.query(
                `INSERT INTO daily_stats (user_id, date, total_minutes, session_count)
         VALUES ($1, $2, $3, 1)
         ON CONFLICT (user_id, date)
         DO UPDATE SET 
           total_minutes = daily_stats.total_minutes + $3,
           session_count = daily_stats.session_count + 1`,
                [userId, new Date().toISOString().split('T')[0], session.duration_minutes]
            );

            await client.query('COMMIT');
            return session;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    // Get active session for user
    static async getActiveSession(userId) {
        const result = await query(
            `SELECT ws.*, p.name as project_name, p.color as project_color, p.icon as project_icon
       FROM work_sessions ws
       LEFT JOIN projects p ON ws.project_id = p.id
       WHERE ws.user_id = $1 AND ws.status = 'active'
       LIMIT 1`,
            [userId]
        );
        return result.rows[0];
    }

    // Get recent sessions
    static async getRecentSessions(userId, limit = 10) {
        const result = await query(
            `SELECT ws.*, p.name as project_name, p.color as project_color, p.icon as project_icon
       FROM work_sessions ws
       LEFT JOIN projects p ON ws.project_id = p.id
       WHERE ws.user_id = $1 AND ws.status = 'completed'
       ORDER BY ws.start_time DESC
       LIMIT $2`,
            [userId, limit]
        );
        return result.rows;
    }

    // Get session history with filters
    static async getHistory(userId, { startDate, endDate, projectId, limit = 50, offset = 0 }) {
        let sql = `
      SELECT ws.*, p.name as project_name, p.color as project_color, p.icon as project_icon
      FROM work_sessions ws
      LEFT JOIN projects p ON ws.project_id = p.id
      WHERE ws.user_id = $1 AND ws.status = 'completed'
    `;
        const params = [userId];
        let paramCount = 2;

        if (startDate) {
            sql += ` AND ws.start_time >= $${paramCount++}`;
            params.push(startDate);
        }
        if (endDate) {
            sql += ` AND ws.start_time <= $${paramCount++}`;
            params.push(endDate);
        }
        if (projectId) {
            sql += ` AND ws.project_id = $${paramCount++}`;
            params.push(projectId);
        }

        sql += ` ORDER BY ws.start_time DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
        params.push(limit, offset);

        const result = await query(sql, params);
        return result.rows;
    }

    // Get session by ID
    static async findById(sessionId, userId) {
        const result = await query(
            `SELECT ws.*, p.name as project_name, p.color as project_color, p.icon as project_icon
       FROM work_sessions ws
       LEFT JOIN projects p ON ws.project_id = p.id
       WHERE ws.id = $1 AND ws.user_id = $2`,
            [sessionId, userId]
        );
        return result.rows[0];
    }

    // Update session notes
    static async updateNotes(sessionId, userId, notes) {
        const result = await query(
            'UPDATE work_sessions SET notes = $1 WHERE id = $2 AND user_id = $3 RETURNING *',
            [notes, sessionId, userId]
        );
        return result.rows[0];
    }

    // Cancel active session
    static async cancelSession(userId) {
        const result = await query(
            `UPDATE work_sessions SET status = 'cancelled' 
       WHERE user_id = $1 AND status = 'active'
       RETURNING *`,
            [userId]
        );
        return result.rows[0];
    }
}

module.exports = WorkSession;
