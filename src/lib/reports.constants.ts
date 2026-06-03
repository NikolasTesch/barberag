/** Constantes de relatório seguras para o cliente (sem dependência de Prisma). */
export const REPORT_TYPES = ['faturamento', 'agendamentos', 'clientes', 'barbeiros'] as const
export type ReportType = (typeof REPORT_TYPES)[number]

export const REPORT_LABELS: Record<ReportType, string> = {
  faturamento: 'Faturamento',
  agendamentos: 'Agendamentos',
  clientes: 'Clientes',
  barbeiros: 'Barbeiros',
}
