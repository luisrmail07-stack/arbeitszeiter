const express = require('express');
const router = express.Router();
const SessionController = require('../controllers/sessionController');
const { authMiddleware } = require('../middleware/auth');
const { punchInValidation, sessionHistoryValidation, uuidParamValidation } = require('../middleware/validation');

// All session routes require authentication
router.use(authMiddleware);

// Punch in/out
router.post('/punch-in', punchInValidation, SessionController.punchIn);
router.post('/punch-out', SessionController.punchOut);
router.post('/cancel', SessionController.cancelSession);

// Get sessions
router.get('/current', SessionController.getCurrentSession);
router.get('/recent', SessionController.getRecentSessions);
router.get('/history', sessionHistoryValidation, SessionController.getHistory);
router.get('/:id', uuidParamValidation, SessionController.getSessionById);

// Update session
router.put('/:id/notes', uuidParamValidation, SessionController.updateNotes);

module.exports = router;
