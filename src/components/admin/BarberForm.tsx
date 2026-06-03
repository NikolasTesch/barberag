'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X } from 'lucide-react'
import { BarberFormSchema, type BarberFormInput, type BarberWorkingDay } from '@/lib/validations/barber'
import { formatBRL } from '@/lib/utils/format'

export interface ServiceOption {
  id: string
  name: string
  basePrice: number
}

const DAY_LABELS: { day: BarberWorkingDay['dayOfWeek']; label: string }[] = [
  { day: 'MONDAY', label: 'Seg' },
  { day: 'TUESDAY', label: 'Ter' },
  { day: 'WEDNESDAY', label: 'Qua' },
  { day: 'THURSDAY', label: 'Qui' },
  { day: 'FRIDAY', label: 'Sex' },
  { day: 'SATURDAY', label: 'Sáb' },
  { day: 'SUNDAY', label: 'Dom' },
]

function defaultWorkingHours(): BarberWorkingDay[] {
  return DAY_LABELS.map(({ day }) => ({
    dayOfWeek: day,
    isActive: day !== 'SUNDAY',
    startTime: '09:00',
    endTime: day === 'SATURDAY' ? '18:00' : '19:00',
  }))
}

export interface BarberFormProps {
  services: ServiceOption[]
  mode: 'create' | 'edit'
  barberId?: string
  initial?: Partial<BarberFormInput> & {
    services?: { serviceId: string; customPrice: number | null }[]
    workingHours?: BarberWorkingDay[]
  }
}

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[12px] font-semibold text-textMuted mb-1">{children}</label>
)

const inputClass =
  'w-full border border-line rounded-md px-3 py-2 text-[14px] text-textPrimary focus:outline-none focus:border-accent'

export function BarberForm({ services, mode, barberId, initial }: BarberFormProps) {
  const router = useRouter()

  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [phone, setPhone] = useState(initial?.phone ?? '')
  const [bio, setBio] = useState(initial?.bio ?? '')
  const [image, setImage] = useState(initial?.image ?? '')
  const [commissionPercent, setCommissionPercent] = useState(
    initial?.commissionPercent ?? 35
  )
  const [specialties, setSpecialties] = useState<string[]>(initial?.specialties ?? [])
  const [specialtyInput, setSpecialtyInput] = useState('')

  const [selectedServices, setSelectedServices] = useState<Map<string, number | null>>(
    () => new Map((initial?.services ?? []).map((s) => [s.serviceId, s.customPrice ?? null]))
  )

  const [workingHours, setWorkingHours] = useState<BarberWorkingDay[]>(
    initial?.workingHours && initial.workingHours.length > 0
      ? DAY_LABELS.map(({ day, label: _l }) => {
          const found = initial!.workingHours!.find((w) => w.dayOfWeek === day)
          return (
            found ?? { dayOfWeek: day, isActive: false, startTime: '09:00', endTime: '19:00' }
          )
        })
      : defaultWorkingHours()
  )

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleService(id: string) {
    setSelectedServices((prev) => {
      const next = new Map(prev)
      if (next.has(id)) next.delete(id)
      else next.set(id, null)
      return next
    })
  }

  function setServicePrice(id: string, value: string) {
    setSelectedServices((prev) => {
      const next = new Map(prev)
      next.set(id, value === '' ? null : Number(value))
      return next
    })
  }

  function addSpecialty() {
    const v = specialtyInput.trim()
    if (v && !specialties.includes(v)) setSpecialties([...specialties, v])
    setSpecialtyInput('')
  }

  function updateDay(day: BarberWorkingDay['dayOfWeek'], patch: Partial<BarberWorkingDay>) {
    setWorkingHours((prev) =>
      prev.map((w) => (w.dayOfWeek === day ? { ...w, ...patch } : w))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const payload: BarberFormInput = {
      name,
      email,
      phone: phone || '',
      bio: bio || '',
      image: image || '',
      commissionPercent,
      specialties,
      services: Array.from(selectedServices.entries()).map(([serviceId, customPrice]) => ({
        serviceId,
        customPrice,
      })),
      workingHours,
    }

    const parsed = BarberFormSchema.safeParse(payload)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Verifique os campos.')
      return
    }

    setSubmitting(true)
    try {
      const url = mode === 'create' ? '/api/admin/barbers' : `/api/admin/barbers/${barberId}`
      const method = mode === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error?.formErrors?.[0] ?? 'Falha ao salvar barbeiro.')
      }
      router.push('/barbeiros')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-3xl">
      {error && (
        <div className="border border-error/30 bg-error/5 text-error rounded-lg px-4 py-2.5 text-sm">
          {error}
        </div>
      )}

      {/* Dados pessoais */}
      <section className="border border-line rounded-xl bg-white p-4">
        <h3 className="text-[11px] font-semibold tracking-widest uppercase text-textMuted mb-3">Dados pessoais</h3>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-fill border border-line overflow-hidden flex items-center justify-center text-textDisabled text-xs">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="preview" className="w-full h-full object-cover" />
              ) : (
                'Foto'
              )}
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3">
            <div className="col-span-2 sm:col-span-1">
              <FieldLabel>Nome *</FieldLabel>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <FieldLabel>E-mail *</FieldLabel>
              <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <FieldLabel>Telefone</FieldLabel>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Foto (URL)</FieldLabel>
              <input className={inputClass} value={image} onChange={(e) => setImage(e.target.value)} placeholder="https://…" />
            </div>
            <div className="col-span-2">
              <FieldLabel>Bio</FieldLabel>
              <textarea className={inputClass} rows={2} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
          </div>
        </div>
      </section>

      {/* Configuração profissional */}
      <section className="border border-line rounded-xl bg-white p-4">
        <h3 className="text-[11px] font-semibold tracking-widest uppercase text-textMuted mb-3">Configuração profissional</h3>
        <div className="mb-4">
          <FieldLabel>Comissão padrão: <span className="text-accent-deep font-bold">{commissionPercent}%</span></FieldLabel>
          <input
            type="range"
            min={0}
            max={100}
            value={commissionPercent}
            onChange={(e) => setCommissionPercent(Number(e.target.value))}
            className="w-full accent-accent"
          />
        </div>
        <div>
          <FieldLabel>Especialidades</FieldLabel>
          <div className="flex gap-2 mb-2 flex-wrap">
            {specialties.map((s) => (
              <span key={s} className="inline-flex items-center gap-1 bg-accent-soft text-accent-deep text-xs font-semibold px-2.5 py-1 rounded-full">
                {s}
                <button type="button" onClick={() => setSpecialties(specialties.filter((x) => x !== s))}>
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={specialtyInput}
              onChange={(e) => setSpecialtyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSpecialty()
                }
              }}
              placeholder="Ex: Degradê, Barba…"
            />
            <button type="button" onClick={addSpecialty} className="px-3 py-2 border border-line rounded-md text-sm font-semibold hover:bg-fill">
              Adicionar
            </button>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className="border border-line rounded-xl bg-white p-4">
        <h3 className="text-[11px] font-semibold tracking-widest uppercase text-textMuted mb-3">Serviços que realiza</h3>
        {services.length === 0 ? (
          <p className="text-sm text-textMuted">Nenhum serviço ativo cadastrado.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {services.map((svc) => {
              const selected = selectedServices.has(svc.id)
              const custom = selectedServices.get(svc.id)
              return (
                <div key={svc.id} className="flex items-center gap-3 border border-line rounded-lg px-3 py-2">
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input type="checkbox" checked={selected} onChange={() => toggleService(svc.id)} className="accent-accent" />
                    <span className="font-medium text-[14px]">{svc.name}</span>
                    <span className="text-textDisabled text-xs">base {formatBRL(svc.basePrice)}</span>
                  </label>
                  {selected && (
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="preço custom"
                      value={custom ?? ''}
                      onChange={(e) => setServicePrice(svc.id, e.target.value)}
                      className="w-32 border border-line rounded-md px-2 py-1 text-sm"
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Horário de trabalho */}
      <section className="border border-line rounded-xl bg-white p-4">
        <h3 className="text-[11px] font-semibold tracking-widest uppercase text-textMuted mb-3">Horário de trabalho</h3>
        <div className="flex flex-col gap-2">
          {workingHours.map((w) => (
            <div key={w.dayOfWeek} className="flex items-center gap-3">
              <label className="flex items-center gap-2 w-20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={w.isActive}
                  onChange={(e) => updateDay(w.dayOfWeek, { isActive: e.target.checked })}
                  className="accent-accent"
                />
                <span className="text-sm font-medium">{DAY_LABELS.find((d) => d.day === w.dayOfWeek)?.label}</span>
              </label>
              <input
                type="time"
                value={w.startTime}
                disabled={!w.isActive}
                onChange={(e) => updateDay(w.dayOfWeek, { startTime: e.target.value })}
                className="border border-line rounded-md px-2 py-1 text-sm disabled:opacity-40"
              />
              <span className="text-textDisabled">→</span>
              <input
                type="time"
                value={w.endTime}
                disabled={!w.isActive}
                onChange={(e) => updateDay(w.dayOfWeek, { endTime: e.target.value })}
                className="border border-line rounded-md px-2 py-1 text-sm disabled:opacity-40"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-deep transition-colors disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {mode === 'create' ? 'Criar barbeiro' : 'Salvar alterações'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/barbeiros')}
          className="px-5 py-2.5 rounded-lg border border-line font-semibold hover:bg-fill transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
