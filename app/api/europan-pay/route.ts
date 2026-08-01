// app/api/europan-pay/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { fulfillOrder, ANSCHLUESSE } from '@/lib/fulfillOrder'

const NOBLE_API_URL = 'https://www.noble-limited.com'
const NOBLE_API_KEY = process.env.NOBLE_API_KEY || ''

const SETUP_FEE_EUR = 9.90
const EUROPAN_BONUS_PCT = 0.02
const DOPPELWUMS_BONUS_PCT = 0.03

// POST /api/europan-pay
// Body: { email, pin, anschluss, bonusChoice ('now'|'save'), with_ki, company, name, phone, notes }
//
// SICHERHEIT: /api/v1/debit bei noble-limited prüft NUR den API-Key, keine PIN —
// diese Route ist die einzige Stelle, die die PIN vor dem Debit verifiziert.
// Der Rabatt-/Zahlbetrag wird ausschließlich serverseitig berechnet.
export async function POST(req: NextRequest) {
  const { email, pin, anschluss, bonusChoice, with_ki, company, name, phone, notes, department_keyword } =
    await req.json().catch(() => ({}))

  if (!email || !pin || !anschluss || !name) {
    return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 })
  }
  if (!ANSCHLUESSE[anschluss]) {
    return NextResponse.json({ error: 'Ungültiger Anschluss' }, { status: 400 })
  }
  if (!/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: 'PIN (4-stellig) erforderlich' }, { status: 400 })
  }
  if (!NOBLE_API_KEY) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }
  if (with_ki && !String(department_keyword || '').trim()) {
    return NextResponse.json({ error: 'Für den KI-Assistenten wird ein Fallback-Stichwort (z.B. Ihre Abteilung) benötigt.' }, { status: 400 })
  }
  if (with_ki) {
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: existing } = await supabase
      .from('ipbx_directory')
      .select('id')
      .eq('anschluss', anschluss)
      .ilike('department', department_keyword.trim())
      .limit(1)
    if (existing && existing.length > 0) {
      return NextResponse.json({ error: `Das Stichwort "${department_keyword}" ist auf diesem Anschluss schon vergeben. Bitte ein anderes wählen.` }, { status: 409 })
    }
  }

  // 0. PIN verifizieren + echten Kontostand holen — nie dem Client vertrauen
  const verifyRes = await fetch(`${NOBLE_API_URL}/api/v1/balance-by-email`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${NOBLE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.toLowerCase(), pin, coin_id: 'europan' }),
  })
  if (verifyRes.status === 404) return NextResponse.json({ error: 'Kein EUROPAN-Guthaben für diese E-Mail gefunden.' }, { status: 404 })
  if (verifyRes.status === 401) return NextResponse.json({ error: 'Falsche PIN.' }, { status: 401 })
  if (verifyRes.status === 429) return NextResponse.json({ error: 'Zu viele falsche Versuche — bitte später erneut versuchen.' }, { status: 429 })
  if (!verifyRes.ok) return NextResponse.json({ error: 'Noble API error' }, { status: verifyRes.status })

  const verifyData = await verifyRes.json()
  const balance: number = verifyData.balances?.europan || 0

  // 1. Bonus-Mathematik — serverseitig, wie im EUROPAN-Widget-Standard
  const europanBonus = SETUP_FEE_EUR * EUROPAN_BONUS_PCT
  const europanBonusApplied = bonusChoice === 'now' ? europanBonus : 0
  const afterEuropanBonus = Math.max(0, SETUP_FEE_EUR - europanBonusApplied)

  const doppelWumsBonus = SETUP_FEE_EUR * DOPPELWUMS_BONUS_PCT
  const fullyCovered = balance >= afterEuropanBonus
  if (!fullyCovered) {
    return NextResponse.json({
      error: 'Guthaben deckt den Betrag nicht vollständig — EUROPAN kann hier nur als vollständige Zahlung eingesetzt werden.',
      balance,
      required: afterEuropanBonus,
    }, { status: 402 })
  }
  const doppelWumsApplied = doppelWumsBonus
  const amountToDebit = Math.max(0, afterEuropanBonus - doppelWumsApplied)

  const orderRef = `IPBX-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`

  // 2. Debit — PIN bereits oben verifiziert
  const debitRes = await fetch(`${NOBLE_API_URL}/api/v1/debit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${NOBLE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      coin_id: 'europan',
      amount: amountToDebit,
      description: `i-PBX Einrichtungsgebühr – ${ANSCHLUESSE[anschluss].label}`,
      reference: orderRef,
    }),
  })
  if (!debitRes.ok) {
    const err = await debitRes.json().catch(() => ({}))
    return NextResponse.json({ error: err.error || 'Zahlung fehlgeschlagen' }, { status: debitRes.status })
  }
  const debitData = await debitRes.json()

  // 3. Affiliate/Bonus-Gutschrift beim Anbieter (doppel_wums=true, da vollständig in EUROPAN bezahlt)
  await fetch(`${NOBLE_API_URL}/api/v1/affiliate-credit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${NOBLE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      buyer_email: email,
      affiliate_ref: null,
      order_amount_eur: SETUP_FEE_EUR,
      coin_id_used: 'europan',
      doppel_wums: true,
      order_reference: orderRef,
    }),
  }).catch(() => {})

  // 4. Nummer provisionieren — exakt der gleiche Weg wie bei Stripe
  try {
    const result = await fulfillOrder({
      anschluss,
      name,
      email,
      company: company || '',
      phone,
      with_ki: Boolean(with_ki),
      departmentKeyword: department_keyword,
      monthlyFeeCents: with_ki ? 2480 : 490,
      notes,
      paymentMethod: 'europan',
      paymentRef: orderRef,
      paymentNote: `Bezahlt mit EUROPAN-Guthaben (${amountToDebit.toFixed(2)} )( , neues Guthaben: ${debitData.new_balance} )( ). Hier sind Ihre Zugangsdaten:`,
    })

    return NextResponse.json({
      success: true,
      order_reference: orderRef,
      amount_paid: amountToDebit,
      new_balance: debitData.new_balance,
      doppel_wums: true,
      ...result,
    })
  } catch (err: any) {
    console.error('europan-pay fulfillOrder error:', err)
    // Zahlung ist bereits erfolgt — Fehler hier bedeutet manuelle Nacharbeit, nicht Zahlungsfehler
    return NextResponse.json({
      success: true,
      order_reference: orderRef,
      amount_paid: amountToDebit,
      new_balance: debitData.new_balance,
      warning: 'Zahlung erfolgreich, Provisionierung wird manuell nachgeholt.',
    })
  }
}
