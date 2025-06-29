const express = require('express');
const router = express.Router();
const taskController = require('../../controllers/admin/TaskController');

router.get('/', taskController.getTasksPage);
router.post('/', taskController.createTask);
router.post('/taskassign', taskController.assignTask);


module.exports = router;
