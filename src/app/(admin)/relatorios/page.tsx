'use client'

import { useCallback, useEffect, useState } from 'react'
import { format, startOfMonth } from 'date-fns'
import { Download, Loader2 } from 'lucide-react'
import { REPORT_TYPES, REPORT_LABELS, type ReportType } from '@/lib/reports.constants'

export default function RelatoriosPage() {
  const [type, setType] = useState<ReportType>('faturamento')
  const [from, setFrom] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<(string | number)[][]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [exporting, setExporting] = useState(false)

  const query = useCallback(
    () => `type=${type}&period=custom&from=${from}&to=${to}`,
    [type, from, to]
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(false)
    try {
      const res = await fetch(`/api/admin/metrics/export?${query()}&format=json`)
      if (!res.ok) throw new Error()
      const json = await res.json()
      setHeaders(json.headers)
      setRows(json.rows)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [query])

  useEffect(() => {
    load()
  }, [load])

  async function exportCsv() {
    setExporting(true)
    try {
      const res = await fetch(`/api/admin/metrics/export?${query()}`)
      if (!res.ok) throw new Error()
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${type}-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {
      setError(true)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-3 px-4 sm:px-[22px] py-4 border-b border-line bg-white">
        <div>
          <div className="font-bold text-[19px] text-primary">Relatórios</div>
          <div className="text-[13px] text-textMuted">Exporte dados de faturamento, agendamentos e clientes</div>
        </div>
        <button
          onClick={exportCsv}
          disabled={exporting || loading}
          className="ml-auto inline-flex items-center gap-2 bg-accent text-white font-semibold px-4 py-2 rounded-lg hover:bg-accent-deep transition-colors text-sm disabled:opacity-60"
        >
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          Exportar CSV
        </button>
      </div>

      <div className="p-4 flex flex-col gap-3.5 overflow-auto">
        {/* Filtros */}
        <div className="flex flex-wrap items-end gap-3 border border-line rounded-xl bg-white p-4">
          <div className="flex flex-col">
            <label className="text-[11px] font-semibold text-textMuted mb-1">Relatório</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ReportType)}
              className="border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
            >
              {REPORT_TYPES.map((t) => (
                <option key={t} value={t}>{REPORT_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-semibold text-textMuted mb-1">De</label>
            <input type="date" value={from} max={to} onChange={(e) => setFrom(e.target.value)} className="border border-line rounded-md px-3 py-2 text-sm" />
          </div>
          <div className="flex flex-col">
            <label className="text-[11px] font-semibold text-textMuted mb-1">Até</label>
            <input type="date" value={to} min={from} onChange={(e) => setTo(e.target.value)} className="border border-line rounded-md px-3 py-2 text-sm" />
          </div>
        </div>

        {error && (
          <div className="border border-error/30 bg-error/5 text-error rounded-lg px-4 py-2.5 text-sm flex items-center justify-between">
            <span>Erro ao gerar o relatório.</span>
            <button onClick={load} className="font-semibold underline">Tentar novamente</button>
          </div>
        )}

        {/* Tabela */}
        <div className="border border-line rounded-xl bg-white overflow-hidden">
          {loading ? (
            <div className="py-12 flex items-center justify-center text-textMuted text-sm">
              <Loader2 size={16} className="animate-spin mr-2" /> Gerando relatório…
            </div>
          ) : rows.length === 0 ? (
            <div className="py-12 text-center text-textMuted text-sm">Nenhum registro no período.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[12.5px]">
                <thead>
                  <tr className="bg-fill-soft border-b border-line">
                    {headers.map((h) => (
                      <th key={h} className="text-left font-semibold text-textMuted px-3 py-2 whitespace-nowrap font-mono text-[10px] uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 200).map((row, i) => (
                    <tr key={i} className="border-b border-fill" style={{ background: i % 2 ? '#F7F5F2' : '#fff' }}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 whitespace-nowrap">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {rows.length > 200 && (
                <div className="px-3 py-2 text-[12px] text-textMuted bg-fill-soft border-t border-line">
                  Mostrando 200 de {rows.length} registros. Exporte o CSV para o conjunto completo.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
