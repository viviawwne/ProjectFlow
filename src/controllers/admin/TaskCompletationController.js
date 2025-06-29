// src/controllers/user/TaskCompletionController.js
const { pool } = require('../../config/db');

exports.handleTaskCompletion = async (req, res) => {
  const { user_id, card_id, task_id } = req.body;

  if (!user_id || !card_id || !task_id) {
    return res.status(400).send('Missing required parameters');
  }

  try {
    // Verifica se o usuário está atribuído à tarefa
    const [assignment] = await pool.execute(
      'SELECT * FROM assignment WHERE employee_id = ? AND task_id = ?',
      [user_id, task_id]
    );

    if (assignment.length === 0) {
      return res.status(403).send('You are not assigned to this task');
    }

    // Insere na tabela de tarefas completas
    await pool.execute(
      'INSERT INTO completed_tasks (user_id, card_id, task_id, completed_task) VALUES (?, ?, ?, NOW())',
      [user_id, card_id, task_id]
    );

    // Atualiza o status da tarefa na tabela assignment
    await pool.execute(
      "UPDATE assignment SET status = 'Complete' WHERE employee_id = ? AND task_id = ?",
      [user_id, task_id]
    );

    // Atualiza o contador de tarefas atribuídas
    const [counts] = await pool.execute(
      'SELECT task_id, COUNT(*) AS total_count FROM assignment GROUP BY task_id'
    );

    for (const row of counts) {
      await pool.execute(
        'UPDATE tasks SET total_assigned = ? WHERE id = ?',
        [row.total_count, row.task_id]
      );
    }

    // Copia para old_complete se todas as assignments da task estiverem "Complete"
    const [completeRows] = await pool.execute(
      "SELECT * FROM assignment WHERE task_id = ? AND status = 'Complete'",
      [task_id]
    );

    if (completeRows.length > 0) {
      await pool.execute(
        'INSERT INTO old_complete (user_id, card_id, task_id, completed_task) SELECT user_id, card_id, task_id, completed_task FROM completed_tasks WHERE task_id = ? AND user_id = ?',
        [task_id, user_id]
      );

      await pool.execute(
        'DELETE FROM completed_tasks WHERE task_id = ? AND user_id = ?',
        [task_id, user_id]
      );

      await pool.execute(
        "DELETE FROM assignment WHERE task_id = ? AND employee_id = ? AND status = 'Complete'",
        [task_id, user_id]
      );
    }

    return res.status(200).send('Task completed and processed successfully.');
  } catch (err) {
    console.error('Erro no processamento da tarefa:', err);
    return res.status(500).send('Erro interno no servidor');
  }
};
