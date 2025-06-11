const { pool } = require('../../config/db');
const crypto = require('crypto');

const hashPassword = (password) => {
    return crypto.createHash('sha256').update(password).digest('hex');
};

module.exports = {
    renderOptions: (req, res) => {
        if (req.session.user) {
            return res.redirect('/admin/dashboard');
            }
        res.render('admin/options', { error: null });
    },

    renderRegister: (req, res) => {
        res.render('admin/registration', { error: null, success: null });
    },

    register: async (req, res) => {
        console.log('📝 Tentando registrar admin...');
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.render('admin/registration', {
                error: 'All fields are required.',
                success: null
            });
        }

        const hashedPassword = hashPassword(password);

        try {
            console.log('🔍 Verificando se usuário já existe...');
            const existingQuery = 'SELECT * FROM admins WHERE username = ? OR email = ?';
            const [existing] = await pool.execute(existingQuery, [username, email]);

            if (existing.length > 0) {
                return res.render('admin/registration', {
                    error: 'User already exists. Try another username or email.',
                    success: null
                });
            }

            console.log('💾 Inserindo novo admin...');
            const insertAdminQuery = 'INSERT INTO admins (username, email, password) VALUES (?, ?, ?)';
            await pool.execute(insertAdminQuery, [username, email, hashedPassword]);

            console.log('👤 Inserindo novo employee...');
            const insertEmployeeQuery = 'INSERT INTO employees (username, email) VALUES (?, ?)';
            await pool.execute(insertEmployeeQuery, [username, email]);

            console.log('✅ Registro completado com sucesso!');
            return res.render('admin/registration', {
                success: `Registration for ${username} completed successfully!`,
                error: null
            });

        } catch (err) {
            console.error('❌ Erro no registro:', err);
            return res.render('admin/registration', {
                error: 'Something went wrong while registering the user: ' + err.message,
                success: null
            });
        }
    },

    renderLogin: (req, res) => {
    res.render('admin/login', { error: null });
    },

    login: async (req, res) => {
    console.log('🔑 Tentando login...');
    console.log('📦 req.body:', req.body);

    const { username, password } = req.body;

    if (!username || !password) {
        return res.render('admin/login', {
            error: 'All fields are required.'
        });
    }

    const hashedPassword = hashPassword(password);

    try {
        const loginQuery = `
            SELECT * FROM admins
            WHERE (username = ? OR email = ?) AND password = ?
        `;
        const [rows] = await pool.execute(loginQuery, [username, username, hashedPassword]);

        if (rows.length === 0) {
            console.warn('🚫 Login inválido');
            return res.render('admin/login', {
                error: 'Invalid credentials.'
            });
        }

        const admin = rows[0];

        req.session.user = admin.username;
        req.session.email = admin.email;
        req.session.picture = 'default.png';
        req.session.id = admin.id;

        console.log('✅ Login bem-sucedido:', admin.username);
        return res.redirect('/admin');

    } catch (err) {
        console.error('❌ Erro durante login:', err);
        return res.render('admin/login', {
            error: 'Something went wrong during login: ' + err.message
        });
    }
}

};
