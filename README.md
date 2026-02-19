# PWG Ranking - League of Legends Friends ELO

Um aplicativo web moderno para rankear amigos baseado no ELO do League of Legends. Tema gamer escuro, interface limpa e pronta para deploy na Vercel.

## 🎮 Características

- ✅ Ranking em tempo real de amigos por ELO
- ✅ Dois modes: Solo/Duo e Flex
- ✅ Integração com API oficial da Riot Games
- ✅ Banco de dados com Supabase (PostgreSQL)
- ✅ Tema gamer escuro moderno
- ✅ Responsivo em todos os dispositivos
- ✅ Deploy automático na Vercel
- ✅ Código TypeScript completo

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router) + React 18
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Backend**: API Routes do Next.js
- **API Externa**: Riot Games API
- **Linguagem**: TypeScript
- **Deploy**: Vercel

## 📁 Estrutura do Projeto

```
rankingpwg/
├── app/
│   ├── api/
│   │   ├── ranking/
│   │   │   └── route.ts          # GET /api/ranking - Retorna ranking ordenado por tier/rank/LP
│   │   └── update-ranks/
│   │       └── route.ts          # POST /api/update-ranks - Sincroniza com Riot API
│   ├── components/
│   │   ├── Header.tsx            # Header com botão de atualizar
│   │   ├── TabSelector.tsx       # Selector Solo/Duo e Flex
│   │   └── RankingTable.tsx      # Tabela de ranking com LP
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Página principal
│   └── globals.css               # Estilos globais (tema dark gamer)
├── lib/
│   ├── supabase.ts               # Cliente Supabase (anon + admin)
│   ├── riot-api.ts               # Integração oficial Riot API v1/v4
│   └── types.ts                  # Tipos TypeScript compartilhados
├── supabase/
│   └── migrations/
│       ├── 001_init.sql          # Schema SQL inicial com league_points
│       └── 002_add_league_points.sql  # Migration para adicionar LP (opcional)
├── .env.local                    # Variáveis de ambiente (LOCAL, NÃO comitar)
├── .env.example                  # Template de variáveis
├── next.config.js                # Configuração Next.js
├── tsconfig.json                 # Configuração TypeScript
├── tailwind.config.ts            # Configuração Tailwind CSS
├── postcss.config.js             # Processamento CSS
├── vercel.json                   # Deploy Vercel
└── package.json                  # Dependências e scripts npm

Database Schema:

players
├── id (UUID, PK, default: uuid_generate_v4())
├── nickname (TEXT, NOT NULL)
├── tag (TEXT, NOT NULL)
├── region (TEXT, default: 'BR')
├── created_at (TIMESTAMP, default: now())
└── UNIQUE(nickname, tag)

ranks
├── id (UUID, PK, default: uuid_generate_v4())
├── player_id (UUID, FK → players.id, ON DELETE CASCADE)
├── queue_type (TEXT: RANKED_SOLO_5x5, RANKED_FLEX_SR, RANKED_FLEX_TT)
├── tier (TEXT: IRON, BRONZE, SILVER, GOLD, PLATINUM, EMERALD, DIAMOND, MASTER, GRANDMASTER, CHALLENGER)
├── rank (TEXT: IV, III, II, I, ou NULL para Master+)
├── points (INTEGER: ranking score para ordenação)
├── league_points (INTEGER: 0-100 LP real do Riot)
├── last_update (TIMESTAMP)
└── UNIQUE(player_id, queue_type)
```

## 🔧 Como Rodar Localmente

### 1. Clonar o repositório

```bash
cd rankingpwg
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
RIOT_API_KEY=sua_chave_riot_api
```

### 4. Rodar o servidor de desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

### 5. Build para produção

```bash
npm run build
npm start
```

## 🗄️ Configurar Supabase

### Passo 1: Criar projeto Supabase

1. Acesse: https://supabase.com
2. Clique em "New Project"
3. Insira um nome (ex: "pwg-ranking")
4. Escolha uma senha forte
5. Selecione a região (recomendado: us-east-1 ou South America)
6. Clique em "Create new project"

### Passo 2: Pegar as credenciais

1. Vá para "Settings" > "API"
2. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Passo 3: Executar o SQL

1. Vá para "SQL Editor"
2. Clique em "New Query"
3. Copie todo o conteúdo de `supabase/migrations/001_init.sql`
4. Cole na query
5. Clique em "Run"

### Resultado esperado

Após executar o SQL, você terá:
- Tabela `players` com dados iniciais (errid, sneagles, Mega, DIDs)
- Tabela `ranks` com ranks iniciais
- Índices para performance
- RLS (Row Level Security) configurado

## 🔑 Obter Riot API Key

### Passo 1: Registrar como desenvolvedor

1. Acesse: https://developer.riotgames.com/
2. Clique em "Sign Up"
3. Crie uma conta Riot (ou use a existente)
4. Aceite os termos

### Passo 2: Obter a chave

1. Vá para "API Keys"
2. Você verá uma chave de teste para desenvolvimento
3. Copie a chave e cole em `RIOT_API_KEY` no `.env.local`

**Nota importante**: A chave de teste tem limites de rate (20 requests/segundo). Para produção, você precisa solicitar acesso à API Productions (geralmente levam 2-4 semanas).

