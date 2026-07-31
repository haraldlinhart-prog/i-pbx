// app/api/europan-balance/route.ts
import { NextRequest, NextResponse } from 'next/server'

// POST /api/europan-balance
// Body: { email, pin }
// Prüft E-Mail+PIN gegen noble-limited.com (immer www — Apex macht 308-Redirect
// und wirft dabei den Authorization-Header weg).
export async function POST(req: NextRequest) {
  const { email, pin } = await req.json().catch(() => ({}))
  if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })
  if (!pin || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN (4-stellig) erforderlich' }, { status: 400 })
  }

  const nobleUrl = 'https://www.noble-limited.com'
  const nobleKey = process.env.NOBLE_API_KEY
  if (!nobleKey) return NextResponse.json({ error: 'Not configured' }, { status: 500 })

  try {
    const res = await fetch(`${nobleUrl}/api/v1/balance-by-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${nobleKey}` },
      body: JSON.stringify({ email: email.toLowerCase(), pin, coin_id: 'europan' }),
    })

    if (res.status === 404) return NextResponse.json({ error: 'Kein EUROPAN-Guthaben für diese E-Mail gefunden.' }, { status: 404 })
    if (res.status === 401) return NextResponse.json({ error: 'Falsche PIN.' }, { status: 401 })
    if (res.status === 429) return NextResponse.json({ error: 'Zu viele falsche Versuche — bitte später erneut versuchen.' }, { status: 429 })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return NextResponse.json({ error: err.error || 'Noble API error' }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json({
      email: data.email,
      full_name: data.full_name,
      balance: data.balances?.europan || 0,
    })
  } catch {
    return NextResponse.json({ error: 'Noble API unreachable' }, { status: 503 })
  }
}
