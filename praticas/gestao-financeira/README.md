# 📱 gestao-financeira — Frontend

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.81-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo-54-000020?style=flat-square&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo_Router-6-000020?style=flat-square&logo=expo&logoColor=white" />
  <img src="https://img.shields.io/badge/React_Context-API-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/DiceBear-8.x-FF6B6B?style=flat-square&logoColor=white" />
</p>

Aplicativo mobile de gestão financeira pessoal desenvolvido com React Native e Expo Router.
Consome a API REST do módulo `gestao-financeira-api` via Fetch API.

---

## 🛠️ Stack

| Tecnologia | Versão | Função |
|-----------|--------|--------|
| React Native | 0.81.x | Framework mobile |
| Expo | ~54 | Plataforma de build e dev |
| Expo Router | ~6 | Navegação baseada em arquivos |
| React Context | — | Estado global da aplicação |
| Fetch API | — | Comunicação HTTP com o backend |
| AsyncStorage | — | Persistência de sessão do usuário |
| react-native-chart-kit | ^6.12 | Gráficos de pizza e linha |
| react-native-svg | 15.8 | Renderização de SVG (dependência dos gráficos) |
| MaterialIcons | — | Ícones via @expo/vector-icons |
| DiceBear API | 8.x | Geração de avatares por seed (externo) |

---

## 📁 Estrutura de Arquivos

```
gestao-financeira/
├── app/
│   ├── _layout.jsx                  ← Root Stack; redireciona para /login se não autenticado
│   ├── login.jsx                    ← Tela de login, cadastro e redefinição de senha
│   ├── gerenciar-transacao.jsx      ← Tela de criação e edição de transação
│   └── (tabs)/
│       ├── _layout.jsx              ← Configuração das abas inferiores (Bottom Tabs)
│       ├── index.jsx                ← Tela Resumo
│       ├── summary.jsx              ← Tela Histórico
│       └── categories.jsx           ← Tela Categorias
├── assets/
│   └── images/
│       ├── PROSPER_1.png            ← Logo principal usada na tela de login
│       └── PROSPER_2.png            ← Logo compacta usada no header das abas
├── components/
│   ├── AppModal.jsx                 ← Hook useAppModal com Modal de tema escuro
│   └── TransactionItem.jsx          ← Componente de item de transação reutilizável
├── constants/
│   └── colors.js                    ← Paleta de cores do tema escuro
├── contexts/
│   └── GlobalState.jsx              ← Contexto global: auth, categorias e transações
├── services/
│   └── api.js                       ← Funções de acesso à API REST
├── .env                             ← Variáveis de ambiente (não versionado)
├── .env.example                     ← Template das variáveis
└── app.json                         ← Configuração Expo
```

---

## ⚙️ Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com base no `.env.example`:

```env
# Emulador Android (IP especial que aponta para localhost da máquina host)
EXPO_PUBLIC_API_URL=http://10.0.2.2:3000

# Dispositivo físico (substitua pelo IP da sua máquina na rede local)
# EXPO_PUBLIC_API_URL=http://192.168.X.X:3000

# iOS Simulator
# EXPO_PUBLIC_API_URL=http://localhost:3000
```

> Variáveis com prefixo `EXPO_PUBLIC_` são expostas ao bundle do app em tempo de compilação.
> Após alterar o `.env`, reinicie com `npx expo start --clear`.

---

## 🚀 Como Rodar

```bash
# Instalar dependências
npm install

# Iniciar em modo de desenvolvimento
npx expo start

# Reiniciar limpando cache (necessário após alterar .env)
npx expo start --clear
```

O backend (`gestao-financeira-api`) precisa estar rodando antes de abrir o app.

---

## 🔍 Descrição dos Arquivos Principais

### `app/_layout.jsx`

Root layout da aplicação. Verifica o estado de autenticação no `MoneyContext` e redireciona para `/login` quando não há usuário autenticado ou para `/(tabs)` quando há. Exibe `ActivityIndicator` enquanto o estado de autenticação está sendo restaurado do `AsyncStorage`.

### `app/login.jsx`

Tela de autenticação com três fluxos:

1. **Login** — campos de usuário e senha com validação antes do envio. Erros da API são exibidos inline abaixo dos campos.
2. **Cadastro** — modal com campos de nome, nome de usuário e senha. Erros são tratados campo a campo (`regErrors`). Detecção de conflito de usuário via resposta da API (`"já está em uso"`).
3. **Redefinição de senha** — modal em dois passos controlado pelo estado `resetStep` (1 = usuário, 2 = nova senha).

### `app/gerenciar-transacao.jsx`

Formulário de transação acessível como tela modal. Recebe parâmetros via `useLocalSearchParams` quando em modo de edição. Usa `DateTimePicker` nativo para seleção de data. Faz `POST /transactions` ou `PUT /transactions/:id` conforme o modo.

### `app/(tabs)/index.jsx` — Tela Resumo

Tela principal do app após o login. Contém:

- **Header** com avatar (abre modal de seleção), nome editável e botão de logout
- **Filtros** de período (último mês ou personalizado) e categorias (multi-seleção)
- **KPIs** calculados via `useMemo` sobre as transações filtradas
- **Gráfico de pizza** com `PieChart` (react-native-chart-kit)
- **Gráfico de linha** com `LineChart`, agrupando dados por dia ou mês conforme o intervalo
- **`PROFESSIONAL_AVATARS`** — array com 24 opções (16 femininas via lorelei, 8 masculinas via lorelei com `beardProbability=100` desligado e cabelos curtos)
- **`getAvatarUrl(seed, bg)`** — função que monta a URL do DiceBear; seeds iniciados com `"m"` usam parâmetros de avatar masculino

### `app/(tabs)/summary.jsx` — Tela Histórico

Lista paginada de transações com filtros por mês/ano, tipo (receita/despesa) e categoria. Cada item exibe o componente `TransactionItem` com ações de edição (navega para `gerenciar-transacao`) e exclusão (confirmação via `useAppModal`).

### `app/(tabs)/categories.jsx` — Tela Categorias

Gerenciamento de categorias com três estados de view controlados por `useState("list" | "form" | "transfer")`:

- **list** — exibe a lista de categorias com opções de editar e excluir (apenas em não padrão)
- **form** — formulário de criação/edição com seleção de tipo, ícone e cor; ícones já usados por outras categorias ficam desabilitados
- **transfer** — seleção de categoria destino obrigatória antes de confirmar exclusão

### `components/AppModal.jsx`

Hook `useAppModal()` que retorna `{ showAlert, showConfirm, ModalComponent }`. Substitui `Alert.alert()` por um modal nativo com tema escuro. `ModalComponent` é JSX armazenado em variável e deve ser renderizado inline no componente consumidor.

### `components/TransactionItem.jsx`

Componente de apresentação para itens de transação. Recebe `transaction`, `onEdit`, `onDelete` e `showValues`. Trata o parsing da data adicionando `T12:00:00` em strings de data pura (`YYYY-MM-DD`) para evitar deslocamento de fuso horário.

### `contexts/GlobalState.jsx`

Provider central que gerencia:

- **Autenticação** — `user`, `login`, `register`, `logout`, `resetPassword`, `updateAvatar`, `updateName`, `deleteAccount`
- **Dados financeiros** — `transactions`, `categories`, `loading`, `error`, `refresh`
- **Persistência** — sessão salva em `AsyncStorage` com a chave `@gestao_financeira:user`
- **Sincronização** — `addCategory` mantém a lista ordenada alfabeticamente após inserção; `removeCategory` atualiza localmente as transações transferidas sem novo fetch

### `services/api.js`

Camada de acesso HTTP. Função interna `request(path, options)` centraliza tratamento de erros: converte `response.ok === false` em `throw new Error(errMsg)` e erros de rede em mensagem legível com a URL tentada. Retorna `null` para respostas `204 No Content`.

### `constants/colors.js`

Paleta de cores do tema escuro. Exporta tokens como `background`, `surface`, `border`, `text`, `textSecondary`, `primary`, `success` e `danger`, usados em todos os StyleSheets da aplicação.

---

## 🔐 Fluxo de Autenticação

```
Abertura do app
    ↓
restoreSession() lê AsyncStorage
    ├─ Sessão encontrada → refresh() → /(tabs)
    └─ Sem sessão → /login
              ↓
         login() ou register()
              ↓
     Salva sessão no AsyncStorage
              ↓
           /(tabs)
```

---

## 🌐 Comunicação com a API

Todas as chamadas passam por `services/api.js`. O `GlobalState` consome essas funções e atualiza o estado local otimistamente (sem novo fetch) após operações de escrita, exceto em `refresh()` que sincroniza todo o estado com o servidor.

| Ação | Método | Rota |
|------|--------|------|
| Listar categorias | GET | `/categories?userId=` |
| Criar categoria | POST | `/categories` |
| Atualizar categoria | PUT | `/categories/:id` |
| Excluir categoria | DELETE | `/categories/:id` |
| Listar transações | GET | `/transactions?userId=` |
| Criar transação | POST | `/transactions` |
| Atualizar transação | PUT | `/transactions/:id` |
| Excluir transação | DELETE | `/transactions/:id` |
| Login | POST | `/auth/login` |
| Cadastro | POST | `/auth/register` |
| Redefinir senha | PUT | `/auth/reset-password` |
| Atualizar avatar | PUT | `/auth/update-avatar` |
| Atualizar nome | PUT | `/auth/update-name` |
| Excluir conta | DELETE | `/auth/users/:username` |
