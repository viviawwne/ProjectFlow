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

    const [cards] = await pool.execute(
      "SELECT c.*, p.project_title FROM cards c LEFT JOIN projects p ON c.project_id = p.id WHERE c.id = ?",
      [id]
    );

    if (cards.length === 0) {
      return res.status(404).send("Card não encontrado");
    }

    const card = cards[0];

    const [tasks] = await pool.execute(
      "SELECT * FROM tasks WHERE card_id = ? ORDER BY id DESC",
      [id]
    );

    res.render("admin/card-details", {
      card,
      tasks,
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
    const { title, description, status } = req.body;

    await pool.execute(
      "UPDATE cards SET title = ?, description = ?, status = ? WHERE id = ?",
      [title, description, status, cardId]
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
