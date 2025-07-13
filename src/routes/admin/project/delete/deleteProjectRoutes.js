// src/routes/admin/projectRoutes.js
const express = require('express');
const router = express.Router();
const { pool } = require('../../../../config/db');

router.get('/delete/:id', async (req, res) => {
  const projectId = req.params.id;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Remove colaboradores vinculados
    await conn.query(
      'DELETE FROM project_employees WHERE project_id = ?',
      [projectId]
    );

    // 2. Remove o projeto
    await conn.query(
      'DELETE FROM projects WHERE project_id = ?',
      [projectId]
    );

    await conn.commit();
    conn.release();

    res.render('admin/project-delete', {
      title: 'Projeto Deletado',
      success: `Projeto ID ${projectId} deletado com sucesso.`,
      error: null
    });

  } catch (err) {
    await conn.rollback();
    conn.release();

    console.error('❌ Erro ao deletar projeto:', err);
    res.render('admin/project-delete', {
      title: 'Erro ao deletar',
      error: `Erro ao deletar projeto ID ${projectId}: ${err.message}`,
      success: null
    });
  }
});

module.exports = router;
