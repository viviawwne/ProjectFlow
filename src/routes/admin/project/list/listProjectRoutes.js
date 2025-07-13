const express = require('express');
const router = express.Router();
const { pool } = require('../../../../config/db');

// Página com a lista de projetos
router.get('/list', async (req, res) => {
    try {
        const conn = await pool.getConnection();

        const [projects] = await conn.query('SELECT * FROM projects');
        const [pending] = await conn.query("SELECT COUNT(*) as count FROM projects WHERE work_status = 'Pending'");
        const [ongoing] = await conn.query("SELECT COUNT(*) as count FROM projects WHERE work_status = 'On Progress'");
        const [completed] = await conn.query("SELECT COUNT(*) as count FROM projects WHERE work_status = 'Completed'");
        const [total] = await conn.query("SELECT COUNT(*) as count FROM projects");

        conn.release();

        res.render('admin/project-list', {
            projects,
            total: total[0].count,
            pending: pending[0].count,
            ongoing: ongoing[0].count,
            completed: completed[0].count
        });
    } catch (error) {
        console.error('Erro ao buscar projetos:', error);
        res.render('admin/project-list', {
            projects: [],
            total: 0,
            pending: 0,
            ongoing: 0,
            completed: 0
        });
    }
});


module.exports = router;