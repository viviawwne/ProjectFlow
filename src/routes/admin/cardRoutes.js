const express = require('express');
const router = express.Router();
const CardController = require('../../controllers/admin/CardController');

router.post('/', CardController.createCard);

router.post('/:cardId/assign-task', CardController.assignTaskToCard);

router.patch('/:cardId/status', CardController.updateCardStatus);

router.delete('/:cardId', CardController.deleteCard);
router.get('/:id', CardController.getCardDetails);

module.exports = router;
