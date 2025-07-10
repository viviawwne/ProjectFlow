const express = require("express");
const router = express.Router();
const projectController = require("../../controllers/admin/ProjectController");

router.get("/", projectController.renderProjectPage);


module.exports = router;
