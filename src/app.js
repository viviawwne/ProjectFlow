const express = require('express');
const path = require('path');   
const dotenv = require('dotenv');
const session = require('express-session');

// Carrega variáveis de ambiente
dotenv.config();

const app = express();

// =================== MIDDLEWARES ===================

// Sessão com configurações reforçadas
app.use(session({
    secret: process.env.SESSION_SECRET || 'projectflow_secret_key',
    resave: false,
    saveUninitialized: false, // Alterado por segurança
    cookie: { 
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 dias
    }
}));

// Torna a sessão disponível nas views EJS
app.use((req, res, next) => {
    res.locals.session = req.session;
    res.locals.user = req.session.user || null; // Adicionado para acessar usuário nas views
    next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de views e arquivos estáticos
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  
app.use(express.static(path.join(__dirname, 'public')));

// =================== // Ativa suporte a métodos HTTP como DELETE e PUT via formulários HTML usando o parâmetro _method ===================   
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// =================== ROTAS ===================    

// Importação de rotas (mantida a estrutura original)
const rootRoutes = require('./routes/rootRoutes');
const adminAuthRoutes = require('./routes/admin/adminAuthRoutes');
const userAuthRoutes = require('./routes/user/userAuthRoutes');

const adminProjectRoutes = require('./routes/admin/project/create/adminProjectRoutes');
const projectRoutes = require('./routes/admin/projectRoutes');
const projectListRoutes = require('./routes/admin/project/list/listProjectRoutes');
const deleteProjectRoutes = require('./routes/admin/project/delete/deleteProjectRoutes');
const projectDetailsRoutes = require('./routes/admin/projectDetailsRoutes');
//const editProjectRoutes = require('./routes/admin/project/edit/editProjectRoutes');

const departmentRoutes = require('./routes/admin/department/departmentRoutes');
const clientRoutes = require('./routes/admin/clientRoutes');

const employeeRoutes = require('./routes/admin/employeeRoutes'); 
app.use('/', employeeRoutes); 


const taskRoutes = require('./routes/admin/taskRoutes');
app.use('/admin/tasks', taskRoutes);

const cardRoutes = require('./routes/admin/cardRoutes');
app.use('/admin/cards', cardRoutes);

const boardRoutes = require('./routes/admin/boardRoutes');
app.use('/admin/board', boardRoutes);

const documentationRoutes = require('./routes/admin/documentationRoutes');
app.use('/admin/documentation', documentationRoutes);


// Aplicação de Rotas (mantida igual)
app.use('/', rootRoutes);
app.use('/admin', adminAuthRoutes);
app.use('/admin', clientRoutes);
app.use('/admin/departments', departmentRoutes);
app.use('/admin/project', adminProjectRoutes);
app.use('/admin/project', projectRoutes);
app.use('/admin/project', projectListRoutes);
//app.use('/admin', editProjectRoutes);
app.use('/admin/project', deleteProjectRoutes);
app.use('/admin/project-details', projectDetailsRoutes);

// Rotas de perfil do usuário 
const userProfileRoutes = require('./routes/admin/userProfileRoutes');
app.use('/admin', userProfileRoutes);

// Dashboard principal (mantido igual)
const adminProjectController = require('./controllers/admin/AdminProjectController');
app.get('/admin/projects', adminProjectController.renderProjectDashboard);

// Área do usuário (mantido igual)
app.use('/user', userAuthRoutes);

// =================== SERVIDOR ===================
const PORT = process.env.PORT || 3000;

// Teste de conexão com o banco (com tratamento melhorado)
const { testConnection } = require('./config/db');

testConnection()
    .then(success => {
        if (success) {
            app.listen(PORT, () => {
                console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
                console.log('✅ Banco de dados conectado com sucesso.');
            });
        } else {
            console.error('❌ Falha na conexão com o banco de dados');
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('❌ Erro ao conectar ao banco:', err);
        process.exit(1);
    });