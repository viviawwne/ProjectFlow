const { pool } = require('../../config/db');


exports.assignTaskToCard = async (req, res) => {
  const { cardid, taskname } = req.body;

  try {
    // Buscar ID da tarefa com base no nome
    const [taskResult] = await pool.execute(
      'SELECT id FROM tasks WHERE task_name = ?', [taskname]
    );

    if (taskResult.length === 0) {
      return res.render('partials/alert', { error: 'Task not found' });
    }

    const task_id = taskResult[0].id;

    // Atualizar o campo card_id da tarefa
    await pool.execute(
      'UPDATE tasks SET card_id = ? WHERE id = ?',
      [cardid, task_id]
    );

    const success = `Task ID: ${task_id} assigned to CARD ID: ${cardid}`;
    res.render('partials/success', { message: success });

  } catch (err) {
    console.error(err);
    res.render('partials/alert', { error: 'Erro ao atribuir tarefa ao card' });
  }
};

exports.updateCardStatusGet = async (req, res) => {
  const { id, status } = req.params;

  try {
    const validStatuses = ['progress', 'review', 'approved'];
    if (!validStatuses.includes(status)) {
      return res.render('partials/alert', { error: 'Status inválido.' });
    }

    await pool.execute(
      'UPDATE cards SET status = ? WHERE id = ?',
      [status, id]
    );

    res.render('partials/success', { message: `Card ID:${id} atualizado para '${status}'` });
  } catch (err) {
    console.error(err);
    res.render('partials/alert', { error: `Erro ao atualizar card: ${err.message}` });
  }
};

exports.deleteCard = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.execute('DELETE FROM cards WHERE id = ?', [id]);
    res.render('partials/success', { message: `Card ID:${id} deletado com sucesso.` });
  } catch (err) {
    console.error(err);
    res.render('partials/alert', { error: `Erro ao deletar card: ${err.message}` });
  }
};

exports.insertCard = async (req, res) => {
    const { cardTitle, description, start, dueDate, status } = req.body;

    try {
        const [result] = await pool.execute(
            'INSERT INTO cards (title, due_date, start, description, status) VALUES (?, ?, ?, ?, ?)',
            [cardTitle, dueDate, start, description, status]
        );

        res.status(200).json({ message: 'Card added successfully', cardId: result.insertId });
    } catch (error) {
        console.error('Erro ao inserir card:', error);
        res.status(500).json({ error: 'Erro ao adicionar card' });
    }
};

exports.updateCardStatusPost = async (req, res) => {
    const { cardId, newStatus } = req.body;

    if (!cardId || !newStatus) {
        return res.status(400).send('Dados inválidos');
    }

    try {
        const [result] = await db.execute(
            'UPDATE cards SET status = ? WHERE id = ?',
            [newStatus, cardId]
        );

        if (result.affectedRows > 0) {
            res.send('Card status updated successfully');
        } else {
            res.status(404).send('Card not found');
        }
    } catch (error) {
        console.error('Erro ao atualizar status do card:', error);
        res.status(500).send('Erro interno no servidor');
    }
};

// POST /admin/cards
exports.createCard = async (req, res) => {
  const { cardTitle, status, start, dueDate, description, tasks } = req.body;
  const userId = req.session?.user?.id || 1;

  try {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    const taskList = tasks.split(',').map(t => t.trim()); // transforma string em array

    // Insere na tabela cards (agora com mais campos)
    const [cardResult] = await conn.execute(
      'INSERT INTO cards (title, status, start, due_date, description) VALUES (?, ?, ?, ?, ?, ?)',
      [cardTitle, status, start, dueDate, description, taskList.join(',')]
    );

    const cardId = cardResult.insertId;

    // Se desejar: lógica para `completed_tasks` aqui

    await conn.commit();
    conn.release();

    res.redirect('/admin/board'); // ou outro redirecionamento após sucesso
  } catch (error) {
    console.error(error);
    res.render('partials/alert', { error: 'Erro ao adicionar card' });
  }
};
