const express = require('express');
const router = express.Router();
const documentationController = require('../../controllers/admin/DocumentationController');

// Listar todos os projetos com acesso à documentação
router.get('/', documentationController.listProjects);

// Formulário de criação de novo documento para um projeto
router.get('/create/:projectId', documentationController.renderCreateDoc);

// Submissão do novo documento
router.post('/create/:projectId', documentationController.createDocument);

// Lista de documentos vinculados a um projeto
router.get('/project/:projectId', documentationController.listDocuments);

// Formulário de edição de documento
router.get('/edit/:id', documentationController.renderEditForm);

// Atualização de documento
router.post('/edit/:id', documentationController.updateDoc);

// Exclusão de documento
router.post('/delete/:id', documentationController.deleteDoc);

module.exports = router;
