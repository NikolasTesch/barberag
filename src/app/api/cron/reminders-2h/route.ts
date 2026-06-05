import { runReminders } from '@/lib/notifications/reminders'

/**
 * GET /api/cron/reminders-2h — lembrete de 2h. Protegido por CRON_SECRET (RN-07).
 * DESABILITADO por enquanto: não há entrada em vercel.json, então o cron não dispara.
 * O endpoint segue funcional para acionamento manual/futuro.
 */
export async function GET(req: Request) {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const count = await runReminders('2h')
    return Response.json({ ok: true, kind: '2h', sent: count })
  } catch (err) {
    console.error('[cron:reminders-2h]', err)
    return Response.json({ error: 'Erro ao processar lembretes' }, { status: 500 })
  }
}
