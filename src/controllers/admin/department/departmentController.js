const { pool } = require('../../../config/db');

// Lista os departamentos
exports.getAllDepartments = async (req, res) => {
  try {
    const [results] = await pool.query('SELECT * FROM departments');
    res.render('admin/department/list', { departments: results });
  } catch (err) {
    console.error('Erro ao buscar departamentos:', err);
    res.status(500).send('Erro ao buscar departamentos');
  }
};

exports.createDepartment = async (req, res) => {
  const { department_name, description } = req.body;

  try {
    await pool.query(
      'INSERT INTO departments (department_name, description) VALUES (?, ?)',
      [department_name, description]
    );
    res.redirect('/admin/departments');
  } catch (err) {
    console.error('Erro ao criar departamento:', err);
    res.status(500).send('Erro ao criar departamento');
  }
};

// Exclui um departamento
exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM departments WHERE  department_id = ?', [id]);
    res.redirect('/admin/departments');
  } catch (err) {
    console.error('Erro ao deletar departamento:', err);
    res.status(500).send('Erro ao deletar departamento');
  }
};
