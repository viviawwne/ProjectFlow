const express = require('express');
const router = express.Router();
const UserAuthController = require('../../controllers/user/UserAuthController');

// Rota inicial de autenticação (login ou registro)
router.get('/', UserAuthController.renderOptions);

//login
router.get('/login', UserAuthController.renderLogin);
router.post('/login', UserAuthController.login);

// Registro
router.get('/registration', UserAuthController.renderRegister);
router.post('/register', UserAuthController.register);

module.exports = router;


