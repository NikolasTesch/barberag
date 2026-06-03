import { format } from 'date-fns'
import { getSessionAdmin } from '@/lib/auth/admin'
import { resolveRange } from '@/lib/utils/period'
import { buildReport, reportToCsv, REPORT_TYPES, type ReportType } from '@/lib/reports'

/**
 * GET /api/admin/metrics/export?type=faturamento&from=&to=&format=csv|json
 * - format=json → { headers, rows } para preview da tabela na UI.
 * - format=csv (padrão) → download CSV em UTF-8 com BOM (compatível com Excel).
 */
export async function GET(req: Request) {
  const { admin, error } = await getSessionAdmin()
  if (error) return error
  void admin

  const { searchParams } = new URL(req.url)
  const typeParam = searchParams.get('type') ?? 'faturamento'
  if (!REPORT_TYPES.includes(typeParam as ReportType)) {
    return Response.json({ error: 'Tipo de relatório inválido' }, { status: 400 })
  }
  const type = typeParam as ReportType

  const { range } = resolveRange(
    searchParams.get('period'),
    searchParams.get('from'),
    searchParams.get('to')
  )

  const report = await buildReport(type, range)

  if (searchParams.get('format') === 'json') {
    return Response.json({ headers: report.headers, rows: report.rows })
  }

  const csv = '﻿' + reportToCsv(report) // BOM p/ Excel reconhecer UTF-8
  const filename = `relatorio-${type}-${format(new Date(), 'yyyy-MM-dd')}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
