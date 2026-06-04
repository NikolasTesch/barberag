'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, CheckCircle2 } from 'lucide-react'
import {
  CommissionClosingTable,
  type CommissionGroup,
} from '@/components/admin/CommissionClosingTable'
import { CommissionRuleForm, type RuleRow } from '@/components/admin/CommissionRuleForm'

interface Option {
  id: string
  name: string
}

type Tab = 'closing' | 'rules'

export default function ComissoesAdminPage() {
  const [tab, setTab] = useState<Tab>('closing')
  const [groups, setGroups] = useState<CommissionGroup[]>([])
  const [rules, setRules] = useState<RuleRow[]>([])
  const [barbers, setBarbers] = useState<Option[]>([])
  const [services, setServices] = useState<Option[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const [pend, rul, brb, svc] = await Promise.all([
        fetch('/api/admin/commissions'),
        fetch('/api/admin/commissions/rules'),
        fetch('/api/admin/barbers'),
        fetch('/api/admin/services'),
      ])
      if (![pend, rul, brb, svc].every((r) => r.ok)) throw new Error()
      setGroups((await pend.json()).groups)
      setRules((await rul.json()).rules)
      setBarbers((await brb.json()).barbers.map((b: { id: string; name: string }) => ({ id: b.id, name: b.name })))
      setServices((await svc.json()).services.map((s: { id: string; name: string }) => ({ id: s.id, name: s.name })))
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 5000)
    load()
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="font-bold text-[19px] text-primary">Comissões</div>
          <div className="text-[13px] text-textMuted">Fechamento e regras de comissão</div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {(['closing', 'rules'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                tab === t ? 'bg-primary text-white border-primary' : 'bg-white text-textMuted border-line hover:border-accent/40'
              }`}
            >
              {t === 'closing' ? 'Fechamento' : 'Regras'}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3.5 overflow-auto">
        {error && (
          <div className="border border-error/30 bg-error/5 text-error rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
            <span>Erro ao carregar comissões.</span>
            <button onClick={load} className="font-semibold underline">Tentar novamente</button>
          </div>
        )}

        {loading ? (
          <div className="py-16 flex items-center justify-center text-textMuted text-sm">
            <Loader2 size={16} className="animate-spin mr-2" /> Carregando…
          </div>
        ) : tab === 'closing' ? (
          <CommissionClosingTable groups={groups} onPaid={showToast} />
        ) : (
          <CommissionRuleForm rules={rules} barbers={barbers} services={services} onChange={load} />
        )}
      </div>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-primary text-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-2 max-w-sm">
          <CheckCircle2 size={18} className="text-success flex-shrink-0" />
          <span className="text-sm">{toast}</span>
        </div>
      )}
    </div>
  )
}
