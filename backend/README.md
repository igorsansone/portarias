# Backend - Sistema de Controle de Portarias

Backend API do sistema de controle de portarias, construído com Express.js e SQLite.

## 🚀 Produção

Para executar o backend em produção (com frontend integrado):

```bash
# Certifique-se de que o frontend esteja compilado
npm --prefix ../frontend install && npm --prefix ../frontend run build

# Inicie o servidor
node server.js
```

**Nota:** O script `npm start` executa automaticamente a compilação do frontend antes de iniciar o servidor.

## 🛠️ Desenvolvimento

Para desenvolvimento (sem compilar o frontend):

```bash
npm run dev
```

Ou use `npm run start:dev` para pular a etapa de build do frontend.

## 📝 Scripts Disponíveis

- `npm start` - Compila o frontend e inicia o servidor (produção)
- `npm run start:dev` - Inicia apenas o servidor sem compilar o frontend
- `npm run dev` - Alias para start:dev
- `npm run lint` - Verifica o código com ESLint
- `npm run lint:fix` - Corrige problemas automaticamente
- `npm run format` - Formata o código com Prettier
- `npm run format:check` - Verifica formatação

## 🌐 Servidor

O servidor serve:
- API REST em `/api/*` (retorna JSON)
- Arquivos estáticos do frontend em `/` (quando compilado)
- Fallback SPA para rotas não-API (retorna `index.html`)

Por padrão, o servidor escuta na porta `3000` (ou `PORT` do ambiente).

## 📦 Dependências

- **express** - Framework web
- **better-sqlite3** - Banco de dados SQLite
- **cors** - Habilita CORS
- **body-parser** - Parse de JSON
- **csv-stringify** - Geração de CSV
- **express-rate-limit** - Proteção contra DDoS

## 🔧 Configuração

Variáveis de ambiente suportadas:

- `PORT` - Porta do servidor (padrão: 3000)
- `FRONTEND_PATH` - Caminho para build do frontend (padrão: `../frontend/dist`)

## 📚 API Endpoints

Veja a [documentação principal](../README.md#-api-endpoints) para detalhes dos endpoints disponíveis.
