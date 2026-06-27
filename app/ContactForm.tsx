'use client'
import { useState, useEffect } from 'react'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', thema: '', nachricht: '', website: '' })
  const [status, setStatus] = useState<'idle'|'sending'|'ok'|'error'>('idle')
  const [start, setStart] = useState(0)

  useEffect(() => { setStart(Date.now()) }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.website) return
    const elapsed = (Date.now() - start) / 1000
    if (elapsed < 3) return
    if (form.nachricht.split(' ').some((w: string) => w.length > 60)) return

    setStatus('sending')
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, elapsed: Math.round(elapsed) })
    })
    setStatus(res.ok ? 'ok' : 'error')
    if (res.ok) setForm({ name: '', email: '', thema: '', nachricht: '', website: '' })
  }

  const inputStyle = {
    width: '100%', padding: '.75rem 1rem',
    border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-body)', fontSize: '.9rem', color: 'var(--dark)',
    background: 'var(--white)', outline: 'none',
    transition: 'border-color .2s'
  }

  const labelStyle = {
    display: 'block', fontSize: '.75rem', fontWeight: 600,
    letterSpacing: '.08em', textTransform: 'uppercase' as const,
    color: 'var(--gray-text)', marginBottom: '.4rem'
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <input type="text" value={form.website} onChange={e => setForm(p => ({...p, website: e.target.value}))} style={{ display: 'none' }} tabIndex={-1} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label style={labelStyle}>Name *</label>
          <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} placeholder="Ihr Name" required />
        </div>
        <div>
          <label style={labelStyle}>E-Mail *</label>
          <input type="email" style={inputStyle} value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} placeholder="ihre@email.de" required />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Thema</label>
        <select style={inputStyle} value={form.thema} onChange={e => setForm(p => ({...p, thema: e.target.value}))}>
          <option value="">Bitte wählen…</option>
          <option>VoIP-Rufnummer einrichten</option>
          <option>KI-Assistent (Famulor)</option>
          <option>Technische Frage</option>
          <option>Abrechnung</option>
          <option>Sonstiges</option>
        </select>
      </div>

      <div>
        <label style={labelStyle}>Nachricht *</label>
        <textarea style={{...inputStyle, resize: 'vertical', minHeight: 120}} value={form.nachricht} onChange={e => setForm(p => ({...p, nachricht: e.target.value}))} placeholder="Wie können wir Ihnen helfen?" required />
      </div>

      <button type="submit" disabled={status === 'sending'} style={{
        background: 'var(--blue)', color: 'var(--white)', padding: '.875rem',
        border: 'none', borderRadius: 'var(--radius)', fontFamily: 'var(--font-body)',
        fontSize: '1rem', fontWeight: 600, cursor: 'pointer', transition: 'background .2s',
        opacity: status === 'sending' ? .6 : 1
      }}>
        {status === 'sending' ? 'Wird gesendet…' : 'Nachricht senden'}
      </button>

      {status === 'ok' && <div style={{ background: '#D1FAE5', color: '#065F46', padding: '.75rem 1rem', borderRadius: 'var(--radius)', fontSize: '.9rem' }}>Vielen Dank! Wir melden uns innerhalb von 24 Stunden.</div>}
      {status === 'error' && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '.75rem 1rem', borderRadius: 'var(--radius)', fontSize: '.9rem' }}>Fehler beim Senden. Bitte schreiben Sie direkt an info@i-pbx.eu</div>}
    </form>
  )
}
