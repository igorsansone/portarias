# Guia de Contribuição

Obrigado por considerar contribuir para o Sistema de Controle de Portarias CRORS!

## Como Contribuir

### Reportando Bugs

- Use o sistema de Issues do GitHub
- Descreva claramente o problema
- Inclua passos para reproduzir o bug
- Adicione informações sobre seu ambiente (SO, versão do Node.js, etc.)

### Sugerindo Melhorias

- Use o sistema de Issues do GitHub
- Explique claramente a melhoria proposta
- Descreva os benefícios da mudança

### Processo de Pull Request

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Faça commit das suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Faça push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## Padrões de Código

### Backend (Node.js)

- Use JavaScript moderno (ES2021+)
- Siga as regras do ESLint configuradas
- Formate o código com Prettier
- Execute `npm run lint` antes de fazer commit
- Execute `npm run format` para formatar automaticamente

### Frontend (React)

- Use componentes funcionais com Hooks
- Siga as regras do ESLint e React Hooks
- Formate o código com Prettier
- Execute `npm run lint` antes de fazer commit
- Execute `npm run format` para formatar automaticamente

## Estrutura do Projeto

```
portarias/
├── backend/          # API Express + SQLite
│   ├── server.js     # Servidor principal
│   ├── db.js         # Configuração do banco de dados
│   └── data/         # Banco de dados SQLite (criado automaticamente)
├── frontend/         # Aplicação React
│   └── src/
│       ├── App.jsx
│       ├── components/
│       └── main.jsx
└── .github/
    └── workflows/    # CI/CD GitHub Actions
```

## Testando Localmente

### Backend

```bash
cd backend
npm install
npm start
```

O servidor estará disponível em `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`

## Comandos Úteis

### Backend

- `npm start` - Inicia o servidor
- `npm run lint` - Verifica problemas de código
- `npm run lint:fix` - Corrige problemas automaticamente
- `npm run format` - Formata o código
- `npm run format:check` - Verifica formatação

### Frontend

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Compila para produção
- `npm run preview` - Visualiza build de produção
- `npm run lint` - Verifica problemas de código
- `npm run lint:fix` - Corrige problemas automaticamente
- `npm run format` - Formata o código
- `npm run format:check` - Verifica formatação

## Commit Guidelines

- Use mensagens de commit claras e descritivas
- Prefira commits atômicos (uma mudança lógica por commit)
- Formato sugerido: `tipo: descrição breve`
  - `feat:` Nova funcionalidade
  - `fix:` Correção de bug
  - `docs:` Mudanças na documentação
  - `style:` Formatação, ponto e vírgula, etc
  - `refactor:` Refatoração de código
  - `test:` Adição ou correção de testes
  - `chore:` Atualizações de build, dependências, etc

## Dúvidas?

Abra uma Issue no GitHub ou entre em contato com os mantenedores do projeto.
