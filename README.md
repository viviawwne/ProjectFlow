# ProjectFlow - Sistema de Gerenciamento de Projetos

ProjectFlow é uma aplicação web desenvolvida em Node.js com Express e MySQL, projetada para facilitar o gerenciamento de projetos. O sistema contará com um painel intuitivo de visualização e gerenciamento de projetos e departamentos, quadros Kanban, geração de relatórios e dashboards.

## 🌐 Tecnologias Utilizadas

- Backend: Node.js + Express
- Frontend: EJS (Embedded JavaScript Templates)
- Banco: MySQL
- Bootstrap (responsividade)

- Dependências
  
- npm install method-override
   
## 📂Estrutura do projeto:
```bash

ProjectFlow/
├── .env                   # Variáveis de ambiente
├── projectflow.sql        # Script para criar o banco de dados
├── package.json           # Dependências do projeto
├── src/
│   ├── app.js             # Arquivo principal da aplicação
│   ├── config/            # Configurações de conexão (MySQL)
│   ├── controllers/       # Lógica de negócio para cada funcionalidade
│   ├── routes/            # Definição de rotas da aplicação
│   ├── views/             # Templates HTML (EJS)
│   └── public/            # Arquivos estáticos (CSS, JS, Imagens)
