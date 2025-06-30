const express = require('express');
const router = express.Router();
const BoardController = require('../../controllers/admin/BoardController');

router.get('/:projectId', BoardController.renderBoardByProject);

module.exports = router;
