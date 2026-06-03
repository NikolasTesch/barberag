'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Day =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY'
  | 'SUNDAY'

const DAYS: { value: Day; label: string }[] = [
  { value: 'MONDAY', label: 'Segunda' },
  { value: 'TUESDAY', label: 'Terça' },
  { value: 'WEDNESDAY', label: 'Quarta' },
  { value: 'THURSDAY', label: 'Quinta' },
  { value: 'FRIDAY', label: 'Sexta' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
]

interface DayRow {
  dayOfWeek: Day
  isActive: boolean
  startTime: string
  endTime: string
}

interface BlockedSlot {
  id: string
  date: string
  allDay: boolean
  startTime: string
  endTime: string
  reason: string | null
}

function defaultRows(): DayRow[] {
  return DAYS.map((d) => ({
    dayOfWeek: d.value,
    isActive: d.value !== 'SUNDAY',
    startTime: '09:00',
    endTime: '19:00',
  }))
}

export default function DisponibilidadePage() {
  const [rows, setRows] = useState<DayRow[]>(defaultRows)
  const [blocks, setBlocks] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [savingHours, setSavingHours] = useState(false)
  const [hoursSaved, setHoursSaved] = useState(false)

  // Formulário de novo bloqueio
  const [showForm, setShowForm] = useState(false)
  const [blkDate, setBlkDate] = useState('')
  const [blkAllDay, setBlkAllDay] = useState(true)
  const [blkStart, setBlkStart] = useState('09:00')
  const [blkEnd, setBlkEnd] = useState('12:00')
  const [blkReason, setBlkReason] = useState('')
  const [savingBlock, setSavingBlock] = useState(false)
  const [blockError, setBlockError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/barber/availability')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        if (Array.isArray(data.workingHours) && data.workingHours.length > 0) {
          const byDay = new Map<Day, DayRow>()
          for (const w of data.workingHours) {
            byDay.set(w.dayOfWeek, {
              dayOfWeek: w.dayOfWeek,
              isActive: w.isActive,
              startTime: w.startTime,
              endTime: w.endTime,
            })
          }
          setRows(DAYS.map((d) => byDay.get(d.value) ?? { dayOfWeek: d.value, isActive: false, startTime: '09:00', endTime: '19:00' }))
        }
        setBlocks(data.blockedSlots ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function updateRow(day: Day, patch: Partial<DayRow>) {
    setRows((prev) => prev.map((r) => (r.dayOfWeek === day ? { ...r, ...patch } : r)))
    setHoursSaved(false)
  }

  async function saveHours() {
    setSavingHours(true)
    setHoursSaved(false)
    const res = await fetch('/api/barber/availability', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workingHours: rows.filter((r) => r.isActive) }),
    })
    setSavingHours(false)
    if (res.ok) {
      setHoursSaved(true)
      setTimeout(() => setHoursSaved(false), 2500)
    }
  }

  async function addBlock() {
    setBlockError(null)
    if (!blkDate) {
      setBlockError('Selecione uma data.')
      return
    }
    if (!blkAllDay && blkEnd <= blkStart) {
      setBlockError('O fim deve ser após o início.')
      return
    }
    setSavingBlock(true)
    const res = await fetch('/api/barber/availability', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blockedSlots: [
          {
            date: blkDate,
            allDay: blkAllDay,
            startTime: blkAllDay ? '00:00' : blkStart,
            endTime: blkAllDay ? '23:59' : blkEnd,
            reason: blkReason.trim() || undefined,
          },
        ],
      }),
    })
    setSavingBlock(false)
    if (res.ok) {
      // Recarrega a lista para refletir o id real gerado pelo banco.
      const data = await fetch('/api/barber/availability').then((r) => r.json())
      setBlocks(data.blockedSlots ?? [])
      setShowForm(false)
      setBlkDate('')
      setBlkReason('')
    } else {
      setBlockError('Erro ao adicionar bloqueio.')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="font-bold text-[19px] text-primary">Disponibilidade</div>
          <div className="text-[13px] text-textMuted">Defina sua grade semanal e bloqueios pontuais</div>
        </div>
        <button
          onClick={saveHours}
          disabled={savingHours}
          className="ml-auto bg-accent text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-accent-deep transition-colors disabled:opacity-50"
        >
          {savingHours ? 'Salvando...' : hoursSaved ? '✓ Salvo' : 'Salvar grade'}
        </button>
      </div>

      <div className="p-4 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-3.5 overflow-auto">
        {/* Grade semanal */}
        <div className="border border-line rounded-xl bg-white p-4">
          <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-3">
            Jornada padrão — quem agenda enxerga só os horários livres
          </p>

          {loading ? (
            <div className="flex flex-col gap-2">
              {DAYS.map((d) => (
                <div key={d.value} className="h-10 rounded-lg bg-fill animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {rows.map((row) => {
                const label = DAYS.find((d) => d.value === row.dayOfWeek)?.label
                return (
                  <div
                    key={row.dayOfWeek}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg border border-line"
                  >
                    <button
                      type="button"
                      onClick={() => updateRow(row.dayOfWeek, { isActive: !row.isActive })}
                      className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 relative ${
                        row.isActive ? 'bg-accent' : 'bg-fill border border-line'
                      }`}
                      aria-label={`Alternar ${label}`}
                    >
                      <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${
                          row.isActive ? 'left-[18px]' : 'left-0.5'
                        }`}
                      />
                    </button>
                    <span className="w-20 text-[14px] font-semibold">{label}</span>
                    {row.isActive ? (
                      <div className="flex items-center gap-2 ml-auto">
                        <input
                          type="time"
                          value={row.startTime}
                          onChange={(e) => updateRow(row.dayOfWeek, { startTime: e.target.value })}
                          className="border border-line rounded-lg px-2 py-1 text-[13px] focus:outline-none focus:border-accent"
                        />
                        <span className="text-textMuted text-[13px]">até</span>
                        <input
                          type="time"
                          value={row.endTime}
                          onChange={(e) => updateRow(row.dayOfWeek, { endTime: e.target.value })}
                          className="border border-line rounded-lg px-2 py-1 text-[13px] focus:outline-none focus:border-accent"
                        />
                      </div>
                    ) : (
                      <span className="ml-auto text-[13px] text-textDisabled">Folga</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Bloqueios */}
        <div className="flex flex-col gap-3">
          <div className="border border-error rounded-xl bg-error/5 p-3.5">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-textMuted mb-2">
              Bloqueios e folgas
            </p>

            {blocks.length === 0 && !loading && (
              <p className="text-[13px] text-textMuted mb-2">Nenhum bloqueio futuro.</p>
            )}

            <div className="flex flex-col gap-2 mb-2">
              {blocks.map((b) => (
                <div key={b.id} className="flex items-center gap-2 text-[12.5px]">
                  <span className="text-error">✕</span>
                  <span className="flex-1">
                    {format(new Date(b.date), "EEE dd 'de' MMM", { locale: ptBR })}{' '}
                    <span className="text-textMuted">
                      · {b.allDay ? 'dia todo' : `${b.startTime}–${b.endTime}`}
                      {b.reason ? ` · ${b.reason}` : ''}
                    </span>
                  </span>
                </div>
              ))}
            </div>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="w-full border border-error text-error text-xs font-semibold py-2 rounded-lg hover:bg-error/5 transition-colors"
              >
                + Novo bloqueio
              </button>
            ) : (
              <div className="flex flex-col gap-2 mt-1">
                <input
                  type="date"
                  value={blkDate}
                  min={format(new Date(), 'yyyy-MM-dd')}
                  onChange={(e) => setBlkDate(e.target.value)}
                  className="border border-line rounded-lg px-2 py-1.5 text-[13px] focus:outline-none focus:border-accent"
                />
                <label className="flex items-center gap-2 text-[13px]">
                  <input
                    type="checkbox"
                    checked={blkAllDay}
                    onChange={(e) => setBlkAllDay(e.target.checked)}
                  />
                  Dia inteiro
                </label>
                {!blkAllDay && (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={blkStart}
                      onChange={(e) => setBlkStart(e.target.value)}
                      className="border border-line rounded-lg px-2 py-1 text-[13px] flex-1 focus:outline-none focus:border-accent"
                    />
                    <span className="text-textMuted text-[13px]">até</span>
                    <input
                      type="time"
                      value={blkEnd}
                      onChange={(e) => setBlkEnd(e.target.value)}
                      className="border border-line rounded-lg px-2 py-1 text-[13px] flex-1 focus:outline-none focus:border-accent"
                    />
                  </div>
                )}
                <input
                  type="text"
                  value={blkReason}
                  onChange={(e) => setBlkReason(e.target.value)}
                  maxLength={200}
                  placeholder="Motivo (opcional)"
                  className="border border-line rounded-lg px-2 py-1.5 text-[13px] focus:outline-none focus:border-accent"
                />
                {blockError && <p className="text-[12px] text-error">{blockError}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowForm(false)
                      setBlockError(null)
                    }}
                    className="flex-1 border border-line text-textMuted text-xs font-semibold py-2 rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={addBlock}
                    disabled={savingBlock}
                    className="flex-1 bg-error text-white text-xs font-semibold py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {savingBlock ? 'Adicionando...' : 'Adicionar'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="border border-dashed border-line rounded-xl p-3 text-[13px] text-textMuted leading-snug">
            💡 Mudanças não afetam agendamentos já confirmados.
          </div>
        </div>
      </div>
    </div>
  )
}
