import { runReminders } from '@/lib/notifications/reminders'

/** GET /api/cron/reminders-2h — Vercel Cron (a cada 30min). Protegido por CRON_SECRET (RN-07). */
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
