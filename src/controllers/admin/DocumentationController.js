const { pool } = require('../../config/db');

// Lista todos os projetos com opção de criar/ver documentos
exports.listProjects = async (req, res) => {
  try {
    const [projects] = await pool.query('SELECT id, project_title FROM projects');
    res.render('admin/documents', { projects });
  } catch (err) {
    console.error('Erro ao listar projetos:', err);
    res.status(500).send('Erro interno ao listar projetos.');
  }
};

// Renderiza o formulário de criação de novo documento
exports.renderCreateDoc = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [projectResult] = await pool.query('SELECT * FROM projects WHERE id = ?', [projectId]);
    if (projectResult.length === 0) {
      return res.status(404).send('Projeto não encontrado.');
    }

    const project = projectResult[0];

    // Buscar os cards do projeto
    const [cards] = await pool.query(
      'SELECT id, title FROM cards WHERE project_id = ?',
      [project.id]
    );

    res.render('admin/create-doc', { project, cards });
  } catch (err) {
    console.error('Erro ao carregar formulário de criação de documento:', err);
    res.status(500).send('Erro interno ao carregar formulário.');
  }
};

// Cria documento no banco, vinculado ao projeto e ao card (opcional)
exports.createDocument = async (req, res) => {
  try {
    const { title, content, card_id } = req.body;
    const { projectId } = req.params;

    await pool.query(
      'INSERT INTO documents (title, content, project_id, card_id) VALUES (?, ?, ?, ?)',
      [title, content, projectId, card_id || null]
    );

    res.redirect(`/admin/documentation/project/${projectId}`);
  } catch (err) {
    console.error('Erro ao salvar documento:', err);
    res.status(500).send('Erro ao salvar documento.');
  }
};

// Lista documentos de um projeto
exports.listDocuments = async (req, res) => {
  try {
    const { projectId } = req.params;

    const [[project]] = await pool.query(
      'SELECT id, project_title FROM projects WHERE id = ?',
      [projectId]
    );

    if (!project) {
      return res.status(404).send('Projeto não encontrado.');
    }

    const [docs] = await pool.query(
      `SELECT d.id, d.title, d.content, c.card_title
       FROM documents d
       LEFT JOIN cards c ON d.card_id = c.id
       WHERE d.project_id = ?`,
      [projectId]
    );

    res.render('admin/list-docs', { project, docs });
  } catch (err) {
    console.error('Erro ao listar documentos do projeto:', err);
    res.status(500).send('Erro ao carregar documentos.');
  }
};

// Renderiza o formulário de edição de documento
exports.renderEditForm = async (req, res) => {
  try {
    const { id } = req.params;

    const [[doc]] = await pool.query('SELECT * FROM documents WHERE id = ?', [id]);
    if (!doc) {
      return res.status(404).send('Documento não encontrado.');
    }

    const [[project]] = await pool.query('SELECT * FROM projects WHERE id = ?', [doc.project_id]);
    const [cards] = await pool.query('SELECT id, title FROM cards WHERE project_id = ?', [project.id]);

    res.render('admin/edit-doc', { doc, project, cards });
  } catch (err) {
    console.error('Erro ao carregar documento para edição:', err);
    res.status(500).send('Erro ao carregar formulário de edição.');
  }
};

// Atualiza o documento
exports.updateDoc = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, card_id } = req.body;

    await pool.query(
      'UPDATE documents SET title = ?, content = ?, card_id = ? WHERE id = ?',
      [title, content, card_id || null, id]
    );

    const [[doc]] = await pool.query('SELECT project_id FROM documents WHERE id = ?', [id]);
    res.redirect(`/admin/documentation/project/${doc.project_id}`);
  } catch (err) {
    console.error('Erro ao atualizar documento:', err);
    res.status(500).send('Erro ao atualizar documento.');
  }
};

// Exclui documento
exports.deleteDoc = async (req, res) => {
  try {
    const { id } = req.params;

    const [[doc]] = await pool.query('SELECT project_id FROM documents WHERE id = ?', [id]);

    await pool.query('DELETE FROM documents WHERE id = ?', [id]);
    res.redirect(`/admin/documentation/project/${doc.project_id}`);
  } catch (err) {
    console.error('Erro ao excluir documento:', err);
    res.status(500).send('Erro ao excluir documento.');
  }
};
