# Design System — BARBERAG | Authentic Barbershop

> Referência canônica de tokens visuais, componentes e padrões de UX.  
> Toda decisão de estilo parte daqui — nunca de valores inline.

---

## 1. Fundação Visual

### 1.1 Identidade

**Estética:** Rústica-moderna. Tons escuros com detalhes em laranja/dourado. Fotografia em alto contraste. Sensação premium sem ser luxo inacessível.

**Fontes de verdade no código:**
- Tokens de cor → `tailwind.config.ts` (extensão do tema)
- Componentes base → `shadcn/ui` customizados com os tokens abaixo
- Animações → `Framer Motion` com as configurações da seção 6

---

## 2. Paleta de Cores

Todos os valores abaixo são definidos em `tailwind.config.ts` e referenciados via classe utilitária. **Nunca use hex inline nos componentes.**

### 2.1 Cores Principais

| Token Tailwind | Hex | Uso |
|---|---|---|
| `primary` | `#1A1A1A` | Fundo principal, headers, navbar |
| `accent` | `#D4830A` | CTAs, ícones ativos, destaques, badges |
| `background` | `#FFFFFF` | Fundo das telas internas (painel/dashboard) |
| `muted` | `#F5F5F5` | Cards, inputs, áreas de conteúdo secundário |

### 2.2 Cores Semânticas

| Token Tailwind | Hex | Uso |
|---|---|---|
| `success` | `#27AE60` | Status positivo, comissão paga, agendamento confirmado |
| `warning` | `#F39C12` | Comissão pendente, aviso de cancelamento próximo |
| `error` | `#C0392B` | Erros, cancelamentos, no-show, ações destrutivas |
| `info` | `#2980B9` | Notificações informativas, tooltips |

### 2.3 Cores de Texto

| Token Tailwind | Hex | Uso |
|---|---|---|
| `text-primary` | `#1A1A1A` | Textos principais em fundo claro |
| `text-secondary` | `#FFFFFF` | Textos sobre fundo escuro (`primary`) |
| `text-muted` | `#666666` | Textos secundários, labels, placeholders |
| `text-disabled` | `#B0B0B0` | Elementos desabilitados |

### 2.4 Configuração `tailwind.config.ts`

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: '#1A1A1A',
        accent: '#D4830A',
        background: '#FFFFFF',
        muted: '#F5F5F5',
        success: '#27AE60',
        warning: '#F39C12',
        error: '#C0392B',
        info: '#2980B9',
        'text-primary': '#1A1A1A',
        'text-secondary': '#FFFFFF',
        'text-muted': '#666666',
        'text-disabled': '#B0B0B0',
      },
    },
  },
}
```

---

## 3. Tipografia

### 3.1 Famílias

| Família | Uso | Peso disponível |
|---|---|---|
| `Inter` | Corpo, labels, inputs, dados, painel | 400, 500, 600, 700 |
| `Playfair Display` | Títulos da landing page, hero section | 400, 700 |

`Inter` é a fonte padrão de toda a aplicação. `Playfair Display` é exclusiva da landing page para transmitir o caráter premium da marca.

### 3.2 Escala Tipográfica

| Nome | Classe Tailwind | Tamanho | Peso | Uso |
|---|---|---|---|---|
| Display | `text-5xl font-bold` | 48px | 700 | Hero da landing page (Playfair) |
| H1 | `text-3xl font-bold` | 30px | 700 | Título de página |
| H2 | `text-2xl font-semibold` | 24px | 600 | Título de seção |
| H3 | `text-xl font-semibold` | 20px | 600 | Título de card/modal |
| Body | `text-base font-normal` | 16px | 400 | Texto de conteúdo |
| Body Small | `text-sm font-normal` | 14px | 400 | Texto secundário, labels |
| Caption | `text-xs font-normal` | 12px | 400 | Metadados, timestamps, tooltips |
| Label | `text-sm font-medium` | 14px | 500 | Labels de formulário |
| Button | `text-sm font-semibold` | 14px | 600 | Textos de botão |

### 3.3 Configuração `next/font`

```typescript
// src/app/layout.tsx
import { Inter, Playfair_Display } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})
```

---

## 4. Espaçamento e Grid

### 4.1 Escala de Espaçamento

Baseada no sistema de 4px do Tailwind (padrão). Valores mais usados:

| Token | Valor | Uso frequente |
|---|---|---|
| `space-1` | 4px | Micro gaps internos |
| `space-2` | 8px | Gap entre ícone e label |
| `space-3` | 12px | Padding interno de badge |
| `space-4` | 16px | Padding padrão de card |
| `space-6` | 24px | Gap entre cards em grid |
| `space-8` | 32px | Padding de seção |
| `space-12` | 48px | Espaçamento entre seções |
| `space-16` | 64px | Padding de hero |

### 4.2 Breakpoints

| Nome | Largura | Contexto |
|---|---|---|
| `sm` | 640px | Mobile grande |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Desktop largo |

**Mobile-first:** todo componente é construído para 375px e progressivamente adaptado. Testar obrigatoriamente em 375px e 1280px antes de marcar como done.

### 4.3 Container

```html
<div class="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
```

---

## 5. Componentes

### 5.1 Botões

#### Variantes

```tsx
// Primário — ação principal da tela
<Button className="bg-accent text-white hover:bg-accent/90 font-semibold">
  Agendar Agora
</Button>

// Secundário — ação alternativa
<Button variant="outline" className="border-primary text-primary hover:bg-muted">
  Ver Horários
</Button>

// Ghost — ação discreta
<Button variant="ghost" className="text-text-muted hover:text-primary">
  Cancelar
</Button>

// Destrutivo — ações irreversíveis
<Button className="bg-error text-white hover:bg-error/90">
  Cancelar Agendamento
</Button>
```

#### Tamanhos

| Tamanho | Classe | Uso |
|---|---|---|
| `sm` | `h-8 px-3 text-xs` | Tabelas, listas densas |
| `default` | `h-10 px-4 text-sm` | Padrão |
| `lg` | `h-12 px-6 text-base` | CTAs principais, hero |

#### Regras
- Todo botão de ação assíncrona deve exibir estado de loading (spinner + desabilitado).
- Botões destrutivos pedem confirmação via `AlertDialog` antes de executar.
- CTA flutuante no mobile usa `fixed bottom-4 left-4 right-4`.

---

### 5.2 Cards

```tsx
// Card padrão — informação
<div className="bg-background rounded-xl border border-muted p-4 shadow-sm">
  {/* conteúdo */}
</div>

// Card de lead/agendamento — com status
<div className="bg-background rounded-xl border-l-4 border-l-accent p-4 shadow-sm">
  {/* conteúdo */}
</div>

// Card em fundo escuro (landing page)
<div className="bg-primary/80 rounded-xl p-6 text-text-secondary">
  {/* conteúdo */}
</div>
```

---

### 5.3 Badges de Status

Mapeamento obrigatório de status para cores semânticas:

```tsx
const statusConfig = {
  // Agendamento
  SCHEDULED:    { label: 'Agendado',       class: 'bg-info/10 text-info' },
  IN_PROGRESS:  { label: 'Em Atendimento', class: 'bg-warning/10 text-warning' },
  COMPLETED:    { label: 'Concluído',      class: 'bg-success/10 text-success' },
  CANCELLED:    { label: 'Cancelado',      class: 'bg-error/10 text-error' },
  NO_SHOW:      { label: 'Não Compareceu', class: 'bg-error/10 text-error' },
  // Comissão
  PENDING:      { label: 'Pendente',       class: 'bg-warning/10 text-warning' },
  PAID:         { label: 'Pago',           class: 'bg-success/10 text-success' },
}

<Badge className={statusConfig[status].class}>
  {statusConfig[status].label}
</Badge>
```

---

### 5.4 Formulários

```tsx
// Label + Input padrão
<div className="space-y-2">
  <Label className="text-sm font-medium text-text-primary">
    Nome completo
  </Label>
  <Input
    className="bg-muted border-0 focus-visible:ring-accent"
    placeholder="Digite seu nome"
  />
  {/* Erro */}
  <p className="text-xs text-error">Campo obrigatório</p>
</div>
```

**Regras de formulário:**
- Todo campo com erro exibe mensagem abaixo em `text-error`.
- Validação via Zod com `zodResolver` no `react-hook-form`.
- Submit sempre desabilitado durante loading.
- Mensagem de sucesso via `toast` (shadcn Sonner).

---

### 5.5 Estados de UI Obrigatórios

Todo componente que consome dados remotos deve implementar os três estados:

```tsx
// Loading
<div className="animate-pulse bg-muted rounded-xl h-24" />

// Error
<div className="flex flex-col items-center gap-3 py-8 text-text-muted">
  <AlertCircle className="w-8 h-8 text-error" />
  <p className="text-sm">Erro ao carregar dados.</p>
  <Button variant="ghost" size="sm" onClick={retry}>Tentar novamente</Button>
</div>

// Empty
<div className="flex flex-col items-center gap-3 py-8 text-text-muted">
  <CalendarX className="w-8 h-8" />
  <p className="text-sm">Nenhum agendamento encontrado.</p>
</div>
```

---

### 5.6 Navegação

#### Sidebar (Painel Barbeiro / Dashboard Admin)
- Fundo `bg-primary`, textos `text-text-secondary`
- Item ativo: `bg-accent/20 text-accent border-l-2 border-accent`
- Ícone + label em `flex items-center gap-3`
- Largura: `w-64` em desktop, drawer em mobile

#### Top Bar (Portal do Cliente)
- Fundo `bg-primary`, logo centralizado em mobile
- Links de navegação ocultos em mobile (menu hambúrguer)
- Avatar do usuário no canto direito com dropdown

#### Breadcrumb
- Usado em telas de detalhe dentro dos painéis
- `text-text-muted / text-primary` com separador `/`

---

### 5.7 Tabelas

```tsx
<Table>
  <TableHeader>
    <TableRow className="bg-muted">
      <TableHead className="text-xs font-semibold text-text-muted uppercase tracking-wide">
        Cliente
      </TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="text-sm text-text-primary">...</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

### 5.8 Modais / Dialogs

- Overlay: `bg-black/60 backdrop-blur-sm`
- Container: `bg-background rounded-2xl shadow-xl`
- Header: título em H3 + botão de fechar no canto
- Footer: botão cancelar (ghost) à esquerda, ação principal (accent) à direita
- Largura máxima: `max-w-md` (padrão) ou `max-w-2xl` (formulários complexos)

---

### 5.9 Toast / Feedback

```tsx
// Sucesso
toast.success('Agendamento confirmado!', {
  description: 'Você receberá um e-mail de confirmação.',
})

// Erro
toast.error('Falha ao agendar.', {
  description: 'Verifique os dados e tente novamente.',
})
```

Posição: `bottom-right` em desktop, `bottom-center` em mobile.

---

## 6. Animações (Framer Motion)

### 6.1 Transições de Página

```tsx
// variants/page.ts — usar em todo page.tsx
export const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
}

export const pageTransition = { duration: 0.3, ease: 'easeOut' }

// Uso
<motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={pageTransition}>
  {children}
</motion.div>
```

### 6.2 Listas de Cards (Stagger)

```tsx
export const listVariants = {
  animate: { transition: { staggerChildren: 0.05 } },
}

export const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
}
```

### 6.3 Feedback de Ação (Botões)

```tsx
// Usar em botões de ação crítica: check-in, concluir, confirmar
<motion.button
  whileTap={{ scale: 0.96 }}
  whileHover={{ scale: 1.02 }}
  transition={{ duration: 0.15 }}
>
```

### 6.4 Regras de Animação
- **Nunca** animar estados de erro ou loading — priorizar clareza.
- Duração máxima: `0.4s`. Prefira `0.3s`.
- `ease: 'easeOut'` como padrão.
- Animações de entrada de modal: `scale 0.95 → 1` + `opacity 0 → 1`.

---

## 7. Iconografia

Biblioteca: **Lucide React** (já inclusa no shadcn/ui).

| Contexto | Ícone |
|---|---|
| Agendamento / Calendário | `Calendar`, `CalendarCheck`, `CalendarX` |
| Usuário / Perfil | `User`, `UserCircle`, `Users` |
| Barbeiro | `Scissors` |
| Pagamento / Comissão | `Banknote`, `CreditCard`, `Wallet` |
| Status positivo | `CheckCircle2` |
| Status negativo / Erro | `XCircle`, `AlertCircle` |
| Tempo / Horário | `Clock`, `Timer` |
| Métricas / Gráfico | `TrendingUp`, `BarChart3` |
| Configurações | `Settings2` |
| Notificação | `Bell` |
| Sair | `LogOut` |

**Tamanhos padrão:** `w-4 h-4` (inline), `w-5 h-5` (sidebar), `w-8 h-8` (estados vazios/erro).

---

## 8. Padrões por Perfil de Usuário

### 8.1 Landing Page (Público)

- Fundo `bg-primary`, texto `text-text-secondary`
- Hero: imagem/vídeo em full-width com overlay escuro
- Fonte de título: `Playfair Display` (única exceção ao Inter)
- CTA principal: `bg-accent text-white` em tamanho `lg`
- Seções alternadas: `bg-primary` e `bg-primary/90`
- Botão flutuante mobile: `fixed bottom-4 left-4 right-4 bg-accent`

### 8.2 Portal do Cliente (Agendamento)

- Fundo: `bg-background` (branco)
- Top bar: `bg-primary`
- Fluxo multi-step: progress indicator no topo com 4 etapas
- Slots de horário: grid de botões com estado selected (`bg-accent text-white`)
- Horário indisponível: `bg-muted text-text-disabled cursor-not-allowed`

### 8.3 Painel do Barbeiro

- Layout: sidebar `bg-primary` + conteúdo `bg-background`
- Agenda do dia: lista ordenada por horário com card por atendimento
- Status do atendimento codificado por cor via border-left
- Botões de ação (check-in, concluir) em destaque com `bg-accent`

### 8.4 Dashboard Admin / Métricas

- Layout: sidebar `bg-primary` + grid de KPIs no topo
- KPI cards: `bg-background border border-muted`, número em H2, label em caption
- Gráficos (Recharts): cores primárias `accent` e `success`, grid em `muted`
- Tabelas: alternância de linha `bg-muted/30`

---

## 9. Acessibilidade

- Contraste mínimo: **WCAG AA** (4.5:1 para texto normal, 3:1 para texto grande)
- Todo ícone funcional acompanha `aria-label`
- Campos de formulário têm `id` associado ao `htmlFor` do label
- Foco visível: `focus-visible:ring-2 focus-visible:ring-accent` em todos os elementos interativos
- Modais usam `role="dialog"` e `aria-modal="true"` (shadcn Dialog já gerencia isso)

---

## 10. Checklist de Conformidade

Antes de marcar qualquer componente de UI como done:

```
[ ] Nenhuma cor hex inline — apenas tokens Tailwind
[ ] Nenhuma fonte hardcoded — apenas Inter ou Playfair via variáveis CSS
[ ] Estados loading, error e empty implementados
[ ] Testado em 375px (mobile) e 1280px (desktop)
[ ] Contraste WCAG AA verificado
[ ] Animações com duração ≤ 0.4s
[ ] Botões de ação assíncrona com feedback de loading
[ ] Ações destrutivas com confirmação via AlertDialog
```

---

*Versão: 1.0 | Data: 2026-06-01*  
*Projeto: BARBERAG | Authentic Barbershop*
