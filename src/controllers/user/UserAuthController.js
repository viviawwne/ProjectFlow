const { pool } = require('../../config/db');
const crypto = require('crypto');

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

module.exports = {
  renderOptions: (req, res) => {
    if (req.session.user) {
      return res.redirect('/user/dashboard');
    }
    res.render('user/options', { error: null });
  },

  renderRegister: (req, res) => {
    res.render('user/registration', { error: null, success: null });
  },

  register: async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.render('user/registration', {
        error: 'All fields are required.',
        success: null
      });
    }

    const hashedPassword = hashPassword(password);

    try {
      const existingQuery = 'SELECT * FROM employees WHERE username = ? OR email = ?';
      const [existing] = await pool.execute(existingQuery, [username, email]);

      if (existing.length > 0) {
        return res.render('user/registration', {
          error: 'User already exists. Try another username or email.',
          success: null
        });
      }

      const insertQuery = 'INSERT INTO employees (username, email, password) VALUES (?, ?, ?)';
      await pool.execute(insertQuery, [username, email, hashedPassword]);

      return res.render('user/registration', {
        success: `Registration for ${username} completed successfully!`,
        error: null
      });

    } catch (err) {
      console.error('❌ Registration error:', err);
      return res.render('user/registration', {
        error: 'Something went wrong while registering: ' + err.message,
        success: null
      });
    }
  },

  renderLogin: (req, res) => {
    res.render('user/login', { error: null });
  },

  login: async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('user/login', {
        error: 'All fields are required.'
      });
    }

    const hashedPassword = hashPassword(password);

    try {
      const loginQuery = `
        SELECT * FROM employees
        WHERE (username = ? OR email = ?) AND password = ?
      `;
      const [rows] = await pool.execute(loginQuery, [username, username, hashedPassword]);

      if (rows.length === 0) {
        return res.render('user/login', {
          error: 'Invalid credentials.'
        });
      }

      const user = rows[0];

      // ✅ Armazena objeto inteiro na sessão
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        picture: user.picture || 'default.png',
        role: user.role || 'user'
      };

      console.log('✅ Login bem-sucedido:', req.session.user);

      return res.redirect('/user/dashboard');

    } catch (err) {
      console.error('❌ Login error:', err);
      return res.render('user/login', {
        error: 'Something went wrong during login: ' + err.message
      });
    }
  }
};
