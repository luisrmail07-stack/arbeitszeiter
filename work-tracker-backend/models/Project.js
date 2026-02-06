const { query } = require('../config/database');

class Project {
    // Create new project
    static async create({ userId, name, description = null, color = 'blue', icon = 'folder' }) {
        const result = await query(
            `INSERT INTO projects (user_id, name, description, color, icon)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [userId, name, description, color, icon]
        );

        return result.rows[0];
    }

    // Get all projects for a user
    static async findByUserId(userId, includeInactive = false) {
        const sql = includeInactive
            ? 'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC'
            : 'SELECT * FROM projects WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC';

        const result = await query(sql, [userId]);
        return result.rows;
    }

    // Get project by ID
    static async findById(projectId, userId) {
        const result = await query(
            'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
            [projectId, userId]
        );
        return result.rows[0];
    }

    // Update project
    static async update(projectId, userId, updates) {
        const allowedFields = ['name', 'description', 'color', 'icon', 'is_active'];
        const updateFields = [];
        const values = [];
        let paramCount = 1;

        Object.keys(updates).forEach(key => {
            if (allowedFields.includes(key) && updates[key] !== undefined) {
                updateFields.push(`${key} = $${paramCount++}`);
                values.push(updates[key]);
            }
        });

        if (updateFields.length === 0) return null;

        values.push(projectId, userId);
        const result = await query(
            `UPDATE projects SET ${updateFields.join(', ')}
       WHERE id = $${paramCount++} AND user_id = $${paramCount}
       RETURNING *`,
            values
        );

        return result.rows[0];
    }

    // Delete project (soft delete by setting is_active to false)
    static async softDelete(projectId, userId) {
        const result = await query(
            'UPDATE projects SET is_active = false WHERE id = $1 AND user_id = $2 RETURNING *',
            [projectId, userId]
        );
        return result.rows[0];
    }

    // Hard delete project
    static async delete(projectId, userId) {
        await query(
            'DELETE FROM projects WHERE id = $1 AND user_id = $2',
            [projectId, userId]
        );
    }

    // Get project with session count and total time
    static async getProjectStats(userId) {
        const result = await query(
            `SELECT 
        p.*,
        COUNT(ws.id) as session_count,
        COALESCE(SUM(ws.duration_minutes), 0) as total_minutes
       FROM projects p
       LEFT JOIN work_sessions ws ON p.id = ws.project_id AND ws.status = 'completed'
       WHERE p.user_id = $1 AND p.is_active = true
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
            [userId]
        );
        return result.rows;
    }
}

module.exports = Project;
