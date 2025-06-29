const express = require('express');
const router = express.Router();
const BoardController = require('../../controllers/admin/BoardController');

router.get('/', BoardController.renderBoard);

module.exports = router;
