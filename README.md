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

### Rate Limits

- **Development**: 20 requests/segundo, 100 requests/minuto
- **Production**: Varia conforme o tier (Basic, Advanced, Professional)

## 📊 Sistema de Ranking e LP

O ranking **agora usa dados reais** da Riot Games API! Cada jogador mostra seu **League Points (LP)** verdadeiro.

### O que é League Points (LP)?

- **LP** = pontos dentro de uma divisão específica 
- Varia de **0 a 100** por tier/divisão
- Quando atinge 100 LP, sobe uma divisão
- Por exemplo: **EMERALD III com 95 LP** significa 95 pontos para chegar a EMERALD II

### Sistema de Ordenação (Ranking)

O ranking ordena por:

1. **Tier** (maior primeiro): CHALLENGER > GRANDMASTER > MASTER > DIAMOND > EMERALD > PLATINUM > GOLD > SILVER > BRONZE > IRON
2. **Divisão** (se mesmo tier): I > II > III > IV
3. **League Points** (se mesmo tier+divisão): 100 > 0

### Campo `points` vs `leaguePoints`

- **`leaguePoints`**: LP **real** do Riot (0-100) - **ISSO QUE MOSTRA NA INTERFACE**
- **`points`**: Número calculado para ordenação interna (não mostrado ao usuário)

### Exemplos de Ranking

```
#1 - errid#errid       → EMERALD III 95 LP
#2 - sneagles#000      → EMERALD III 93 LP
#3 - DIDs#br1          → PLATINUM IV 91 LP
#4 - Mega#sad          → PLATINUM IV 85 LP
```

**Nota**: Dados sincronizados em tempo real com a Riot API! Clique em "Atualizar" para buscar dados novos.

## 🔌 Como a API Funciona

### GET /api/ranking

Retorna o ranking ordenado por tier, divisão e league points.

**Query Parameters:**
- `queue` (opcional): `RANKED_SOLO_5x5` (Solo/Duo) ou `RANKED_FLEX_SR` (Flex) - padrão: RANKED_SOLO_5x5

**Exemplo de requisição:**
```bash
# Solo/Duo
curl http://localhost:3000/api/ranking

# Flex
curl http://localhost:3000/api/ranking?queue=RANKED_FLEX_SR
```

**Exemplo de resposta:**
```json
{
  "success": true,
  "queue": "RANKED_SOLO_5x5",
  "total": 4,
  "data": [
    {
      "position": 1,
      "player": {
        "id": "uuid-123",
        "nickname": "errid",
        "tag": "errid",
        "region": "BR"
      },
      "tier": "EMERALD",
      "rank": "III",
      "leaguePoints": 95,
      "lastUpdate": "2025-02-13T15:42:30.000Z"
    },
    {
      "position": 2,
      "player": {
        "id": "uuid-456",
        "nickname": "sneagles",
        "tag": "000",
        "region": "BR"
      },
      "tier": "EMERALD",
      "rank": "III",
      "leaguePoints": 93,
      "lastUpdate": "2025-02-13T15:42:20.000Z"
    }
  ]
}
```

### POST /api/update-ranks

Sincroniza os ranks de todos os jogadores com a Riot Games API.

**Sem parâmetros**

**Exemplo de requisição:**
```bash
curl -X POST http://localhost:3000/api/update-ranks
```

**Exemplo de resposta:**
```json
{
  "success": true,
  "message": "4 jogadores atualizados com sucesso",
  "results": [
    {
      "player": "errid#errid",
      "queue": "RANKED_SOLO_5x5",
      "tier": "EMERALD",
      "rank": "III",
      "leaguePoints": 95,
      "status": "updated"
    }
  ],
  "errors": []
}
```

**O que acontece:**
1. Busca todos os players do banco
2. Para cada um, consulta a Riot API usando account-v1 + league-v4
3. Atualiza tier, rank, league_points no banco (Supabase)
4. Retorna summary de sucesso/erro

Atualiza os ranks de todos os jogadores baseado na Riot API.

**Exemplo de requisição:**
```bash
curl -X POST http://localhost:3000/api/update-ranks
```

**Exemplo de resposta:**
```json
{
  "success": true,
  "totalProcessed": 8,
  "results": [
    {
      "player": "errid#errid",
      "queue": "RANKED_SOLO_5x5",
      "tier": "GOLD",
      "rank": "II",
      "points": 800,
      "status": "updated"
    }
  ],
  "errors": []
}
```

## 🎨 Customizações de Estilo

### Tema de Cores

O tema está configurado em `tailwind.config.ts`:

```typescript
colors: {
  primary: '#0f172a',      // Background principal (azul escuro)
  secondary: '#1e293b',    // Cards, componentes
  accent: '#3b82f6',       // Botões, destaques (azul)
}
```

### Adicionar Novos Jogadores

#### Via Supabase Dashboard:

1. Vá para "Table Editor"
2. Clique na tabela `players`
3. Clique em "Insert"
4. Preencha:
   - nickname
   - tag
   - region (deixar como 'BR')
5. Clique em "Save"
6. A tabela `ranks` será preenchida automaticamente

#### Via SQL direto:

```sql
INSERT INTO players (nickname, tag, region) VALUES
  ('seu_nick', 'sua_tag', 'BR');
```

Depois insira os ranks:

```sql
INSERT INTO ranks (player_id, queue_type, tier, rank, points, last_update)
VALUES (
  (SELECT id FROM players WHERE nickname = 'seu_nick' LIMIT 1),
  'RANKED_SOLO_5x5',
  'GOLD',
  'II',
  800,
  now()
);
```

## 🚀 Deploy na Vercel

### Passo 1: Preparar para deploy

```bash
git add .
git commit -m "Initial commit: PWG Ranking app"
git push origin main
```

### Passo 2: Conectar com Vercel

1. Acesse: https://vercel.com
2. Clique em "New Project"
3. Importe seu repositório GitHub
4. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RIOT_API_KEY`
5. Clique em "Deploy"

### Passo 3: Testar em produção

Sua aplicação estará disponível em: `https://seu-projeto.vercel.app`

### Domínio customizado (opcional)

1. Em "Settings" > "Domains"
2. Clique em "Add Domain"
3. Insira seu domínio (ex: ranking.com)
4. Configure o DNS conforme instruções

## 🔐 Segurança

### Pontos importantes:

1. **RLS (Row Level Security)**: Habilitado no Supabase para proteger dados
2. **API Key segura**: Nunca commit a chave da Riot API - usar variáveis de ambiente
3. **NEXT_PUBLIC prefix**: Apenas variáveis público do Supabase têm estes prefixos
4. **Riot API Key**: Sempre no lado do servidor (variável sem NEXT_PUBLIC)

### Renovar Chaves:

Se expuser acidentalmente uma chave:

**Supabase:**
1. Vá para "Settings" > "API"
2. Clique em "Regenerate" para gerar nova chave

**Riot API:**
1. Vá para https://developer.riotgames.com/
2. Clique em "Regenerate API Key"

## 📈 Próximas Melhorias

- [ ] Integração com Riot PDTO (novo endpoint de ranking)
- [ ] Histórico de rankings (gráficos de progresso)
- [ ] Sistema de badges e achievements
- [ ] Estatísticas detalhadas por jogador
- [ ] Notificações de mudanças de ranking
- [ ] Autenticação (login com Discord/Riot)
- [ ] Dashboard de admin
- [ ] Exportar em image

## 🐛 Troubleshooting

### "Missing Supabase environment variables"

**Solução:** Verifique se `.env.local` existe e tem as variáveis corretas.

### "Failed to fetch ranking"

**Solução:**
1. Verifique conexão com Supabase
2. Verifique RLS policies (todas devem ser SELECT públicas)
3. Verifique se as tabelas foram criadas

### "Failed to get summoner data"

**Solução:**
1. Verifique se a Riot API Key é válida
2. Verifique rate limiting (20 req/seg)
3. Verifique os nomes dos jogadores (case-sensitive)

### Erro CORS

**Solução:** O Next.js API routes handler isso automaticamente. Se persistir, verifique permissões Supabase.

## 📞 Suporte

Para problemas:
1. Verifique `.env.local` e variáveis
2. Verifique logs do servidor (`npm run dev`)
3. Verifique console do navegador (F12)
4. Verifique logs do Supabase

## 📄 Licença

MIT - Livre para usar e modificar.

## 🎉 Pronto para começar!

Siga os passos acima para ter seu ranking rodando em minutos. Divirta-se! ✨

---

**Última atualização**: 13 de Fevereiro de 2025
