const { pool } = require("../../config/db");

// Renderiza o board de um projeto específico
exports.renderBoardByProject = async (req, res) => {
  const projectId = req.params.projectId;

  try {
    // Busca o nome do projeto
    const [[project]] = await pool.execute(
      'SELECT project_title FROM projects WHERE id = ?',
      [projectId]
    );

    const projectName = project?.project_title || `Projeto ${projectId}`;

    // Busca todos os cards do projeto
    const [cards] = await pool.execute(
      "SELECT * FROM cards WHERE project_id = ?",
      [projectId]
    );

    let cardsWithTasks = [];
    let todoCards = [], progressCards = [], reviewCards = [], approvedCards = [];

    if (cards.length > 0) {
      const cardIds = cards.map(card => card.id);
      const placeholders = cardIds.map(() => '?').join(',');

      // Busca tarefas associadas aos cards
      const [tasks] = await pool.execute(
        `SELECT * FROM tasks WHERE card_id IN (${placeholders})`,
        cardIds
      );

      // Associa tarefas aos seus respectivos cards
      cardsWithTasks = cards.map(card => ({
        ...card,
        tasks: tasks.filter(task => task.card_id === card.id)
      }));

      // Separa os cards por status
      todoCards = cardsWithTasks.filter(c => c.status === 'todo');
      progressCards = cardsWithTasks.filter(c => c.status === 'progress');
      reviewCards = cardsWithTasks.filter(c => c.status === 'review');
      approvedCards = cardsWithTasks.filter(c => c.status === 'approved');
    }


    // Renderiza o board
    res.render('admin/board', {
      projectId,
      projectName,
      pagetitle: `Board-Flow: ${projectName}`,
      todoCards,
      progressCards,
      reviewCards,
      approvedCards
    });

  } catch (error) {
    console.error('Erro ao carregar o board do projeto:', error);
    res.status(500).send('Erro ao carregar o board do projeto');
  }
};

// Lista todos os projetos com contagem de cards
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

    res.render("admin/boards-list", {
      projects,
      pagetitle: "Board-Flow"
    });

  } catch (error) {
    console.error("Erro ao carregar projetos:", error);
    res.status(500).send("Erro ao carregar projetos");
  }
};

// Busca de projetos (com AJAX e EJS fallback)
exports.searchBoards = async (req, res) => {
  try {
    const { q } = req.query;

    let query = `
      SELECT 
        p.*,
        COUNT(c.id) as total_cards
      FROM projects p
      LEFT JOIN cards c ON p.id = c.project_id
    `;
    const params = [];

    if (q && q.trim()) {
      query += ` WHERE p.project_title LIKE ?`;
      params.push(`%${q.trim()}%`);
    }

    query += ` GROUP BY p.id ORDER BY p.id DESC`;

    const [projects] = await pool.execute(query, params);

    if (req.headers["x-requested-with"] === "XMLHttpRequest") {
      return res.json({
        success: true,
        projects,
        searchTerm: q || ""
      });
    }

    res.render("admin/boards-list", {
      projects,
      pagetitle: "Board-Flow",
      searchTerm: q || ""
    });

  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).send('Erro ao buscar projetos');
  }
};
