  const mysql = require('mysql2/promise');
  require('dotenv').config();

  // Configuração do banco de dados
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'projectflow',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };

  // Criar o pool de conexões
  const pool = mysql.createPool(dbConfig);

  console.log('🔧 Tentando conectar ao MySQL com:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database,
    port: dbConfig.port,
    hasPassword: !!dbConfig.password
  });

  // Função para testar a conexão
  async function testConnection() {
    try {
      const connection = await pool.getConnection();
      console.log('✅ Conectado ao MySQL com sucesso!');
      connection.release();
      return true;
    } catch (error) {
      console.error('❌ Erro ao conectar com o MySQL:', error.message);
      console.error('Detalhes:', {
        code: error.code,
        errno: error.errno,
        sqlMessage: error.sqlMessage
      });
      return false;
    }
  }

  module.exports = {
    pool,
    testConnection,
    dbConfig
  };