import Link from 'next/link'
import ContactForm from './ContactForm'

export default function Home() {
  return (
    <>
{/* <!-- REVIVE:START --> */}
<div dangerouslySetInnerHTML={{__html: "<div style=\"display:flex;justify-content:center;margin:16px 0;\">\n<ins data-revive-zoneid=\"6\" data-revive-id=\"0b01ba1194fdc0e89c6321458dbc5814\"></ins>\n<script async src=\"//ads.pan21.com/www/delivery/asyncjs.php\"></script>\n</div>"}} />
{/* <!-- REVIVE:END --> */}
      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: 'rgba(15,23,41,0.96)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(0,180,216,.2)',
        padding: '0 2rem', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <a href="/" style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'white', letterSpacing: '.02em' }}>
          i-<span style={{ color: 'var(--cyan)' }}>PBX</span>.eu
        </a>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#leistungen" style={{ color: 'rgba(255,255,255,.75)', fontSize: '.85rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>Leistungen</a>
          <a href="#preise" style={{ color: 'rgba(255,255,255,.75)', fontSize: '.85rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>Preise</a>
          <a href="#faq" style={{ color: 'rgba(255,255,255,.75)', fontSize: '.85rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>FAQ</a>
          <a href="#kontakt" style={{ color: 'rgba(255,255,255,.75)', fontSize: '.85rem', fontWeight: 500, letterSpacing: '.05em', textTransform: 'uppercase' }}>Kontakt</a>
          <Link href="/order" className="btn-primary" style={{ padding: '.5rem 1.25rem', fontSize: '.85rem' }}>Jetzt bestellen</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--dark) 0%, var(--blue) 60%, #0d3266 100%)',
        display: 'flex', alignItems: 'center', padding: '6rem 2rem 4rem',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,180,216,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,180,216,.06) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: '-100px', top: '20%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(0,180,216,.18) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 420px', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', background: 'rgba(0,180,216,.12)', border: '1px solid rgba(0,180,216,.3)', color: 'var(--cyan)', fontSize: '.72rem', fontWeight: 600, letterSpacing: '.15em', textTransform: 'uppercase', padding: '.4rem .9rem', borderRadius: 100, marginBottom: '1.5rem' }}>
              ☁️ Cloud VoIP · seit 2007
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: '1.25rem' }}>
              Virtuelle Telefonanlage<br />
              <span style={{ color: 'var(--cyan)' }}>mit KI-Assistenten</span><br />
              für Ihr Unternehmen
            </h1>
            <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,.75)', lineHeight: 1.75, marginBottom: '2.5rem', maxWidth: 520 }}>
              Professionelle VoIP-Telefonanlagen mit deutschen Rufnummern in Frankfurt und Berlin. Sofort eingerichtet, keine Hardware, optional mit KI-Sprachassistenten — ab <strong style={{ color: 'var(--cyan)' }}>€4,90/Monat</strong>.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/order" className="btn-primary">🚀 Jetzt Nummer einrichten</Link>
              <a href="#preise" className="btn-outline">Preise ansehen</a>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(0,180,216,.25)', borderRadius: 'var(--radius-lg)', padding: '2rem', backdropFilter: 'blur(10px)' }}>
            <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(0,180,216,.2)' }}>
              Verfügbare Rufnummern
            </div>
            {[
              { label: 'Frankfurt (069) · Anschluss 1', slots: 10, total: 25 },
              { label: 'Frankfurt (069) · Anschluss 2', slots: 22, total: 25 },
              { label: 'Berlin (030) · Anschluss 1', slots: 23, total: 25 },
              { label: 'Berlin (030) · Anschluss 2', slots: 23, total: 25 },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.35rem' }}>
                  <span style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.8)' }}>{item.label}</span>
                  <span style={{ fontSize: '.78rem', color: item.slots < 5 ? '#f59e0b' : 'var(--cyan)', fontWeight: 600 }}>{item.slots} frei</span>
                </div>
                <div style={{ height: 5, background: 'rgba(255,255,255,.1)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: (item.slots / item.total * 100) + '%', background: item.slots < 5 ? '#f59e0b' : 'var(--cyan)', borderRadius: 3 }} />
                </div>
              </div>
            ))}
            <Link href="/order" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
              Nummer jetzt sichern →
            </Link>
          </div>
        </div>
      </section>

      {/* LEISTUNGEN */}
      <section id="leistungen" style={{ padding: '5rem 2rem', background: 'var(--gray-bg)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '.75rem' }}>Was wir bieten</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 700, color: 'var(--blue)', marginBottom: '1rem' }}>Alles für Ihre professionelle Telefonie</h2>
          <p style={{ fontSize: '1.05rem', color: 'var(--gray-text)', maxWidth: 600, lineHeight: 1.75, marginBottom: '3rem' }}>Von der einfachen Rufnummer bis zur vollautomatischen KI-Telefonzentrale — i-PBX bietet skalierbare Lösungen für jede Unternehmensgröße.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            {[
              { icon: '📞', title: 'VoIP-Rufnummer', desc: 'Deutsche Festnetznummern in Frankfurt (069) und Berlin (030). Sofort aktiv, keine Wartezeit, keine Hardware erforderlich.' },
              { icon: '☁️', title: 'Cloud-Telefonanlage', desc: 'Vollständig cloudbasierte Telefonanlage (PBX) ohne eigene Server. Mehrere Nebenstellen, Weiterleitungen, Warteschlangen.' },
              { icon: '🤖', title: 'KI-Sprachassistent', desc: 'Optionaler KI-Assistent via Famulor: Beantwortet Anrufe, nimmt Nachrichten auf, leitet weiter — rund um die Uhr.' },
              { icon: '🔀', title: 'Anrufweiterleitung', desc: 'Intelligent weiterleiten an Mobilnummern, andere Nebenstellen oder den KI-Assistenten — nach Zeitplan oder Verfügbarkeit.' },
              { icon: '🌐', title: 'Skype & SIP kompatibel', desc: 'Vollständig kompatibel mit Skype for Business, Microsoft Teams, jedem SIP-fähigen Endgerät und Softphones.' },
              { icon: '📊', title: 'Call-Tracking & CDR', desc: 'Detaillierte Gesprächsauswertungen, Anrufprotokolle und Statistiken über das i-PBX Admin-Portal.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>{item.icon}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, color: 'var(--blue)', marginBottom: '.6rem' }}>{item.title}</h3>
                <p style={{ fontSize: '.875rem', color: 'var(--gray-text)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREISE */}
      <section id="preise" style={{ padding: '5rem 2rem', background: 'var(--blue)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '.75rem' }}>Transparente Preise</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 700, color: 'white', marginBottom: '.75rem' }}>Einfach, fair und skalierbar</h2>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,.65)', maxWidth: 500, margin: '0 auto' }}>Keine versteckten Kosten. Einrichtungsgebühr einmalig, monatliche Abrechnung.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: 800, margin: '0 auto' }}>
            <div style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(0,180,216,.3)', borderRadius: 'var(--radius-lg)', padding: '2.5rem' }}>
              <div style={{ fontSize: '.75rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '1rem' }}>Standard</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>€4,90<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,.5)', fontWeight: 400 }}>/Monat</span></div>
              <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.45)', marginBottom: '1.5rem' }}>+ einmalig €9,90 Einrichtung</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '2rem' }}>
                {['Deutsche Festnetznummer (FFM/BER)','VoIP / SIP / Skype-kompatibel','Anrufweiterleitung inklusive','Soforteinrichtung','Admin-Portal Zugang','Gesprächsgebühren nach Verbrauch'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: '.75rem', fontSize: '.875rem', color: 'rgba(255,255,255,.75)' }}>
                    <span style={{ color: 'var(--cyan)', flexShrink: 0 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link href="/order" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Jetzt einrichten</Link>
            </div>
            <div style={{ background: 'rgba(0,180,216,.1)', border: '2px solid var(--cyan)', borderRadius: 'var(--radius-lg)', padding: '2.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'var(--cyan)', color: 'var(--blue)', fontSize: '.7rem', fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '.3rem 1rem', borderRadius: 100 }}>Empfohlen</div>
              <div style={{ fontSize: '.75rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '1rem' }}>Standard + KI-Assistent</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>€24,80<span style={{ fontSize: '1rem', color: 'rgba(255,255,255,.5)', fontWeight: 400 }}>/Monat</span></div>
              <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.45)', marginBottom: '1.5rem' }}>+ einmalig €9,90 Einrichtung</div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '2rem' }}>
                {['Alles aus Standard','KI-Sprachassistent (Famulor)','24/7 automatische Anrufannahme','Natürliche Spracherkennung DE/EN','Anrufzusammenfassung per E-Mail','Individuelle Begrüßung & Routing'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: '.75rem', fontSize: '.875rem', color: 'rgba(255,255,255,.85)' }}>
                    <span style={{ color: 'var(--cyan)', flexShrink: 0 }}>✓</span> {item}
                  </li>
                ))}
              </ul>
              <Link href="/order?plan=ki" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>Mit KI einrichten</Link>
            </div>
          </div>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '.8rem', color: 'rgba(255,255,255,.4)' }}>Alle Preise zzgl. gesetzlicher MwSt. · Gesprächsgebühren nach Verbrauch · Monatlich kündbar</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{ padding: '5rem 2rem', background: 'var(--gray-bg)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '.75rem' }}>FAQ</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 700, color: 'var(--blue)', marginBottom: '2.5rem' }}>Häufige Fragen</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {[
              { q: 'Was ist VoIP und wie funktioniert es?', a: 'VoIP (Voice over Internet Protocol) überträgt Telefongespräche über das Internet statt über das klassische Telefonnetz. Sie benötigen lediglich eine Internetverbindung und ein kompatibles Endgerät (Softphone, IP-Telefon oder Skype).' },
              { q: 'Welche Endgeräte kann ich verwenden?', a: 'i-PBX ist kompatibel mit allen SIP-fähigen Endgeräten: IP-Tischtelefone, Softphones (Zoiper, Linphone), Skype for Business, Microsoft Teams und Mobilgeräte mit entsprechenden Apps.' },
              { q: 'Wie schnell ist die Einrichtung?', a: 'Nach erfolgreicher Zahlung erfolgt die Einrichtung Ihrer Rufnummer in der Regel innerhalb von 24 Stunden an Werktagen. Sie erhalten alle Zugangsdaten per E-Mail.' },
              { q: 'Was kostet ein Gespräch?', a: 'Die monatliche Grundgebühr von €4,90 beinhaltet keine Gesprächsminuten. Gesprächsgebühren werden nach Verbrauch berechnet. Aktuelle Tarifinformationen erhalten Sie nach der Einrichtung.' },
              { q: 'Was ist der KI-Assistent von Famulor?', a: 'Der KI-Assistent ist ein intelligentes Sprachsystem, das Anrufe automatisch entgegennimmt, mit Anrufern spricht, Nachrichten aufnimmt und Anrufe nach Ihren Vorgaben weiterleitet — auf Deutsch und Englisch, rund um die Uhr.' },
              { q: 'Kann ich die Nummer auf mein Handy weiterleiten?', a: 'Ja, Weiterleitungen auf beliebige Rufnummern (Mobil, Festnetz, international) sind möglich und können flexibel über das Admin-Portal konfiguriert werden.' },
            ].map((item, i) => (
              <details key={i} style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem 1.5rem' }}>
                <summary style={{ fontWeight: 600, fontSize: '.95rem', color: 'var(--blue)', cursor: 'pointer', listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {item.q} <span style={{ color: 'var(--cyan)', fontSize: '1.2rem', flexShrink: 0, marginLeft: '1rem' }}>+</span>
                </summary>
                <p style={{ marginTop: '1rem', fontSize: '.9rem', color: 'var(--gray-text)', lineHeight: 1.7 }}>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* TERMIN */}
      <section style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📅</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--blue)', marginBottom: '.75rem' }}>Persönliche Beratung gewünscht?</h2>
          <p style={{ color: 'var(--gray-text)', marginBottom: '2rem', lineHeight: 1.7 }}>Buchen Sie kostenlos einen Telefontermin mit unserem VoIP-Experten. Wir beraten Sie zu den passenden Optionen für Ihr Unternehmen.</p>
          <a href="https://telefon-termin.com/beratung/" target="_blank" rel="noopener" className="btn-blue">📅 Beratungstermin buchen</a>
        </div>
      </section>

      {/* KONTAKT */}
      <section id="kontakt" style={{ padding: '5rem 2rem', background: 'var(--gray-bg)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>
          <div>
            <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--cyan)', marginBottom: '.75rem' }}>Kontakt</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--blue)', marginBottom: '1rem' }}>Schreiben Sie uns</h2>
            <p style={{ color: 'var(--gray-text)', lineHeight: 1.75, marginBottom: '2rem' }}>Haben Sie Fragen zu unseren Leistungen oder benötigen Sie ein individuelles Angebot? Wir antworten innerhalb von 24 Stunden.</p>
            <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1rem', alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, background: 'rgba(0,180,216,.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>✉️</div>
              <div>
                <div style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '.2rem' }}>E-Mail</div>
                <div style={{ fontSize: '.9rem', color: 'var(--blue)' }}>info@i-pbx.eu</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem', alignItems: 'flex-start' }}>
              <div style={{ width: 36, height: 36, background: 'rgba(0,180,216,.1)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>📍</div>
              <div>
                <div style={{ fontSize: '.7rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--gray-text)', marginBottom: '.2rem' }}>Betrieben von</div>
                <div style={{ fontSize: '.9rem', color: 'var(--blue)', lineHeight: 1.6 }}>PAN21.COM Corporate Consultants Ltd<br />61 Bridge Street, Kington HR5 3DJ, UK</div>
              </div>
            </div>
            <a href="https://telefon-termin.com/beratung/" target="_blank" rel="noopener" className="btn-primary">📅 Termin buchen</a>
          </div>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '2rem', border: '1px solid var(--border)' }}>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* IMPRESSUM */}
      <section id="impressum" style={{ padding: '4rem 2rem', background: 'white' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--blue)', marginBottom: '1.25rem' }}>Impressum</h2>
          <address style={{ fontStyle: 'normal', fontSize: '.875rem', color: 'var(--gray-text)', lineHeight: 1.8, marginBottom: '1rem' }}>
            <strong>PAN21.COM Corporate Consultants Ltd</strong><br />
            61 Bridge Street, Kington, HR5 3DJ, United Kingdom<br />
            Company No. 16117708
          </address>
          <p style={{ fontSize: '.875rem', color: 'var(--gray-text)', lineHeight: 1.8, marginBottom: '.75rem' }}>
            <strong>Vertreten durch:</strong> Harald Linhart<br />
            <strong>E-Mail:</strong> info@i-pbx.eu<br />
            <strong>Website:</strong> www.i-pbx.eu
          </p>
          <p id="datenschutz" style={{ fontSize: '.875rem', color: 'var(--gray-text)', lineHeight: 1.8 }}>
            <strong>Datenschutz:</strong> Diese Website verwendet Matomo zur anonymisierten Analyse. Cookies nur nach Ihrer Zustimmung. Kontaktdaten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet und nicht an Dritte weitergegeben.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: 'var(--dark)', color: 'rgba(255,255,255,.5)', padding: '2rem', textAlign: 'center', fontSize: '.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <a href="#impressum" style={{ color: 'var(--cyan)' }}>Impressum</a>
          <a href="#datenschutz" style={{ color: 'var(--cyan)' }}>Datenschutz</a>
          <a href="#kontakt" style={{ color: 'var(--cyan)' }}>Kontakt</a>
          <a href="https://www.pan21.com" target="_blank" rel="noopener" style={{ color: 'var(--cyan)' }}>PAN21 Network</a>
        </div>
        <p>© 2026 i-PBX.eu – Cloud-Telefonanlage & VoIP · PAN21.COM Corporate Consultants Ltd</p>
      </footer>
    </>
  )
}
