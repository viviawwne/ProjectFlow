const express = require('express');
const router = express.Router();
const departmentController = require('../../../controllers/admin/department/departmentController');

// Lista de departamentos
router.get('/', departmentController.getAllDepartments);

// Formulário de criação
router.get('/create', (req, res) => {
  res.render('admin/department/form');
});

// Criação (POST)
router.post('/create', departmentController.createDepartment);

// Exclusão
router.post('/delete/:id', departmentController.deleteDepartment);

module.exports = router;
