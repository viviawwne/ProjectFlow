// src/routes/admin/projectDetailsRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../../config/db');  

// GET: Project Details by ID
router.get('/:id', async (req, res) => {
    const projectId = req.params.id;

    try {
        const conn = await pool.getConnection();

        // Project details
        const [projectRows] = await conn.query('SELECT * FROM projects WHERE id = ?', [projectId]);
        if (projectRows.length === 0) {
            return res.status(404).render('admin/project-details', { error: 'Projeto não encontrado', project: null, tasks: [], contents: [] });
        }

        const project = projectRows[0];

        // Tasks
        const [taskRows] = await conn.query('SELECT * FROM tasks WHERE project_name = ?', [project.project_title]);

        // Contents (por tarefa)
        const contents = [];
        for (const task of taskRows) {
            const [contentRows] = await conn.query('SELECT * FROM content WHERE task = ?', [task.task_name]);
            contents.push(...contentRows);
        }

        conn.release();

        res.render('admin/project-details', {
            title: `Detalhes do Projeto: ${project.project_title}`,
            project,
            tasks: taskRows,
            contents,
            error: null
        });
    } catch (err) {
        console.error(err);
        res.status(500).render('admin/project-details', {
            error: 'Erro ao buscar detalhes do projeto.',
            project: null,
            tasks: [],
            contents: []
        });
    }
});

module.exports = router;
