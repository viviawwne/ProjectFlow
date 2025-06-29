const { pool } = require('../../config/db');

// Renderiza o formulário de novo cliente
const renderNewClientForm = (req, res) => {
  res.render('admin/new-client');
};

// Criação de novo cliente
const createClient = async (req, res) => {
  const {
    name,
    email,
    contact_no,
    country,
    address,
    status,
    website,
    about
  } = req.body;

  const image = req.file ? req.file.filename : null;

  try {
    await pool.execute(`
      INSERT INTO client (name, email_id, contact_no, country, address, status, website, about, image)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, email, contact_no, country, address, status, website, about, image
    ]);

    res.redirect('/admin/clients');
  } catch (err) {
    console.error('❌ Erro ao cadastrar cliente:', err);
    res.status(500).send('Erro interno ao salvar cliente.');
  }
};

// Listagem de clientes
const renderClients = async (req, res) => {
  try {
    const [clients] = await pool.query('SELECT * FROM client ORDER BY id DESC LIMIT 8');
    const [allClients] = await pool.query('SELECT * FROM client');

    res.render('admin/clients', {
      clients,
      allClients
    });
  } catch (err) {
    console.error('Erro ao buscar clientes:', err);
    res.render('admin/clients', {
      clients: [],
      allClients: [],
      error: 'Erro ao carregar dados de clientes.'
    });
  }
};

// Excluir cliente
const deleteClient = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.execute('DELETE FROM client WHERE id = ?', [id]);
    res.redirect('/admin/clients');
  } catch (err) {
    console.error('Erro ao deletar cliente:', err);
    res.status(500).send('Erro ao deletar cliente');
  }
};

// Detalhes do cliente com contagem de projetos
const renderClientDetails = async (req, res) => {
  const clientId = req.params.id;

  try {
    const [[client]] = await pool.query('SELECT * FROM client WHERE id = ?', [clientId]);

    if (!client) {
      return res.status(404).send('Cliente não encontrado');
    }

    const [projects] = await pool.query('SELECT * FROM projects WHERE client = ?', [client.name]);

    const countByStatus = {
      total: projects.length,
      pending: projects.filter(p => p.work_status === 'Pending').length,
      ongoing: projects.filter(p => p.work_status === 'On Progress').length,
      completed: projects.filter(p => p.work_status === 'Completed').length
    };

    res.render('admin/client-details', {
      client,
      projects,
      countByStatus
    });

  } catch (err) {
    console.error('Erro ao carregar detalhes do cliente:', err);
    res.status(500).send('Erro ao carregar detalhes do cliente');
  }
};


module.exports = {
  renderNewClientForm,
  createClient,
  renderClients,
  deleteClient,
  renderClientDetails 
};

