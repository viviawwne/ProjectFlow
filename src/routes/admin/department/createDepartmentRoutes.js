const express = require('express');
const router = express.Router();
const departmentController = require('../../../controllers/admin/department/departmentController');

// Rota para exibir o formulário de criação
router.get('/create', (req, res) => {
  res.render('admin/department/form'); 
});

// Rota para processar o formulário e criar o departamento
router.post('/create', departmentController.createDepartment);

module.exports = router;
