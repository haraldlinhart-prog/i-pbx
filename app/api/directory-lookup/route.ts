// app/api/directory-lookup/route.ts
// Wird vom Famulor-Mid-Call-Tool aufgerufen, wenn der KI-Empfangsassistent
// einen gesprochenen Namen/Abteilung einer Nebenstelle zuordnen muss.
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/herr|frau|herrn|dr\.|prof\./g, '')
    .replace(/[^a-zäöüß\s]/g, '')
    .trim()
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const anschluss = String(body.anschluss || '').trim()
    const query = normalize(String(body.name || ''))

    if (!anschluss || !query) {
      return NextResponse.json({ found: false, message: 'Anschluss oder Name fehlt.' })
    }

    const { data, error } = await getSupabase()
      .from('ipbx_directory')
      .select('employee_name, aliases, department, extension, transfer_type')
      .eq('anschluss', anschluss)
      .eq('active', true)

    if (error) throw error

    const candidates = (data || []).filter((row) => {
      const names = [row.employee_name, row.department, ...(row.aliases || [])]
        .filter(Boolean)
        .map((n: string) => normalize(n))
      return names.some((n) => n.includes(query) || query.includes(n))
    })

    if (candidates.length === 0) {
      return NextResponse.json({
        found: false,
        message: `Keine Nebenstelle für "${body.name}" gefunden. Bitte nach genauerem Namen oder Abteilung fragen.`,
      })
    }

    if (candidates.length > 1) {
      return NextResponse.json({
        found: false,
        ambiguous: true,
        options: candidates.map((c) => ({ name: c.employee_name, department: c.department })),
        message: 'Mehrere Treffer gefunden, bitte beim Anrufer nachfragen, wen genau er meint.',
      })
    }

    const match = candidates[0]
    return NextResponse.json({
      found: true,
      employee_name: match.employee_name,
      department: match.department,
      extension: match.extension,
      transfer_type: match.transfer_type,
    })
  } catch (err: any) {
    console.error('directory-lookup error:', err)
    return NextResponse.json({ found: false, message: 'Interner Fehler bei der Suche.' }, { status: 200 })
  }
}
