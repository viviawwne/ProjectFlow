const { pool } = require('../../config/db');

// Função para formatar datas (YYYY-MM-DD -> DD/MM/YYYY)
function formatDate(date) {
  if (!date) return '-';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

exports.getTasksPage = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tasks');
    res.render('admin/tasks', {
      pagetitle: 'Gerenciar Tarefas',
      tasks: rows,
      formatDate,
    });
  } catch (error) {
    console.error('Erro ao carregar tarefas:', error);
    res.status(500).send('Erro ao carregar tarefas');
  }
};



// Criar nova tarefa
exports.createTask = async (req, res) => {
  try {
    const { taskName, description, priority, cardId } = req.body;

    await pool.execute(
      `INSERT INTO tasks (task_name, description, priority, card_id) VALUES (?, ?, ?, ?)`,
      [taskName, description, priority || null, cardId || null]
    );

    res.redirect(`/admin/cards/${cardId}`);
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).send('Erro ao criar tarefa.');
  }
};

// Atribuir tarefa a um card
exports.assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { cardId } = req.body;

    await pool.execute(
      'UPDATE tasks SET card_id = ? WHERE id = ?',
      [cardId, taskId]
    );

    res.redirect('/admin/tasks');
  } catch (err) {
    console.error('Erro ao atribuir tarefa ao card:', err);
    res.render('partials/alert', { error: 'Erro ao atribuir tarefa ao card' });
  }
};

// Marcar tarefa como concluída (insere na tabela completed_tasks)
exports.completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    await pool.execute(
      `INSERT INTO completed_tasks (task_id, completed_task) VALUES (?, NOW())`,
      [taskId]
    );

    res.redirect('/admin/tasks');
  } catch (err) {
    console.error('Erro ao concluir tarefa:', err);
    res.render('partials/alert', { error: 'Erro ao concluir tarefa' });
  }
};

// Atualizar tarefa
exports.updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const {
      taskName,
      description,
      cardId,
      priority,
      startDate,
      dueDate,
    } = req.body;

    await pool.execute(
      `UPDATE tasks SET 
       task_name = ?, 
       description = ?, 
       card_id = ?, 
       priority = ?, 
       start_date = ?, 
       due_date = ? 
       WHERE id = ?`,
      [taskName, description, cardId || null, priority || null, startDate || null, dueDate || null, taskId]
    );

    res.redirect('/admin/tasks');
  } catch (err) {
    console.error('Erro ao atualizar tarefa:', err);
    res.render('partials/alert', { error: 'Erro ao atualizar tarefa' });
  }
};

// Deletar tarefa
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    await pool.execute('DELETE FROM tasks WHERE id = ?', [taskId]);
    res.redirect('/admin/tasks');
  } catch (err) {
    console.error('Erro ao deletar tarefa:', err);
    res.render('partials/alert', { error: 'Erro ao deletar tarefa' });
  }
};

// Página para criar nova tarefa
exports.getNewTaskPage = (req, res) => {
  res.render('admin/new', { pagetitle: 'Nova Tarefa' });
};

// Página para editar tarefa
exports.getEditTaskPage = async (req, res) => {
  const { taskId } = req.params;
  try {
    // Busca a tarefa pelo id
    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [taskId]);
    if (rows.length === 0) {
      return res.status(404).send('Tarefa não encontrada');
    }
    const task = rows[0];
    res.render('admin/edit', { pagetitle: 'Editar Tarefa', task });
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao carregar tarefa');
  }
};

