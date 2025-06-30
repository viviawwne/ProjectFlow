const { pool } = require('../../config/db');

exports.renderBoardByProject = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    // Busca cards do projeto
    const [cards] = await pool.execute(
      'SELECT * FROM cards WHERE project_id = ?',
      [projectId]
    );

    const cardIds = cards.map(card => card.id);

    // Se não tiver cards, evita erro na query
    if (cardIds.length === 0) {
      return res.render('admin/board', {
        todoCards: [],
        progressCards: [],
        reviewCards: [],
        approvedCards: [],
        unassignedTasks: [],
        pagetitle: `Board do Projeto ${projectId}`,
        projectId
      });
    }

    // Busca tarefas dos cards do projeto
    const [tasks] = await pool.execute(
      `SELECT * FROM tasks WHERE card_id IN (${cardIds.map(() => '?').join(',')})`,
      cardIds
    );

    // Monta cards com tarefas associadas
    const cardsWithTasks = cards.map(card => ({
      ...card,
      tasks: tasks.filter(task => task.card_id === card.id)
    }));

    // Filtra cards por status
    const todoCards = cardsWithTasks.filter(c => c.status === 'todo');
    const progressCards = cardsWithTasks.filter(c => c.status === 'progress');
    const reviewCards = cardsWithTasks.filter(c => c.status === 'review');
    const approvedCards = cardsWithTasks.filter(c => c.status === 'approved');

    // Tarefas sem card (não atribuídas) no projeto (opcional)
    const [unassignedTasks] = await pool.execute(
      'SELECT * FROM tasks WHERE card_id IS NULL AND project_name = (SELECT project_title FROM projects WHERE id = ?)',
      [projectId]
    );

    // Renderiza a view com todas as variáveis
    res.render('admin/board', {
      todoCards,
      progressCards,
      reviewCards,
      approvedCards,
      unassignedTasks,
      pagetitle: `Board do Projeto ${projectId}`,
      projectId
    });

  } catch (error) {
    console.error('Erro ao carregar o board do projeto:', error);
    res.status(500).send('Erro ao carregar o board do projeto');
  }
};
