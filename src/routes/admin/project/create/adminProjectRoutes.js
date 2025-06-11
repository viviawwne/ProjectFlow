const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { pool } = require('../../../../config/db');

// Configuração do multer para upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/profile/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Rota GET para exibir o formulário de criação de projeto
router.get('/create', (req, res) => {
    res.render('admin/new-project', {
        title: 'New Project',
        success: null,
        error: null
    });
});

// Rota de criação de projeto
router.post('/create', upload.single('attachment_file'), async (req, res) => {
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
                success: null
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

        res.render('admin/new-project', {
            success: `Projeto "${project_title}" criado com sucesso.`,
            error: null
        });
    } catch (err) {
        console.error(err);
        res.render('admin/new-project', {
            error: 'Erro ao salvar projeto: ' + err.message,
            success: null
        });
    }
});

module.exports = router;
