require('dotenv').config();

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS ? '(definida)' : '(vazia ou indefinida)');
