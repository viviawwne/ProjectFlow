const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const session = require('express-session');

dotenv.config();

const app = express();

// Sessão
app.use(session({
    secret: 'projectflow_secret_key',
    resave: false,
    saveUninitialized: true
}));

// Tornar sessão acessível nas views
app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Views e estáticos
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

// Rotas
const rootRoutes = require('./routes/rootRoutes');
const adminAuthRoutes = require('./routes/admin/adminAuthRoutes');
const adminProjectRoutes = require('./routes/admin/project/create/adminProjectRoutes'); 
const projectRoutes = require('./routes/admin/projectRoutes');
const projectListRoutes = require('./routes/admin/project/list/listProjectRoutes'); 
const deleteProjectRoutes = require('./routes/admin/project/delete/deleteProjectRoutes');
const projectDetailsRoutes = require('./routes/admin/projectDetailsRoutes');
const adminProjectController = require('./controllers/admin/AdminProjectController');
const departmentRoutes = require('./routes/admin/department/departmentRoutes');
const createDepartmentRoutes = require('./routes/admin/department/createDepartmentRoutes');

// Aplicação das rotas
app.use('/', rootRoutes);
app.use('/admin', adminAuthRoutes);
app.use('/admin/project', adminProjectRoutes); 
app.use('/admin/project', projectRoutes);
app.use('/admin/project', projectListRoutes); 
app.use('/admin/project', deleteProjectRoutes);
app.use('/admin/project-details', projectDetailsRoutes);
app.use('/admin/departments', departmentRoutes);
app.use('/admin/departments', createDepartmentRoutes);


// Rota para o dashboard de projetos
app.get('/admin/projects', adminProjectController.renderProjectDashboard);

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Conexão com DB
const { testConnection } = require('./config/db');
testConnection().then(success => {
    if (success) {
        console.log('🚀 Servidor pronto para receber requisições!');
    } else {
        console.log('⚠️ Servidor iniciado, mas há problemas com o banco de dados');
    }
});
