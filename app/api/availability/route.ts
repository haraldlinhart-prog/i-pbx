// app/api/availability/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const TOTALS: Record<string, number> = { ffm1: 30, ffm2: 30, ber1: 30, ber2: 299 }

export async function GET() {
  try {
    const { data, error } = await getSupabase()
      .from('ipbx_numbers')
      .select('anschluss, status')

    if (error) throw error

    const result: Record<string, { free: number; total: number }> = {
      ffm1: { free: 0, total: TOTALS.ffm1 },
      ffm2: { free: 0, total: TOTALS.ffm2 },
      ber1: { free: 0, total: TOTALS.ber1 },
      ber2: { free: 0, total: TOTALS.ber2 },
    }

    for (const row of data || []) {
      if (row.status === 'free' && result[row.anschluss]) {
        result[row.anschluss].free += 1
      }
    }

    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Availability error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
