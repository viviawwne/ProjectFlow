const { pool } = require('../../config/db');

// Criar card
exports.createCard = async (req, res) => {
  try {
    const { title, description, project_id } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO cards (title, description, project_id, status) VALUES (?, ?, ?, ?)',
      [title, description, project_id, 'todo'] // status inicial como todo
    );

    res.redirect(`/admin/board/${project_id}`); // redireciona para o board do projeto criado
  } catch (error) {
    console.error('Erro ao criar card:', error);
    res.status(500).send('Erro ao criar card');
  }
};

// Atribuir tarefa a card
exports.assignTaskToCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { taskId } = req.body; // id da tarefa a ser atribuída

    await pool.execute(
      'UPDATE tasks SET card_id = ? WHERE id = ?',
      [cardId, taskId]
    );

    // Supondo que tenha project_id para redirecionar
    // Pode ajustar conforme sua lógica
    res.redirect('back');
  } catch (error) {
    console.error('Erro ao atribuir tarefa ao card:', error);
    res.status(500).send('Erro ao atribuir tarefa ao card');
  }
};

// Atualizar status do card
exports.updateCardStatus = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { status } = req.body;

    await pool.execute(
      'UPDATE cards SET status = ? WHERE id = ?',
      [status, cardId]
    );

    res.redirect('back');
  } catch (error) {
    console.error('Erro ao atualizar status do card:', error);
    res.status(500).send('Erro ao atualizar status do card');
  }
};

// Deletar card
exports.deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    // Remove associação das tarefas
    await pool.execute(
      'UPDATE tasks SET card_id = NULL WHERE card_id = ?',
      [cardId]
    );

    // Deleta o card
    await pool.execute(
      'DELETE FROM cards WHERE id = ?',
      [cardId]
    );

    res.redirect(req.get('Referrer') || '/admin/cards');
  } catch (error) {
    console.error('Erro ao deletar card:', error);
    res.status(500).send('Erro ao deletar card');
  }
};


exports.getCardDetails = async (req, res) => {
  try {
    const cardId = req.params.id;

    // Buscar o card
    const [cards] = await pool.execute('SELECT * FROM cards WHERE id = ?', [cardId]);
    if (cards.length === 0) return res.status(404).send('Card não encontrado');
    const card = cards[0];

    // Buscar as tarefas vinculadas ao card
    const [tasks] = await pool.execute('SELECT * FROM tasks WHERE card_id = ?', [cardId]);

    res.render('admin/cardDetails', {
      pagetitle: `Detalhes do Card - ${card.title}`,
      card,
      tasks,
    });
  } catch (err) {
    console.error('Erro ao carregar detalhes do card:', err);
    res.status(500).send('Erro interno');
  }
};

exports.getCardDetails = async (req, res) => {
  const cardId = req.params.id;

  try {
    // Buscar card
    const [cardRows] = await pool.execute('SELECT * FROM cards WHERE id = ?', [cardId]);
    if (cardRows.length === 0) return res.status(404).send('Card não encontrado.');

    const card = cardRows[0];

    // Buscar tarefas associadas
    const [taskRows] = await pool.execute('SELECT * FROM tasks WHERE card_id = ?', [cardId]);

    res.render('admin/cardDetails', {
      pagetitle: `Card: ${card.title}`,
      card,
      tasks: taskRows
    });
  } catch (error) {
    console.error('Erro ao buscar card:', error);
    res.status(500).send('Erro interno.');
  }
};

