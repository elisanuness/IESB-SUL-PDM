# 💰 Gestão Financeira · Elisa Nunes de Freitas

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo-54-000020?style=flat-square&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-8.x-4479A1?style=flat-square&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-6.x-2D3748?style=flat-square&logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/Zod-3.x-3E67B1?style=flat-square&logo=zod&logoColor=white" />
</p>

Sistema completo de gestão financeira pessoal desenvolvido como prática de backend, composto por um aplicativo mobile em React Native e uma API REST em Node.js integrada a banco de dados MySQL.

---

## Sumário

1. [Sobre o Sistema](#1-sobre-o-sistema)
2. [Funcionalidades por Tela](#2-funcionalidades-por-tela)
3. [Como Rodar o Sistema](#3-como-rodar-o-sistema)
4. [Árvore de Arquivos](#4-árvore-de-arquivos)
5. [Checklist de Requisitos](#5-checklist-de-requisitos)

---

## 📌 1. Sobre o Sistema

O **Gestão Financeira** é um aplicativo mobile que permite ao usuário registrar, visualizar e analisar suas receitas e despesas de forma organizada. O sistema foi desenvolvido com foco na integração entre frontend e backend, substituindo o armazenamento local em memória por um banco de dados relacional persistente.

### Objetivo central

Fornecer uma ferramenta de controle financeiro pessoal com autenticação de usuário, categorização de transações, visualização gráfica e gerenciamento completo de dados via interface mobile e API REST.

### Como foi construído

O projeto é dividido em dois módulos independentes que se comunicam via HTTP:

- **Frontend** (`gestao-financeira/`): aplicativo React Native construído com Expo Router, com tema escuro, navegação por abas e consumo da API via Fetch API. O estado global é gerenciado por React Context, centralizando autenticação e dados financeiros.

- **Backend** (`gestao-financeira-api/`): servidor Node.js com Express, que expõe uma API REST para autenticação, categorias e transações. O acesso ao banco é feito via Prisma ORM, garantindo tipagem e migrations versionadas.

### Principais tecnologias

| Camada | Tecnologia | Função |
|--------|-----------|--------|
| Frontend | React Native + Expo | Interface mobile multiplataforma |
| Frontend | Expo Router | Navegação baseada em arquivos |
| Frontend | React Context | Gerenciamento de estado global |
| Frontend | Fetch API | Comunicação HTTP com o backend |
| Frontend | react-native-chart-kit | Gráficos de pizza e linha |
| Frontend | DiceBear API | Geração de avatares por seed |
| Backend | Node.js + Express | Servidor HTTP e roteamento |
| Backend | Prisma ORM | Acesso ao banco com migrations |
| Backend | MySQL | Banco de dados relacional |
| Backend | Zod | Validação de entrada nas rotas |
| Backend | Nodemon | Reinício automático em desenvolvimento |

---

## 📱 2. Funcionalidades por Tela

> **Como adicionar os prints:** crie a pasta `screenshots/` dentro de `praticas/` e adicione as imagens com os nomes indicados abaixo de cada seção. O GitHub renderizará automaticamente.

---

### 🔐 Tela de Login

<p align="center">
  <img src="screenshots/login/01-tela-login.jpeg" width="23%" alt="Tela de login" />
  <img src="screenshots/login/02-cadastro.jpeg" width="23%" alt="Modal de cadastro" />
  <img src="screenshots/login/03-reset-senha.jpeg" width="23%" alt="Redefinir senha" />
</p>

**Funcionalidades:**

- **Login com validação de acesso** — campos de usuário e senha com validação antes do envio. Erros de credenciais são exibidos diretamente abaixo do campo, sem popups.
- **Mostrar/ocultar senha** — ícone de olho no campo de senha permite alternar a visibilidade.
- **Cadastro de nova conta** — modal com campos de nome, nome de usuário e senha. Validação inline por campo: campos obrigatórios, nome de usuário sem espaços, detecção de usuário já em uso via resposta da API.
- **Redefinição de senha** — fluxo em dois passos: (1) informar o nome de usuário; (2) definir a nova senha. Se o usuário não for encontrado, o sistema retorna ao passo 1 com a mensagem de erro no campo correto.
- **Pré-preenchimento após cadastro** — ao criar a conta com sucesso, o campo de usuário da tela de login é preenchido automaticamente para agilizar o acesso.

---

### 📊 Tela Resumo

<p align="center">
  <img src="screenshots/resumo/01-header-kpis.jpeg" width="23%" alt="Header e KPIs" />
  <img src="screenshots/resumo/02-filtros.jpeg" width="23%" alt="Filtros de período" />
  <img src="screenshots/resumo/03-grafico-pizza.jpeg" width="23%" alt="Gráfico de distribuição" />
  <img src="screenshots/resumo/04-grafico-linha.jpeg" width="23%" alt="Gráfico de evolução" />
</p>

**Funcionalidades:**

- **Header personalizado** — exibe o avatar do usuário (clicável para trocar), nome de boas-vindas com botão de edição (lápis), @username e botão de logout. O botão de "Nova transação" abre a tela de gerenciamento diretamente.
- **Avatar personalizável** — modal com grade de 24 opções de avatares (masculinos e femininos) da coleção DiceBear lorelei. O avatar selecionado é salvo no servidor e persiste entre sessões.
- **Edição de nome** — ícone de lápis ao lado do nome abre um modal para o usuário definir como quer ser chamado no app.
- **Filtro de período** — alterna entre "Último mês" e "Período personalizado". No período personalizado, o usuário define dia, mês e ano de início e fim via seletores.
- **Filtro de categorias** — seleção múltipla de categorias para filtrar todos os dados exibidos na tela.
- **KPIs financeiros** — exibe receita total, despesa total e saldo do período filtrado, com tag "Lucro" ou "Prejuízo". Ícone de olho oculta todos os valores sensíveis.
- **Transações recentes** — lista as 5 transações mais recentes do período, com link para o histórico completo.
- **Gráfico de distribuição (pizza)** — mostra a distribuição por categoria com legenda e filtros por tipo (receitas, despesas ou todos).
- **Gráfico de evolução temporal (linha)** — mostra a evolução de receitas e despesas ao longo do tempo, agrupado por dias (períodos curtos) ou meses (períodos longos). Suporta tooltip ao tocar nos pontos.

---

### 📋 Tela Histórico

<p align="center">
  <img src="screenshots/historico/01-lista-transacoes.jpeg" width="23%" alt="Lista de transações e filtros" />
  <img src="screenshots/historico/02-nova-transacao.jpeg" width="23%" alt="Nova transação" />
  <img src="screenshots/historico/03-editar-transacao.jpeg" width="23%" alt="Editar transação" />
  <img src="screenshots/historico/04-excluir-transacao.jpeg" width="23%" alt="Excluir transação" />
</p>

**Funcionalidades:**

- **Lista completa de transações** — exibe todas as transações do usuário com ícone da categoria (na cor da categoria), descrição, nome da categoria, data formatada e valor. Receitas aparecem em verde, despesas em vermelho.
- **Filtro por mês e ano** — seletores de mês e ano para navegar pelo histórico. Opção "Todos" lista todas as transações independentemente do período.
- **Filtro por tipo** — alterna entre "Todos", "Receitas" e "Despesas".
- **Filtro por categoria** — lista suspensa para filtrar por categoria específica.
- **Ocultar/exibir valores** — ícone de olho no topo oculta todos os valores monetários da tela.
- **Edição de transação** — botão de lápis em cada item abre o formulário de edição com os dados pré-preenchidos (descrição, valor, data, categoria).
- **Exclusão de transação** — botão de lixeira com modal de confirmação antes de excluir.
- **Formulário de transação** — campos: descrição (texto livre), valor (numérico), data (seletor com DateTimePicker) e categoria (lista com ícones coloridos). Salva via `POST /transactions` ou `PUT /transactions/:id`.

---

### 🏷️ Tela Categorias

<p align="center">
  <img src="screenshots/categorias/01-lista.jpeg" width="23%" alt="Lista de categorias" />
  <img src="screenshots/categorias/02-nova-categoria.jpeg" width="23%" alt="Nova categoria" />
  <img src="screenshots/categorias/03-editar-categoria.jpeg" width="23%" alt="Editar categoria" />
  <img src="screenshots/categorias/04-excluir-transferir.jpeg" width="23%" alt="Excluir com transferência" />
</p>

**Funcionalidades:**

- **Lista de categorias** — exibe todas as categorias do usuário (padrão + personalizadas) com ícone colorido, nome, badge "Padrão" ou "Personalizada" e indicação de tipo (Receita/Despesa).
- **Nova categoria** — formulário com:
  - *Tipo*: alternância entre Despesa e Receita
  - *Identificador*: nome técnico único (sem espaços, ex.: `saude`)
  - *Nome de exibição*: rótulo visível no app (ex.: `Saúde`)
  - *Ícone*: grade de 20 ícones Material Icons; ícones já em uso por outras categorias aparecem desabilitados; o primeiro ícone disponível é pré-selecionado automaticamente
  - *Cor*: paleta de 10 cores predefinidas
  - Validação inline por campo antes de enviar
- **Edição de categoria** — disponível apenas para categorias personalizadas. Abre o mesmo formulário com os dados preenchidos. O identificador não pode ser alterado após a criação.
- **Exclusão com transferência** — ao excluir uma categoria, o sistema exige que o usuário selecione uma categoria de destino para as transações vinculadas antes de confirmar. Categorias padrão não podem ser excluídas.

---

## 🚀 3. Como Rodar o Sistema

### 📋 Pré-requisitos

Certifique-se de que os itens abaixo estão instalados antes de começar:

- [Node.js LTS](https://nodejs.org/) (versão 18 ou superior)
- [MySQL Server 8](https://dev.mysql.com/downloads/mysql/) rodando localmente
- [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) ou outro cliente MySQL
- [Expo Go](https://expo.dev/go) instalado no celular (ou Android Studio para emulador)
- [Postman](https://www.postman.com/downloads/) para testar os endpoints

---

### 1️⃣ Passo 1 — Criar o banco de dados

Abra o **MySQL Workbench** e conecte à instância local com o usuário `root`.

Na aba de query, execute:

```sql
CREATE DATABASE gestao_financeira CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Para confirmar que o banco foi criado:

```sql
SHOW DATABASES;
```

Clique no ícone de raio (⚡) ou pressione **Ctrl + Enter** para executar cada comando.

---

### 2️⃣ Passo 2 — Configurar e iniciar o backend

Abra um terminal e navegue até a pasta do backend:

```bash
cd \praticas\gestao-financeira-api
```

**2.1 — Instalar dependências**

```bash
npm install
```
Se necessário, utilize o comando antes do *npm install*:
```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**2.2 — Criar o arquivo de ambiente**

Crie um arquivo `.env` na raiz de `gestao-financeira-api/` com o seguinte conteúdo, substituindo os valores pelos da sua máquina:

```env
PORT=3000
DATABASE_URL="mysql://root:SUA_SENHA@localhost:3306/gestao_financeira"
```

> Se a sua senha do MySQL contiver caracteres especiais (`@`, `#`, `$`, etc.), é necessário usar o equivalente URL-encoded. Por exemplo, `@` vira `%40`.

**2.3 — Executar a migration**

Cria as tabelas no banco a partir do schema Prisma:

```bash
npx prisma migrate dev
```

**2.4 — Popular com categorias padrão**

Insere as 5 categorias iniciais no banco:

```bash
npm run prisma:seed
```

**2.5 — Iniciar o servidor**

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3000`. Para confirmar, acesse essa URL no navegador — a resposta deve ser:

```json
{ "ok": true, "name": "gestao-financeira-api" }
```

---

### 3️⃣ Passo 3 — Configurar e iniciar o frontend

Abra um **segundo terminal** e navegue até a pasta do app:

```bash
cd gestao-financeira
```

**3.1 — Instalar dependências**

```bash
npm install
```

**3.2 — Criar o arquivo de ambiente**

Crie um arquivo `.env` na raiz de `gestao-financeira/` com a URL da API (Descomente o valor correto):

```env
# Para emulador Android
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000

# Para dispositivo físico (descubra seu IP com `ipconfig` no Windows)
# EXPO_PUBLIC_API_URL=http://192.168.X.X:3000

# Para iOS Simulator
# EXPO_PUBLIC_API_URL=http://localhost:3000
```

> **Importante:** após criar ou alterar o `.env`, reinicie o Expo com a flag `--clear` para garantir que as variáveis sejam carregadas:
> ```bash
> npx expo start --clear
> ```

**3.3 — Iniciar o app**

```bash
npx expo start
```

Em caso de erro de versão, execute:
```bash
npm install expo@latest
npx expo install --fix
```

Escaneie o QR Code com o Expo Go no celular, ou pressione `a` para abrir no emulador Android.

> **Dispositivo físico:** certifique-se de que o celular e o computador estão **na mesma rede Wi-Fi**. Se o app não conectar ao servidor, verifique se o IP em `EXPO_PUBLIC_API_URL` é o IP da máquina na rede local. No Windows, confirme com `ipconfig` no terminal.

---

### 4️⃣ Passo 4 — Abrir o Prisma Studio (opcional)

O Prisma Studio é uma interface visual para inspecionar e editar o banco de dados diretamente pelo navegador.

Em um terceiro terminal, dentro de `gestao-financeira-api/`:

```bash
npx prisma studio
```

Acesse `http://localhost:5555` no navegador. É possível visualizar e editar os registros de `User`, `Category` e `Transaction`.

---

### 5️⃣ Passo 5 — Testar os endpoints com Postman

**5.1 — Importar a collection**

1. Abra o Postman
2. Clique em **Import**
3. Selecione o arquivo `gestao-financeira-api/postman/collection.json`
4. A collection **"Gestão Financeira API"** será criada com todas as requisições prontas

**5.2 — Configurar a variável de ambiente**

1. Clique no ícone de engrenagem (⚙️) no canto superior direito → **Manage Environments**
2. Crie um novo ambiente chamado `Local`
3. Adicione a variável: `baseUrl` = `http://localhost:3000`
4. Selecione o ambiente `Local` no seletor do canto superior direito

**5.3 — Executar os testes**

Com o servidor rodando, execute as requisições na seguinte ordem:

| # | Requisição | Resultado esperado |
|---|-----------|-------------------|
| 1 | `GET /` Health-check | `{ "ok": true, "name": "gestao-financeira-api" }` |
| 2 | `GET /categories` Listar Categorias | Array com 5 categorias padrão |
| 3 | `POST /categories` Criar Categoria | `201 Created` com objeto criado |
| 4 | `PUT /categories/:id` Atualizar Categoria | Objeto atualizado |
| 5 | `DELETE /categories/:id` Excluir Categoria | `204 No Content` |
| 6 | `POST /transactions` Criar Transação | `201 Created` com `category` aninhada |
| 7 | `GET /transactions` Listar Transações | Array com transações e categorias expandidas |
| 8 | `DELETE /transactions/:id` Excluir Transação | `204 No Content` |
| 9 | `POST /transactions` Validar Erros (body vazio) | `400` com `"error": "Dados inválidos"` |

> **Atenção:** na requisição **Criar Transação**, substitua o `categoryId` pelo `id` real de uma categoria, copiado da resposta de **Listar Categorias**.

---

### 🖥️ Resumo dos terminais necessários

| Terminal | Pasta | Comando |
|---------|-------|---------|
| 1 | `gestao-financeira-api/` | `npm run dev` |
| 2 | `gestao-financeira/` | `npx expo start --clear` |
| 3 (opcional) | `gestao-financeira-api/` | `npx prisma studio` |

---

## 📁 4. Árvore de Arquivos

```
praticas/
├── README.md                              ← Este arquivo
│
├── gestao-financeira/                     ← Frontend (React Native + Expo)
│   ├── app/
│   │   ├── _layout.jsx                   ← Root layout; redireciona para login se não autenticado
│   │   ├── login.jsx                     ← Login, cadastro e redefinição de senha
│   │   ├── gerenciar-transacao.jsx       ← Tela/modal de criar e editar transação
│   │   └── (tabs)/
│   │       ├── _layout.jsx              ← Configuração das abas inferiores
│   │       ├── index.jsx                ← Resumo: KPIs, gráficos, filtros, transações recentes
│   │       ├── summary.jsx              ← Histórico completo com filtros
│   │       └── categories.jsx           ← Gerenciar categorias (listar, criar, editar, excluir)
│   ├── assets/
│   │   └── images/
│   │       ├── PROSPER_1.jpeg            ← Logo principal (tela de login)
│   │       └── PROSPER_2.jpeg            ← Logo compacta (header das abas)
│   ├── components/
│   │   ├── AppModal.jsx                 ← Hook useAppModal: alertas e confirmações com tema escuro
│   │   └── TransactionItem.jsx          ← Componente reutilizável de item de transação
│   ├── constants/
│   │   └── colors.js                    ← Paleta de cores do tema escuro
│   ├── contexts/
│   │   └── GlobalState.jsx              ← Contexto global: autenticação + categorias + transações
│   ├── services/
│   │   └── api.js                       ← Cliente HTTP centralizado (Fetch API)
│   ├── .env                             ← URL da API (não versionado)
│   ├── .env.example                     ← Template de variáveis de ambiente
│   └── app.json                         ← Configuração Expo (ícone, splash, plugins)
│
└── gestao-financeira-api/                ← Backend (Node.js + Express + Prisma + MySQL)
    ├── prisma/
    │   ├── schema.prisma                ← Modelos: User, Category, Transaction
    │   ├── seed.js                      ← Script de seed com as 5 categorias padrão
    │   └── migrations/                  ← Histórico de migrações SQL (gerado pelo Prisma)
    ├── src/
    │   ├── server.js                    ← Entry point: Express, middlewares, rotas
    │   ├── lib/
    │   │   └── prisma.js               ← Instância singleton do PrismaClient
    │   ├── middlewares/
    │   │   └── errorHandler.js         ← Middleware central de erros (Zod, Prisma, genérico)
    │   ├── routes/
    │   │   ├── auth.js                 ← Rotas /auth/* (registro, login, avatar, nome, exclusão)
    │   │   ├── categories.js           ← Rotas /categories/* (CRUD completo)
    │   │   └── transactions.js         ← Rotas /transactions/* (CRUD completo)
    │   └── schemas/
    │       ├── authSchema.js           ← Validações Zod para autenticação
    │       ├── categorySchema.js       ← Validações Zod para categorias
    │       └── transactionSchema.js    ← Validações Zod para transações
    ├── postman/
    │   └── collection.json             ← Collection do Postman (importável)
    ├── .env                            ← Credenciais do banco (não versionado)
    ├── .env.example                    ← Template das variáveis de ambiente
    └── package.json
```

---

## ✅ 5. Checklist de Requisitos

### 📱 Frontend

- [x] **Filtro de mês/ano** nas telas de lista (Histórico) e resumo (Resumo)
- [x] **Gráfico de pizza** na aba de Resumo — distribuição por categoria
- [x] **Gráfico de linha** na aba de Resumo — evolução temporal de receitas e despesas
- [x] **Edição de transações** — botão de lápis abre o formulário com dados preenchidos
- [x] **Exclusão de transações** — botão de lixeira com modal de confirmação
- [x] **Categorias customizadas** — CRUD completo além das 5 categorias padrão
- [x] **Tela de login** com validação de acesso (usuário + senha)
- [x] **Mensagem de boas-vindas** com nome do usuário autenticado na tela principal

### 🗄️ Backend

- [x] **Base de dados** MySQL para salvar despesas e receitas
- [x] **Integração frontend-backend** — dados persistidos no banco, não mais em memória
- [x] **Categorias no banco** com suporte a criação de novas pelo usuário
- [x] **Rotas de categoria** — GET, POST, PUT, DELETE em `/categories`
- [x] **Rotas de transação** — GET, POST, PUT, DELETE em `/transactions`
- [x] **Validação no servidor** via Zod com retorno padronizado de erros
- [x] **API Client HTTP** em `services/api.js` com Fetch API
- [x] **Endpoints testados no Postman** — collection exportada em `postman/collection.json`

### 📮 Postman (conforme solicitado)

- [x] Health-check `GET /`
- [x] Listar categorias `GET /categories`
- [x] Criar categoria `POST /categories`
- [x] Atualizar categoria `PUT /categories/:id`
- [x] Excluir categoria `DELETE /categories/:id` (com proteção de padrão)
- [x] Criar transação `POST /transactions`
- [x] Listar transações `GET /transactions`
- [x] Excluir transação `DELETE /transactions/:id`
- [x] Validar erros Zod `POST /transactions` com body inválido

### ⭐ Funcionalidades extras

- [x] Autenticação completa — cadastro, login, redefinição de senha, logout
- [x] Avatar personalizável com coleção DiceBear (masculinos e femininos)
- [x] Edição de nome de exibição diretamente no app
- [x] Exclusão de conta `DELETE /auth/users/:username`
- [x] Persistência de sessão via AsyncStorage (login se mantém ao reabrir o app)
- [x] Filtro de categorias nos gráficos (multi-seleção)
- [x] Ocultar/exibir valores sensíveis (ícone de olho)
- [x] Tema escuro completo em todas as telas
- [x] Transferência de transações ao excluir uma categoria
