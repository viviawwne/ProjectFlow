const express = require('express');
const router = express.Router();
const TaskController = require('../../controllers/admin/TaskController');

// Rotas principais de tarefas
router.get('/', TaskController.getTasksPage);
router.post('/', TaskController.createTask);
router.patch('/:taskId', TaskController.updateTask);
router.delete('/:taskId', TaskController.deleteTask);
router.get('/new', TaskController.getNewTaskPage);

// Rotas específicas para tarefas de cards
router.put('/:taskId/card', TaskController.updateCardTask);
router.delete('/:taskId/card', TaskController.deleteCardTask);

// Rotas adicionais (caso implementadas no controller futuramente)
if (TaskController.assignTask) {
  router.patch('/:taskId/assign', TaskController.assignTask);
}

if (TaskController.completeTask) {
  router.patch('/:taskId/complete', TaskController.completeTask);
}

module.exports = router;
