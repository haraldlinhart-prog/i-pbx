import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { Resend } from 'resend'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })
const resend = new Resend(process.env.RESEND_API_KEY!)

const LOCATION_LABELS: Record<string, string> = {
  ffm1: 'Frankfurt Anschluss 1 (069)',
  ffm2: 'Frankfurt Anschluss 2 (069)',
  ber1: 'Berlin Anschluss 1 (030)',
  ber2: 'Berlin Anschluss 2 (030)',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { location, with_ki, company, name, email, phone, notes } = body

    if (!location || !name || !email) {
      return NextResponse.json({ error: 'Pflichtfelder fehlen' }, { status: 400 })
    }

    const locationLabel = LOCATION_LABELS[location] || location
    const setupFee = 990 // cents
    const monthlyFee = with_ki ? 2480 : 490 // cents

    // Stripe Checkout: einmalige Einrichtungsgebühr
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'i-PBX Rufnummer – ' + locationLabel,
              description: 'Einrichtungsgebühr (einmalig) · Dann €' + (monthlyFee/100).toFixed(2) + '/Monat' + (with_ki ? ' inkl. KI-Assistent' : ''),
            },
            unit_amount: setupFee,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: process.env.NEXT_PUBLIC_SITE_URL + '/confirm?session={CHECKOUT_SESSION_ID}',
      cancel_url: process.env.NEXT_PUBLIC_SITE_URL + '/order?cancelled=1',
      customer_email: email,
      metadata: {
        location,
        with_ki: with_ki ? 'true' : 'false',
        company: company || '',
        name,
        email,
        phone: phone || '',
        notes: notes || '',
        monthly_fee: monthlyFee.toString(),
      },
    })

    // Notification email to admin
    await resend.emails.send({
      from: process.env.CONTACT_FROM || 'noreply@pan21.com',
      to: 'info@i-pbx.eu',
      subject: 'Neue i-PBX Bestellung – ' + locationLabel,
      html: `
        <h2>Neue Bestellung – i-PBX.eu</h2>
        <table style="border-collapse:collapse;width:100%">
          <tr><td style="padding:8px;font-weight:bold">Standort:</td><td style="padding:8px">${locationLabel}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">KI-Assistent:</td><td style="padding:8px">${with_ki ? 'Ja (Famulor) +€19,90/Mo' : 'Nein'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Unternehmen:</td><td style="padding:8px">${company || '–'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Name:</td><td style="padding:8px">${name}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">E-Mail:</td><td style="padding:8px">${email}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Telefon:</td><td style="padding:8px">${phone || '–'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Anmerkungen:</td><td style="padding:8px">${notes || '–'}</td></tr>
          <tr><td style="padding:8px;font-weight:bold">Stripe Session:</td><td style="padding:8px">${session.id}</td></tr>
        </table>
        <p style="color:#999;font-size:12px;margin-top:24px">
          Zahlung noch ausstehend. Nach Zahlungseingang bitte Rufnummer einrichten und Zugangsdaten an ${email} senden.
          <br>TODO (Montag): i-PBX Subscriber API + Famulor automatisch triggern.
        </p>
      `,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Order error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
