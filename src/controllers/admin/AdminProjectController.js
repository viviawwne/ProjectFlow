// src/controllers/admin/AdminProjectController.js
const { pool } = require('../../config/db');

module.exports = {
  // =============================
  // DASHBOARD DE PROJETOS
  // =============================
  renderProjectDashboard: async (req, res) => {
    try {
      const [projectList] = await pool.query('SELECT * FROM projects');

      const [[{ totalCount }]]     = await pool.query('SELECT COUNT(*) AS totalCount FROM projects');
      const [[{ pendingCount }]]   = await pool.query("SELECT COUNT(*) AS pendingCount FROM projects WHERE work_status = 'Pending'");
      const [[{ progressCount }]]  = await pool.query("SELECT COUNT(*) AS progressCount FROM projects WHERE work_status = 'On Progress'");
      const [[{ completedCount }]] = await pool.query("SELECT COUNT(*) AS completedCount FROM projects WHERE work_status = 'Completed'");

      const [recentProjects] = await pool.query(`
        SELECT id, project_title, department, description
        FROM projects
        ORDER BY start_date DESC
        LIMIT 5
      `);

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
      console.error('❌ Erro ao carregar dashboard de projetos:', err);
      res.status(500).send('Erro ao carregar dashboard de projetos.');
    }
  },

  // =============================
  // FORMULÁRIO PARA NOVO PROJETO
  // =============================
  renderNewProject: async (req, res) => {
    try {
      const [departments] = await pool.query('SELECT department_name FROM departments');
      const [clients]     = await pool.query('SELECT id, name FROM client');
      const [teams]       = await pool.query('SELECT name FROM team');

      res.render('admin/new-project', {
        departments,
        clients,
        teams,
        error: null,
        success: null
      });

    } catch (err) {
      console.error('❌ Erro ao carregar dados do novo projeto:', err);
      res.status(500).send('Erro ao carregar dados para novo projeto.');
    }
  },

  // =============================
  // PROCESSAMENTO DO NOVO PROJETO
  // =============================
  processNewProject: async (req, res) => {
    const conn = await pool.getConnection();
    try {
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
        employee_ids // ← será uma string CSV: "1,2,3"
      } = req.body;

      const attachment_file = req.file ? req.file.filename : null;

      await conn.beginTransaction();

      // Inserir novo projeto
      const insertProjectQuery = `
        INSERT INTO projects (
          project_id, project_title, department, priority, client,
          start_date, end_date, description, attachment_file, work_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await conn.execute(insertProjectQuery, [
        project_id,
        project_title,
        department,
        priority,
        client,
        start_date,
        end_date,
        description,
        attachment_file,
        work_status
      ]);

      // Associar colaboradores ao projeto
      if (employee_ids && employee_ids.length > 0) {
        const employeeArray = employee_ids
          .split(',')
          .map(id => id.trim())
          .filter(id => id !== '');

        for (const empId of employeeArray) {
          await conn.execute(
            'INSERT INTO project_employees (project_id, employee_id) VALUES (?, ?)',
            [project_id, empId]
          );
        }
      }

      await conn.commit();
      res.redirect('/admin/projects');

    } catch (err) {
      await conn.rollback();
      console.error('❌ Erro ao salvar novo projeto:', err);
      res.status(500).send('Erro ao salvar projeto.');
    } finally {
      conn.release();
    }
  }
};
