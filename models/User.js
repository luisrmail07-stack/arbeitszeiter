const { query } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Create new user
    static async create({ email, password, fullName, profileImageUrl = null }) {
        const passwordHash = await bcrypt.hash(password, 10);

        const result = await query(
            `INSERT INTO users (email, password_hash, full_name, profile_image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, profile_image_url, created_at`,
            [email, passwordHash, fullName, profileImageUrl]
        );

        return result.rows[0];
    }

    // Find user by email
    static async findByEmail(email) {
        const result = await query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    // Find user by ID
    static async findById(id) {
        const result = await query(
            'SELECT id, email, full_name, profile_image_url, created_at, last_login FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    // Verify password
    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    // Update last login
    static async updateLastLogin(userId) {
        await query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [userId]
        );
    }

    // Update user profile
    static async updateProfile(userId, { fullName, profileImageUrl }) {
        const updates = [];
        const values = [];
        let paramCount = 1;

        if (fullName !== undefined) {
            updates.push(`full_name = $${paramCount++}`);
            values.push(fullName);
        }
        if (profileImageUrl !== undefined) {
            updates.push(`profile_image_url = $${paramCount++}`);
            values.push(profileImageUrl);
        }

        if (updates.length === 0) return null;

        values.push(userId);
        const result = await query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount}
       RETURNING id, email, full_name, profile_image_url`,
            values
        );

        return result.rows[0];
    }

    // Delete user
    static async delete(userId) {
        await query('DELETE FROM users WHERE id = $1', [userId]);
    }
}

module.exports = User;
