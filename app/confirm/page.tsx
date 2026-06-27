'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ConfirmInner() {
  const params = useSearchParams()
  const session = params.get('session')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: 'white', borderRadius: 16, padding: '3rem', maxWidth: 520, width: '100%', textAlign: 'center', boxShadow: '0 12px 48px rgba(15,43,91,.12)' }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--blue)', marginBottom: '.5rem' }}>
          Zahlung erfolgreich!
        </h1>
        <p style={{ color: 'var(--gray-text)', marginBottom: '2rem', lineHeight: 1.7 }}>
          Vielen Dank für Ihre Bestellung. Ihre Rufnummer wird innerhalb von <strong>24 Stunden</strong> (Werktage) eingerichtet. Sie erhalten alle Zugangsdaten per E-Mail.
        </p>

        <div style={{ background: 'var(--gray-bg)', borderRadius: 10, padding: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
          <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '1rem' }}>Nächste Schritte</div>
          {[
            { icon: '📧', text: 'Sie erhalten eine Bestätigungs-E-Mail mit Ihrer Bestellnummer' },
            { icon: '⚙️', text: 'Unser Team richtet Ihre Rufnummer innerhalb von 24 Stunden ein' },
            { icon: '📱', text: 'Sie erhalten Ihre SIP/VoIP-Zugangsdaten per E-Mail' },
            { icon: '🤖', text: 'Falls KI-Assistent gewählt: Konfiguration folgt separat per E-Mail' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: '.75rem', alignItems: 'flex-start', marginBottom: '.75rem', fontSize: '.875rem', color: 'var(--dark)' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <p style={{ fontSize: '.8rem', color: 'var(--gray-text)', marginBottom: '1.5rem' }}>
          Fragen? Schreiben Sie uns: <a href="mailto:info@i-pbx.eu" style={{ color: 'var(--blue-light)' }}>info@i-pbx.eu</a>
        </p>

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'var(--blue)', color: 'white', padding: '.875rem 2rem', borderRadius: 8, fontWeight: 600, fontSize: '.9rem' }}>
          Zurück zur Startseite
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmPage() {
  return <Suspense><ConfirmInner /></Suspense>
}
