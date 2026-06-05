# tech.md — BARBERAG (Visão Técnica)

> Documento técnico do projeto. Para regras de negócio veja `PRD.md`;
> para topologia de arquivos detalhada veja `STRUCTURE.md`; para tokens visuais
> veja `DESIGN_SYSTEM.md`. Este arquivo é o índice técnico + registro de decisões.

---

## 1. Arquitetura

Aplicação **full-stack Next.js 14 (App Router)** — frontend e backend no mesmo deploy (Vercel).

```
Browser (Server + Client Components)
        │
        ▼
Next.js App Router  ── (auth)/(client)/(barber)/(admin)/(public) route groups
        │                guards de auth nos layout.tsx de cada grupo (não nas páginas)
        ▼
API Routes (/src/app/api/*)  ── auth → Zod → lógica → resposta tipada
        │
        ▼
Camada de domínio (/src/lib)  ── prisma/ · utils/ (slots, commission) · validations/ (Zod) · notifications/ · auth/
        │
        ▼
Prisma Client (singleton)  ──►  PostgreSQL / NeonDB (serverless)
        │
        ├─►  Resend (e-mail)        ├─►  Cloudinary (mídia)
        ├─►  Evolution API (WhatsApp) └─►  Vercel Cron (lembretes)
```

Camadas:
| Camada | Onde | Responsabilidade |
|--------|------|------------------|
| Apresentação | `src/app/**`, `src/components/**` | UI; Server Components por padrão |
| API | `src/app/api/**` | auth, validação Zod, orquestração |
| Domínio | `src/lib/**` | regras puras testáveis (slots, comissão), integrações |
| Persistência | `prisma/` + Prisma Client | schema, migrations, queries |
| Estado UI | `src/store/**` (Zustand) | apenas fluxo de agendamento + UI global |

---

## 2. Modelo de Dados

Fonte de verdade: **`prisma/schema.prisma`**. Não duplicar o schema aqui — consultar o arquivo.

Entidades centrais (ver schema para campos exatos):
- **User** — papéis `CLIENT` / `BARBER` / `ADMIN` (`role`); `passwordHash` nunca exposto.
- **Service** — serviço ofertado, com `duration` e preço.
- **Appointment** — agendamento; status `SCHEDULED → IN_PROGRESS → COMPLETED / NO_SHOW / CANCELLED` (RN-05).
- **Commission** — gerada na conclusão do agendamento; status `PENDING → PAID` (RN-06).
- **CommissionRule** — regras hierárquicas usadas por `calculateCommission()` (RN-03).

Convenções:
- Migrations via `npx prisma migrate dev --name <nome>`. Nenhuma migration sem backup/rollback testado.
- Escrita crítica (agendamento, comissão) em `prisma.$transaction({ isolationLevel: 'Serializable' })`.
- `select` explícito em queries que retornam dados ao cliente.

---

## 3. Integrações

| Serviço | Uso | Variável(is) `.env` |
|---------|-----|---------------------|
| NeonDB (PostgreSQL) | banco serverless | `DATABASE_URL` |
| NextAuth.js v5 | auth (JWT + Google OAuth) | `AUTH_SECRET`, `GOOGLE_*` |
| Resend | e-mails transacionais | `RESEND_API_KEY` |
| Cloudinary | upload de mídia (signed) | `CLOUDINARY_*` |
| Evolution API | mensagens WhatsApp | (ver `.env.example`) |
| Vercel Cron | lembretes 24h/2h | `CRON_SECRET` |

> Detalhe completo e nomes exatos das variáveis: `.env.example`.
> Limitação conhecida de cron: ver §4 (ADR-equivalente) e memória do projeto.

---

## 4. Decisões Técnicas (ADRs curtos)

> ADRs detalhados, quando criados, vivem em `docs/adr/ADR-NNN-titulo.md`.
> Resumo dos principais até aqui:

### ADR-001 — Next.js full-stack em vez de back-end separado
- **Decisão:** API Routes do Next.js no mesmo projeto, deploy único na Vercel.
- **Consequência:** menos infra; front e back compartilham tipos e schemas Zod. Acoplados ao ecossistema Vercel.

### ADR-002 — Route groups por papel com guards nos `layout.tsx`
- **Decisão:** `(client)/(barber)/(admin)` com guard de auth no `layout.tsx` do grupo, nunca na página.
- **Consequência:** isolamento por role centralizado (RN-04). Páginas administrativas usam sufixo `-admin` na URL para evitar colisão de route group.

### ADR-003 — Zod como contrato único front+back
- **Decisão:** schemas em `src/lib/validations/*` importados pela API Route e pelo form (`zodResolver`).
- **Consequência:** validação consistente; uma só fonte de verdade por entidade.

### ADR-004 — Transação Serializable para anti double-booking (RN-01)
- **Decisão:** criação de agendamento e geração de comissão sob `$transaction` Serializable.
- **Consequência:** previne reservas concorrentes no mesmo slot; custo de possíveis retries sob contenção.

### ADR-005 — Cron no plano Vercel Hobby
- **Decisão:** apenas 1 cron diário (lembrete 24h) por limite do plano Hobby; lembrete de 2h não dispara.
- **Consequência:** cobertura de lembretes degradada por design enquanto no Hobby. Reavaliar ao migrar de plano.

---

## 5. Ambiente & Deploy

**Local**
```bash
npm run dev          # Next.js dev server
npx prisma studio    # inspecionar o banco
npx prisma db seed   # popular dados de teste
```

**Verificação (pré-commit / CI)**
```bash
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm run test         # vitest run
npm run build        # prisma generate && next build
```

**Deploy:** Vercel (build = `prisma generate && next build`). Variáveis de ambiente
configuradas no painel da Vercel — nunca commitar `.env`/`.env.local`.

---

## 6. Onde mexer (mapa rápido)

| Preciso de... | Vá para |
|---------------|---------|
| Endpoint novo | `src/app/api/<rota>/route.ts` |
| Validação de input | `src/lib/validations/<entidade>.ts` |
| Regra pura (slots/comissão/datas) | `src/lib/utils/*` (+ teste em `__tests__/`) |
| Acesso a dados | Prisma client singleton `src/lib/prisma/client.ts` |
| Notificações | `src/lib/notifications/*` |
| Estado do fluxo de agendamento | `src/store/*` (Zustand) |
| Tokens visuais | `tailwind.config.ts` / `DESIGN_SYSTEM.md` |
