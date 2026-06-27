import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  const { name, email, thema, nachricht, elapsed, website } = await req.json()

  if (website) return NextResponse.json({ ok: true })
  if (!elapsed || elapsed < 3) return NextResponse.json({ error: 'Too fast' }, { status: 400 })
  if (!name || !email || !nachricht) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  if (nachricht.split(' ').some((w: string) => w.length > 60)) return NextResponse.json({ error: 'Spam' }, { status: 400 })
  if (name.length > 80) return NextResponse.json({ error: 'Spam' }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Invalid email' }, { status: 400 })

  try {
    await resend.emails.send({
      from: process.env.CONTACT_FROM || 'noreply@pan21.com',
      to: 'info@i-pbx.eu',
      replyTo: email,
      subject: 'Kontaktanfrage i-PBX.eu – ' + (thema || 'Allgemein') + ' von ' + name,
      html: `
        <h2>Neue Kontaktanfrage – i-PBX.eu</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold;width:120px">Name:</td><td style="padding:8px">${name}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">E-Mail:</td><td style="padding:8px"><a href="mailto:${email}">${email}</a></td></tr>
          <tr><td style="padding:8px;font-weight:bold">Thema:</td><td style="padding:8px">${thema || '–'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold;vertical-align:top">Nachricht:</td><td style="padding:8px">${nachricht.replace(/\n/g, '<br>')}</td></tr>
        </table>
        <p style="color:#999;font-size:12px;margin-top:24px">Gesendet über i-pbx.eu | Verweildauer: ${elapsed}s</p>
      `,
    })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Contact error:', err)
    return NextResponse.json({ error: 'Mail failed' }, { status: 500 })
  }
}
