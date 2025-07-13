const express = require("express");
const router = express.Router();
const CardController = require("../../controllers/admin/CardController");

// Criar um novo card
router.post("/", CardController.createCard);

// Detalhes de um card específico
router.get("/:id", CardController.showCardDetails);

// Editar um card
router.put("/:cardId", CardController.updateCard);

// Atualizar status do card (ex: via drag-and-drop)
router.patch("/:cardId/status", CardController.updateCardStatus);

// Atribuir tarefa a um card
router.post("/:cardId/assign-task", CardController.assignTaskToCard);

// Deletar um card
router.delete("/:cardId", CardController.deleteCard);

// Atribuir um card a um colaborador do projeto
router.post("/assign", CardController.assignCardToEmployee);

module.exports = router;
