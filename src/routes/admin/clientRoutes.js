const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const clientController = require('../../controllers/admin/ClientController');

// Configuração do storage para upload da imagem do cliente
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../../public/images/client');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
  cb(null, file.originalname);
}

});

const upload = multer({ storage });

/* ===== ROTAS ===== */

// Listagem de clientes
router.get('/clients', clientController.renderClients);

// Formulário para adicionar novo cliente
router.get('/clients/new', clientController.renderNewClientForm);

// Criação de novo cliente
router.post('/clients/new', upload.single('attachment_file'), clientController.createClient);

// Exclusão de cliente
router.get('/clients/delete/:id', clientController.deleteClient);

// Rota para exibir detalhes de um cliente
router.get('/client-details/:id', clientController.renderClientDetails);



module.exports = router;
