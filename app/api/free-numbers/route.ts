// app/api/free-numbers/route.ts
// Liefert die Liste der tatsächlich freien Rufnummern für einen Anschluss,
// damit Kunden im Bestellformular eine Wunschnummer auswählen können.
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ANSCHLUESSE: Record<string, { nr: string; digits: number }> = {
  ffm1: { nr: '069 9001280', digits: 2 },
  ffm2: { nr: '069 902887', digits: 2 },
  ber1: { nr: '030 5684450', digits: 2 },
  ber2: { nr: '030 5684460', digits: 3 },
}

export async function GET(req: NextRequest) {
  try {
    const anschluss = req.nextUrl.searchParams.get('anschluss') || ''
    const info = ANSCHLUESSE[anschluss]
    if (!info) {
      return NextResponse.json({ error: 'Ungültiger Anschluss' }, { status: 400 })
    }

    const { data, error } = await getSupabase()
      .from('ipbx_numbers')
      .select('nr')
      .eq('anschluss', anschluss)
      .eq('status', 'free')
      .order('nr', { ascending: true })
      .limit(300)

    if (error) throw error

    const numbers = (data || []).map((row) => {
      const nrStr = String(row.nr).padStart(info.digits, '0')
      return { nr: row.nr, display: `${info.nr}-${nrStr}` }
    })

    return NextResponse.json({ numbers })
  } catch (err: any) {
    console.error('free-numbers error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
