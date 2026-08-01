'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

const LOCATIONS = [
  { id: 'ffm1', city: 'Frankfurt', prefix: '069', label: 'Frankfurt Anschluss 1' },
  { id: 'ffm2', city: 'Frankfurt', prefix: '069', label: 'Frankfurt Anschluss 2' },
  { id: 'ber1', city: 'Berlin', prefix: '030', label: 'Berlin Anschluss 1' },
  { id: 'ber2', city: 'Berlin', prefix: '030', label: 'Berlin Anschluss 2' },
]

type Availability = Record<string, { free: number; total: number }>

function OrderInner() {
  const params = useSearchParams()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [availability, setAvailability] = useState<Availability>({})
  const [freeNumbers, setFreeNumbers] = useState<{ nr: number; display: string }[]>([])
  const [numbersLoading, setNumbersLoading] = useState(false)

  const [form, setForm] = useState({
    location: '',
    with_ki: params.get('plan') === 'ki',
    company: '',
    name: '',
    email: '',
    phone: '',
    notes: '',
    department_keyword: '',
    desired_nr: null as number | null,
  })

  useEffect(() => {
    fetch('/api/availability')
      .then(r => r.json())
      .then(data => setAvailability(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!form.location) { setFreeNumbers([]); return }
    setNumbersLoading(true)
    fetch('/api/free-numbers?anschluss=' + form.location)
      .then(r => r.json())
      .then(data => setFreeNumbers(data.numbers || []))
      .catch(() => setFreeNumbers([]))
      .finally(() => setNumbersLoading(false))
  }, [form.location])

  // --- EUROPAN-Zahlung (Single-Item-Variante des EUROPAN-Widget-Standards) ---
  const [epEmail, setEpEmail] = useState('')
  const [epPin, setEpPin] = useState('')
  const [epChecking, setEpChecking] = useState(false)
  const [epError, setEpError] = useState('')
  const [epVerified, setEpVerified] = useState(false)
  const [epBalance, setEpBalance] = useState<number | null>(null)
  const [epBonusChoice, setEpBonusChoice] = useState<'now' | 'save'>('now')
  const [epPaying, setEpPaying] = useState(false)
  const [epResult, setEpResult] = useState<any>(null)

  const EP_BONUS_PCT = 0.02
  const EP_DOPPELWUMS_PCT = 0.03
  const SETUP_FEE = 9.90

  const epBonus = SETUP_FEE * EP_BONUS_PCT
  const epBonusApplied = epBonusChoice === 'now' ? epBonus : 0
  const epAfterBonus = Math.max(0, SETUP_FEE - epBonusApplied)
  const epDoppelWums = SETUP_FEE * EP_DOPPELWUMS_PCT
  const epFullyCovered = epVerified && epBalance !== null && epBalance >= epAfterBonus
  const epDoppelWumsApplied = epFullyCovered ? epDoppelWums : 0
  const epTotal = Math.max(0, epAfterBonus - epDoppelWumsApplied)
  const epTotalSaved = SETUP_FEE - epTotal

  const fmtEur = (n: number) => '€' + (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2).replace('.', ','))
  const fmtEp = (n: number) => ')( ' + (n % 1 === 0 ? n.toFixed(0) : n.toFixed(2).replace('.', ','))

  const checkEuropanBalance = async () => {
    setEpChecking(true)
    setEpError('')
    try {
      const res = await fetch('/api/europan-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: epEmail, pin: epPin }),
      })
      const data = await res.json()
      if (res.ok) {
        setEpVerified(true)
        setEpBalance(data.balance)
      } else {
        setEpError(data.error || 'Prüfung fehlgeschlagen.')
        setEpVerified(false)
      }
    } catch {
      setEpError('Verbindungsfehler.')
    } finally {
      setEpChecking(false)
    }
  }

  const payWithEuropan = async () => {
    if (form.with_ki && !form.department_keyword.trim()) {
      setEpError('Bitte ein Fallback-Stichwort (z.B. Ihre Abteilung) angeben — wichtig, falls der KI-Assistent Ihren Namen mal nicht versteht.')
      return
    }
    setEpPaying(true)
    setEpError('')
    try {
      const res = await fetch('/api/europan-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: epEmail, pin: epPin, anschluss: form.location,
          bonusChoice: epBonusChoice, with_ki: form.with_ki,
          company: form.company, name: form.name, phone: form.phone, notes: form.notes,
          department_keyword: form.department_keyword,
          desired_nr: form.desired_nr,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setEpResult(data)
      } else {
        setEpError(data.error || 'Zahlung fehlgeschlagen.')
      }
    } catch {
      setEpError('Verbindungsfehler.')
    } finally {
      setEpPaying(false)
    }
  }

  const selectedLocation = LOCATIONS.find(l => l.id === form.location)
  const setupFee = 9.90
  const monthlyBase = 4.90
  const monthlyKI = form.with_ki ? 19.90 : 0
  const totalMonthly = monthlyBase + monthlyKI

  const handleCheckout = async () => {
    if (form.with_ki && !form.department_keyword.trim()) {
      setError('Bitte ein Fallback-Stichwort (z.B. Ihre Abteilung) angeben — wichtig, falls der KI-Assistent Ihren Namen mal nicht versteht.')
      return
    }
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
            Ihr 24-Stunden-Office-Service
          </h1>
          <p style={{ color: 'var(--gray-text)', fontSize: '.9rem' }}>Nicht nur eine Rufnummer — eine echte Telefonzentrale, die für Sie erreichbar ist</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg,#0f2b5b,#1a4a9b)', borderRadius: 16, padding: '2rem 2.25rem', marginBottom: '1.5rem', color: 'white' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '.9rem' }}>
            Was Sie hier eigentlich bekommen
          </h2>
          <p style={{ fontSize: '.92rem', lineHeight: 1.7, color: 'rgba(255,255,255,.92)', marginBottom: '1rem' }}>
            Eine deutsche Telefonnummer allein macht noch keinen professionellen Auftritt. Deshalb bieten wir mehr: Ihre Nummer ist Teil einer <strong>echten 24-Stunden-Telefonzentrale</strong>.
            Wenn jemand anruft, meldet sich unser KI-gestützter Empfang — genau wie bei einer großen, etablierten Firma — und verbindet den Anrufer direkt zu Ihnen durch, egal ob Sie über die IRIS-App,
            ein Tischtelefon oder unterwegs erreichbar sind.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
            <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 10, padding: '1rem 1.1rem' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '.4rem' }}>☎️</div>
              <div style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: '.3rem' }}>Professionelle Zentrale</div>
              <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.75)', lineHeight: 1.5 }}>Anrufer werden namentlich begrüßt und direkt zu Ihnen oder Ihrer Abteilung durchgestellt — wie bei einem großen Unternehmen mit eigenem Empfang.</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 10, padding: '1rem 1.1rem' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '.4rem' }}>🌍</div>
              <div style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: '.3rem' }}>Rund um die Uhr erreichbar</div>
              <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.75)', lineHeight: 1.5 }}>Kein Anruf geht verloren, auch nachts oder am Wochenende — die Zentrale nimmt jederzeit ab und leitet weiter oder notiert eine Nachricht.</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.08)', borderRadius: 10, padding: '1rem 1.1rem' }}>
              <div style={{ fontSize: '1.3rem', marginBottom: '.4rem' }}>📱</div>
              <div style={{ fontWeight: 700, fontSize: '.88rem', marginBottom: '.3rem' }}>Erreichbar, wo Sie sind</div>
              <div style={{ fontSize: '.78rem', color: 'rgba(255,255,255,.75)', lineHeight: 1.5 }}>Über die kostenlose IRIS-App auf dem Smartphone oder ein Tischtelefon — Ihre Durchwahl klingelt dort, wo Sie gerade sind.</div>
            </div>
          </div>
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
                {LOCATIONS.map(loc => {
                  const avail = availability[loc.id]
                  const free = avail?.free
                  const total = avail?.total
                  const low = free !== undefined && total !== undefined && free < total * 0.15
                  return (
                  <div key={loc.id} onClick={() => free !== 0 && setForm(p => ({...p, location: loc.id}))}
                    style={{
                      border: '2px solid ' + (form.location === loc.id ? 'var(--blue-light)' : 'var(--border)'),
                      borderRadius: 10, padding: '1.25rem 1.5rem',
                      cursor: free === 0 ? 'not-allowed' : 'pointer',
                      opacity: free === 0 ? 0.5 : 1,
                      background: form.location === loc.id ? '#EFF6FF' : 'white',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      transition: 'all .2s'
                    }}>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--blue)', fontSize: '1rem' }}>{loc.label}</div>
                      <div style={{ fontSize: '.85rem', color: 'var(--gray-text)', marginTop: '.2rem' }}>Vorwahl {loc.prefix} · VoIP / SIP / Skype</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: free === 0 ? '#dc2626' : low ? '#f59e0b' : 'var(--blue-light)', fontSize: '.9rem' }}>
                        {free === undefined ? '…' : free === 0 ? 'ausgebucht' : `${free} verfügbar`}
                      </div>
                      <div style={{ fontSize: '.75rem', color: 'var(--gray-text)' }}>{total !== undefined ? `von ${total} Slots` : ''}</div>
                    </div>
                  </div>
                  )
                })}
              </div>

              {form.location && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={labelStyle}>Rufnummer</label>
                  <div
                    onClick={() => setForm(p => ({...p, desired_nr: null}))}
                    style={{
                      border: '1.5px solid ' + (form.desired_nr === null ? 'var(--blue-light)' : 'var(--border)'),
                      borderRadius: 8, padding: '.7rem 1rem', marginBottom: '.6rem', cursor: 'pointer',
                      background: form.desired_nr === null ? '#EFF6FF' : 'white', fontSize: '.88rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                    <span>🎲 Automatisch zuteilen (nächste freie Nummer)</span>
                    {form.desired_nr === null && <span style={{ color: 'var(--blue-light)', fontWeight: 700 }}>✓</span>}
                  </div>

                  {numbersLoading ? (
                    <div style={{ fontSize: '.82rem', color: 'var(--gray-text)', padding: '.5rem' }}>Lade verfügbare Nummern …</div>
                  ) : freeNumbers.length > 0 && (
                    <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: '.5rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '.4rem' }}>
                        {freeNumbers.map(n => (
                          <div key={n.nr} onClick={() => setForm(p => ({...p, desired_nr: n.nr}))}
                            style={{
                              border: '1.5px solid ' + (form.desired_nr === n.nr ? 'var(--blue-light)' : 'var(--border)'),
                              borderRadius: 6, padding: '.5rem .7rem', cursor: 'pointer', fontSize: '.82rem',
                              background: form.desired_nr === n.nr ? '#EFF6FF' : 'white', textAlign: 'center',
                              fontWeight: form.desired_nr === n.nr ? 700 : 400,
                            }}>
                            {n.display}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p style={{ fontSize: '.75rem', color: 'var(--gray-text)', marginTop: '.4rem' }}>
                    Wunschnummer wird bis zum Zahlungsabschluss für Sie reserviert, aber nicht garantiert — bei sehr schneller Doppelbuchung erhalten Sie automatisch die nächste freie Nummer.
                  </p>
                </div>
              )}

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
                {form.with_ki && (
                  <div style={{ background: '#EFF6FF', border: '1px solid var(--blue-light)', borderRadius: 8, padding: '1rem 1.1rem' }}>
                    <label style={labelStyle}>Fallback-Stichwort für den KI-Assistenten *</label>
                    <input required style={inputStyle} value={form.department_keyword}
                      onChange={e => setForm(p => ({...p, department_keyword: e.target.value}))}
                      placeholder="z.B. Ihre Abteilung oder ein eindeutiges Kennwort" />
                    <p style={{ fontSize: '.78rem', color: 'var(--text-light)', marginTop: '.4rem', marginBottom: 0 }}>
                      Falls unser KI-Assistent Ihren Namen am Telefon einmal nicht versteht, fragt er stattdessen nach diesem Stichwort — muss auf Ihrem Anschluss einzigartig sein.
                    </p>
                  </div>
                )}
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
          {step === 3 && epResult && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: '#0d5c33', marginBottom: '1rem' }}>
                ✅ Bezahlt mit EUROPAN — Ihre Nummer ist aktiv
              </h2>
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '1.5rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                  <span style={{ color: 'var(--gray-text)' }}>Rufnummer</span>
                  <strong>{epResult.fullNumber}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                  <span style={{ color: 'var(--gray-text)' }}>Bezahlt mit EUROPAN</span>
                  <strong>{fmtEp(epResult.amount_paid)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--gray-text)' }}>Neues Guthaben</span>
                  <strong>{fmtEp(epResult.new_balance)}</strong>
                </div>
              </div>
              <p style={{ fontSize: '.9rem', color: 'var(--gray-text)' }}>Ihre Zugangsdaten (PIN, SIP-Einrichtung) haben wir gerade an {form.email} gesendet.</p>
              <a href="/" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>Zurück zur Startseite</a>
            </div>
          )}

          {step === 3 && !epResult && (
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

              {/* EUROPAN-Zahlung */}
              <div style={{ border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--blue)' }}>Mit EUROPAN-Guthaben bezahlen</div>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#e5f6ec', color: '#1b7a3d', fontSize: '.75rem', fontWeight: 600, padding: '.25rem .6rem', borderRadius: 100 }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1b7a3d', display: 'inline-block' }} />
                    {epVerified ? 'Aktiv' : 'Bereit – anmelden'}
                  </span>
                </div>

                {!epVerified && (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: '.6rem', alignItems: 'end' }}>
                      <div>
                        <label style={labelStyle}>E-Mail (EUROPAN)</label>
                        <input style={inputStyle} type="email" value={epEmail} onChange={e => setEpEmail(e.target.value)} placeholder="ihre@email.de" />
                      </div>
                      <div>
                        <label style={labelStyle}>PIN</label>
                        <input style={inputStyle} maxLength={4} value={epPin} onChange={e => setEpPin(e.target.value.replace(/\D/g, ''))} placeholder="1234" />
                      </div>
                      <button className="btn-outline" style={{ color: 'var(--blue)', borderColor: 'var(--border)', whiteSpace: 'nowrap' }}
                        onClick={checkEuropanBalance} disabled={epChecking || !epEmail || epPin.length !== 4}>
                        {epChecking ? 'Prüfe…' : 'Guthaben prüfen'}
                      </button>
                    </div>
                    <p style={{ fontSize: '.78rem', color: 'var(--gray-text)', marginTop: '.6rem' }}>
                      Ihre PIN aus der EUROPAN-Bestellbestätigung. Noch kein Guthaben? <a href="https://europan.group/buy" target="_blank" style={{ color: 'var(--blue)', fontWeight: 600 }}>Auf europan.group aufladen →</a>
                    </p>
                  </>
                )}

                {epVerified && (
                  <div>
                    <div style={{ fontSize: '.85rem', color: 'var(--gray-text)', marginBottom: '1rem' }}>
                      Ihr aktuelles EUROPAN-Guthaben beträgt <strong>{fmtEp(epBalance || 0)}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '.85rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="radio" checked={epBonusChoice === 'now'} onChange={() => setEpBonusChoice('now')} />
                        Jetzt für diese Bestellung einsetzen
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                        <input type="radio" checked={epBonusChoice === 'save'} onChange={() => setEpBonusChoice('save')} />
                        Auf meinem Guthaben sparen
                      </label>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem', fontSize: '.88rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--gray-text)' }}>Einrichtungsgebühr</span>
                        <span>{fmtEur(SETUP_FEE)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--gray-text)' }}>EUROPAN-Bonus (2%)</span>
                        <span>{epBonusChoice === 'now' ? `-${fmtEp(epBonus)}` : 'wird gespart'}</span>
                      </div>
                      {epFullyCovered ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1b7a3d' }}>
                          <span>Doppel-Wums-Bonus (3%)</span>
                          <span>-{fmtEp(epDoppelWumsApplied)}</span>
                        </div>
                      ) : (
                        <div style={{ background: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 8, padding: '.6rem .8rem', fontSize: '.8rem', color: '#C2410C' }}>
                          💡 Ihnen fehlen noch {fmtEp(Math.max(0, epAfterBonus - (epBalance || 0)))}, um diese Bestellung komplett zu decken und den Doppel-Wums-Bonus freizuschalten (zusätzlich {fmtEur(epDoppelWums)} Ersparnis).
                        </div>
                      )}
                      {epFullyCovered && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: 'var(--gray-text)' }}>Wird mit EUROPAN-Guthaben bezahlt</span>
                          <span>-{fmtEur(epTotal)}</span>
                        </div>
                      )}
                      {epTotalSaved > 0.004 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: '#1b7a3d' }}>
                          <span>Sie sparen heute mit EUROPAN</span>
                          <span>{fmtEur(epTotalSaved)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '.5rem', marginTop: '.3rem', fontWeight: 700 }}>
                        <span>Gesamt</span>
                        <span>{fmtEur(epTotal)}</span>
                      </div>
                    </div>

                    <button
                      style={{
                        width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 8,
                        padding: '.875rem 2rem', borderRadius: 8, fontWeight: 600, fontSize: '.95rem', border: 'none', cursor: epFullyCovered ? 'pointer' : 'not-allowed',
                        background: epFullyCovered ? '#0d5c33' : '#E2E8F0', color: epFullyCovered ? '#fff' : 'var(--gray-text)',
                      }}
                      onClick={payWithEuropan} disabled={!epFullyCovered || epPaying || !form.location}
                    >
                      {epPaying ? 'Wird bezahlt…' : `Jetzt mit EUROPAN bezahlen ${fmtEur(epTotal)}`}
                    </button>
                    {!form.location && <p style={{ fontSize: '.75rem', color: '#C2410C', marginTop: '.5rem' }}>Bitte zuerst einen Anschluss in Schritt 1 wählen.</p>}
                  </div>
                )}

                {epError && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '.6rem .8rem', borderRadius: 8, fontSize: '.82rem', marginTop: '.75rem' }}>{epError}</div>}
              </div>

              <div style={{ textAlign: 'center', fontSize: '.8rem', color: 'var(--gray-text)', margin: '1rem 0' }}>— oder —</div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-outline" style={{ color: 'var(--blue)', borderColor: 'var(--border)', flex: 1, justifyContent: 'center' }}
                  onClick={() => setStep(2)}>← Zurück</button>
                <button className="btn-primary" style={{ flex: 2, justifyContent: 'center' }}
                  onClick={handleCheckout} disabled={loading}>
                  {loading ? 'Weiterleitung…' : `Mit Karte zahlen €${setupFee.toFixed(2)} →`}
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
