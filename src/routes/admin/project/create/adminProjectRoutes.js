const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../../../../config/db');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../../public/images/profile'); // novo caminho

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

// Rota GET para exibir o formulário de criação de projeto
router.get('/create', async (req, res) => {
    try {
        const [departments] = await pool.query('SELECT department_name FROM departments');
        const [clients] = await pool.query('SELECT name FROM client');
        const [teams] = await pool.query('SELECT name FROM team');

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

// Rota POST para criação do projeto
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
        work_status
    } = req.body;

    const attachment = req.file ? req.file.filename : null;

    try {
        const conn = await pool.getConnection();

        const [existing] = await conn.query(
            'SELECT * FROM projects WHERE project_id = ? AND project_title = ?',
            [project_id, project_title]
        );

        if (existing.length > 0) {
            conn.release();
            return res.render('admin/new-project', {
                error: `Projeto com ID ${project_id} e título "${project_title}" já existe.`,
                success: null,
                departments: [],
                clients: [],
                teams: []
            });
        }

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

        conn.release();

        res.redirect('/admin/projects');
    } catch (err) {
        console.error(err);
        res.render('admin/new-project', {
            error: 'Erro ao salvar projeto: ' + err.message,
            success: null,
            departments: [],
            clients: [],
            teams: []
        });
    }
});

module.exports = router;
