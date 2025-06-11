// src/controllers/admin/AdminProjectController.js
const { pool } = require('../../config/db');

module.exports = {
    renderProjectDashboard: async (req, res) => {
        try {
            // Lista completa de projetos para a tabela
            const [projectList] = await pool.query('SELECT * FROM projects');

            // Contadores
            const [[{ totalCount }]] = await pool.query('SELECT COUNT(*) AS totalCount FROM projects');
            const [[{ pendingCount }]] = await pool.query("SELECT COUNT(*) AS pendingCount FROM projects WHERE work_status = 'Pending'");
            const [[{ progressCount }]] = await pool.query("SELECT COUNT(*) AS progressCount FROM projects WHERE work_status = 'On Progress'");
            const [[{ completedCount }]] = await pool.query("SELECT COUNT(*) AS completedCount FROM projects WHERE work_status = 'Completed'");

            // Projetos mais recentes (últimos 4 ou 5)
            const [recentProjects] = await pool.query(
                'SELECT id, project_title, department, description FROM projects ORDER BY created_at DESC LIMIT 5'
            );

            res.render('admin/project', {
                title: 'Projects Dashboard',
                projectList,
                recentProjects,
                totalCount,
                pendingCount,
                progressCount,
                completedCount
            });

        } catch (err) {
            console.error('Erro ao carregar dashboard de projetos:', err);
            res.status(500).send('Erro ao carregar dashboard de projetos.');
        }
    },

    renderNewProject: async (req, res) => {
        try {
            const [departments] = await pool.query('SELECT department_name FROM departments');
            const [clients] = await pool.query('SELECT name FROM client');
            const [teams] = await pool.query('SELECT name FROM team');

            const usernames = clients.map(c => c.name);
            const teamnames = teams.map(t => t.name);

            res.render('admin/new-project', {
                departments,
                usernames,
                teamnames,
                error: null,
                success: null
            });
        } catch (err) {
            console.error('Erro ao carregar página de novo projeto:', err);
            res.status(500).send('Erro ao carregar dados para novo projeto.');
        }
    },

    processNewProject: async (req, res) => {
        try {
            const {
                project_id,
                project_title,
                department,
                priority,
                username,
                start_date,
                end_date,
                description,
                work_status
            } = req.body;

            const attachment_file = req.file ? req.file.filename : null;

            const insertQuery = `INSERT INTO projects (
                project_id, project_title, department, priority, client_name,
                start_date, end_date, description, attachment_file, work_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            await pool.execute(insertQuery, [
                project_id, project_title, department, priority,
                username, start_date, end_date, description,
                attachment_file, work_status
            ]);

            return res.redirect('/admin/projects');

        } catch (err) {
            console.error('Erro ao salvar novo projeto:', err);
            res.status(500).send('Erro ao salvar projeto.');
        }
    }
};
