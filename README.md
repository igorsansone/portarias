# Sistema de Controle de Portarias (CRORS)

Este projeto implementa um sistema simples para controlar portarias do CRORS.

Principais funcionalidades:
- Cadastro, edição, exclusão de portarias.
- Campos condicionais (plenária / diretoria / despacho).
- Flags: PDF, Word, assinada, publicada.
- Pesquisa por texto e filtros.
- Relatórios de pendências (assinatura, publicação, documento) e exportação CSV.
- Layout com aparência “banco antigo” (fundo preto, texto amarelo, monospace).

## Estrutura do Projeto
- `backend/`  -> API Express + SQLite
- `frontend/` -> App React (Vite)

## Como rodar (local)

### 1. Backend
```bash
cd backend
npm install
npm start
```
- O servidor roda por padrão em http://localhost:3000
- O banco SQLite será criado em backend/data/portarias.db automaticamente
- Uma migração/seed básica é executada na primeira vez

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```
- App roda em http://localhost:5173 (Vite) e chama a API em http://localhost:3000

## Como rodar com Docker

O repositório inclui um Dockerfile configurado para construir e executar o backend em um container.

### Build da imagem
```bash
docker build -t portarias:latest .
```

### Executar o container
```bash
docker run -p 3000:3000 -v $(pwd)/backend/data:/app/data portarias:latest
```

O servidor estará disponível em http://localhost:3000

### Notas sobre Docker
- O Dockerfile usa a imagem base `node:18-alpine` para manter o container pequeno
- Copia os arquivos do diretório `backend/` para `/app` no container
- Suporta tanto `package-lock.json` (usa `npm ci`) quanto instalação sem lock file (usa `npm install`)
- A porta 3000 é exposta por padrão
- Use volumes (`-v`) para persistir dados do SQLite fora do container

### Dockerfile.debug
Para depuração de problemas de build, use:
```bash
docker build -f Dockerfile.debug -t portarias:debug .
```

Isso mostrará o conteúdo de `/app`, package.json e a lista de módulos instalados.

## Criando branch e PR (exemplo)
```bash
git checkout -b feature/portarias-crors
git add .
git commit -m "feat: sistema de controle de portarias CRORS"
git push --set-upstream origin feature/portarias-crors
```
Abra um pull request na interface do GitHub descrevendo o que foi adicionado.

## Observações
- Ajuste CORS/URLs conforme seu ambiente.
- Se o repositório já tem um backend/frontend existente, adapte os arquivos em vez de substituir.
- O arquivo `.dockerignore` está configurado para excluir `node_modules` mas incluir `package.json` e `package-lock.json`.
