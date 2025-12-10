# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [Não Lançado]

### Adicionado

- Configuração completa de linting (ESLint) para backend e frontend
- Configuração de formatação automática (Prettier)
- Workflows de CI/CD no GitHub Actions
  - CI para backend (lint, formatação)
  - CI para frontend (lint, formatação, build)
  - Build e teste de Docker
- Arquivo `.gitignore` para excluir arquivos desnecessários
- Arquivo `.editorconfig` para consistência entre editores
- Arquivo `.env.example` com variáveis de ambiente do backend
- Arquivo `index.html` para o frontend Vite
- Configuração `vite.config.js` com proxy para API
- Documentação `CONTRIBUTING.md` com guias de contribuição
- Scripts npm para lint, format e build em ambos os projetos

### Alterado

- Atualizadas dependências do backend para versões mais recentes e seguras
  - `multer` 1.4.5 → 2.0.2 (correção de vulnerabilidades)
  - `body-parser` 1.20.2 → 1.20.3 (patches de segurança)
  - `better-sqlite3` 8.0.0 → 11.7.0
  - `express` 4.18.2 → 4.21.2
  - `csv-stringify` 6.0.5 → 6.5.2
- Atualizadas dependências do frontend para versões mais recentes e seguras
  - `vite` 4.4.0 → 6.1.7 (correção de vulnerabilidades moderadas)
  - `react` e `react-dom` 18.2.0 → 18.3.1
- Corrigido `Dockerfile` para copiar corretamente do diretório `backend/`
- Formatado todo o código fonte com Prettier
- Corrigidos warnings do ESLint em componentes React
- Removido uso desnecessário de `React` import (React 17+ JSX transform)

### Corrigido

- Imports desnecessários de React em componentes
- Warnings de dependências em React Hooks
- Configuração incorreta do Dockerfile apontando para arquivo inexistente
- Falta de arquivo `index.html` no frontend
- Falta de configuração Vite

## [1.0.0] - Data Inicial

### Adicionado

- Sistema básico de controle de portarias
- Backend com Express e SQLite
- Frontend com React e Vite
- CRUD completo de portarias
- Sistema de filtros e pesquisa
- Relatórios de pendências
- Exportação para CSV
