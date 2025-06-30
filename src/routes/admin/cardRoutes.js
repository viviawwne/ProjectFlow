const express = require('express');
const router = express.Router();
const CardController = require('../../controllers/admin/CardController');

// Detalhes de um card específico
router.get('/:id', CardController.showCardDetails);

router.post('/', CardController.createCard);

router.post('/:cardId/assign-task', CardController.assignTaskToCard);

router.patch('/:cardId/status', CardController.updateCardStatus);

router.delete('/:cardId', CardController.deleteCard);

module.exports = router;
