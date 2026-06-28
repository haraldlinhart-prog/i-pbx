// app/api/webhook/route.ts
// Stripe Webhook → i-PBX Subscriber anlegen → Welcome-Mail

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
const resend = new Resend(process.env.RESEND_API_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const IPBX_PBX       = '1343'
const IPBX_SMS_KEY   = process.env.IPBX_SMS_KEY!    // Subscriber-Management API Key
const IPBX_SYS_KEY   = process.env.IPBX_SYS_KEY!    // System API Key

// Die 4 Anschlüsse — Präfix ohne Durchwahl
const ANSCHLUESSE = [
  { label: 'Frankfurt', nr: '069 9001280', prefix: '49699001280' },
  { label: 'Frankfurt', nr: '069 902887',  prefix: '4969902887'  },
  { label: 'Berlin',    nr: '030 5684450', prefix: '493056844450' },
  { label: 'Berlin',    nr: '030 5684460', prefix: '493056844460' },
]

function generatePin(): string {
  return String(Math.floor(10000 + Math.random() * 90000))
}

async function getNextFreeNumber(): Promise<number | null> {
  const { data } = await supabase
    .from('ipbx_numbers')
    .select('nr')
    .eq('status', 'free')
    .order('nr', { ascending: true })
    .limit(1)
  return data?.[0]?.nr ?? null
}

async function provisionSubscriber(
  nr: number, name: string, email: string, pin: string
): Promise<boolean> {
  const url = `https://admin.i-pbx.de/app/api/api.subscriber` +
    `?key=${IPBX_SMS_KEY}` +
    `&reqtype=add` +
    `&pbx=${IPBX_PBX}` +
    `&art=telefon` +
    `&tarif=standard` +
    `&nr=${nr}` +
    `&name=${encodeURIComponent(name)}` +
    `&email=${encodeURIComponent(email)}` +
    `&pin=${pin}` +
    `&sendpinmail=0`

  const res = await fetch(url)
  const text = await res.text()
  console.log(`i-PBX provision nr=${nr}:`, text)
  return text.trim().startsWith('OK')
}

async function getSessionLink(email: string): Promise<string> {
  try {
    const url = `https://admin.i-pbx.de/app/api/api.session?key=${IPBX_SYS_KEY}&user=${encodeURIComponent(email)}`
    const res = await fetch(url)
    const text = await res.text()
    // OK;SESSION_ID;mainindex;
    const parts = text.split(';')
    if (parts[0] === 'OK' && parts[1]) {
      return `https://admin.i-pbx.de/app/api/main?session=${parts[1]}&page=mainindex`
    }
  } catch (e) {
    console.error('Session link error:', e)
  }
  return 'https://admin.i-pbx.de'
}

async function sendWelcomeMail(
  name: string, email: string, company: string,
  nr: number, pin: string, with_ki: boolean, sessionUrl: string
) {
  const nrStr = String(nr).padStart(2, '0')
  const rufnummern = ANSCHLUESSE.map(a => ({
    label: a.label,
    nr: a.nr,
    full: `${a.nr}-${nrStr}`
  }))

  const nrRows = rufnummern.map(r =>
    `<tr><td style="padding:6px 12px;color:#64748b">${r.label}</td><td style="padding:6px 12px;font-weight:600;color:#0f2b5b">${r.full}</td></tr>`
  ).join('')

  await resend.emails.send({
    from: 'i-PBX <noreply@pan21.com>',
    to: email,
    subject: 'Willkommen bei i-PBX – Ihre Zugangsdaten',
    html: `<!DOCTYPE html>
<html lang="de"><head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;font-size:14px;color:#1a2a40;max-width:620px;margin:0 auto;background:#fff">

<div style="background:linear-gradient(135deg,#0f2b5b,#1a4a9b);padding:2rem;text-align:center;border-radius:12px 12px 0 0">
  <h1 style="color:#fff;margin:0;font-size:1.6rem">☎️ Willkommen bei i-PBX</h1>
  <p style="color:rgba(255,255,255,.75);margin:.5rem 0 0;font-size:.9rem">Ihre Cloud-Telefonanlage ist eingerichtet</p>
</div>

<div style="padding:2rem;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px">

  <p>Guten Tag${company ? ` ${company}` : ''},<br>liebe/r ${name},</p>
  <p>Ihre i-PBX Nebenstelle ist sofort einsatzbereit. Hier sind Ihre Zugangsdaten:</p>

  <div style="background:#f0f7ff;border-radius:8px;padding:1.5rem;margin:1.5rem 0;border-left:4px solid #1a4a9b">
    <div style="font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#1a4a9b;margin-bottom:1rem">Ihre Daten</div>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:6px 12px;color:#64748b">Interne Nebenstelle</td><td style="padding:6px 12px;font-weight:700;font-size:1.2rem;color:#0f2b5b">${nrStr}</td></tr>
      <tr><td style="padding:6px 12px;color:#64748b">PIN</td><td style="padding:6px 12px;font-weight:700;font-size:1.2rem;color:#0f2b5b">${pin}</td></tr>
      <tr><td style="padding:6px 12px;color:#64748b">Login (E-Mail)</td><td style="padding:6px 12px;font-weight:600;color:#0f2b5b">${email}</td></tr>
    </table>
  </div>

  <div style="font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#1a4a9b;margin-bottom:.75rem">Ihre Rufnummern</div>
  <p style="font-size:.85rem;color:#64748b;margin-bottom:.75rem">Sie sind unter folgenden 4 Nummern erreichbar:</p>
  <table style="width:100%;border-collapse:collapse;background:#f8fafc;border-radius:8px;overflow:hidden;margin-bottom:1.5rem">
    ${nrRows}
  </table>

  <div style="text-align:center;margin:2rem 0">
    <a href="${sessionUrl}" style="display:inline-block;background:#0f2b5b;color:#fff;padding:.9rem 2rem;border-radius:8px;font-weight:700;font-size:.9rem;text-decoration:none">
      🔐 Direkt zum i-PBX Portal →
    </a>
  </div>

  ${with_ki ? `
  <div style="background:#f0fdf4;border-radius:8px;padding:1.25rem;margin:1rem 0;border-left:4px solid #22c55e">
    <div style="font-weight:700;color:#15803d;margin-bottom:.5rem">🤖 KI-Assistent (Famulor)</div>
    <p style="color:#166534;font-size:.85rem;margin:0">Ihr KI-Assistent wird in den nächsten 24 Stunden separat konfiguriert. Sie erhalten eine weitere E-Mail mit den Einstellungen.</p>
  </div>
  ` : ''}

  <div style="background:#fff3e0;border-radius:8px;padding:1.25rem;margin:1rem 0">
    <div style="font-weight:700;color:#e65100;margin-bottom:.5rem">📱 SIP/VoIP Einrichtung</div>
    <p style="color:#bf360c;font-size:.85rem;margin:0">Für die Einrichtung auf Ihrem SIP-fähigen Telefon oder der i-PBX App benötigen Sie:<br>
    <strong>SIP-Server:</strong> sip.i-pbx.de &nbsp;|&nbsp; <strong>Nebenstelle:</strong> ${nrStr} &nbsp;|&nbsp; <strong>PIN:</strong> ${pin}</p>
  </div>

  <p style="font-size:.8rem;color:#94a3b8;margin-top:2rem;border-top:1px solid #e2e8f0;padding-top:1rem">
    Fragen? <a href="mailto:info@i-pbx.eu" style="color:#1a4a9b">info@i-pbx.eu</a> &nbsp;|&nbsp; 
    <a href="https://i-pbx.eu" style="color:#1a4a9b">i-pbx.eu</a>
  </p>
</div>
</body></html>`,
  })
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook sig error:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.CheckoutSession
  if (session.payment_status !== 'paid') {
    return NextResponse.json({ received: true })
  }

  const meta = session.metadata || {}
  const name    = meta.name    || 'Kunde'
  const email   = meta.email   || session.customer_email || ''
  const company = meta.company || ''
  const with_ki = meta.with_ki === 'true'
  const monthly = parseInt(meta.monthly_fee || '490')

  try {
    // 1. Freie Nummer holen & reservieren
    const nr = await getNextFreeNumber()
    if (!nr) {
      console.error('KEIN FREIER NUMMERNPOOL!')
      // Admin informieren
      await resend.emails.send({
        from: 'noreply@pan21.com',
        to: 'info@i-pbx.eu',
        subject: '⚠️ i-PBX: Kein freier Nummernpool!',
        html: `<p>Neue Bestellung von ${name} (${email}) konnte nicht automatisch provisioniert werden: Kein freier Nummernpool.</p><p>Stripe Session: ${session.id}</p>`,
      })
      return NextResponse.json({ received: true })
    }

    // Nummer reservieren
    await supabase.from('ipbx_numbers')
      .update({ status: 'reserved', reserved_at: new Date().toISOString() })
      .eq('nr', nr)

    // 2. PIN generieren
    const pin = generatePin()

    // 3. Bestellung in Supabase speichern
    const { data: order } = await supabase.from('ipbx_orders').insert({
      stripe_session_id: session.id,
      stripe_payment_intent: session.payment_intent as string,
      nr,
      company,
      name,
      email,
      phone: meta.phone || null,
      with_ki,
      monthly_fee: monthly,
      pin,
      status: 'pending',
      notes: meta.notes || null,
    }).select().single()

    // 4. i-PBX Subscriber anlegen
    const provisioned = await provisionSubscriber(nr, name, email, pin)

    if (provisioned) {
      // Nummer aktivieren
      await supabase.from('ipbx_numbers')
        .update({ status: 'active', customer_id: order?.id, activated_at: new Date().toISOString() })
        .eq('nr', nr)
      await supabase.from('ipbx_orders')
        .update({ status: 'provisioned', provisioned_at: new Date().toISOString() })
        .eq('id', order?.id)
    } else {
      await supabase.from('ipbx_orders').update({ status: 'failed' }).eq('id', order?.id)
    }

    // 5. Session-Link generieren
    const sessionUrl = await getSessionLink(email)

    // 6. Welcome-Mail
    await sendWelcomeMail(name, email, company, nr, pin, with_ki, sessionUrl)

    // 7. Admin-Notification
    const nrStr = String(nr).padStart(2, '0')
    await resend.emails.send({
      from: 'noreply@pan21.com',
      to: 'info@i-pbx.eu',
      subject: `✅ i-PBX Bestellung provisioniert – Nebenstelle ${nrStr}`,
      html: `<h2>Neue i-PBX Bestellung ${provisioned ? '✅ provisioniert' : '⚠️ FEHLER bei Provisionierung'}</h2>
        <p><b>Kunde:</b> ${name} (${company || '–'})<br>
        <b>E-Mail:</b> ${email}<br>
        <b>Nebenstelle:</b> ${nrStr}<br>
        <b>PIN:</b> ${pin}<br>
        <b>KI-Assistent:</b> ${with_ki ? 'Ja' : 'Nein'}<br>
        <b>Monatlich:</b> €${(monthly/100).toFixed(2)}<br>
        <b>Stripe:</b> ${session.id}</p>
        ${!provisioned ? '<p style="color:red"><b>⚠️ Provisionierung fehlgeschlagen! Bitte manuell anlegen.</b></p>' : ''}`,
    })

    return NextResponse.json({ received: true, nr, provisioned })

  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ received: true })
  }
}
