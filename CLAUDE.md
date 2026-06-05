# Constituição do Agente — BARBERAG

> Leia este arquivo **inteiro** antes de qualquer ação. É o ponto zero de toda sessão.

---

## Identidade do Projeto

**BARBERAG | Authentic Barbershop** — plataforma web de gestão completa para barbearias.

Três perfis de usuário, três experiências distintas:
- **Cliente** → agendamento self-service 24/7, histórico, lembretes automáticos.
- **Barbeiro** → agenda do dia, execução de atendimentos, comissões em tempo real.
- **Admin/Dono** → dashboard de métricas, gestão de equipe, fechamento de comissões.

**Documentação de referência:**
| Necessidade | Arquivo |
|---|---|
| Visão do produto, personas, regras de negócio | `PRD.md` |
| Topologia de arquivos e responsabilidades | `STRUCTURE.md` |
| Status de implementação do handoff de design | `docs/HANDOFF_STATUS.md` |
| Tokens de cor, tipografia, componentes e animações | `DESIGN_SYSTEM.md` |
| Schema completo do banco de dados | `prisma/schema.prisma` |
| Variáveis de ambiente necessárias | `.env.example` |
| Tasks em andamento | `specs/active/` |
| Próximas tasks | `specs/pending/` |
| Tasks concluídas | `specs/done/` |

---

## Ritual de Início de Sessão (Obrigatório)

Execute nesta ordem antes de tocar qualquer código:

1. Leia `specs/active/` — há alguma spec em andamento? Retome do último step com `"status": "pending"`.
2. Se `specs/active/` vazio, leia `specs/pending/` — assuma a próxima spec disponível (menor número de sprint).
3. Verifique se as dependências da spec estão satisfeitas (`depends_on`).
4. Ao assumir uma spec: mova o JSON de `pending/` → `active/`, atualize `"status": "in-progress"`.

---

## Workflow SDD (Spec-Driven Development)

```
specs/pending/ → specs/active/ → [código] → specs/done/
(aguardando)     (em andamento)              (concluído)
```

### Regras do Workflow

- **Nunca** escreva código sem spec JSON correspondente em `specs/active/`.
- **Ao assumir task:** mova JSON de `pending/` → `active/`, atualize `"status": "in-progress"`.
- **Ao concluir task:** atualize todos os steps para `"done"`, mova `active/` → `done/`.
- **Se sessão for interrompida:** na próxima sessão leia `specs/active/` e retome do último step com `"status": "pending"`.
- **Mudanças de escopo:** entram apenas em `specs/pending/` — nunca interrompem sprint ativo.

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 14 — App Router, TypeScript |
| Banco de Dados | PostgreSQL via NeonDB (serverless) |
| ORM | Prisma + Prisma Migrate |
| Autenticação | NextAuth.js v5 (JWT + Google OAuth) |
| Validação | Zod — schemas compartilhados entre front e back |
| Estilização | Tailwind CSS + shadcn/ui |
| Animações | Framer Motion |
| Estado global | Zustand (apenas para estado de UI e fluxo de agendamento) |
| Gráficos | Recharts |
| Storage de mídia | Cloudinary |
| E-mail | Resend |
| WhatsApp | Evolution API |
| Jobs/Cron | Vercel Cron Jobs |
| Deploy | Vercel (frontend + API Routes) |

---

## Estrutura de Rotas

```
(public)  → /                    Landing page — sem auth
(auth)    → /login /cadastro     Autenticação
(client)  → /agendar /agendamentos /perfil    Role: CLIENT
(barber)  → /agenda /atendimento /comissoes   Role: BARBER
(admin)   → /dashboard /barbeiros /servicos   Role: ADMIN
```

Guards de autenticação são aplicados nos `layout.tsx` de cada route group — **nunca nas páginas individuais**.

---

## Regras de Negócio Críticas

### RN-01 — Anti Double-Booking
Ao criar um agendamento (`POST /api/appointments`), usar **Prisma transaction com isolationLevel Serializable** para garantir que dois clientes não reservem o mesmo slot simultaneamente. Nunca validar conflito apenas no frontend.

### RN-02 — Cálculo de Duração
Quando múltiplos serviços são selecionados, a duração do agendamento é a **soma** das durações individuais. Nunca sobrescrever manualmente.

### RN-03 — Hierarquia de Comissões (RN-04 do PRD)
A função `calculateCommission()` em `src/lib/utils/commission.ts` aplica regras nesta ordem de prioridade (maior → menor):
1. Regra: barbeiro + serviço + forma de pagamento
2. Regra: barbeiro + serviço
3. Regra: barbeiro (geral)
4. Regra padrão da barbearia

**Nunca** calcular comissão fora desta função. Qualquer mudança na lógica requer atualização nos testes.

### RN-04 — Isolamento de Dados por Perfil
- Barbeiro só acessa seus próprios agendamentos e comissões.
- Cliente só acessa seus próprios agendamentos.
- Admin acessa tudo.
- Toda API Route verifica `session.user.role` **antes** de qualquer query ao banco.

### RN-05 — Status do Agendamento
```
SCHEDULED → IN_PROGRESS → COMPLETED
                        ↘ NO_SHOW
         ↘ CANCELLED
```
Transições inválidas devem retornar HTTP 400. Nunca pular estados.

### RN-06 — Comissão gerada ao concluir
A comissão é calculada e persistida **dentro da mesma transaction** que marca o agendamento como `COMPLETED`. Se a criação da comissão falhar, o status não muda.

### RN-07 — Cron autenticado
Toda API Route em `/api/cron/*` deve validar o header `Authorization: Bearer ${CRON_SECRET}` antes de qualquer processamento. Retornar 401 se inválido.

---

## Padrões de Código

### TypeScript
- `strict: true` em todo o projeto — sem `any` explícito.
- Tipos de retorno obrigatórios em funções de utilidade e API handlers.
- Prefira `type` a `interface` para objetos simples; `interface` para entidades extensíveis.

### API Routes (Next.js)
```typescript
// Padrão obrigatório para toda API Route
export async function POST(req: Request) {
  // 1. Autenticação
  const session = await getServerSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // 2. Validação com Zod
  const body = await req.json()
  const result = SomeSchema.safeParse(body)
  if (!result.success) return Response.json({ error: result.error.flatten() }, { status: 400 })

  // 3. Lógica de negócio
  // 4. Resposta tipada
}
```

### Zod — onde definir schemas
- Todos os schemas em `src/lib/validations/[entidade].ts`
- O mesmo schema é importado pela API Route (validação server-side) e pelo formulário frontend (`zodResolver`)
- **Nunca** duplicar um schema em dois arquivos

### Prisma
- Singleton do client em `src/lib/prisma/client.ts` — nunca instanciar `new PrismaClient()` fora deste arquivo
- Operações de escrita críticas (agendamento, comissão) sempre em `prisma.$transaction()`
- Selects explícitos (`select: {}`) em queries que retornam dados para o cliente — nunca expor `passwordHash`

### Framer Motion
- Animações de entrada de página: `fade + slideY` com `duration: 0.3`
- Listas de cards: `staggerChildren: 0.05` no container
- Animações de ação (check-in, conclusão): `scale` feedback no botão
- Sem animações em estados de erro/loading — priorizar clareza

### Zustand
- Usado **apenas** para: estado do fluxo de agendamento (`bookingStore`) e estado de UI global (`uiStore`)
- Dados remotos (agendamentos, barbeiros, métricas) **nunca** no Zustand — usar `fetch` + `SWR` ou Server Components

### Componentes
- Server Components por padrão — adicionar `'use client'` apenas quando necessário (hooks, eventos, Framer Motion)
- Dados da landing page: `fetch` com `{ next: { revalidate: 3600 } }` — nunca client-side
- Loading states: usar `<Suspense>` com skeleton components, nunca spinners inline em Server Components

---

## Identidade Visual

| Token | Valor | Uso |
|-------|-------|-----|
| `primary` | `#1A1A1A` | Fundo principal, headers |
| `accent` | `#D4830A` | CTAs, ícones, destaques |
| `background` | `#FFFFFF` | Fundo das telas internas |
| `muted` | `#F5F5F5` | Cards, inputs |
| `success` | `#27AE60` | Status positivo, comissão paga |
| `warning` | `#F39C12` | Status morno, comissão pendente |
| `error` | `#C0392B` | Erros, cancelamentos |
| `textPrimary` | `#1A1A1A` | Textos principais |
| `textMuted` | `#666666` | Textos secundários |

**Fontes:** `Inter` (corpo) + `Playfair Display` (títulos da landing page)

Cores e fontes **somente** via tokens do `tailwind.config.ts` — nunca valores hex inline.

---

## Qualidade e Testes

### Definition of Done — uma task só é DONE quando:
- [ ] Código funciona sem erros de TypeScript (`tsc --noEmit`)
- [ ] Sem `console.log` de debug no código commitado
- [ ] Credenciais nunca hardcoded — sempre via `process.env`
- [ ] Loading + error states implementados em toda interação com API
- [ ] Isolamento de dados por role validado (barbeiro não acessa dados de outro)
- [ ] Testado em mobile (375px) e desktop (1280px)

### Testes unitários obrigatórios para:
- `src/lib/utils/slots.ts` — geração de slots disponíveis
- `src/lib/utils/commission.ts` — cálculo de comissão (todas as combinações da hierarquia)
- Schemas Zod de agendamento e comissão

---

## Segurança

- `.env.local` **nunca** commitado — está no `.gitignore`
- `passwordHash` **nunca** retornado em responses de API (usar `select` explícito no Prisma)
- Telefone e dados sensíveis mascarados em logs
- Toda rota de admin valida `session.user.role === 'ADMIN'` no início do handler
- Upload de imagens passa pelo backend (Cloudinary signed upload) — nunca expor `CLOUDINARY_API_SECRET` no cliente

---

## Comandos Frequentes

```bash
# Desenvolvimento
npm run dev

# Banco de dados
npx prisma migrate dev --name <nome>   # nova migration
npx prisma db seed                      # popular com dados de teste
npx prisma studio                       # visualizar banco local

# Verificação de tipos
npx tsc --noEmit

# Adicionar componente shadcn
npx shadcn@latest add <componente>
```

---

## Ciclo de Vida do Agendamento (Referência Rápida)

```
Cliente escolhe serviços → barbeiro → data/hora → confirma
                                                      ↓
                              Slot bloqueado + e-mail enviado
                                                      ↓
                              Lembrete 24h e 2h antes (Cron)
                                                      ↓
                              Barbeiro faz check-in (IN_PROGRESS)
                                                      ↓
                              Barbeiro conclui + registra pagamento
                                                      ↓
                    Comissão calculada automaticamente (PENDING)
                                                      ↓
                              Link de avaliação enviado ao cliente
                                                      ↓
                              Admin fecha comissões (PAID)
```

---

## Como Trabalhar Aqui — Subagentes & Fluxo

Delegue para os subagentes em `.claude/agents/` seguindo o fluxo
**arquiteto → implementador → revisor → testador**. Não pule etapas em features não-triviais.

| Agente | Quando usar | Escreve código? |
|--------|-------------|-----------------|
| `arquiteto` | Início de toda feature/regra de negócio — desenha solução + ADR curto | Não |
| `implementador` | Executa o plano: código + testes + atualiza spec/docs | Sim |
| `revisor` | Antes do merge: audita o diff (bugs, segurança, padrões) | Não (só aponta) |
| `testador` | Cobre e valida bordas do agendamento; roda a suíte vitest | Só testes |

**Disparo:** ao receber "implemente a feature X", delegue ao `arquiteto` para o plano,
passe o plano ao `implementador`, então rode `revisor` e `testador` sobre o resultado.
Cada agente lê este `CLAUDE.md` e respeita as regras RN-01..RN-07, o workflow SDD
(`specs/active/`) e os padrões de código acima.

Referências técnicas: `docs/tech.md` (arquitetura, ADRs, ambiente), `STRUCTURE.md` (topologia),
`PRD.md` (regras de negócio), `DESIGN_SYSTEM.md` (tokens visuais).
