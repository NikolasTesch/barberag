# Estrutura de Pastas — BARBERAG

> **Esta é a estrutura-alvo (full-stack).** Para o que já está implementado hoje, veja
> `docs/HANDOFF_STATUS.md` — todas as telas do handoff de design estão prontas; a camada de
> backend (`api/`, `lib/auth`, `lib/validations`, `lib/notifications`, `hooks`, `store`) ainda
> é scaffolding vazio. Algumas rotas de admin usam sufixo `-admin` na URL (ver abaixo) para
> evitar colisão de route-groups do App Router.

```
barberag/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── seed.ts                # Dados iniciais (admin, serviços padrão)
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
│   │   │   │   └── page.tsx   # Listagem (CRUD novo/[id] = pendente)
│   │   │   ├── servicos/
│   │   │   │   └── page.tsx   # Listagem (CRUD novo/[id] = pendente)
│   │   │   ├── comissoes-admin/      # sufixo -admin evita colisão de route-group
│   │   │   │   └── page.tsx   # Gestão e fechamento de comissões
│   │   │   ├── clientes-admin/       # sufixo -admin evita colisão de route-group
│   │   │   │   └── page.tsx
│   │   │   ├── relatorios/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx     # Guard: redirect se não for ADMIN
│   │   │
│   │   └── api/               # API Routes (backend)
│   │       ├── auth/
│   │       │   └── [...nextauth]/route.ts
│   │       ├── appointments/
│   │       │   ├── route.ts            # GET (listar) / POST (criar)
│   │       │   ├── [id]/route.ts       # GET / PATCH / DELETE
│   │       │   ├── [id]/checkin/route.ts
│   │       │   └── [id]/complete/route.ts
│   │       ├── barbers/
│   │       │   ├── route.ts
│   │       │   ├── [id]/route.ts
│   │       │   └── [id]/availability/route.ts
│   │       ├── services/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── commissions/
│   │       │   ├── route.ts
│   │       │   ├── rules/route.ts
│   │       │   └── pay/route.ts
│   │       ├── clients/
│   │       │   ├── route.ts
│   │       │   └── [id]/route.ts
│   │       ├── metrics/
│   │       │   ├── overview/route.ts
│   │       │   ├── revenue/route.ts
│   │       │   └── barbers/route.ts
│   │       └── cron/
│   │           ├── reminders-24h/route.ts
│   │           └── reminders-2h/route.ts
│   │
│   ├── components/
│   │   ├── ui/                # Componentes base (shadcn/ui — gerados)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
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
│   │   │   ├── DailySchedule.tsx
│   │   │   ├── AppointmentAction.tsx
│   │   │   ├── CommissionSummary.tsx
│   │   │   └── AvailabilityEditor.tsx
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
│   │   │   └── helpers.ts     # getServerSession wrapper
│   │   ├── validations/       # Schemas Zod (compartilhados front/back)
│   │   │   ├── appointment.ts
│   │   │   ├── barber.ts
│   │   │   ├── service.ts
│   │   │   ├── commission.ts
│   │   │   └── client.ts
│   │   ├── notifications/
│   │   │   ├── whatsapp.ts    # Evolution API wrapper
│   │   │   └── email.ts       # Resend wrapper
│   │   └── utils/
│   │       ├── slots.ts       # Lógica de geração de slots disponíveis
│   │       ├── commission.ts  # Cálculo de comissão (RN-04)
│   │       ├── date.ts        # Helpers de data (date-fns)
│   │       └── cn.ts          # classnames helper (shadcn)
│   │
│   ├── hooks/                 # React hooks customizados
│   │   ├── useAppointments.ts
│   │   ├── useAvailability.ts
│   │   ├── useCommissions.ts
│   │   └── useMetrics.ts
│   │
│   ├── store/                 # Zustand stores
│   │   ├── bookingStore.ts    # Estado do fluxo de agendamento
│   │   └── uiStore.ts         # Estado de UI (modais, sidebar)
│   │
│   └── types/
│       └── index.ts           # Types globais e enums
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
