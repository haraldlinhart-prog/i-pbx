'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const LOCATIONS = [
  { id: 'ffm1', city: 'Frankfurt', prefix: '069', label: 'Frankfurt Anschluss 1', slots: 10 },
  { id: 'ffm2', city: 'Frankfurt', prefix: '069', label: 'Frankfurt Anschluss 2', slots: 22 },
  { id: 'ber1', city: 'Berlin', prefix: '030', label: 'Berlin Anschluss 1', slots: 23 },
  { id: 'ber2', city: 'Berlin', prefix: '030', label: 'Berlin Anschluss 2', slots: 23 },
]

function OrderInner() {
  const params = useSearchParams()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    location: '',
    with_ki: params.get('plan') === 'ki',
    company: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  const selectedLocation = LOCATIONS.find(l => l.id === form.location)
  const setupFee = 9.90
  const monthlyBase = 4.90
  const monthlyKI = form.with_ki ? 19.90 : 0
  const totalMonthly = monthlyBase + monthlyKI

  const handleCheckout = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Fehler beim Erstellen der Bestellung.')
        setLoading(false)
      }
    } catch {
      setError('Verbindungsfehler. Bitte versuchen Sie es erneut.')
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '.75rem 1rem',
    border: '1.5px solid #E2E8F0', borderRadius: '8px',
    fontFamily: 'var(--font-body)', fontSize: '.9rem',
    color: 'var(--dark)', background: 'white', outline: 'none'
  }

  const labelStyle = {
    display: 'block', fontSize: '.72rem', fontWeight: 600,
    letterSpacing: '.1em', textTransform: 'uppercase' as const,
    color: 'var(--gray-text)', marginBottom: '.4rem'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-bg)', padding: '6rem 1.5rem 3rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <a href="/" style={{ color: 'var(--gray-text)', fontSize: '.85rem' }}>← Zurück zur Startseite</a>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--blue)', margin: '1rem 0 .25rem' }}>
            Rufnummer einrichten
          </h1>
          <p style={{ color: 'var(--gray-text)', fontSize: '.9rem' }}>Deutsche VoIP-Nummer in 3 Schritten — sofort aktiv</p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: '.5rem', marginBottom: '1.5rem' }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= step ? 'var(--blue-light)' : 'var(--border)', transition: 'background .3s' }} />
          ))}
        </div>

        <div style={{ background: 'white', borderRadius: 16, padding: '2.5rem', boxShadow: '0 4px 24px rgba(15,43,91,.08)' }}>

          {/* STEP 1: Standort */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--blue)', marginBottom: '1.5rem' }}>
                Standort & Vorwahl wählen
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '1.5rem' }}>
                {LOCATIONS.map(loc => (
                  <div key={loc.id} onClick={() => setForm(p => ({...p, location: loc.id}))}
                    style={{
                      border: '2px solid ' + (form.location === loc.id ? 'var(--blue-light)' : 'var(--border)'),
                      borderRadius: 10, padding: '1.25rem 1.5rem', cursor: 'pointer',
                      background: form.location === loc.id ? '#EFF6FF' : 'white',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all .2s'
                    }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--blue)', fontSize: '1rem' }}>{loc.label}</div>
                      <div style={{ fontSize: '.85rem', color: 'var(--gray-text)', marginTop: '.2rem' }}>Vorwahl {loc.prefix} · VoIP / SIP / Skype</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: loc.slots < 5 ? '#f59e0b' : 'var(--blue-light)', fontSize: '.9rem' }}>{loc.slots} verfügbar</div>
                      <div style={{ fontSize: '.75rem', color: 'var(--gray-text)' }}>von 25 Slots</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* KI Option */}
              <div style={{ border: '2px solid ' + (form.with_ki ? 'var(--blue-light)' : 'var(--border)'), borderRadius: 10, padding: '1.25rem 1.5rem', marginBottom: '1.5rem', cursor: 'pointer', background: form.with_ki ? '#EFF6FF' : 'white', transition: 'all .2s' }}
                onClick={() => setForm(p => ({...p, with_ki: !p.with_ki}))}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--blue)', display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                      🤖 KI-Sprachassistent hinzufügen
                      <span style={{ background: 'var(--cyan)', color: 'var(--blue)', fontSize: '.65rem', fontWeight: 700, padding: '.2rem .5rem', borderRadius: 100 }}>NEU</span>
                    </div>
                    <div style={{ fontSize: '.85rem', color: 'var(--gray-text)', marginTop: '.2rem' }}>Famulor KI-Assistent · 24/7 automatische Anrufannahme</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: 'var(--blue-light)' }}>+€19,90/Mo</div>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid ' + (form.with_ki ? 'var(--blue-light)' : 'var(--border)'), background: form.with_ki ? 'var(--blue-light)' : 'white', marginLeft: 'auto', marginTop: '.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {form.with_ki && <span style={{ color: 'white', fontSize: '.7rem' }}>✓</span>}
                    </div>
                  </div>
                </div>
              </div>

              <button className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setStep(2)} disabled={!form.location}>
                Weiter →
              </button>
            </div>
          )}

          {/* STEP 2: Kundendaten */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--blue)', marginBottom: '1.5rem' }}>
                Ihre Kontaktdaten
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={labelStyle}>Unternehmen (optional)</label>
                  <input style={inputStyle} value={form.company} onChange={e => setForm(p => ({...p, company: e.target.value}))} placeholder="Ihre Firma GmbH" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={labelStyle}>Name *</label>
                    <input required style={inputStyle} value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Max Mustermann" />
                  </div>
                  <div>
                    <label style={labelStyle}>Telefon</label>
                    <input style={inputStyle} value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} placeholder="+49 XXX XXXXXXX" />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>E-Mail *</label>
                  <input type="email" required style={inputStyle} value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="ihre@email.de" />
                </div>
                <div>
                  <label style={labelStyle}>Anmerkungen (optional)</label>
                  <textarea style={{...inputStyle, resize: 'vertical', minHeight: 80}} value={form.notes} onChange={e => setForm(p => ({...p, notes: e.target.value}))} placeholder="Besondere Anforderungen, gewünschte Durchwahl, etc." />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-outline" style={{ color: 'var(--blue)', borderColor: 'var(--border)', flex: 1, justifyContent: 'center' }}
                  onClick={() => setStep(1)}>← Zurück</button>
                <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}
                  onClick={() => setStep(3)} disabled={!form.name || !form.email}>
                  Weiter →
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Zusammenfassung & Zahlung */}
          {step === 3 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--blue)', marginBottom: '1.5rem' }}>
                Bestellung prüfen & bezahlen
              </h2>

              {/* Summary */}
              <div style={{ background: 'var(--gray-bg)', borderRadius: 10, padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '1rem' }}>Bestellübersicht</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', fontSize: '.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-text)' }}>Standort</span>
                    <span style={{ fontWeight: 500 }}>{selectedLocation?.label}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-text)' }}>Vorwahl</span>
                    <span style={{ fontWeight: 500 }}>{selectedLocation?.prefix}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-text)' }}>KI-Assistent</span>
                    <span style={{ fontWeight: 500 }}>{form.with_ki ? '✓ Ja (Famulor)' : '– Nein'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--gray-text)' }}>Inhaber</span>
                    <span style={{ fontWeight: 500 }}>{form.company || form.name}</span>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', marginTop: '1rem', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.4rem', fontSize: '.9rem' }}>
                    <span style={{ color: 'var(--gray-text)' }}>Einrichtungsgebühr (einmalig)</span>
                    <span style={{ fontWeight: 600 }}>€{setupFee.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.9rem' }}>
                    <span style={{ color: 'var(--gray-text)' }}>Monatliche Gebühr</span>
                    <span style={{ fontWeight: 600 }}>€{totalMonthly.toFixed(2)}/Mo</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '.75rem', paddingTop: '.75rem', borderTop: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 700, color: 'var(--blue)' }}>Heute fällig</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--blue-light)', fontWeight: 700 }}>€{setupFee.toFixed(2)}</span>
                  </div>
                  <div style={{ fontSize: '.75rem', color: 'var(--gray-text)', marginTop: '.4rem', textAlign: 'right' }}>
                    Dann €{totalMonthly.toFixed(2)}/Monat · zzgl. MwSt.
                  </div>
                </div>
              </div>

              <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '.75rem 1rem', marginBottom: '1.25rem', fontSize: '.82rem', color: '#C2410C' }}>
                ℹ️ Die Einrichtung Ihrer Rufnummer erfolgt nach Zahlungseingang innerhalb von 24 Stunden (Werktage). Sie erhalten alle Zugangsdaten per E-Mail.
              </div>

              {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '.75rem 1rem', borderRadius: 8, fontSize: '.85rem', marginBottom: '1rem' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-outline" style={{ color: 'var(--blue)', borderColor: 'var(--border)', flex: 1, justifyContent: 'center' }}
                  onClick={() => setStep(2)}>← Zurück</button>
                <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}
                  onClick={handleCheckout} disabled={loading}>
                  {loading ? 'Weiterleitung…' : `Jetzt zahlen €${setupFee.toFixed(2)} →`}
                </button>
              </div>
              <div style={{ textAlign: 'center', marginTop: '.75rem', fontSize: '.75rem', color: 'var(--gray-text)' }}>
                🔒 Sichere Zahlung via Stripe
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function OrderPage() {
  return <Suspense><OrderInner /></Suspense>
}
