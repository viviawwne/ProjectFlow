const express = require('express');
const router = express.Router();
const CardController = require('../../controllers/admin/CardController');

// Criar Card
router.post('/add', CardController.createCard); 

// Atribuir tarefa a um card
router.post('/cardassign', CardController.assignTaskToCard);

// Atualizar status
router.get('/card/update/:status/:id', CardController.updateCardStatusGet);
router.post('/update-status', CardController.updateCardStatusPost);

// Excluir Card
router.get('/card/delete/:id', CardController.deleteCard);

module.exports = router;
