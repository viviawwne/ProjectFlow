const { pool } = require('../../config/db');

const renderUserProfile = async (req, res) => {
  try {
    const [profiles] = await pool.execute('SELECT * FROM profiles');
    const [tasks] = await pool.execute('SELECT * FROM tasks');

    // Dados do usuário logado simulados (substitua conforme sua autenticação)
    const userProfile = {
      picture: req.session?.user?.picture || 'default.png',
      name: req.session?.user?.name || 'Viviane',
      email: req.session?.user?.email || 'viviane@gmail.com',
      id: req.session?.user?.id || 1
    };

    res.render('admin/profile', {
      profiles,
      tasks,
      userProfile
    });
  } catch (err) {
    console.error('Erro ao renderizar perfil:', err);
    res.status(500).send('Erro interno ao carregar perfil.');
  }
};

module.exports = { renderUserProfile };
