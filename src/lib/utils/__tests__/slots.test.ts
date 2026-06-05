import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock do Prisma client antes de importar o módulo sob teste.
vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    workingHours: { findFirst: vi.fn() },
    appointment: { findMany: vi.fn() },
    blockedSlot: { findMany: vi.fn() },
  },
}))

import { prisma } from '@/lib/prisma/client'
import {
  computeAvailableSlots,
  getAvailableSlots,
  isSlotWithinSchedule,
  fitsSchedule,
  timeToMinutes,
  minutesToTime,
} from '@/lib/utils/slots'

const wh = prisma.workingHours.findFirst as unknown as ReturnType<typeof vi.fn>
const appt = prisma.appointment.findMany as unknown as ReturnType<typeof vi.fn>
const blocked = prisma.blockedSlot.findMany as unknown as ReturnType<typeof vi.fn>

/** Cria uma data no dia base (local) com hora:minuto definidos. */
function at(base: Date, hours: number, minutes = 0): Date {
  const d = new Date(base)
  d.setHours(hours, minutes, 0, 0)
  return d
}

describe('helpers de tempo', () => {
  it('converte HH:mm ↔ minutos', () => {
    expect(timeToMinutes('09:00')).toBe(540)
    expect(timeToMinutes('19:30')).toBe(1170)
    expect(minutesToTime(540)).toBe('09:00')
    expect(minutesToTime(1170)).toBe('19:30')
  })
})

describe('computeAvailableSlots (núcleo puro)', () => {
  const open = timeToMinutes('09:00') // 540
  const close = timeToMinutes('19:00') // 1140

  it('gera slots de 09:00 até 18:30 (duração 30min) sem agendamentos', () => {
    const slots = computeAvailableSlots(open, close, 30, [])
    expect(slots[0]).toBe('09:00')
    expect(slots[slots.length - 1]).toBe('18:30') // 18:30 + 30 = 19:00
  })

  it('bloqueia 09:00 quando há agendamento das 09:00 às 09:30', () => {
    const occupied = [{ start: timeToMinutes('09:00'), end: timeToMinutes('09:30') }]
    const slots = computeAvailableSlots(open, close, 30, occupied)
    expect(slots).not.toContain('09:00')
    expect(slots).toContain('09:30')
  })

  it('bloqueia 08:45 por overlap parcial (serviço 30min começa quando agendamento 09:00 já corre)', () => {
    const occupied = [{ start: timeToMinutes('09:00'), end: timeToMinutes('09:30') }]
    const slots = computeAvailableSlots(timeToMinutes('08:30'), close, 30, occupied)
    expect(slots).not.toContain('08:45') // 08:45–09:15 colide com 09:00–09:30
    expect(slots).toContain('08:30') // 08:30–09:00 encosta mas não colide
  })

  it('o último slot é startTime + (endTime - duração)', () => {
    const slots = computeAvailableSlots(open, close, 50, [])
    // Passo de 15min: o último início ≤ (19:00 - 50min) que cai na grade é 18:00 (18:00+50=18:50).
    expect(slots[slots.length - 1]).toBe('18:00')
  })
})

describe('getAvailableSlots (com Prisma mockado)', () => {
  const date = new Date(2026, 5, 4) // 2026-06-04 (quinta)

  beforeEach(() => {
    vi.clearAllMocks()
    appt.mockResolvedValue([])
    blocked.mockResolvedValue([])
  })

  it('retorna [] quando não há WorkingHours para o dia', async () => {
    wh.mockResolvedValue(null) // específico e fallback ambos null
    const slots = await getAvailableSlots('barber-1', date, 30)
    expect(slots).toEqual([])
  })

  it('retorna [] quando WorkingHours.isActive = false', async () => {
    wh.mockResolvedValue({ startTime: '09:00', endTime: '19:00', isActive: false })
    const slots = await getAvailableSlots('barber-1', date, 30)
    expect(slots).toEqual([])
  })

  it('respeita BlockedSlot (bloqueio das 12:00 às 13:00)', async () => {
    wh.mockResolvedValue({ startTime: '09:00', endTime: '19:00', isActive: true })
    blocked.mockResolvedValue([{ startTime: '12:00', endTime: '13:00', allDay: false }])
    const slots = await getAvailableSlots('barber-1', date, 30)
    expect(slots).not.toContain('12:00')
    expect(slots).not.toContain('12:30')
    expect(slots).toContain('11:30') // 11:30–12:00 ok
    expect(slots).toContain('13:00')
  })

  it('respeita agendamento existente do barbeiro', async () => {
    wh.mockResolvedValue({ startTime: '09:00', endTime: '19:00', isActive: true })
    appt.mockResolvedValue([{ scheduledAt: at(date, 10, 0), totalDuration: 30 }])
    const slots = await getAvailableSlots('barber-1', date, 30)
    expect(slots).not.toContain('10:00')
    expect(slots).toContain('10:30')
  })

  it('bloqueio allDay zera os slots', async () => {
    wh.mockResolvedValue({ startTime: '09:00', endTime: '19:00', isActive: true })
    blocked.mockResolvedValue([{ startTime: '00:00', endTime: '23:59', allDay: true }])
    const slots = await getAvailableSlots('barber-1', date, 30)
    expect(slots).toEqual([])
  })
})

describe('fitsSchedule (núcleo puro)', () => {
  const open = timeToMinutes('09:00') // 540
  const close = timeToMinutes('19:00') // 1140

  it('aceita um intervalo inteiramente dentro da janela, sem bloqueios', () => {
    expect(fitsSchedule(timeToMinutes('10:00'), timeToMinutes('10:30'), open, close, [])).toBe(true)
  })

  it('rejeita início antes da abertura', () => {
    expect(fitsSchedule(timeToMinutes('08:45'), timeToMinutes('09:15'), open, close, [])).toBe(false)
  })

  it('rejeita término depois do fechamento', () => {
    expect(fitsSchedule(timeToMinutes('18:45'), timeToMinutes('19:15'), open, close, [])).toBe(false)
  })

  it('rejeita overlap com bloqueio', () => {
    const blocks = [{ start: timeToMinutes('12:00'), end: timeToMinutes('13:00') }]
    expect(fitsSchedule(timeToMinutes('12:30'), timeToMinutes('13:00'), open, close, blocks)).toBe(false)
    expect(fitsSchedule(timeToMinutes('11:30'), timeToMinutes('12:00'), open, close, blocks)).toBe(true)
  })
})

describe('isSlotWithinSchedule (validação server-side de booking)', () => {
  const date = new Date(2026, 5, 4)

  beforeEach(() => {
    vi.clearAllMocks()
    blocked.mockResolvedValue([])
  })

  it('aceita slot dentro do horário e sem bloqueio', async () => {
    wh.mockResolvedValue({ startTime: '09:00', endTime: '19:00', isActive: true })
    const ok = await isSlotWithinSchedule(prisma as never, 'barber-1', at(date, 10, 0), at(date, 10, 30))
    expect(ok).toBe(true)
  })

  it('rejeita slot fora do horário de trabalho', async () => {
    wh.mockResolvedValue({ startTime: '09:00', endTime: '19:00', isActive: true })
    const ok = await isSlotWithinSchedule(prisma as never, 'barber-1', at(date, 20, 0), at(date, 20, 30))
    expect(ok).toBe(false)
  })

  it('rejeita slot que cai em bloqueio', async () => {
    wh.mockResolvedValue({ startTime: '09:00', endTime: '19:00', isActive: true })
    blocked.mockResolvedValue([{ startTime: '12:00', endTime: '13:00', allDay: false }])
    const ok = await isSlotWithinSchedule(prisma as never, 'barber-1', at(date, 12, 15), at(date, 12, 45))
    expect(ok).toBe(false)
  })

  it('rejeita quando não há WorkingHours para o dia', async () => {
    wh.mockResolvedValue(null)
    const ok = await isSlotWithinSchedule(prisma as never, 'barber-1', at(date, 10, 0), at(date, 10, 30))
    expect(ok).toBe(false)
  })
})
