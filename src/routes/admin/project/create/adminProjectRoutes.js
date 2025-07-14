const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../../../../config/db');
const fs = require('fs');


const uploadDir = path.join(__dirname, '../../../public/images/profile');

// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// ==============================
// GET: Formulário de Novo Projeto
// ==============================
router.get('/create', async (req, res) => {
  try {
    const [departments] = await pool.query('SELECT department_name FROM departments');
    const [clients]     = await pool.query('SELECT name FROM client');
    const [teams]       = await pool.query('SELECT name FROM team');

    res.render('admin/new-project', {
      title: 'New Project',
      departments,
      clients,
      teams,
      success: null,
      error: null
    });

  } catch (err) {
    console.error('Erro ao carregar dados do formulário de projeto:', err);
    res.status(500).send('Erro ao carregar formulário de projeto.');
  }
});

// ==============================
// POST: Criação de Novo Projeto
// ==============================
router.post('/create', upload.single('attachment'), async (req, res) => {
  const {
    project_id,
    project_title,
    department,
    priority,
    client,
    start_date,
    end_date,
    description,
    work_status,
    employee_ids // ← CSV "1,2,3"
  } = req.body;

  const attachment = req.file ? req.file.filename : null;
  const conn = await pool.getConnection();

  try {
    const [existing] = await conn.query(
      'SELECT * FROM projects WHERE project_id = ? AND project_title = ?',
      [project_id, project_title]
    );

    if (existing.length > 0) {
      const [departments] = await pool.query('SELECT department_name FROM departments');
      const [clients] = await pool.query('SELECT name FROM client');
      const [teams] = await pool.query('SELECT name FROM team');

      conn.release();
      return res.render('admin/new-project', {
        error: `Projeto com ID ${project_id} e título "${project_title}" já existe.`,
        success: null,
        departments,
        clients,
        teams
      });
    }

    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO projects 
        (project_id, project_title, department, priority, client, start_date, end_date, description, attachment, work_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project_id,
        project_title,
        department,
        priority,
        client,
        start_date,
        end_date,
        description,
        attachment,
        work_status
      ]
    );

    // Associar colaboradores via CSV de IDs
    if (employee_ids && employee_ids.trim() !== '') {
      const employeeArray = employee_ids
        .split(',')
        .map(id => id.trim())
        .filter(id => id !== '');

      for (const empId of employeeArray) {
        await conn.query(
          'INSERT INTO project_employees (project_id, employee_id) VALUES (?, ?)',
          [project_id, empId]
        );
      }
    }

    await conn.commit();
    conn.release();
    res.redirect('/admin/projects');

  } catch (err) {
    await conn.rollback();
    conn.release();

    console.error('Erro ao salvar projeto:', err);

    const [departments] = await pool.query('SELECT department_name FROM departments');
    const [clients] = await pool.query('SELECT name FROM client');
    const [teams] = await pool.query('SELECT name FROM team');

    res.render('admin/new-project', {
      error: 'Erro ao salvar projeto: ' + err.message,
      success: null,
      departments,
      clients,
      teams
    });
  }
});

module.exports = router;
