const Project = require('../models/Project');

class ProjectController {
    // Get all projects for user
    static async getAllProjects(req, res, next) {
        try {
            const includeInactive = req.query.includeInactive === 'true';
            const withStats = req.query.withStats === 'true';

            let projects;
            if (withStats) {
                projects = await Project.getProjectStats(req.userId);
            } else {
                projects = await Project.findByUserId(req.userId, includeInactive);
            }

            res.json({
                success: true,
                data: { projects, count: projects.length }
            });
        } catch (error) {
            next(error);
        }
    }

    // Get project by ID
    static async getProjectById(req, res, next) {
        try {
            const project = await Project.findById(req.params.id, req.userId);

            if (!project) {
                return res.status(404).json({
                    success: false,
                    error: 'Project not found'
                });
            }

            res.json({
                success: true,
                data: { project }
            });
        } catch (error) {
            next(error);
        }
    }

    // Create new project
    static async createProject(req, res, next) {
        try {
            const { name, description, color, icon } = req.body;

            const project = await Project.create({
                userId: req.userId,
                name,
                description,
                color,
                icon
            });

            res.status(201).json({
                success: true,
                message: 'Project created successfully',
                data: { project }
            });
        } catch (error) {
            next(error);
        }
    }

    // Update project
    static async updateProject(req, res, next) {
        try {
            const { name, description, color, icon, is_active } = req.body;

            const project = await Project.update(req.params.id, req.userId, {
                name,
                description,
                color,
                icon,
                is_active
            });

            if (!project) {
                return res.status(404).json({
                    success: false,
                    error: 'Project not found or no changes made'
                });
            }

            res.json({
                success: true,
                message: 'Project updated successfully',
                data: { project }
            });
        } catch (error) {
            next(error);
        }
    }

    // Soft delete project
    static async deleteProject(req, res, next) {
        try {
            const hardDelete = req.query.hard === 'true';

            if (hardDelete) {
                await Project.delete(req.params.id, req.userId);
            } else {
                const project = await Project.softDelete(req.params.id, req.userId);
                if (!project) {
                    return res.status(404).json({
                        success: false,
                        error: 'Project not found'
                    });
                }
            }

            res.json({
                success: true,
                message: hardDelete ? 'Project deleted permanently' : 'Project archived'
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProjectController;
