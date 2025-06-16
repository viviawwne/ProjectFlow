const express = require('express');
const router = express.Router();
const departmentController = require('../../../controllers/admin/department/departmentController');

router.get('/', departmentController.getAllDepartments);
router.post('/create', departmentController.createDepartment);
router.post('/delete/:id', departmentController.deleteDepartment);

module.exports = router;
