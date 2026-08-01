// app/api/directory-lookup/route.ts
// Wird vom Famulor-Mid-Call-Tool aufgerufen, wenn der KI-Empfangsassistent
// einen gesprochenen Namen/Firmenname/Abteilung/Durchwahl einer Nebenstelle
// zuordnen muss.
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

function normalizeDurchwahl(s: string): string | null {
  // Erkennt 1-3-stellige gesprochene/geschriebene Zahlen (z.B. "47", "047", "null vier sieben")
  const digits = String(s || '').replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length > 3) return null;
  return digits.padStart(3, '0');
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const anschluss = String(body.anschluss || '').trim()
    const rawQuery = String(body.name || '').trim()
    const query = normalize(rawQuery)
    const durchwahlQuery = normalizeDurchwahl(rawQuery)

    if (!anschluss || !rawQuery) {
      return NextResponse.json({ found: false, message: 'Anschluss oder Name fehlt.' })
    }

    const { data, error } = await getSupabase()
      .from('ipbx_directory')
      .select('employee_name, aliases, department, company_display_name, durchwahl, extension, transfer_type')
      .eq('anschluss', anschluss)
      .eq('active', true)

    if (error) throw error
    const rows = data || []

    // 1) Durchwahl hat Vorrang, falls die Eingabe wie eine 1-3-stellige Zahl aussieht
    //    (eindeutig, kein Rätselraten nötig)
    if (durchwahlQuery) {
      const byDurchwahl = rows.find((row) => row.durchwahl === durchwahlQuery)
      if (byDurchwahl) {
        return NextResponse.json({
          found: true,
          employee_name: byDurchwahl.employee_name,
          company_display_name: byDurchwahl.company_display_name,
          department: byDurchwahl.department,
          durchwahl: byDurchwahl.durchwahl,
          extension: byDurchwahl.extension,
          transfer_type: byDurchwahl.transfer_type,
        })
      }
    }

    // 2) Name / Firmenname / Abteilung / Aliase durchsuchen
    const candidates = rows.filter((row) => {
      const names = [row.employee_name, row.department, row.company_display_name, ...(row.aliases || [])]
        .filter(Boolean)
        .map((n: string) => normalize(n))
      return names.some((n) => n.includes(query) || query.includes(n))
    })

    if (candidates.length === 0) {
      return NextResponse.json({
        found: false,
        message: `Keine Nebenstelle für "${rawQuery}" gefunden. Bitte nach Name, Firmenname, Abteilung oder dreistelliger Durchwahl fragen.`,
      })
    }

    if (candidates.length > 1) {
      return NextResponse.json({
        found: false,
        ambiguous: true,
        options: candidates.map((c) => ({
          name: c.employee_name,
          company: c.company_display_name,
          department: c.department,
        })),
        message: 'Mehrere Treffer gefunden, bitte beim Anrufer nachfragen, wen genau er meint (oder nach der dreistelligen Durchwahl fragen).',
      })
    }

    const match = candidates[0]
    return NextResponse.json({
      found: true,
      employee_name: match.employee_name,
      company_display_name: match.company_display_name,
      department: match.department,
      durchwahl: match.durchwahl,
      extension: match.extension,
      transfer_type: match.transfer_type,
    })
  } catch (err: any) {
    console.error('directory-lookup error:', err)
    return NextResponse.json({ found: false, message: 'Interner Fehler bei der Suche.' }, { status: 200 })
  }
}

