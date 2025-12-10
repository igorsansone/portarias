# Sistema de Controle de Portarias (CRORS)

[![Backend CI](https://github.com/igorsansone/portarias/workflows/Backend%20CI/badge.svg)](https://github.com/igorsansone/portarias/actions)
[![Frontend CI](https://github.com/igorsansone/portarias/workflows/Frontend%20CI/badge.svg)](https://github.com/igorsansone/portarias/actions)
[![Docker Build](https://github.com/igorsansone/portarias/workflows/Docker%20Build/badge.svg)](https://github.com/igorsansone/portarias/actions)

Este projeto implementa um sistema para controle e gerenciamento de portarias do CRORS.

## ⚡ Quick Start

```bash
# Clonar o repositório
git clone https://github.com/igorsansone/portarias.git
cd portarias

# Instalar dependências e executar
npm run install:all
npm start
```

Acesse: **http://localhost:3000**

## 📋 Funcionalidades

- ✅ Cadastro, edição e exclusão de portarias
- 🔍 Pesquisa por texto e múltiplos filtros
- 📊 Campos condicionais (plenária, diretoria, despacho)
- 🏷️ Flags de status (PDF, Word, assinada, publicada)
- 📈 Relatórios de pendências (assinatura, publicação, documento)
- 💾 Exportação de dados para CSV
- 🎨 Interface temática "banco antigo" (fundo preto, texto amarelo, monospace)

## 🏗️ Estrutura do Projeto

```
portarias/
├── backend/              # API REST com Express + SQLite
│   ├── server.js         # Servidor e rotas da API
│   ├── db.js             # Configuração e migração do banco
│   ├── data/             # Banco de dados SQLite (auto-criado)
│   └── package.json
├── frontend/             # Interface React com Vite
│   ├── src/
│   │   ├── App.jsx       # Componente principal
│   │   ├── components/   # Componentes React
│   │   └── styles.css    # Estilos da aplicação
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── .github/
│   └── workflows/        # Pipelines de CI/CD
├── Dockerfile            # Build do backend
└── docker-compose.yml    # (opcional) Orquestração
```

## 🚀 Como Executar Localmente

### Pré-requisitos

- Node.js 18.x ou superior
- npm ou yarn

### Execução Completa (Produção)

Para executar a aplicação completa (frontend + backend integrados):

```bash
# Instalar dependências de backend e frontend
npm run install:all

# Compilar frontend e iniciar servidor
npm start
```

A aplicação estará disponível em `http://localhost:3000`

- O backend serve tanto a API (`/api/*`) quanto o frontend compilado (`/`)
- O banco SQLite será criado automaticamente em `backend/data/portarias.db`
- Dados de exemplo (seed) são inseridos na primeira execução

### Desenvolvimento (Frontend e Backend Separados)

Para desenvolvimento com hot-reload, execute em **dois terminais separados**:

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm start
```

O servidor API estará disponível em `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

O servidor de desenvolvimento estará disponível em `http://localhost:5173`

- O frontend está configurado para fazer proxy das requisições `/api` para `http://localhost:3000`
- Mudanças no código são recarregadas automaticamente

## 🐳 Executar com Docker

### Build da imagem

```bash
docker build -t portarias-backend .
```

### Executar container

```bash
docker run -d -p 3000:3000 -v $(pwd)/backend/data:/app/data portarias-backend
```

## 🛠️ Comandos de Desenvolvimento

### Backend

| Comando                | Descrição                           |
| ---------------------- | ----------------------------------- |
| `npm start`            | Inicia o servidor                   |
| `npm run lint`         | Verifica problemas de código        |
| `npm run lint:fix`     | Corrige problemas automaticamente   |
| `npm run format`       | Formata o código com Prettier       |
| `npm run format:check` | Verifica formatação sem modificar   |

### Frontend

| Comando                | Descrição                           |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Inicia servidor de desenvolvimento  |
| `npm run build`        | Compila para produção               |
| `npm run preview`      | Visualiza build de produção         |
| `npm run lint`         | Verifica problemas de código        |
| `npm run lint:fix`     | Corrige problemas automaticamente   |
| `npm run format`       | Formata o código com Prettier       |
| `npm run format:check` | Verifica formatação sem modificar   |

## 📝 API Endpoints

### Portarias

- `GET /api/portarias` - Lista portarias (com filtros opcionais)
- `GET /api/portarias/:id` - Busca portaria por ID
- `POST /api/portarias` - Cria nova portaria
- `PUT /api/portarias/:id` - Atualiza portaria existente
- `DELETE /api/portarias/:id` - Remove portaria

### Relatórios

- `GET /api/report?tipo={assinatura|publicacao|documento}` - Relatório de pendências
- `GET /api/export?tipo={assinatura|publicacao|documento|all}` - Exporta CSV

## 🧪 Testes

Atualmente o projeto está configurado com linting e verificação de build.
Para executar as verificações:

```bash
# Backend
cd backend
npm run lint
npm run format:check

# Frontend
cd frontend
npm run lint
npm run format:check
npm run build
```

## 🔒 Segurança

- Todas as dependências foram atualizadas para versões seguras
- Multer atualizado para v2.x (vulnerabilidades corrigidas)
- Body-parser atualizado para 1.20.3+ (patches de segurança)
- Vite atualizado para 6.x (correção de vulnerabilidades)
- CI configurado para verificar código automaticamente

## 🤝 Como Contribuir

Veja o arquivo [CONTRIBUTING.md](CONTRIBUTING.md) para instruções detalhadas sobre como contribuir para o projeto.

### Processo Rápido

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença [MIT](LICENSE) (ou a licença de sua escolha).

## 📞 Suporte

Para reportar bugs ou sugerir melhorias, abra uma [Issue](https://github.com/igorsansone/portarias/issues) no GitHub.
