'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmInner() {
  const params = useSearchParams()
  const session = params.get('session')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '3rem', maxWidth: 540, width: '100%', textAlign: 'center', boxShadow: '0 12px 48px rgba(15,43,91,.12)' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--blue)', marginBottom: '.5rem' }}>
          Zahlung erfolgreich!
        </h1>
        <p style={{ color: 'var(--gray-text)', marginBottom: '2rem', lineHeight: 1.7 }}>
          Vielen Dank für Ihre Bestellung. Ihre Nebenstelle wird soeben automatisch eingerichtet.
          Sie erhalten <strong>in wenigen Minuten</strong> eine E-Mail mit allen Zugangsdaten.
        </p>

        <div style={{ background: '#f0f7ff', borderRadius: 10, padding: '1.5rem', marginBottom: '2rem', textAlign: 'left', borderLeft: '4px solid var(--blue)' }}>
          <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '1rem' }}>Was Sie erhalten</div>
          {[
            { icon: '📧', text: 'E-Mail mit Nebenstelle, PIN und Ihren 4 Rufnummern (Frankfurt + Berlin)' },
            { icon: '🔐', text: 'Direkter Login-Link zum i-PBX Admin-Portal' },
            { icon: '📱', text: 'SIP/VoIP-Zugangsdaten für Ihr Telefon oder die i-PBX App' },
            { icon: '🤖', text: 'KI-Assistent: Konfiguration folgt separat (falls gebucht)' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start', marginBottom: '.75rem', fontSize: '.875rem', color: 'var(--dark)' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff3e0', borderRadius: 8, padding: '1rem', marginBottom: '2rem', fontSize: '.85rem', color: '#e65100' }}>
          <strong>Keine E-Mail erhalten?</strong> Bitte prüfen Sie Ihren Spam-Ordner oder schreiben Sie uns:{' '}
          <a href="mailto:info@i-pbx.eu" style={{ color: '#e65100' }}>info@i-pbx.eu</a>
        </div>

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--blue)', color: 'white', padding: '.875rem 2rem', borderRadius: 8, fontWeight: 600, fontSize: '.9rem', textDecoration: 'none' }}>
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return <Suspense><ConfirmInner /></Suspense>
}
