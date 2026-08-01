// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { fulfillOrder } from '@/lib/fulfillOrder'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

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
  const anschluss = meta.location || ''
  const name    = meta.name    || 'Kunde'
  const email   = meta.email   || session.customer_email || ''
  const company = meta.company || ''
  const with_ki = meta.with_ki === 'true'
  const monthly = parseInt(meta.monthly_fee || '490')

  try {
    const result = await fulfillOrder({
      anschluss,
      name,
      email,
      company,
      phone: meta.phone,
      with_ki,
      desiredNr: meta.desired_nr ? parseInt(meta.desired_nr) : null,
      departmentKeyword: meta.department_keyword,
      monthlyFeeCents: monthly,
      notes: meta.notes,
      paymentMethod: 'stripe',
      paymentRef: session.id,
      paymentNote: 'Hier sind Ihre Zugangsdaten:',
    })
    return NextResponse.json({ received: true, ...result })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json({ received: true })
  }
}
