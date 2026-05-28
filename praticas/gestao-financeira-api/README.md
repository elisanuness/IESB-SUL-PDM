# 🗄️ gestao-financeira-api — Backend

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Zod-3.x-3E67B1?style=flat-square&logo=zod&logoColor=white" />
</p>

API REST do sistema de gestão financeira, desenvolvida com Node.js, Express, Prisma ORM e MySQL.
Fornece os endpoints consumidos pelo app `gestao-financeira`.

---

## 🛠️ Stack

| Tecnologia | Versão | Função |
|-----------|--------|--------|
| Node.js | ≥ 18 | Runtime JavaScript |
| Express | 5.x | Framework HTTP e roteamento |
| Prisma ORM | 6.x | Acesso ao banco com migrations |
| MySQL | 8.x | Banco de dados relacional |
| Zod | 3.x | Validação de entrada nas rotas |
| dotenv | — | Carregamento de variáveis de ambiente |
| Nodemon | — | Reinício automático em desenvolvimento |

---

## 📁 Estrutura de Arquivos

```
gestao-financeira-api/
├── prisma/
│   ├── schema.prisma       ← Modelos User, Category e Transaction
│   ├── seed.js             ← Insere as 5 categorias padrão no banco
│   └── migrations/         ← Histórico de migrações SQL gerado pelo Prisma
├── src/
│   ├── server.js           ← Entry point: configuração do Express e registro de rotas
│   ├── lib/
│   │   └── prisma.js      ← Instância singleton do PrismaClient
│   ├── middlewares/
│   │   └── errorHandler.js ← Middleware central de erros (Zod, Prisma, genérico)
│   ├── routes/
│   │   ├── auth.js        ← Rotas /auth/* (autenticação e perfil)
│   │   ├── categories.js  ← Rotas /categories/* (CRUD de categorias)
│   │   └── transactions.js ← Rotas /transactions/* (CRUD de transações)
│   └── schemas/
│       ├── authSchema.js  ← Schemas Zod para as rotas de autenticação
│       ├── categorySchema.js ← Schemas Zod para categorias
│       └── transactionSchema.js ← Schemas Zod para transações
├── postman/
│   └── collection.json    ← Collection do Postman (importável)
├── .env                   ← Variáveis de ambiente (não versionado)
├── .env.example           ← Template das variáveis
└── package.json
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
PORT=3000
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/gestao_financeira"
```

> Se a senha contiver caracteres especiais, use URL encoding: `@` → `%40`, `#` → `%23`, etc.

---

## 🚀 Como Rodar

```bash
# Instalar dependências
npm install

# Criar o banco no MySQL (rodar no Workbench ou terminal MySQL)
# CREATE DATABASE gestao_financeira CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Criar as tabelas via migration
npx prisma migrate dev --name init

# Popular com categorias padrão
npm run prisma:seed

# Iniciar em desenvolvimento (com hot-reload)
npm run dev

# Abrir interface visual do banco
npx prisma studio
```

---

## 🌐 Endpoints da API

### Health-check

| Método | Rota | Descrição | Resposta |
|--------|------|-----------|---------|
| GET | `/` | Verifica se a API está no ar | `{ "ok": true, "name": "gestao-financeira-api" }` |

---

### Autenticação — `/auth`

| Método | Rota | Descrição | Body |
|--------|------|-----------|------|
| POST | `/auth/register` | Cadastrar novo usuário | `{ name, username, password }` |
| POST | `/auth/login` | Autenticar usuário | `{ username, password }` |
| PUT | `/auth/reset-password` | Redefinir senha pelo username | `{ username, newPassword }` |
| PUT | `/auth/update-avatar` | Atualizar avatar | `{ userId, avatarSeed, avatarBg }` |
| PUT | `/auth/update-name` | Atualizar nome de exibição | `{ userId, name }` |
| DELETE | `/auth/users/:username` | Excluir conta e todos os dados vinculados | — |

**Respostas de autenticação:**
- `POST /register` → `201` com `{ id, name, username, avatarSeed, avatarBg }`
- `POST /login` → `200` com os mesmos campos; `401` se credenciais incorretas
- `DELETE /auth/users/:username` → `204`; exclui em cascata: transações → categorias customizadas → usuário

---

### Categorias — `/categories`

| Método | Rota | Descrição | Body |
|--------|------|-----------|------|
| GET | `/categories?userId=` | Listar padrão + do usuário | — |
| POST | `/categories` | Criar categoria | `{ name, displayName, icon, background, isIncome, userId }` |
| PUT | `/categories/:id` | Atualizar categoria | Campos parciais |
| DELETE | `/categories/:id` | Excluir categoria | `{ transferCategoryId }` (opcional) |

**Regras:**
- Categorias com `isDefault: true` não podem ser excluídas → `400 "Categorias padrão não podem ser excluídas"`
- O campo `name` é único por usuário — duplicata retorna `409`
- `DELETE` aceita `{ transferCategoryId }` no body para reatribuir transações antes de excluir

---

### Transações — `/transactions`

| Método | Rota | Descrição | Body |
|--------|------|-----------|------|
| GET | `/transactions?userId=` | Listar transações do usuário (com `category` expandida) | — |
| POST | `/transactions` | Criar transação | `{ description, value, date, categoryId, userId }` |
| PUT | `/transactions/:id` | Atualizar transação | Campos parciais |
| DELETE | `/transactions/:id` | Excluir transação | — |

**Respostas:**
- `POST /transactions` → `201` com objeto criado e `category` aninhada
- `DELETE` → `204 No Content`

---

## 🛡️ Validação (Zod)

Toda rota que recebe corpo valida via Zod antes de acessar o banco.
Corpo inválido retorna `400`:

```json
{
  "error": "Dados inválidos",
  "details": [
    { "path": ["value"], "message": "Number must be greater than 0" }
  ]
}
```

---

## ⚠️ Tratamento de Erros

O middleware `errorHandler.js` intercepta todos os erros passados via `next(e)` e normaliza as respostas:

| Tipo de erro | Status | Mensagem |
|-------------|--------|---------|
| `ZodError` | 400 | `"Dados inválidos"` + `details` |
| Prisma `P2025` (not found) | 404 | `"Recurso não encontrado"` |
| Prisma `P2002` (unique constraint) | 409 | `"Registro duplicado"` |
| Outros | 500 | `"Erro interno do servidor"` |

---

## 🌱 Banco de Dados — Categorias Padrão (seed)

Inseridas pelo `prisma/seed.js` usando `upsert` (idempotente):

| name | displayName | icon | isIncome |
|------|-------------|------|---------|
| income | Receita | payments | true |
| food | Alimentação | fastfood | false |
| transport | Transporte | directions-car | false |
| home | Moradia | home | false |
| entertainment | Lazer | sports-esports | false |

---

## 📮 Postman

Importe o arquivo `postman/collection.json` no Postman. Configure a variável de ambiente `baseUrl = http://localhost:3000`.

A collection contém todas as requisições organizadas por grupo, com bodies de exemplo prontos para uso.

---

## 📜 Scripts Disponíveis

| Script | Comando | Função |
|--------|---------|--------|
| `npm run dev` | `nodemon src/server.js` | Servidor com hot-reload |
| `npm start` | `node src/server.js` | Servidor em produção |
| `npm run prisma:migrate` | `prisma migrate dev` | Executar migrations |
| `npm run prisma:seed` | `node prisma/seed.js` | Popular dados iniciais |
| `npm run prisma:studio` | `prisma studio` | Interface visual do banco |
