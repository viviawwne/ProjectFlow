const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const taskController = require('../../controllers/admin/TaskController');

// ✅ Corrigido: caminho correto para a pasta "public/images/work"
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../../public/images/work'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage });

// ✅ Rotas
router.get('/', taskController.getTasksPage);
router.post('/', taskController.createTask);
router.post('/taskassign', taskController.assignTask);
router.post('/update_tasks', taskController.updateTasks);

// ✅ Rota de upload de conteúdo da tarefa
router.post('/task-content', upload.single('attachment_file'), taskController.handleTaskContent);

// ✅ Rota para atribuir tarefa a um card
router.post('/complete-task', taskController.handleTaskCompletion);


module.exports = router;
