'use client'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('cookieConsent')) setShow(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookieConsent', 'accepted')
    setShow(false)
    if (window._paq) window._paq.push(['rememberConsentGiven'])
  }

  const decline = () => {
    localStorage.setItem('cookieConsent', 'declined')
    setShow(false)
  }

  if (!show) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 999,
      background: 'var(--blue)', borderTop: '2px solid var(--cyan)',
      padding: '1.25rem 2rem', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap'
    }}>
      <p style={{ color: 'rgba(255,255,255,.85)', fontSize: '.875rem', flex: 1, minWidth: 200 }}>
        Wir verwenden Cookies und Analyse-Tools (Matomo) zur Verbesserung unseres Angebots.
        Mehr in unserer <a href="#datenschutz" style={{ color: 'var(--cyan)' }}>Datenschutzerklärung</a>.
      </p>
      <div style={{ display: 'flex', gap: '.75rem', flexShrink: 0 }}>
        <button onClick={decline} style={{
          padding: '.5rem 1.25rem', borderRadius: '4px', fontSize: '.875rem',
          fontWeight: 600, cursor: 'pointer', background: 'transparent',
          color: 'rgba(255,255,255,.6)', border: '1px solid rgba(255,255,255,.2)',
          fontFamily: 'var(--font-body)'
        }}>Ablehnen</button>
        <button onClick={accept} style={{
          padding: '.5rem 1.25rem', borderRadius: '4px', fontSize: '.875rem',
          fontWeight: 600, cursor: 'pointer', background: 'var(--cyan)',
          color: 'var(--blue)', border: 'none', fontFamily: 'var(--font-body)'
        }}>Akzeptieren</button>
      </div>
    </div>
  )
}
