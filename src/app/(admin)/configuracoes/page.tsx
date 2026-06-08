'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { ConfigFormSchema, type ConfigFormInput } from '@/lib/validations/config'
import type { BarberWorkingDay } from '@/lib/validations/barber'

const DAY_LABELS: { day: BarberWorkingDay['dayOfWeek']; label: string }[] = [
  { day: 'MONDAY', label: 'Segunda' },
  { day: 'TUESDAY', label: 'Terça' },
  { day: 'WEDNESDAY', label: 'Quarta' },
  { day: 'THURSDAY', label: 'Quinta' },
  { day: 'FRIDAY', label: 'Sexta' },
  { day: 'SATURDAY', label: 'Sábado' },
  { day: 'SUNDAY', label: 'Domingo' },
]

const inputClass = 'w-full border border-line rounded-md px-3 py-2 text-[14px] focus:outline-none focus:border-accent'
const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[12px] font-semibold text-textMuted mb-1">{children}</label>
)

function defaultDays(): BarberWorkingDay[] {
  return DAY_LABELS.map(({ day }) => ({
    dayOfWeek: day,
    isActive: day !== 'SUNDAY',
    startTime: '09:00',
    endTime: day === 'SATURDAY' ? '18:00' : '19:00',
  }))
}

export default function ConfiguracoesPage() {
  const [name, setName] = useState('BARBERAG')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [cancelPolicyHours, setCancelPolicyHours] = useState(2)
  const [days, setDays] = useState<BarberWorkingDay[]>(defaultDays)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/config')
      if (!res.ok) throw new Error()
      const json = await res.json()
      if (json.config) {
        setName(json.config.name ?? 'BARBERAG')
        setPhone(json.config.phone ?? '')
        setEmail(json.config.email ?? '')
        setAddress(json.config.address ?? '')
        setLogoUrl(json.config.logoUrl ?? '')
        setCancelPolicyHours(json.config.cancelPolicyHours ?? 2)
      }
      if (json.workingHours?.length) {
        setDays(
          DAY_LABELS.map(({ day }) => {
            const found = json.workingHours.find((w: BarberWorkingDay) => w.dayOfWeek === day)
            return found ?? { dayOfWeek: day, isActive: false, startTime: '09:00', endTime: '19:00' }
          })
        )
      }
    } catch {
      setError('Erro ao carregar configurações.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function updateDay(day: BarberWorkingDay['dayOfWeek'], patch: Partial<BarberWorkingDay>) {
    setDays((prev) => prev.map((w) => (w.dayOfWeek === day ? { ...w, ...patch } : w)))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    const payload: ConfigFormInput = {
      name,
      phone: phone || '',
      email: email || '',
      address: address || '',
      logoUrl: logoUrl || '',
      cancelPolicyHours,
      workingHours: days,
    }
    const parsed = ConfigFormSchema.safeParse(payload)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Verifique os campos.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (!res.ok) throw new Error()
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch {
      setError('Falha ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
        <div className="font-bold text-[19px] text-primary">Configurações</div>
      </div>

      <div className="p-4 overflow-auto">
        {loading ? (
          <div className="py-16 flex items-center justify-center text-textMuted text-sm">
            <Loader2 size={16} className="animate-spin mr-2" /> Carregando…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
            {error && (
              <div className="border border-error/30 bg-error/5 text-error rounded-lg px-4 py-2.5 text-sm">{error}</div>
            )}

            <section className="border border-line rounded-xl bg-white shadow-sm p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <h3 className="col-span-2 text-[10px] font-bold tracking-widest uppercase text-textDisabled">Dados da empresa</h3>
              <div className="col-span-2">
                <FieldLabel>Nome *</FieldLabel>
                <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <FieldLabel>Telefone</FieldLabel>
                <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <FieldLabel>E-mail</FieldLabel>
                <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="col-span-2">
                <FieldLabel>Endereço</FieldLabel>
                <input className={inputClass} value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div className="col-span-2 flex items-end gap-3">
                <div className="flex-1">
                  <FieldLabel>Logo (URL)</FieldLabel>
                  <input className={inputClass} value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…" />
                </div>
                {logoUrl && (
                  <div className="w-12 h-12 rounded-lg border border-line overflow-hidden flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />
                  </div>
                )}
              </div>
            </section>

            <section className="border border-line rounded-xl bg-white shadow-sm p-4">
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-textDisabled mb-3">Política de cancelamento</h3>
              <FieldLabel>Antecedência mínima para cancelamento (horas)</FieldLabel>
              <input
                type="number"
                min={0}
                max={168}
                className={`${inputClass} max-w-[160px]`}
                value={cancelPolicyHours}
                onChange={(e) => setCancelPolicyHours(Number(e.target.value))}
              />
            </section>

            <section className="border border-line rounded-xl bg-white shadow-sm p-4">
              <h3 className="text-[10px] font-bold tracking-widest uppercase text-textDisabled mb-1">Horário de funcionamento</h3>
              <p className="text-[12px] text-textMuted mb-3">Padrão herdado por barbeiros sem horário próprio.</p>
              <div className="flex flex-col gap-2">
                {days.map((w) => (
                  <div key={w.dayOfWeek} className="flex items-center gap-3">
                    <label className="flex items-center gap-2 w-28 cursor-pointer">
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
                disabled={saving}
                className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-deep transition-colors disabled:opacity-60"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                Salvar configurações
              </button>
              {saved && (
                <span className="inline-flex items-center gap-1.5 text-success text-sm font-semibold">
                  <CheckCircle2 size={16} /> Salvo!
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
