import { format } from 'date-fns'
import { prisma } from '@/lib/prisma/client'
import type { DateRange } from '@/lib/utils/period'
import { REPORT_TYPES, REPORT_LABELS, type ReportType } from '@/lib/reports.constants'

export { REPORT_TYPES, REPORT_LABELS }
export type { ReportType }

export interface Report {
  type: ReportType
  headers: string[]
  rows: (string | number)[][]
}

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Agendado',
  CONFIRMED: 'Confirmado',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  NO_SHOW: 'Não compareceu',
  CANCELLED: 'Cancelado',
}
const PAYMENT_LABELS: Record<string, string> = { CASH: 'Dinheiro', PIX: 'Pix', DEBIT: 'Débito', CREDIT: 'Crédito' }

const money = (v: number) => v.toFixed(2).replace('.', ',')

async function faturamento(range: DateRange): Promise<Report> {
  const appts = await prisma.appointment.findMany({
    where: { status: 'COMPLETED', scheduledAt: range },
    select: {
      id: true,
      scheduledAt: true,
      totalPrice: true,
      paymentMethod: true,
      client: { select: { name: true } },
      barber: { select: { user: { select: { name: true } } } },
      services: { select: { service: { select: { name: true } } } },
      commission: { select: { amount: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  })

  return {
    type: 'faturamento',
    headers: ['Data', 'Agendamento', 'Cliente', 'Barbeiro', 'Serviços', 'Preço', 'Pagamento', 'Comissão'],
    rows: appts.map((a) => [
      format(a.scheduledAt, 'dd/MM/yyyy'),
      a.id,
      a.client.name,
      a.barber.user.name,
      a.services.map((s) => s.service.name).join('; '),
      money(a.totalPrice),
      a.paymentMethod ? PAYMENT_LABELS[a.paymentMethod] : '—',
      a.commission ? money(a.commission.amount) : '0,00',
    ]),
  }
}

async function agendamentos(range: DateRange): Promise<Report> {
  const appts = await prisma.appointment.findMany({
    where: { scheduledAt: range },
    select: {
      scheduledAt: true,
      totalDuration: true,
      status: true,
      cancelledAt: true,
      client: { select: { name: true } },
      barber: { select: { user: { select: { name: true } } } },
      services: { select: { service: { select: { name: true } } } },
    },
    orderBy: { scheduledAt: 'asc' },
  })

  return {
    type: 'agendamentos',
    headers: ['Data', 'Horário', 'Cliente', 'Barbeiro', 'Serviços', 'Duração', 'Status', 'Cancelado em'],
    rows: appts.map((a) => [
      format(a.scheduledAt, 'dd/MM/yyyy'),
      format(a.scheduledAt, 'HH:mm'),
      a.client.name,
      a.barber.user.name,
      a.services.map((s) => s.service.name).join('; '),
      `${a.totalDuration} min`,
      STATUS_LABELS[a.status] ?? a.status,
      a.cancelledAt ? format(a.cancelledAt, 'dd/MM/yyyy HH:mm') : '',
    ]),
  }
}

async function clientes(range: DateRange): Promise<Report> {
  const users = await prisma.user.findMany({
    where: { role: 'CLIENT', createdAt: range },
    select: {
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      appointments: {
        select: { scheduledAt: true, status: true },
        orderBy: { scheduledAt: 'desc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  return {
    type: 'clientes',
    headers: ['Nome', 'E-mail', 'Telefone', 'Cadastro', 'Total agendamentos', 'Último atendimento'],
    rows: users.map((u) => {
      const lastCompleted = u.appointments.find((a) => a.status === 'COMPLETED')
      return [
        u.name,
        u.email,
        u.phone ?? '',
        format(u.createdAt, 'dd/MM/yyyy'),
        u.appointments.length,
        lastCompleted ? format(lastCompleted.scheduledAt, 'dd/MM/yyyy') : '—',
      ]
    }),
  }
}

async function barbeiros(range: DateRange): Promise<Report> {
  const list = await prisma.barber.findMany({
    where: { isActive: true },
    select: {
      id: true,
      user: { select: { name: true } },
      appointments: {
        where: { status: 'COMPLETED', scheduledAt: range },
        select: { totalPrice: true },
      },
      commissions: { select: { amount: true, status: true, createdAt: true } },
      reviews: { where: { createdAt: range }, select: { rating: true } },
    },
    orderBy: { user: { name: 'asc' } },
  })

  return {
    type: 'barbeiros',
    headers: ['Barbeiro', 'Atendimentos', 'Faturamento', 'Ticket médio', 'Comissão gerada', 'Comissão paga', 'Avaliação média'],
    rows: list.map((b) => {
      const count = b.appointments.length
      const revenue = b.appointments.reduce((acc, a) => acc + a.totalPrice, 0)
      const inRange = b.commissions.filter((c) => c.createdAt >= range.gte && c.createdAt <= range.lte)
      const generated = inRange.reduce((acc, c) => acc + c.amount, 0)
      const paid = inRange.filter((c) => c.status === 'PAID').reduce((acc, c) => acc + c.amount, 0)
      const avgRating = b.reviews.length
        ? b.reviews.reduce((acc, r) => acc + r.rating, 0) / b.reviews.length
        : null
      return [
        b.user.name,
        count,
        money(revenue),
        money(count ? revenue / count : 0),
        money(generated),
        money(paid),
        avgRating != null ? avgRating.toFixed(1) : '—',
      ]
    }),
  }
}

export async function buildReport(type: ReportType, range: DateRange): Promise<Report> {
  switch (type) {
    case 'agendamentos':
      return agendamentos(range)
    case 'clientes':
      return clientes(range)
    case 'barbeiros':
      return barbeiros(range)
    case 'faturamento':
    default:
      return faturamento(range)
  }
}

/** Serializa o relatório em CSV com aspas escapadas. Não inclui BOM (a rota adiciona). */
export function reportToCsv(report: Report): string {
  const escape = (cell: string | number) => {
    const s = String(cell)
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [report.headers, ...report.rows].map((row) => row.map(escape).join(';'))
  return lines.join('\r\n')
}
