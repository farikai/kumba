# Kumbapay — AI Voice-First Digital Wallet

Kumba is a voice-first AI-powered digital wallet for Nigeria. It combines financial management, a marketplace, bill payments, and an AI assistant (Kumba) that can execute transactions, analyze finances, and guide users — all through natural conversation.

## Features

### 💰 AI Financial Assistant (Kumba)
- Voice-first chat interface with 20+ tools
- PIN-protected transactions (send, buy airtime, pay bills, place orders)
- RAG-powered context: remembers transactions, spending patterns, beneficiaries
- Navigates any app screen via voice commands
- Budget-aware shopping: checks budget before recommending purchases

### 🏪 Marketplace
- Seller dashboard with store registration
- Product CRUD (add, edit, delete inventory)
- Orders management with status tracking
- Payout history for sellers
- Commission-based revenue model (5% default)

### 📊 Financial Tools
- **AI Budget Planner** — Set category budgets, track vs actual spending
- **Budget Analytics** — Visual breakdown of budget vs actual
- **Transaction Analytics** — Income/expense trends and charts
- **Financial Stability Analyzer** — Health score (0-100) from real data
- **AI Tax Calculator** — Nigerian PAYE bracket estimation
- **Savings Goals** — Track progress toward targets

### 💸 Payments & Bills
- Send money via 9PSB to any Nigerian bank
- Buy airtime (MTN, Airtel, Glo, 9mobile)
- Data bundles
- Electricity bills (IKEDC, EKEDC, AEDC, PHEDC, IBEDC, KEDC)
- TV subscriptions (DSTV, GOtv, StarTimes)
- Scheduled recurring payments
- QR code scanning
- Fund wallet via bank transfer/card

### 🛒 Shop & Compare
- Product search across stores (Jumia, Konga, Jiji)
- Category browsing (Rice, Beverages, Electronics, Fashion, Home & Kitchen)
- Price comparison with savings display
- Marketplace products from sellers
- Order placement with wallet debit

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router), TypeScript (strict), Tailwind CSS v4 |
| Backend | Convex (cloud — `dev:academic-goat-377`) |
| AI | OpenRouter (`openrouter/owl-alpha`), `openai/text-embedding-3-small` |
| Payments | 9PSB (sandbox mode) |
| UI | Framer Motion, Radix UI, Lucide Icons |
| RAG | Vector embeddings (1536-dim), client-side cosine similarity |

## Architecture

```
User → Voice/Text → Kumba AI (OpenRouter)
                        │
           ┌────────────┼────────────┐
           ▼            ▼            ▼
      READ TOOLS   NAV TOOLS    WRITE TOOLS
      (execute     (navigate    (PIN required →
       instantly)   screen)      execute route)
           │            │            │
           ▼            ▼            ▼
      Convex DB    App Screen    Convex Mutation
      (balance,    navigation    (send, order,
       txs,                       schedule)
       budget)
```

## Getting Started

```bash
pnpm install
pnpm dev
```

### Environment Variables

Create `.env.local`:

```
AI_API_KEY=sk-or-v1-...
AI_MODEL=openrouter/owl-alpha
NEXT_PUBLIC_CONVEX_URL=https://academic-goat-377.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://academic-goat-377.convex.site
NINE_PSB_API_KEY=your_9psb_key
NINE_PSB_MODE=sandbox
```

### Setting Up Convex

```bash
npx convex dev --typecheck=disable
npx convex env set AI_API_KEY sk-or-v1-...
npx convex env set AI_MODEL openrouter/owl-alpha
```

### Seeding Products

Call `products:seedProducts` from the Convex dashboard to populate the product catalog with 21 items across 5 categories.

## Project Structure

```
app/
  api/
    kumba-chat/route.ts    — AI chat endpoint with tool execution
    kumba-execute/route.ts — PIN-verified write operations
    kumba-ingest/route.ts  — RAG embedding ingestion
  page.tsx                 — Onboarding flow (splash → PIN → dashboard)
  landing/page.tsx         — Landing page
components/
  dashboard/               — Main app dashboard
  features/                — Feature screens (budget, shop, seller, etc.)
  scheduled/               — Scheduled payments
  bills/                   — Bill payment screens
  onboarding/              — Registration flow
  payments/                — Send money, QR scanner
  ui/                      — Shared UI components (Radix-based)
convex/
  schema.ts                — All data models
  wallet.ts                — Balance, transactions, send, fund
  sellers.ts               — Seller registration, products, orders, payouts
  budgets.ts               — Budget CRUD + analytics
  products.ts              — Product catalog + search
  orders.ts                — Order placement with wallet debit
  analytics.ts             — Financial health calculations
  scheduled.ts             — Recurring payments
  rag.ts                   — Vector storage + retrieval
  beneficiaries.ts         — Saved beneficiaries
lib/
  ai.ts                    — OpenRouter client, tool definitions, executors
  rag.ts                   — Financial context builder + semantic search
  rag-ingestion.ts         — Chunking logic for embedding
  embeddings.ts            — OpenRouter embedding client
```

## Pre-existing Build Errors

- `app/landing/page.tsx:107` — Framer Motion `ease` type issue (pre-existing, unrelated to app features)
