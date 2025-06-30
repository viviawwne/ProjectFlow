const { pool } = require('../../config/db');

exports.renderBoardByProject = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    // Busca todos os cards do projeto
    const [cards] = await pool.execute(
      'SELECT * FROM cards WHERE project_id = ?',
      [projectId]
    );

    const cardIds = cards.map(card => card.id);

    // Se não houver cards, evita erro e já renderiza
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

    // Busca tarefas associadas aos cards
    const placeholders = cardIds.map(() => '?').join(',');
    const [tasks] = await pool.execute(
      `SELECT * FROM tasks WHERE card_id IN (${placeholders})`,
      cardIds
    );

    // Associa tarefas a seus respectivos cards
    const cardsWithTasks = cards.map(card => ({
      ...card,
      tasks: tasks.filter(task => task.card_id === card.id)
    }));

    // Filtra os cards por status
    const todoCards = cardsWithTasks.filter(c => c.status === 'todo');
    const progressCards = cardsWithTasks.filter(c => c.status === 'progress');
    const reviewCards = cardsWithTasks.filter(c => c.status === 'review');
    const approvedCards = cardsWithTasks.filter(c => c.status === 'approved');

    // Busca tarefas não atribuídas a nenhum card, mas pertencentes ao projeto
    const [unassignedTasks] = await pool.execute(
      `SELECT * FROM tasks 
       WHERE card_id IS NULL 
         AND EXISTS (
           SELECT 1 FROM cards 
           WHERE cards.id = tasks.card_id 
             AND cards.project_id = ?
         )`,
      [projectId]
    );

    // Renderiza a view
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

// Lista todos os projetos para o board-flow
exports.renderBoardsList = async (req, res) => {
  try {
    const [projects] = await pool.execute(`
      SELECT 
        p.*,
        COUNT(c.id) as total_cards
      FROM projects p
      LEFT JOIN cards c ON p.id = c.project_id
      GROUP BY p.id
      ORDER BY p.id DESC
    `);

    res.render('admin/boards-list', {
      projects,
      pagetitle: 'Board-Flow'
    });

  } catch (error) {
    console.error('Erro ao carregar projetos:', error);
    res.status(500).send('Erro ao carregar projetos');
  }
};
