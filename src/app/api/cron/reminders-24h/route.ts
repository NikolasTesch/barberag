import { runReminders } from '@/lib/notifications/reminders'

/** GET /api/cron/reminders-24h — Vercel Cron (de hora em hora). Protegido por CRON_SECRET (RN-07). */
export async function GET(req: Request) {
  const auth = req.headers.get('Authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const count = await runReminders('24h')
    return Response.json({ ok: true, kind: '24h', sent: count })
  } catch (err) {
    console.error('[cron:reminders-24h]', err)
    return Response.json({ error: 'Erro ao processar lembretes' }, { status: 500 })
  }
}
