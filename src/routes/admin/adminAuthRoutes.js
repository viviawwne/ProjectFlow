// adminroutes.js

const express = require('express');
const router = express.Router();
const AdminAuthController = require('../../controllers/admin/AdminAuthController');
const AdminDashboardController = require('../../controllers/admin/AdminDashboardController');
const TaskCompletationController = require('../../controllers/admin/TaskCompletationController');

router.post('/handle_task_completation', TaskCompletationController.handleTaskCompletion);

// Rota inicial de autenticação (login ou registro)
router.get('/', AdminAuthController.renderOptions);

// Dashboard real, após login
router.get('/dashboard', AdminDashboardController.dashboard);

// Registro
router.get('/registration', AdminAuthController.renderRegister);
router.post('/register', AdminAuthController.register);

// Login
router.get('/login', AdminAuthController.renderLogin);
router.post('/login', AdminAuthController.login);

module.exports = router;
