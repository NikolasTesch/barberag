# PRD — BARBERAG | Sistema de Gestão de Barbearia
**Authentic Barbershop Management Platform**

> Versão: 1.0 | Data: 2026-06-01 | Status: Em Elaboração

---

## 1. VISÃO GERAL DO PRODUTO

### 1.1 Problema
Barbearias modernas enfrentam três dores críticas sem um sistema integrado:
1. **Agendamentos caóticos** — dependência de WhatsApp e cadernos físicos, resultando em conflitos de horário, faltas e experiência ruim para o cliente.
2. **Falta de visibilidade financeira** — dono não sabe em tempo real qual barbeiro rendeu mais, quais serviços são mais lucrativos ou qual o faturamento do dia.
3. **Comissões calculadas manualmente** — fonte frequente de conflitos entre dono e barbeiros, sem transparência.

### 1.2 Solução
A **Plataforma BARBERAG** é um sistema web completo que conecta:
- **Clientes** → agendamento online self-service, 24/7, sem precisar ligar.
- **Barbeiros** → visibilidade dos próprios atendimentos, histórico e comissões ganhas.
- **Gestores/Donos** → dashboard de métricas, controle financeiro, gestão de equipe e comissões.

### 1.3 Proposta de Valor
> *"Do agendamento ao fechamento de caixa, tudo em um lugar — para o barbeiro focar no que sabe fazer: cortar."*

---

## 2. OBJETIVOS DE NEGÓCIO

| # | Objetivo | Métrica de Sucesso |
|---|----------|--------------------|
| 1 | Eliminar conflito de agendamentos | 0 conflitos de horário após go-live |
| 2 | Reduzir no-shows | Taxa de presença ≥ 85% (com lembretes automáticos) |
| 3 | Dar transparência de comissões | Barbeiro acessa comissão em tempo real, zero disputas manuais |
| 4 | Aumentar retenção de clientes | 60% dos clientes reagendam dentro de 30 dias |
| 5 | Visibilidade financeira para o dono | Dashboard atualizado a cada atendimento concluído |

---

## 3. USUÁRIOS E PERSONAS

### Persona 1 — João, o Cliente (25–45 anos)
- Trabalha em horário comercial, prefere agendar pelo celular à noite
- Não quer ligar para a barbearia para saber horário disponível
- Quer receber confirmação e lembrete do agendamento
- Quer poder cancelar ou remarcar sem constrangimento

### Persona 2 — Rafael, o Barbeiro
- Atende 8–15 clientes por dia
- Quer saber sua agenda do dia ao acordar
- Quer transparência total das suas comissões sem depender do dono
- Não tem paciência para sistemas complicados — interface deve ser simples

### Persona 3 — Marcos, o Dono/Gestor
- Gerencia 3–8 barbeiros
- Precisa de visão financeira em tempo real
- Quer definir comissões por barbeiro e por tipo de serviço
- Precisa de relatórios para fechar o mês sem planilha manual

---

## 4. ESCOPO DO SISTEMA

O sistema é composto por **5 módulos principais**:

```
┌─────────────────────────────────────────────────────────────┐
│                    PLATAFORMA BARBERAG                       │
├──────────────┬──────────────┬───────────┬────────┬──────────┤
│  Landing     │  Portal do   │ Dashboard │ Painel │  Admin   │
│  Page        │  Cliente     │ Métricas  │Barbeiro│  Gestão  │
│  (Público)   │ (Agendamento)│ (Dono)    │        │          │
└──────────────┴──────────────┴───────────┴────────┴──────────┘
```

---

## 5. MÓDULOS E REQUISITOS FUNCIONAIS

---

### MÓDULO 1 — LANDING PAGE (Público)

**Objetivo:** Converter visitante em agendamento ou cadastro.

#### RF-001 — Hero Section
- Exibir nome da barbearia, slogan e CTA principal "Agendar Agora"
- Logo BARBERAG em destaque
- Imagem ou vídeo da barbearia (configurável pelo admin)

#### RF-002 — Seção de Serviços
- Listagem de todos os serviços com: nome, descrição curta, duração estimada e faixa de preço (opcional)
- Cards visuais com ícone ou foto do serviço

#### RF-003 — Seção de Equipe
- Cards dos barbeiros com: foto, nome, especialidades e avaliação média
- Link para agendar diretamente com aquele barbeiro

#### RF-004 — Depoimentos / Reviews
- Carrossel de avaliações de clientes
- Integração opcional com Google Reviews

#### RF-005 — Galeria de Trabalhos
- Grid de fotos dos cortes realizados (gerenciado pelo admin)
- Lightbox para visualização ampliada

#### RF-006 — Informações e Contato
- Endereço com mapa integrado (Google Maps embed)
- Horário de funcionamento
- Telefone/WhatsApp com link direto
- Redes sociais (Instagram, TikTok)

#### RF-007 — CTA Flutuante
- Botão "Agendar" fixo no rodapé mobile ao rolar a página

---

### MÓDULO 2 — PORTAL DO CLIENTE (Agendamento)

**Objetivo:** Permitir ao cliente agendar, gerenciar e acompanhar seus atendimentos de forma autônoma.

#### RF-010 — Cadastro e Autenticação
- Cadastro via: e-mail/senha, Google OAuth ou número de telefone (OTP via WhatsApp/SMS)
- Login com "lembrar sessão"
- Recuperação de senha via e-mail

#### RF-011 — Fluxo de Agendamento (Multi-Step)
```
Passo 1: Escolher Serviço(s)
Passo 2: Escolher Barbeiro (ou "Qualquer disponível")
Passo 3: Escolher Data e Horário
Passo 4: Confirmar e finalizar
```
- Seleção múltipla de serviços em um único agendamento (combo)
- Duração total calculada automaticamente
- Horários bloqueados de barbeiros indisponíveis

#### RF-012 — Escolha de Barbeiro
- Visualizar barbeiros disponíveis para o serviço selecionado
- Ver próximos horários disponíveis por barbeiro
- Opção "Qualquer barbeiro disponível" (sistema escolhe automaticamente)

#### RF-013 — Calendário de Disponibilidade
- Visualização mensal com dias disponíveis destacados
- Grade de horários por dia (slots de acordo com duração do serviço)
- Bloqueios automáticos de: horário de almoço, feriados, folgas do barbeiro

#### RF-014 — Confirmação e Notificações
- E-mail de confirmação imediato após agendamento
- Lembrete por WhatsApp (ou e-mail) 24h antes
- Lembrete por WhatsApp (ou e-mail) 2h antes
- Opção de adicionar ao Google Calendar / iCalendar

#### RF-015 — Gerenciamento dos Agendamentos
- Tela "Meus Agendamentos": próximos e histórico
- Cancelar agendamento (com política de antecedência configurável pelo admin)
- Reagendar: redireciona para fluxo de agendamento com serviço/barbeiro pré-preenchidos

#### RF-016 — Perfil do Cliente
- Editar nome, telefone, foto
- Histórico completo de atendimentos
- Barbeiro favorito
- Avaliação dos atendimentos passados (estrelas + comentário)

#### RF-017 — Fidelidade (MVP v2 — opcional)
- Programa de pontos: X atendimentos = desconto ou serviço grátis
- Exibir saldo de pontos no perfil

---

### MÓDULO 3 — PAINEL DO BARBEIRO

**Objetivo:** Dar ao barbeiro visibilidade da sua agenda e das suas comissões sem depender do dono.

#### RF-020 — Autenticação do Barbeiro
- Login com e-mail/senha (cadastrado pelo admin)
- Acesso restrito apenas às próprias informações

#### RF-021 — Agenda do Dia / Semana
- Visão diária: lista de atendimentos ordenada por horário
- Visão semanal: calendário com blocos de horário
- Detalhes do agendamento: nome do cliente, serviço, duração, hora
- Status: agendado, em atendimento, concluído, faltou

#### RF-022 — Gestão de Disponibilidade
- Definir horário de trabalho padrão (dias da semana + horários)
- Marcar dias/períodos como indisponível (férias, compromissos)
- Bloqueios excepcionais em horários específicos

#### RF-023 — Execução do Atendimento
- Dar "check-in" no cliente quando ele chegar
- Marcar atendimento como "Concluído"
- Registrar serviço realizado (pode diferir do agendado, ex: adicionou serviço)
- Registrar forma de pagamento: dinheiro, Pix, cartão débito, cartão crédito

#### RF-024 — Dashboard de Comissões
- Total ganho no dia, semana e mês
- Detalhamento por atendimento: valor do serviço, % de comissão, valor recebido
- Histórico completo de comissões pagas e a receber
- Status de pagamento da comissão: "pendente" ou "pago"

#### RF-025 — Histórico de Clientes Atendidos
- Lista de clientes com última visita e frequência
- Anotações sobre o cliente (estilo preferido, observações)

---

### MÓDULO 4 — DASHBOARD DE MÉTRICAS (Dono/Gestor)

**Objetivo:** Visão executiva e operacional completa da barbearia em tempo real.

#### RF-030 — Visão Geral (Home Dashboard)
- **KPIs do Dia:** Atendimentos realizados, Faturamento, Ticket médio, Clientes novos vs. recorrentes
- **KPIs do Mês:** Faturamento total, meta vs. realizado, crescimento vs. mês anterior
- **Agenda em Tempo Real:** todos os barbeiros e seus slots do dia (view tipo "hotel")

#### RF-031 — Relatório de Faturamento
- Gráfico de faturamento diário (últimos 30 dias)
- Gráfico de faturamento por serviço (quais serviços faturam mais)
- Faturamento por barbeiro (ranking)
- Faturamento por forma de pagamento (Pix, dinheiro, cartão)
- Exportar relatório em PDF ou CSV

#### RF-032 — Relatório de Agendamentos
- Taxa de ocupação por barbeiro (% de slots preenchidos)
- Taxa de no-show por período
- Horários mais demandados (heatmap de horários)
- Serviços mais agendados

#### RF-033 — Relatório de Clientes
- Total de clientes cadastrados
- Clientes novos por período
- Clientes inativos (sem visita há X dias — configurável)
- Ranking de clientes mais frequentes
- Taxa de retenção mensal

#### RF-034 — Relatório de Barbeiros
- Atendimentos por barbeiro (dia/semana/mês)
- Ticket médio por barbeiro
- Avaliação média por barbeiro
- Comparativo de performance entre barbeiros

#### RF-035 — Filtros Globais do Dashboard
- Filtrar por período: hoje, esta semana, este mês, personalizado
- Filtrar por barbeiro
- Filtrar por serviço

---

### MÓDULO 5 — GESTÃO ADMIN (Configurações e Operações)

**Objetivo:** Controle total da barbearia pelo dono: cadastros, comissões, serviços, equipe.

#### RF-040 — Gestão de Barbeiros
- Cadastrar, editar e desativar barbeiros
- Upload de foto de perfil
- Definir dias e horários de trabalho padrão
- Definir intervalo de almoço/descanso
- Visualizar histórico de atendimentos e faturamento de cada um

#### RF-041 — Gestão de Serviços
- Cadastrar, editar e desativar serviços
- Campos: nome, descrição, duração (minutos), preço base
- Serviços com variações de preço por barbeiro (ex: corte com barbeiro sênior custa mais)
- Definir quais barbeiros realizam cada serviço
- Categoria de serviço: cabelo, barba, sobrancelha, combo, etc.

#### RF-042 — Gestão de Comissões
- Definir % de comissão padrão da barbearia
- Comissão individualizada por barbeiro (override do padrão)
- Comissão por tipo de serviço (ex: barba = 40%, corte = 35%)
- Comissão por forma de pagamento (ex: Pix +5%)
- Tela de fechamento: marcar comissões como "pagas" com data e forma de pagamento
- Histórico de pagamentos de comissão por barbeiro

#### RF-043 — Gestão de Horários e Bloqueios
- Definir horário de funcionamento da barbearia (por dia da semana)
- Cadastrar feriados (nacionais e locais)
- Bloqueios de agenda: fechar a barbearia em datas específicas
- Intervalo mínimo entre agendamentos

#### RF-044 — Gestão de Clientes
- Listar todos os clientes cadastrados
- Buscar por nome, telefone ou e-mail
- Ver perfil completo, histórico e agendamentos futuros
- Adicionar cliente manualmente (para cadastrar clientes físicos)
- Blacklist: bloquear cliente de agendar (com motivo)

#### RF-045 — Configurações da Barbearia
- Dados da empresa: nome, CNPJ, endereço, telefone, redes sociais
- Upload do logo
- Configurações de notificação: ativar/desativar lembretes, templates de mensagem
- Política de cancelamento: antecedência mínima para cancelar sem penalidade
- Integração WhatsApp Business API ou link de redirecionamento

#### RF-046 — Gestão de Avaliações
- Visualizar todas as avaliações recebidas
- Responder avaliações (resposta aparece no perfil público do barbeiro)
- Filtrar por barbeiro, nota e período
- Opção de publicar/ocultar avaliação da landing page

---

## 6. REQUISITOS NÃO FUNCIONAIS

### 6.1 Performance
| Requisito | Meta |
|-----------|------|
| Carregamento inicial da landing page | ≤ 2s (LCP) |
| Carregamento do calendário de agendamento | ≤ 1.5s |
| Atualização do dashboard após atendimento | ≤ 3s |
| Disponibilidade do sistema | ≥ 99.5% uptime |

### 6.2 Usabilidade
- Interface **mobile-first** — maioria dos clientes agenda pelo celular
- Fluxo de agendamento em **no máximo 4 taps/cliques**
- Acessibilidade: contraste mínimo WCAG AA, textos legíveis sem zoom

### 6.3 Segurança
- Autenticação com JWT (access token 1h, refresh token 7d)
- HTTPS obrigatório em todos os ambientes
- Dados sensíveis (CPF, telefone) mascarados em logs
- Controle de acesso por perfil: cliente, barbeiro, gestor, admin

### 6.4 Escalabilidade
- Sistema deve suportar até 10 barbearias distintas (multi-tenancy) em versão futura
- Arquitetura preparada para isolamento de dados por unidade

---

## 7. REGRAS DE NEGÓCIO CRÍTICAS

### RN-01 — Conflito de Agendamento
> Um barbeiro não pode ter dois agendamentos com sobreposição de horário. O sistema deve validar no momento da confirmação e bloquear o slot imediatamente.

### RN-02 — Cálculo de Duração
> Quando múltiplos serviços são selecionados, a duração do agendamento é a **soma** das durações individuais. Ex: corte (30min) + barba (20min) = bloco de 50 minutos.

### RN-03 — Política de Cancelamento
> Cancelamentos realizados com menos de X horas de antecedência (configurável pelo admin, padrão: 2h) são marcados como "cancelamento tardio" e podem impactar o score do cliente.

### RN-04 — Cálculo de Comissão
> A comissão é calculada sobre o **valor efetivamente pago pelo cliente** no momento em que o atendimento é marcado como "Concluído". A sequência de prioridade das regras de comissão é:
> 1. Comissão específica: barbeiro + serviço + forma de pagamento
> 2. Comissão: barbeiro + serviço
> 3. Comissão: barbeiro (geral)
> 4. Comissão padrão da barbearia

### RN-05 — Status do Atendimento
```
agendado → confirmado → em_atendimento → concluido
                     ↘ no_show
         ↘ cancelado (pelo cliente ou admin)
```

### RN-06 — Horário de Funcionamento
> Agendamentos só podem ser criados dentro do horário de funcionamento cadastrado. O sistema deve respeitar o fuso horário da barbearia.

### RN-07 — Barbeiro Inativo
> Ao desativar um barbeiro, todos os agendamentos futuros dele são marcados como "a reagendar" e o cliente é notificado automaticamente.

### RN-08 — Avaliação
> Um cliente só pode avaliar um atendimento após ele ser marcado como "Concluído". O prazo para avaliação é de 72h após o atendimento.

---

## 8. IDENTIDADE VISUAL

Baseada no logo **BARBERAG | Authentic Barbershop**:

| Token | Valor | Uso |
|-------|-------|-----|
| `primaryColor` | `#1A1A1A` (preto) | Fundo principal, headers |
| `accentColor` | `#D4830A` (laranja/dourado) | CTAs, destaques, ícones |
| `secondaryColor` | `#FFFFFF` | Textos sobre fundo escuro |
| `errorColor` | `#C0392B` | Estados de erro |
| `successColor` | `#27AE60` | Confirmações, status positivo |
| `textPrimary` | `#1A1A1A` | Textos em fundo claro |
| `textSecondary` | `#666666` | Textos secundários |
| `cardBackground` | `#F5F5F5` | Cards em fundo branco |
| `font` | `Inter` (sans) + `Playfair Display` (títulos) | — |

**Estética:** Rústica-moderna. Tons escuros com detalhes em laranja/dourado. Fotografia em alto contraste. Sensação premium sem ser luxo inacessível.

---

## 9. STACK TECNOLÓGICA (PROPOSTA)

### 9.1 Backend
- **Runtime:** Node.js + TypeScript
- **Framework:** Next.js 14 API Routes (serverless) — colocado junto ao frontend no Vercel
- **Banco de Dados:** PostgreSQL (NeonDB — managed, serverless-friendly)
- **ORM:** Prisma (migrations + type-safe queries)
- **Autenticação:** NextAuth.js v5 (JWT + OAuth Google)
- **Notificações:** Evolution API (WhatsApp) + Resend (e-mail transacional)
- **Jobs / Lembretes:** Vercel Cron Jobs (agendamento de lembretes 24h e 2h)
- **Storage:** Cloudinary (fotos de barbeiros e serviços)
- **Validação:** Zod (schemas compartilhados entre front e back)

### 9.2 Frontend
- **Framework:** Next.js 14 (React) — App Router
- **Estilização:** Tailwind CSS + shadcn/ui
- **Animações:** Framer Motion
- **Gerenciamento de Estado:** Zustand
- **Calendário:** react-big-calendar ou FullCalendar
- **Gráficos:** Recharts

### 9.3 Infra
- **Hospedagem (Frontend + API):** Vercel
- **Banco de Dados:** NeonDB (PostgreSQL serverless — integração nativa com Vercel)
- **Jobs de Background:** Vercel Cron Jobs
- **Storage de Mídia:** Cloudinary
- **DNS/CDN:** Cloudflare (opcional)

---

## 10. FLUXOS PRINCIPAIS (User Journeys)

### Fluxo A — Cliente Agendando pela Primeira Vez
```
Landing Page
  → "Agendar Agora"
    → Cadastro (Google OAuth)
      → Escolher Serviço
        → Escolher Barbeiro
          → Escolher Data/Hora
            → Confirmar
              → Tela de sucesso + E-mail/WhatsApp de confirmação
```

### Fluxo B — Barbeiro Executando Atendimento
```
Login no Painel
  → Agenda do Dia
    → Cliente chegou → "Check-in"
      → Atendimento concluído → "Marcar como Concluído"
        → Registrar serviço realizado + forma de pagamento
          → Comissão calculada automaticamente
```

### Fluxo C — Dono Fechando o Caixa do Dia
```
Login no Dashboard
  → Visão geral do dia (faturamento, atendimentos)
    → Relatório por barbeiro
      → Gestão de Comissões
        → Marcar comissões como "Pagas"
          → Exportar relatório do dia
```

---

## 11. CRITÉRIOS DE ACEITAÇÃO (Definition of Done por Módulo)

### Landing Page — Done quando:
- [ ] Roda em mobile (375px) e desktop (1280px) sem quebras
- [ ] CTA de agendamento abre o portal do cliente
- [ ] Informações são editáveis pelo admin
- [ ] Score PageSpeed ≥ 85 mobile

### Agendamento — Done quando:
- [ ] Fluxo completo em ≤ 4 passos sem erro
- [ ] Conflito de horário é bloqueado (teste com dois agendamentos simultâneos)
- [ ] E-mail de confirmação é disparado em ≤ 30s
- [ ] Cancelamento funciona e libera o slot
- [ ] Lembrete é enviado 24h e 2h antes

### Painel do Barbeiro — Done quando:
- [ ] Barbeiro vê APENAS seus próprios dados
- [ ] Marcar atendimento como concluído gera comissão correta
- [ ] Comissão reflete na tela do dono em tempo real

### Dashboard Métricas — Done quando:
- [ ] KPIs do dia atualizam após cada atendimento concluído
- [ ] Relatório exporta em PDF e CSV sem erro
- [ ] Filtros por período e barbeiro funcionam corretamente

### Gestão Admin — Done quando:
- [ ] CRUD completo de serviços, barbeiros e comissões
- [ ] Desativar barbeiro notifica clientes com agendamentos futuros
- [ ] Regras de comissão respeitam hierarquia definida (RN-04)

---

## 12. FORA DE ESCOPO (MVP)

Os itens abaixo foram conscientemente excluídos do MVP e entram no backlog para versões futuras:

- Pagamento online / pré-pagamento (checkout integrado)
- App mobile nativo (iOS/Android) — MVP é web responsiva
- Multi-tenancy (múltiplas barbearias) — arquitetura preparada, não ativada
- Programa de fidelidade / pontos
- Integração com Google Reviews
- Relatório contábil / NF-e
- Chat interno (dono ↔ barbeiro)
- Módulo de estoque de produtos

---

## 13. RISCOS E MITIGAÇÕES

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Conflito de agendamentos simultâneos | Média | Alto | Lock otimista no banco durante confirmação |
| Barbeiro não registrar atendimento concluído | Alta | Médio | Lembrete automático 30min após horário previsto |
| Cliente não aparecer (no-show) | Alta | Médio | Lembretes automáticos + política de cancelamento |
| Cálculo de comissão incorreto | Baixa | Alto | Testes unitários exaustivos nas regras RN-04 |
| Dados de clientes expostos entre barbeiros | Baixa | Alto | RBAC rigoroso + testes de autorização |

---

## 14. ROADMAP DE ENTREGA

### Sprint 1 — Fundação (Semana 1–2)
- [ ] Setup do projeto (monorepo, CI/CD, banco de dados)
- [ ] Sistema de autenticação (JWT, roles: cliente, barbeiro, admin)
- [ ] CRUD de barbeiros, serviços e horários de funcionamento
- [ ] Lógica de slots de disponibilidade

### Sprint 2 — Agendamento (Semana 3–4)
- [ ] Fluxo completo de agendamento (frontend + backend)
- [ ] Bloqueio de conflitos
- [ ] E-mail de confirmação
- [ ] Gerenciamento de agendamentos (cancelar, reagendar)

### Sprint 3 — Painel Barbeiro (Semana 5–6)
- [ ] Agenda do dia/semana para o barbeiro
- [ ] Execução do atendimento (check-in, conclusão, registro)
- [ ] Cálculo automático de comissões

### Sprint 4 — Dashboard e Admin (Semana 7–8)
- [ ] Dashboard de métricas (KPIs, gráficos)
- [ ] Gestão de comissões e fechamento
- [ ] Relatórios e exportação

### Sprint 5 — Landing Page e Polimento (Semana 9–10)
- [ ] Landing page pública
- [ ] Lembretes automáticos (24h e 2h)
- [ ] Avaliações
- [ ] QA geral, testes de carga, ajustes de UI

---

*Documento gerado em: 2026-06-01*
*Produto: BARBERAG | Authentic Barbershop*
*Próximo passo: Validar com stakeholders e iniciar spec técnico dos módulos prioritários.*
