const { pool } = require("../../config/db");

// Criar card
exports.createCard = async (req, res) => {
  try {
    const { title, description, project_id } = req.body;

    await pool.execute(
      "INSERT INTO cards (title, description, project_id, status) VALUES (?, ?, ?, ?)",
      [title, description, project_id, "todo"]
    );

    res.redirect(`/admin/board/${project_id}`);
  } catch (error) {
    console.error("Erro ao criar card:", error);
    res.status(500).send("Erro ao criar card");
  }
};

// Atribuir tarefa a um card
exports.assignTaskToCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { taskId } = req.body;

    await pool.execute(
      "UPDATE tasks SET card_id = ? WHERE id = ?",
      [cardId, taskId]
    );

    res.redirect("back");
  } catch (error) {
    console.error("Erro ao atribuir tarefa ao card:", error);
    res.status(500).send("Erro ao atribuir tarefa ao card");
  }
};

// Atualizar status do card (via drag and drop ou formulário)
exports.updateCardStatus = async (req, res) => {
  try {
    const cardId = req.params.cardId || req.params.id;
    const { status } = req.body;

    const allowedStatuses = ['todo', 'progress', 'review', 'approved'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).send('Status inválido');
    }

    await pool.execute(
      'UPDATE cards SET status = ? WHERE id = ?',
      [status, cardId]
    );

    if (req.headers['content-type'] === 'application/json' || req.headers.accept?.includes('application/json')) {
      return res.sendStatus(200);
    }

    res.redirect('back');
  } catch (error) {
    console.error("Erro ao atualizar status do card:", error);
    res.status(500).send("Erro ao atualizar status do card");
  }
};

// Deletar card
exports.deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    await pool.execute(
      "UPDATE tasks SET card_id = NULL WHERE card_id = ?",
      [cardId]
    );

    await pool.execute(
      "DELETE FROM cards WHERE id = ?",
      [cardId]
    );

    if (req.headers['content-type'] === 'application/json' || req.headers.accept?.includes('application/json')) {
      res.json({ success: true, message: 'Card deletado com sucesso' });
    } else {
      res.redirect(req.get("Referrer") || "/admin/cards");
    }
  } catch (error) {
    console.error("Erro ao deletar card:", error);
    if (req.headers['content-type'] === 'application/json' || req.headers.accept?.includes('application/json')) {
      res.status(500).json({ success: false, message: 'Erro ao deletar card' });
    } else {
      res.status(500).send("Erro ao deletar card");
    }
  }
};

// Detalhes de um card
exports.showCardDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Buscar o card + project_id interno (ID) e externo (project_id)
    const [cards] = await pool.execute(`
      SELECT c.*, p.project_title, p.project_id AS external_project_id, e.username AS assignee_name
      FROM cards c
      LEFT JOIN projects p ON c.project_id = p.id
      LEFT JOIN employees e ON c.assigned_to = e.id
      WHERE c.id = ?
    `, [id]);

    if (cards.length === 0) {
      return res.status(404).send("Card não encontrado");
    }

    const card = cards[0];

    // 2. Buscar as tarefas associadas ao card
    const [tasks] = await pool.execute(
      "SELECT * FROM tasks WHERE card_id = ? ORDER BY id DESC",
      [id]
    );

    // 3. Buscar os colaboradores usando o *project_id externo* do projeto (ex: "PRJ001")
    const [projectEmployees] = await pool.execute(`
      SELECT e.id, e.username AS name, e.email
      FROM project_employees pe
      JOIN employees e ON pe.employee_id = e.id
      WHERE pe.project_id = ?
    `, [card.external_project_id]);

    console.log("External Project ID:", card.external_project_id);
    console.log("Colaboradores:", projectEmployees);


    // 4. Renderização
    res.render("admin/card-details", {
      card,
      tasks,
      projectEmployees,
      pagetitle: `Card: ${card.title}`,
    });

  } catch (error) {
    console.error("Erro ao carregar detalhes do card:", error);
    res.status(500).send("Erro ao carregar detalhes do card");
  }
};


// Editar card
exports.updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { title, description, status, employee_id } = req.body;

    await pool.execute(
      "UPDATE cards SET title = ?, description = ?, status = ?, assigned_to = ? WHERE id = ?",
      [title, description, status, employee_id || null, cardId]
    );

    if (req.headers['content-type'] === 'application/json') {
      res.json({ success: true, message: 'Card atualizado com sucesso' });
    } else {
      res.redirect(`/admin/cards/${cardId}`);
    }
  } catch (error) {
    console.error("Erro ao editar card:", error);
    if (req.headers['content-type'] === 'application/json') {
      res.status(500).json({ success: false, message: 'Erro ao editar card' });
    } else {
      res.status(500).send("Erro ao editar card");
    }
  }
};


// Atribuir colaborador a um card
exports.assignCardToEmployee = async (req, res) => {
  const { card_id, employee_id } = req.body;

  try {
    // Buscar o card e o project_id real do projeto
    const [[cardProject]] = await pool.execute(`
      SELECT p.project_id
      FROM cards c
      JOIN projects p ON c.project_id = p.id
      WHERE c.id = ?
    `, [card_id]);

    if (!cardProject) return res.status(404).send('Card ou projeto não encontrado');

    // Verificar se o colaborador pertence ao projeto (pela project_id externa)
    const [match] = await pool.execute(
      'SELECT * FROM project_employees WHERE project_id = ? AND employee_id = ?',
      [cardProject.project_id, employee_id]
    );

    if (match.length === 0) {
      return res.status(403).send('Colaborador não pertence ao projeto');
    }

    // Atribuir colaborador ao card
    await pool.execute(
      'UPDATE cards SET assigned_to = ? WHERE id = ?',
      [employee_id, card_id]
    );

    res.redirect('back');
  } catch (err) {
    console.error('Erro ao atribuir card:', err);
    res.status(500).send('Erro ao atribuir card');
  }
};
