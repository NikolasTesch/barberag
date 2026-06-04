'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import {
  ServiceFormSchema,
  SERVICE_CATEGORIES,
  CATEGORY_LABELS,
  type ServiceFormInput,
} from '@/lib/validations/service'
import { formatBRL } from '@/lib/utils/format'

export interface BarberOption {
  id: string
  name: string
}

export interface ServiceFormProps {
  barbers: BarberOption[]
  mode: 'create' | 'edit'
  serviceId?: string
  initial?: Partial<ServiceFormInput> & {
    barbers?: { barberId: string; customPrice: number | null }[]
  }
}

const inputClass =
  'w-full border border-line rounded-md px-3 py-2 text-[14px] text-textPrimary focus:outline-none focus:border-accent'
const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[12px] font-semibold text-textMuted mb-1">{children}</label>
)

export function ServiceForm({ barbers, mode, serviceId, initial }: ServiceFormProps) {
  const router = useRouter()

  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category, setCategory] = useState<ServiceFormInput['category']>(initial?.category ?? 'HAIR')
  const [durationMinutes, setDurationMinutes] = useState(initial?.durationMinutes ?? 30)
  const [basePrice, setBasePrice] = useState(initial?.basePrice ?? 0)
  const [selected, setSelected] = useState<Map<string, number | null>>(
    () => new Map((initial?.barbers ?? []).map((b) => [b.barberId, b.customPrice ?? null]))
  )

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Map(prev)
      if (next.has(id)) next.delete(id)
      else next.set(id, null)
      return next
    })
  }

  function setPrice(id: string, value: string) {
    setSelected((prev) => {
      const next = new Map(prev)
      next.set(id, value === '' ? null : Number(value))
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const payload: ServiceFormInput = {
      name,
      description: description || '',
      category,
      durationMinutes,
      basePrice,
      barbers: Array.from(selected.entries()).map(([barberId, customPrice]) => ({ barberId, customPrice })),
    }

    const parsed = ServiceFormSchema.safeParse(payload)
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Verifique os campos.')
      return
    }

    setSubmitting(true)
    try {
      const url = mode === 'create' ? '/api/admin/services' : `/api/admin/services/${serviceId}`
      const res = await fetch(url, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed.data),
      })
      if (!res.ok) {
        const json = await res.json().catch(() => null)
        throw new Error(json?.error?.formErrors?.[0] ?? 'Falha ao salvar serviço.')
      }
      router.push('/servicos')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
      {error && (
        <div className="border border-error/30 bg-error/5 text-error rounded-lg px-4 py-2.5 text-sm">{error}</div>
      )}

      <section className="border border-line rounded-xl bg-white p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="col-span-2">
          <FieldLabel>Nome *</FieldLabel>
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-span-2">
          <FieldLabel>Descrição</FieldLabel>
          <textarea className={inputClass} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <FieldLabel>Categoria</FieldLabel>
          <select className={inputClass} value={category} onChange={(e) => setCategory(e.target.value as ServiceFormInput['category'])}>
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <FieldLabel>Duração (minutos)</FieldLabel>
          <input
            type="number"
            min={5}
            max={480}
            step={5}
            className={inputClass}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <FieldLabel>Preço base (R$)</FieldLabel>
          <input
            type="number"
            min={0}
            step="0.01"
            className={inputClass}
            value={basePrice}
            onChange={(e) => setBasePrice(Number(e.target.value))}
            required
          />
        </div>
      </section>

      <section className="border border-line rounded-xl bg-white p-4">
        <h3 className="text-[11px] font-semibold tracking-widest uppercase text-textMuted mb-3">Barbeiros que realizam</h3>
        {barbers.length === 0 ? (
          <p className="text-sm text-textMuted">Nenhum barbeiro ativo cadastrado.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {barbers.map((b) => {
              const isSel = selected.has(b.id)
              return (
                <div key={b.id} className="flex items-center gap-3 border border-line rounded-lg px-3 py-2">
                  <label className="flex items-center gap-2 flex-1 cursor-pointer">
                    <input type="checkbox" checked={isSel} onChange={() => toggle(b.id)} className="accent-accent" />
                    <span className="font-medium text-[14px]">{b.name}</span>
                  </label>
                  {isSel && (
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder={`base ${formatBRL(basePrice)}`}
                      value={selected.get(b.id) ?? ''}
                      onChange={(e) => setPrice(b.id, e.target.value)}
                      className="w-36 border border-line rounded-md px-2 py-1 text-sm"
                    />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 bg-accent text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-accent-deep transition-colors disabled:opacity-60"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {mode === 'create' ? 'Criar serviço' : 'Salvar alterações'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/servicos')}
          className="px-5 py-2.5 rounded-lg border border-line font-semibold hover:bg-fill transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
