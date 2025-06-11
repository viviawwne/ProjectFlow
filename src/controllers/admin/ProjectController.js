// controllers/admin/ProjectController.js
const { pool } = require('../../config/db');

exports.renderProjectPage = async (req, res) => {
    try {
        const [allProjects] = await pool.query("SELECT * FROM projects");
        const [pendingProjects] = await pool.query("SELECT * FROM projects WHERE work_status = 'Pending'");
        const [progressProjects] = await pool.query("SELECT * FROM projects WHERE work_status = 'On Progress'");
        const [completedProjects] = await pool.query("SELECT * FROM projects WHERE work_status = 'Completed'");
        const [recentProjects] = await pool.query("SELECT * FROM projects WHERE id BETWEEN 1 AND 4");
        const [projectList] = await pool.query("SELECT * FROM projects ORDER BY id DESC LIMIT 10");

        res.render("admin/project", {
            title: "Project Overview",
            totalCount: allProjects.length,
            pendingCount: pendingProjects.length,
            progressCount: progressProjects.length,
            completedCount: completedProjects.length,
            recentProjects,
            projectList
        });
    } catch (error) {
        console.error("Erro ao carregar a página de projetos:", error);
        res.status(500).send("Erro ao carregar a página de projetos.");
    }
};
