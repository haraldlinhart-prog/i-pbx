// lib/fulfillOrder.ts
// Gemeinsame Provisionierungs-Logik für Stripe- UND EUROPAN-Zahlungen.
// Wird nach BESTÄTIGTER Zahlung aufgerufen (Stripe-Webhook oder direkt aus
// dem EUROPAN-Pay-Route nach erfolgreichem Debit) — nie vorher.

import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY!)

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const IPBX_PBX     = '1343'
const IPBX_SMS_KEY = process.env.IPBX_SMS_KEY!
const IPBX_SYS_KEY = process.env.IPBX_SYS_KEY!

export const ANSCHLUESSE: Record<string, { label: string; nr: string; digits: number }> = {
  ffm1: { label: 'Frankfurt Anschluss 1', nr: '069 9001280', digits: 2 },
  ffm2: { label: 'Frankfurt Anschluss 2', nr: '069 902887',  digits: 2 },
  ber1: { label: 'Berlin Anschluss 1',    nr: '030 5684450', digits: 2 },
  ber2: { label: 'Berlin Anschluss 2',    nr: '030 5684460', digits: 3 },
}

function generatePin(): string {
  return String(Math.floor(10000 + Math.random() * 90000))
}

async function getNextFreeNumber(anschluss: string): Promise<number | null> {
  const { data } = await getSupabase()
    .from('ipbx_numbers')
    .select('nr')
    .eq('anschluss', anschluss)
    .eq('status', 'free')
    .order('nr', { ascending: true })
    .limit(1)
  return data?.[0]?.nr ?? null
}

async function provisionSubscriber(nr: number, name: string, email: string, pin: string): Promise<boolean> {
  const url = `https://admin.i-pbx.de/app/api/api.subscriber` +
    `?key=${IPBX_SMS_KEY}&reqtype=add&pbx=${IPBX_PBX}&art=telefon&tarif=standard` +
    `&nr=${nr}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&pin=${pin}&sendpinmail=0`
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
  anschluss: string, nr: number, pin: string, with_ki: boolean, sessionUrl: string,
  paymentNote: string
) {
  const info = ANSCHLUESSE[anschluss]
  const nrStr = String(nr).padStart(info.digits, '0')
  const fullNumber = `${info.nr}-${nrStr}`

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
  <p>Ihre i-PBX Nebenstelle auf dem Anschluss <strong>${info.label}</strong> ist sofort einsatzbereit. ${paymentNote}</p>
  <div style="background:#f0f7ff;border-radius:8px;padding:1.5rem;margin:1.5rem 0;border-left:4px solid #1a4a9b">
    <div style="font-size:.7rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#1a4a9b;margin-bottom:1rem">Ihre Daten</div>
    <table style="width:100%;border-collapse:collapse">
      <tr><td style="padding:6px 12px;color:#64748b">Rufnummer</td><td style="padding:6px 12px;font-weight:700;font-size:1.2rem;color:#0f2b5b">${fullNumber}</td></tr>
      <tr><td style="padding:6px 12px;color:#64748b">Interne Nebenstelle</td><td style="padding:6px 12px;font-weight:700;color:#0f2b5b">${nrStr}</td></tr>
      <tr><td style="padding:6px 12px;color:#64748b">PIN</td><td style="padding:6px 12px;font-weight:700;font-size:1.2rem;color:#0f2b5b">${pin}</td></tr>
      <tr><td style="padding:6px 12px;color:#64748b">Login (E-Mail)</td><td style="padding:6px 12px;font-weight:600;color:#0f2b5b">${email}</td></tr>
    </table>
  </div>
  <div style="text-align:center;margin:2rem 0">
    <a href="${sessionUrl}" style="display:inline-block;background:#0f2b5b;color:#fff;padding:.9rem 2rem;border-radius:8px;font-weight:700;font-size:.9rem;text-decoration:none">
      🔐 Direkt zum i-PBX Portal →
    </a>
  </div>
  ${with_ki ? `
  <div style="background:#f0fdf4;border-radius:8px;padding:1.25rem;margin:1rem 0;border-left:4px solid #22c55e">
    <div style="font-weight:700;color:#15803d;margin-bottom:.5rem">🤖 KI-Assistent (Famulor)</div>
    <p style="color:#166534;font-size:.85rem;margin:0">Ihr KI-Assistent wird in den nächsten 24 Stunden separat konfiguriert. Sie erhalten eine weitere E-Mail mit den Einstellungen.</p>
  </div>` : ''}
  <div style="background:#fff3e0;border-radius:8px;padding:1.25rem;margin:1rem 0">
    <div style="font-weight:700;color:#e65100;margin-bottom:.5rem">📱 SIP/VoIP Einrichtung</div>
    <p style="color:#bf360c;font-size:.85rem;margin:0">SIP-Server: sip.i-pbx.de &nbsp;|&nbsp; Nebenstelle: ${nrStr} &nbsp;|&nbsp; PIN: ${pin}</p>
  </div>
  <p style="font-size:.8rem;color:#94a3b8;margin-top:2rem;border-top:1px solid #e2e8f0;padding-top:1rem">
    Fragen? <a href="mailto:info@i-pbx.eu" style="color:#1a4a9b">info@i-pbx.eu</a> &nbsp;|&nbsp;
    <a href="https://i-pbx.eu" style="color:#1a4a9b">i-pbx.eu</a>
  </p>
</div>
</body></html>`,
  })
}

export interface FulfillParams {
  anschluss: string
  name: string
  email: string
  company: string
  phone?: string
  with_ki: boolean
  monthlyFeeCents: number
  notes?: string
  paymentMethod: 'stripe' | 'europan'
  paymentRef: string
  paymentNote: string // erscheint in der Willkommensmail, z.B. "Bezahlt mit EUROPAN-Guthaben."
}

export async function fulfillOrder(p: FulfillParams) {
  const info = ANSCHLUESSE[p.anschluss]
  if (!info) throw new Error(`Unbekannter Anschluss: ${p.anschluss}`)

  const nr = await getNextFreeNumber(p.anschluss)
  if (nr === null) {
    await resend.emails.send({
      from: 'noreply@pan21.com',
      to: 'info@i-pbx.eu',
      subject: `⚠️ i-PBX: Kein freier Nummernpool (${p.anschluss})!`,
      html: `<p>Bestellung von ${p.name} (${p.email}) für ${info.label} konnte nicht automatisch provisioniert werden: Kein freier Nummernpool.</p><p>Zahlungsreferenz: ${p.paymentRef}</p>`,
    })
    return { ok: false, reason: 'no_free_number' as const }
  }

  await getSupabase().from('ipbx_numbers')
    .update({ status: 'reserved', reserved_at: new Date().toISOString() })
    .eq('anschluss', p.anschluss).eq('nr', nr)

  const pin = generatePin()

  const { data: order } = await getSupabase().from('ipbx_orders').insert({
    stripe_session_id: p.paymentMethod === 'stripe' ? p.paymentRef : null,
    stripe_payment_intent: null,
    anschluss: p.anschluss,
    nr,
    company: p.company,
    name: p.name,
    email: p.email,
    phone: p.phone || null,
    with_ki: p.with_ki,
    monthly_fee: p.monthlyFeeCents,
    pin,
    status: 'pending',
    notes: p.notes || null,
    payment_method: p.paymentMethod,
    payment_reference: p.paymentRef,
  }).select().single()

  const provisioned = await provisionSubscriber(nr, p.name, p.email, pin)

  if (provisioned) {
    await getSupabase().from('ipbx_numbers')
      .update({ status: 'active', customer_id: order?.id, activated_at: new Date().toISOString() })
      .eq('anschluss', p.anschluss).eq('nr', nr)
    await getSupabase().from('ipbx_orders')
      .update({ status: 'provisioned', provisioned_at: new Date().toISOString() })
      .eq('id', order?.id)
  } else {
    await getSupabase().from('ipbx_orders').update({ status: 'failed' }).eq('id', order?.id)
  }

  const sessionUrl = await getSessionLink(p.email)
  await sendWelcomeMail(p.name, p.email, p.company, p.anschluss, nr, pin, p.with_ki, sessionUrl, p.paymentNote)

  const nrStr = String(nr).padStart(info.digits, '0')
  await resend.emails.send({
    from: 'noreply@pan21.com',
    to: 'info@i-pbx.eu',
    subject: `✅ i-PBX Bestellung provisioniert – ${info.label} ${nrStr}`,
    html: `<h2>Neue i-PBX Bestellung ${provisioned ? '✅ provisioniert' : '⚠️ FEHLER bei Provisionierung'}</h2>
      <p><b>Kunde:</b> ${p.name} (${p.company || '–'})<br>
      <b>E-Mail:</b> ${p.email}<br>
      <b>Anschluss:</b> ${info.label} (${info.nr}-${nrStr})<br>
      <b>PIN:</b> ${pin}<br>
      <b>KI-Assistent:</b> ${p.with_ki ? 'Ja' : 'Nein'}<br>
      <b>Zahlungsart:</b> ${p.paymentMethod === 'europan' ? 'EUROPAN-Guthaben' : 'Stripe (Karte)'}<br>
      <b>Referenz:</b> ${p.paymentRef}</p>
      ${!provisioned ? '<p style="color:red"><b>⚠️ Provisionierung fehlgeschlagen! Bitte manuell anlegen.</b></p>' : ''}`,
  })

  return { ok: true, anschluss: p.anschluss, nr, nrStr, fullNumber: `${info.nr}-${nrStr}`, pin, provisioned }
}
