const express = require('express');
const router = express.Router();
const CardController = require('../../controllers/admin/CardController');


// POST /admin/cardassign
router.post('/cardassign', CardController.assignTaskToCard);
router.get('/card/delete/:id', CardController.deleteCard);               // /admin/card/delete/5
router.post('/add', CardController.insertCard);
router.get('/card/update/:status/:id', CardController.updateCardStatusGet);
router.post('/update-status', CardController.updateCardStatusPost);


module.exports = router;
