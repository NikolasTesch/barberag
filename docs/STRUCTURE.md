# Estrutura de Pastas — BARBERAG

> **Esta é a estrutura-alvo (full-stack).** Para o que já está implementado hoje, veja
> `docs/HANDOFF_STATUS.md`. Todas as telas do handoff de design estão prontas e a camada de
> backend **já está implementada** (sprints 01–05): API Routes, NextAuth com isolamento por
> role, `lib/utils` (`slots`/`commission`, com testes), `lib/validations` (Zod) e
> `lib/notifications`. Esta árvore lista a topologia-alvo; alguns nomes de arquivo divergem do
> que foi de fato extraído (ver notas em `barber/` e `ui/`). Algumas rotas de admin usam sufixo
> `-admin` na URL (ver abaixo) para evitar colisão de route-groups do App Router.

```
barberag/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   ├── seed.ts                # Dados iniciais (admin, barbeiros, serviços, agendamentos)
│   └── tsconfig.seed.json     # tsconfig dedicado p/ rodar o seed via ts-node (CommonJS)
│
├── public/
│   └── images/                # Assets estáticos (logo, og-image)
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   │
│   │   ├── (public)/          # Rotas públicas — sem autenticação
│   │   │   ├── page.tsx       # Landing page "/"
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (auth)/            # Rotas de autenticação
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── cadastro/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── (client)/          # Portal do cliente (role: CLIENT)
│   │   │   ├── agendar/
│   │   │   │   ├── page.tsx           # Step 1: escolher serviço
│   │   │   │   ├── barbeiro/page.tsx  # Step 2: escolher barbeiro
│   │   │   │   ├── horario/page.tsx   # Step 3: escolher data/hora
│   │   │   │   └── confirmar/page.tsx # Step 4: confirmar
│   │   │   ├── agendamentos/
│   │   │   │   └── page.tsx   # Meus agendamentos
│   │   │   ├── perfil/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx     # Guard: redirect se não for CLIENT
│   │   │
│   │   ├── (barber)/          # Painel do barbeiro (role: BARBER)
│   │   │   ├── agenda/
│   │   │   │   └── page.tsx   # Agenda do dia/semana
│   │   │   ├── atendimento/
│   │   │   │   ├── page.tsx       # Lista de atendimentos do dia
│   │   │   │   └── [id]/page.tsx  # Executar atendimento
│   │   │   ├── comissoes/
│   │   │   │   └── page.tsx
│   │   │   ├── disponibilidade/
│   │   │   │   └── page.tsx
│   │   │   ├── clientes/
│   │   │   │   └── page.tsx   # Meus clientes (barbeiro)
│   │   │   └── layout.tsx     # Guard: redirect se não for BARBER
│   │   │
│   │   ├── (admin)/           # Painel admin/dono (role: ADMIN)
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx   # KPIs e métricas
│   │   │   ├── agendamentos-admin/   # sufixo -admin evita colisão de route-group
│   │   │   │   └── page.tsx   # Visão geral todos os agendamentos
│   │   │   ├── barbeiros/
│   │   │   │   ├── page.tsx   # Listagem
│   │   │   │   ├── novo/page.tsx
│   │   │   │   └── [id]/page.tsx     # CRUD completo
│   │   │   ├── servicos/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── novo/page.tsx
│   │   │   │   └── [id]/page.tsx     # CRUD completo
│   │   │   ├── comissoes-admin/      # sufixo -admin evita colisão de route-group
│   │   │   │   └── page.tsx   # Gestão e fechamento de comissões
│   │   │   ├── clientes-admin/       # sufixo -admin evita colisão de route-group
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── avaliacoes-admin/     # moderação de avaliações
│   │   │   │   └── page.tsx
│   │   │   ├── configuracoes/        # config da barbearia (/api/admin/config)
│   │   │   │   └── page.tsx
│   │   │   ├── relatorios/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx     # Guard: redirect se não for ADMIN
│   │   │
│   │   ├── avaliar/[token]/   # Avaliação pública pós-atendimento (sem auth, via token)
│   │   │   └── page.tsx
│   │   │
│   │   └── api/               # API Routes (backend) — namespaced por role
│   │       ├── auth/
│   │       │   ├── [...nextauth]/route.ts
│   │       │   └── register/route.ts
│   │       ├── appointments/          # agendamento (cliente)
│   │       │   ├── route.ts            # GET (listar) / POST (criar — anti double-booking)
│   │       │   └── [id]/route.ts
│   │       ├── barbers/               # público: lista + disponibilidade p/ agendar
│   │       │   ├── route.ts
│   │       │   └── [id]/availability/route.ts
│   │       ├── barber/                # painel do barbeiro (role BARBER, barberId via sessão)
│   │       │   ├── appointments/route.ts
│   │       │   ├── appointments/[id]/checkin/route.ts
│   │       │   ├── appointments/[id]/complete/route.ts
│   │       │   ├── commissions/route.ts
│   │       │   └── availability/route.ts
│   │       ├── admin/                 # painel admin (role ADMIN)
│   │       │   ├── barbers/[route.ts, [id]/route.ts]
│   │       │   ├── services/[route.ts, [id]/route.ts]
│   │       │   ├── clients/[route.ts, [id]/route.ts]
│   │       │   ├── commissions/[route.ts, pay/route.ts, rules/route.ts, rules/[id]/route.ts]
│   │       │   ├── metrics/[overview, revenue, barbers, export]/route.ts
│   │       │   ├── occupancy/route.ts
│   │       │   ├── reviews/[route.ts, [id]/route.ts]
│   │       │   └── config/route.ts
│   │       ├── reviews/route.ts       # submissão pública de avaliação (via token)
│   │       └── cron/                  # autenticados via CRON_SECRET (RN-07)
│   │           ├── reminders-24h/route.ts
│   │           └── reminders-2h/route.ts
│   │
│   ├── components/
│   │   ├── ui/                # Componentes base (shadcn/ui)
│   │   │   ├── badge.tsx      # hoje só badge + button foram gerados; demais primitivos
│   │   │   └── button.tsx     # (card, input, dialog, calendar…) ainda via `npx shadcn add`
│   │   │
│   │   ├── shared/            # Componentes reutilizáveis entre módulos
│   │   │   ├── AppointmentCard.tsx
│   │   │   ├── BarberAvatar.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   │
│   │   ├── navigation/        # Navbars por role (AdminNav, BarberNav implementados)
│   │   │   ├── AdminNav.tsx
│   │   │   ├── BarberNav.tsx
│   │   │   └── ClientNav.tsx
│   │   │
│   │   ├── landing/           # Seções da landing page
│   │   │   ├── Hero.tsx
│   │   │   ├── Services.tsx
│   │   │   ├── Team.tsx
│   │   │   ├── Gallery.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   └── Footer.tsx
│   │   │
│   │   ├── scheduling/        # Fluxo de agendamento
│   │   │   ├── ServiceSelector.tsx
│   │   │   ├── BarberSelector.tsx
│   │   │   ├── SlotPicker.tsx
│   │   │   ├── BookingSummary.tsx
│   │   │   └── StepIndicator.tsx
│   │   │
│   │   ├── barber/            # Painel do barbeiro
│   │   │   └── CompleteModal.tsx   # único componente extraído; as telas /agenda,
│   │   │       # /comissoes e /disponibilidade foram construídas inline nas próprias
│   │   │       # page.tsx (DailySchedule/AppointmentAction/etc. da spec não viraram arquivos)
│   │   │
│   │   ├── dashboard/         # Dashboard admin
│   │   │   ├── KPICard.tsx
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── OccupancyGrid.tsx
│   │   │   ├── BarberRanking.tsx
│   │   │   └── CommissionTable.tsx
│   │   │
│   │   └── admin/             # Telas admin
│   │       ├── BarberForm.tsx
│   │       ├── ServiceForm.tsx
│   │       ├── CommissionRuleForm.tsx
│   │       └── ClientTable.tsx
│   │
│   ├── lib/
│   │   ├── prisma/
│   │   │   └── client.ts      # Singleton do PrismaClient
│   │   ├── auth/
│   │   │   ├── config.ts      # NextAuth config (providers, callbacks)
│   │   │   ├── config.base.ts # config base reutilizável (sem adapter)
│   │   │   ├── helpers.ts     # getServerSession wrapper
│   │   │   ├── admin.ts       # guard getSessionAdmin (role ADMIN)
│   │   │   └── barber.ts      # guard getSessionBarber (deriva barberId da sessão)
│   │   ├── validations/       # Schemas Zod (compartilhados front/back)
│   │   │   ├── appointment.ts ├── auth.ts        ├── availability.ts
│   │   │   ├── barber.ts      ├── commission.ts  ├── config.ts
│   │   │   ├── review.ts      └── service.ts
│   │   ├── notifications/
│   │   │   ├── whatsapp.ts    # Evolution API wrapper (+ __tests__/)
│   │   │   ├── email.ts       # Resend wrapper
│   │   │   ├── templates.ts   # templates de mensagem
│   │   │   └── reminders.ts   # lógica dos lembretes (consumida pelos crons)
│   │   ├── utils/
│   │   │   ├── slots.ts       # Geração de slots disponíveis (+ __tests__/)
│   │   │   ├── commission.ts  # Cálculo de comissão RN-04 (+ __tests__/)
│   │   │   ├── period.ts      # Helpers de período (hoje|semana|mês)
│   │   │   ├── format.ts      # Formatação (moeda, data)
│   │   │   └── cn.ts          # classnames helper (shadcn)
│   │   ├── landing.ts         # Dados/queries da landing page
│   │   ├── reports.ts         # Geração de relatórios (admin)
│   │   └── reports.constants.ts
│   │
│   ├── store/                 # Zustand stores
│   │   └── bookingStore.ts    # Estado do fluxo de agendamento
│   │
│   └── types/
│       └── next-auth.d.ts     # Augmentação de tipos da sessão (role, barberId)
│
├── specs/
│   ├── pending/               # Tasks aguardando execução
│   ├── active/                # Task em andamento (máx 1 por vez)
│   └── done/                  # Tasks concluídas
│
├── docs/
│   └── adr/                   # Architecture Decision Records
│
├── .env.example
├── .env.local                 # Nunca commitar
├── .gitignore
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── PRD.md
└── STRUCTURE.md
```
