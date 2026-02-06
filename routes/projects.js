const express = require('express');
const router = express.Router();
const ProjectController = require('../controllers/projectController');
const { authMiddleware } = require('../middleware/auth');
const { createProjectValidation, updateProjectValidation, uuidParamValidation } = require('../middleware/validation');

// All project routes require authentication
router.use(authMiddleware);

// Project CRUD
router.get('/', ProjectController.getAllProjects);
router.get('/:id', uuidParamValidation, ProjectController.getProjectById);
router.post('/', createProjectValidation, ProjectController.createProject);
router.put('/:id', updateProjectValidation, ProjectController.updateProject);
router.delete('/:id', uuidParamValidation, ProjectController.deleteProject);

module.exports = router;
