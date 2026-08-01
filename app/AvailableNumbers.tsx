'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type NumberItem = { anschluss: string; label: string; fullNumber: string }
type CountItem = { anschluss: string; label: string; free: number; total: number }

export default function AvailableNumbers() {
  const [numbers, setNumbers] = useState<NumberItem[]>([])
  const [counts, setCounts] = useState<CountItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/available-numbers', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data) => {
        setNumbers(data.numbers || [])
        setCounts(data.counts || [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(0,180,216,.25)', borderRadius: 'var(--radius-lg)', padding: '2rem', backdropFilter: 'blur(10px)' }}>
      <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,180,216,.2)' }}>
        Verfügbare Rufnummern
      </div>

      {loading ? (
        <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.5)', padding: '1rem 0' }}>Lade freie Nummern …</div>
      ) : (
        <>
          {numbers.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginBottom: '1.25rem' }}>
              {numbers.slice(0, 5).map((n, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(0,180,216,.08)', border: '1px solid rgba(0,180,216,.18)',
                  borderRadius: 8, padding: '.55rem .8rem'
                }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '.92rem', color: 'white', fontWeight: 600, letterSpacing: '.02em' }}>
                    {n.fullNumber}
                  </span>
                  <span style={{ fontSize: '.68rem', color: 'rgba(255,255,255,.5)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                    {n.label.split('·')[0].trim()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {counts.map((item, i) => (
            <div key={i} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.35rem' }}>
                <span style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.8)' }}>{item.label}</span>
                <span style={{ fontSize: '.78rem', color: item.free < 5 ? '#f59e0b' : 'var(--cyan)', fontWeight: 600 }}>{item.free} frei</span>
              </div>
              <div style={{ height: 5, background: 'rgba(255,255,255,.1)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: (item.total ? (item.free / item.total * 100) : 0) + '%', background: item.free < 5 ? '#f59e0b' : 'var(--cyan)', borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </>
      )}

      <Link href="/order" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
        Nummer jetzt sichern →
      </Link>
    </div>
  )
}
