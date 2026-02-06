const WorkSession = require('../models/WorkSession');

class SessionController {
    // Punch in - start a new work session
    static async punchIn(req, res, next) {
        try {
            const { projectId, notes } = req.body;

            const session = await WorkSession.punchIn({
                userId: req.userId,
                projectId: projectId || null,
                notes
            });

            res.status(201).json({
                success: true,
                message: 'Successfully punched in',
                data: { session }
            });
        } catch (error) {
            if (error.message.includes('already have an active session')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // Punch out - end current work session
    static async punchOut(req, res, next) {
        try {
            const session = await WorkSession.punchOut(req.userId);

            res.json({
                success: true,
                message: 'Successfully punched out',
                data: { session }
            });
        } catch (error) {
            if (error.message.includes('No active session')) {
                return res.status(400).json({
                    success: false,
                    error: error.message
                });
            }
            next(error);
        }
    }

    // Get current active session
    static async getCurrentSession(req, res, next) {
        try {
            const session = await WorkSession.getActiveSession(req.userId);

            if (!session) {
                return res.json({
                    success: true,
                    data: { session: null, isActive: false }
                });
            }

            // Calculate current duration for active session
            const startTime = new Date(session.start_time);
            const currentDuration = Math.floor((Date.now() - startTime.getTime()) / 1000 / 60);

            res.json({
                success: true,
                data: {
                    session: {
                        ...session,
                        current_duration_minutes: currentDuration
                    },
                    isActive: true
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get recent sessions
    static async getRecentSessions(req, res, next) {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const sessions = await WorkSession.getRecentSessions(req.userId, limit);

            res.json({
                success: true,
                data: { sessions, count: sessions.length }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get session history with filters
    static async getHistory(req, res, next) {
        try {
            const { startDate, endDate, projectId, limit, offset } = req.query;

            const sessions = await WorkSession.getHistory(req.userId, {
                startDate,
                endDate,
                projectId,
                limit: parseInt(limit) || 50,
                offset: parseInt(offset) || 0
            });

            res.json({
                success: true,
                data: {
                    sessions,
                    count: sessions.length,
                    filters: { startDate, endDate, projectId }
                }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get session by ID
    static async getSessionById(req, res, next) {
        try {
            const session = await WorkSession.findById(req.params.id, req.userId);

            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }

            res.json({
                success: true,
                data: { session }
            });
        } catch (error) {
            next(error);
        }
    }

    // Update session notes
    static async updateNotes(req, res, next) {
        try {
            const { notes } = req.body;
            const session = await WorkSession.updateNotes(req.params.id, req.userId, notes);

            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Session not found'
                });
            }

            res.json({
                success: true,
                message: 'Notes updated successfully',
                data: { session }
            });
        } catch (error) {
            next(error);
        }
    }

    // Cancel active session
    static async cancelSession(req, res, next) {
        try {
            const session = await WorkSession.cancelSession(req.userId);

            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'No active session found'
                });
            }

            res.json({
                success: true,
                message: 'Session cancelled',
                data: { session }
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = SessionController;
