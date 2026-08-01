// app/api/available-numbers/route.ts
// Liefert bei jedem Aufruf eine neue, zufällige Auswahl echter freier
// i-PBX-Rufnummern als Teaser für die Bestellseite. Kein Caching, damit
// bei jedem Seitenaufruf andere Nummern erscheinen.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const ANSCHLUESSE: Record<string, { label: string; nr: string; digits: number; total: number }> = {
  ffm1: { label: 'Frankfurt · Anschluss 1', nr: '069 9001280', digits: 2, total: 30 },
  ffm2: { label: 'Frankfurt · Anschluss 2', nr: '069 902887', digits: 2, total: 30 },
  ber1: { label: 'Berlin · Anschluss 1', nr: '030 5684450', digits: 2, total: 30 },
  ber2: { label: 'Berlin · Anschluss 2', nr: '030 5684460', digits: 3, total: 299 },
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('ipbx_numbers')
      .select('anschluss, nr, status')
      .eq('status', 'free')

    if (error) throw error

    const byAnschluss: Record<string, number[]> = { ffm1: [], ffm2: [], ber1: [], ber2: [] }
    for (const row of data || []) {
      if (byAnschluss[row.anschluss]) byAnschluss[row.anschluss].push(row.nr)
    }

    // Pro Anschluss 1-2 zufällige freie Nummern für den Teaser ziehen
    const numbers: { anschluss: string; label: string; fullNumber: string }[] = []
    for (const key of Object.keys(ANSCHLUESSE)) {
      const info = ANSCHLUESSE[key]
      const picks = shuffle(byAnschluss[key] || []).slice(0, 2)
      for (const nr of picks) {
        const nrStr = String(nr).padStart(info.digits, '0')
        numbers.push({ anschluss: key, label: info.label, fullNumber: `${info.nr}-${nrStr}` })
      }
    }

    const counts = Object.keys(ANSCHLUESSE).map((key) => ({
      anschluss: key,
      label: ANSCHLUESSE[key].label,
      free: (byAnschluss[key] || []).length,
      total: ANSCHLUESSE[key].total,
    }))

    return NextResponse.json(
      { numbers: shuffle(numbers), counts },
      { headers: { 'Cache-Control': 'no-store, max-age=0' } }
    )
  } catch (err: any) {
    console.error('available-numbers error:', err)
    return NextResponse.json({ numbers: [], counts: [] }, { status: 200 })
  }
}
