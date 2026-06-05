import { startOfDay, endOfDay } from 'date-fns'
import type { DayOfWeek, Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma/client'

/** Passo da grade de horários, em minutos. */
export const SLOT_STEP_MINUTES = 15

/** date.getDay() (0=Dom) → enum DayOfWeek do Prisma. */
export const DAY_OF_WEEK: DayOfWeek[] = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
]

/** Intervalo ocupado, em minutos a partir da meia-noite do dia. */
export interface OccupiedInterval {
  start: number
  end: number
}

/** 'HH:mm' → minutos desde a meia-noite. */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

/** minutos desde a meia-noite → 'HH:mm'. */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/**
 * Núcleo puro (sem I/O) da geração de slots. Gera candidatos de
 * `SLOT_STEP_MINUTES` em `SLOT_STEP_MINUTES` entre [workStart, workEnd - duration]
 * e descarta os que colidem com qualquer intervalo ocupado.
 *
 * Overlap: slotStart < occupiedEnd AND slotEnd > occupiedStart.
 */
export function computeAvailableSlots(
  workStart: number,
  workEnd: number,
  durationMinutes: number,
  occupied: OccupiedInterval[]
): string[] {
  const slots: string[] = []
  for (let start = workStart; start + durationMinutes <= workEnd; start += SLOT_STEP_MINUTES) {
    const end = start + durationMinutes
    const collides = occupied.some((o) => start < o.end && end > o.start)
    if (!collides) slots.push(minutesToTime(start))
  }
  return slots
}

/**
 * Slots livres de um barbeiro numa data, para um serviço de duração `serviceDurationMinutes`.
 * Considera WorkingHours (com fallback para o horário geral da barbearia),
 * Appointments não cancelados e BlockedSlots (do barbeiro ou da barbearia).
 */
export async function getAvailableSlots(
  barberId: string,
  date: Date,
  serviceDurationMinutes: number
): Promise<string[]> {
  const dayOfWeek = DAY_OF_WEEK[date.getDay()]

  // 1. WorkingHours: específico do barbeiro → fallback para o geral (barberId null).
  const workingHours =
    (await prisma.workingHours.findFirst({ where: { barberId, dayOfWeek } })) ??
    (await prisma.workingHours.findFirst({ where: { barberId: null, dayOfWeek } }))

  if (!workingHours || !workingHours.isActive) return []

  const workStart = timeToMinutes(workingHours.startTime)
  const workEnd = timeToMinutes(workingHours.endTime)

  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)
  const toMinutes = (d: Date) => Math.floor((d.getTime() - dayStart.getTime()) / 60000)

  // 2. Agendamentos não cancelados naquele dia.
  const appointments = await prisma.appointment.findMany({
    where: {
      barberId,
      status: { not: 'CANCELLED' },
      scheduledAt: { gte: dayStart, lte: dayEnd },
    },
    select: { scheduledAt: true, totalDuration: true },
  })

  // 3. Bloqueios do barbeiro ou da barbearia inteira.
  const blocks = await prisma.blockedSlot.findMany({
    where: {
      OR: [{ barberId }, { barberId: null }],
      date: { gte: dayStart, lte: dayEnd },
    },
    select: { startTime: true, endTime: true, allDay: true },
  })

  const occupied: OccupiedInterval[] = [
    ...appointments.map((a) => {
      const start = toMinutes(a.scheduledAt)
      return { start, end: start + a.totalDuration }
    }),
    ...blocks.map((b) =>
      b.allDay
        ? { start: 0, end: 24 * 60 }
        : { start: timeToMinutes(b.startTime), end: timeToMinutes(b.endTime) }
    ),
  ]

  return computeAvailableSlots(workStart, workEnd, serviceDurationMinutes, occupied)
}

/**
 * Núcleo puro: o intervalo [startMin, endMin] cabe na janela de trabalho
 * [workStart, workEnd] e não colide com nenhum bloqueio. (sem I/O)
 */
export function fitsSchedule(
  startMin: number,
  endMin: number,
  workStart: number,
  workEnd: number,
  blocks: OccupiedInterval[]
): boolean {
  if (startMin < workStart || endMin > workEnd) return false
  return !blocks.some((b) => startMin < b.end && endMin > b.start)
}

/**
 * Valida, no servidor, se um agendamento de [scheduledAt, endAt] respeita o
 * horário de trabalho do barbeiro e não cai em um bloqueio (do barbeiro ou da
 * barbearia). NÃO checa conflito com outros agendamentos — isso é feito à parte,
 * dentro da transaction Serializable (RN-01). Aceita `tx` ou o client global.
 */
export async function isSlotWithinSchedule(
  client: Prisma.TransactionClient,
  barberId: string,
  scheduledAt: Date,
  endAt: Date
): Promise<boolean> {
  const dayOfWeek = DAY_OF_WEEK[scheduledAt.getDay()]

  const workingHours =
    (await client.workingHours.findFirst({ where: { barberId, dayOfWeek } })) ??
    (await client.workingHours.findFirst({ where: { barberId: null, dayOfWeek } }))

  if (!workingHours || !workingHours.isActive) return false

  const dayStart = startOfDay(scheduledAt)
  const toMinutes = (d: Date) => Math.floor((d.getTime() - dayStart.getTime()) / 60000)
  const startMin = toMinutes(scheduledAt)
  const endMin = toMinutes(endAt)

  const blocks = await client.blockedSlot.findMany({
    where: {
      OR: [{ barberId }, { barberId: null }],
      date: { gte: dayStart, lte: endOfDay(scheduledAt) },
    },
    select: { startTime: true, endTime: true, allDay: true },
  })

  const blockIntervals: OccupiedInterval[] = blocks.map((b) =>
    b.allDay
      ? { start: 0, end: 24 * 60 }
      : { start: timeToMinutes(b.startTime), end: timeToMinutes(b.endTime) }
  )

  return fitsSchedule(
    startMin,
    endMin,
    timeToMinutes(workingHours.startTime),
    timeToMinutes(workingHours.endTime),
    blockIntervals
  )
}
