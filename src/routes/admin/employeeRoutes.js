const express = require('express');
const router = express.Router();
const { pool } = require('../../config/db'); // ajuste se necessário

// Rota de busca por colaboradores (autocomplete)
router.get('/admin/employees/search', async (req, res) => {
  const term = req.query.term;
  if (!term) return res.json([]);

  try {
    const [rows] = await pool.query(
      `SELECT id, username, email 
       FROM employees 
       WHERE username LIKE ? OR email LIKE ? 
       LIMIT 10`,
      [`%${term}%`, `%${term}%`]
    );
    res.json(rows);
  } catch (err) {
    console.error('Erro ao buscar colaboradores:', err);
    res.status(500).json([]);
  }
});

module.exports = router;
