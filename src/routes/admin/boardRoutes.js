const express = require("express");
const router = express.Router();
const BoardController = require("../../controllers/admin/BoardController");

// Lista de projetos/boards
router.get("/", BoardController.renderBoardsList);

// Buscar boards/projetos
router.get("/search", BoardController.searchBoards);

// Board específico de um projeto
router.get("/:projectId", BoardController.renderBoardByProject);

module.exports = router;
