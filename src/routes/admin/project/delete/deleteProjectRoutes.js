// src/routes/admin/projectRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../../../../config/db');

router.get('/delete/:id', async (req, res) => {
    const projectId = req.params.id;

    try {
        const conn = await pool.getConnection();

        const [result] = await conn.query(
            'DELETE FROM projects WHERE project_id = ?',
            [projectId]
        );

        conn.release();

        res.render('admin/project-delete', {
            title: 'Projeto Deletado',
            success: `Projeto ID ${projectId} deletado com sucesso.`,
            error: null
        });
    } catch (err) {
        console.error(err);
        res.render('admin/project-delete', {
            title: 'Erro ao deletar',
            error: `Erro ao deletar projeto ID ${projectId}: ${err.message}`,
            success: null
        });
    }
});

module.exports = router;
