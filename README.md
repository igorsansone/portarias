# Sistema de Controle de Portarias (CRORS)

Este projeto implementa um sistema simples para controlar portarias do CRORS.

Principais funcionalidades:
- Cadastro, edição, exclusão de portarias.
- Campos condicionais (plenária / diretoria / despacho).
- Flags: PDF, Word, assinada, publicada.
- Pesquisa por texto e filtros.
- Relatórios de pendências (assinatura, publicação, documento) e exportação CSV.
- Layout com aparência “banco antigo” (fundo preto, texto amarelo, monospace).

Estrutura sugerida
- backend/  -> API Express + SQLite
- frontend/ -> App React (Vite)

Como rodar (local)
1. Backend
   cd backend
   npm install
   npm start
   - O servidor roda por padrão em http://localhost:3000
   - O banco SQLite será criado em backend/data/portarias.db automaticamente
   - Uma migração/seed básica é executada na primeira vez

2. Frontend
   cd frontend
   npm install
   npm run dev
   - App roda em http://localhost:5173 (Vite) e chama a API em http://localhost:3000

Criando branch e PR (exemplo)
- git checkout -b feature/portarias-crors
- git add .
- git commit -m "feat: sistema de controle de portarias CRORS"
- git push --set-upstream origin feature/portarias-crors
- Abra um pull request na interface do GitHub descrevendo o que foi adicionado.

Observações
- Ajuste CORS/URLs conforme seu ambiente.
- Se o repositório já tem um backend/frontend existente, adapte os arquivos em vez de substituir.
