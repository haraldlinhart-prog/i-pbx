import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Datenschutzerklärung – i-PBX.eu',
  description: 'Datenschutzerklärung von i-PBX.eu (PAN21.com International LLC).',
  alternates: { canonical: 'https://www.i-pbx.eu/datenschutz' },
}

const h2: React.CSSProperties = { fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, color: 'var(--blue)', margin: '2rem 0 .5rem' }
const p: React.CSSProperties = { fontSize: '.9rem', color: 'var(--gray-text)', lineHeight: 1.8, marginBottom: '.75rem' }
const a: React.CSSProperties = { color: 'var(--blue)' }

export default function DatenschutzPage() {
  return (
    <>
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '3rem 2rem 4rem' }}>
        <Link href="/" style={{ color: 'var(--blue)', fontSize: '.85rem', textDecoration: 'none' }}>← Zurück zur Startseite</Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--blue)', margin: '1.5rem 0 1rem' }}>Datenschutzerklärung</h1>

        <h2 style={h2}>1. Verantwortlicher</h2>
        <p style={p}>
          Verantwortlich für die Datenverarbeitung auf dieser Website ist die PAN21.com International LLC, 7533 South Center View CT, STE R,
          West Jordan, UT 84084, USA, vertreten durch Harald Linhart. E-Mail: <a href="mailto:dsgvo@pan21.com" style={a}>dsgvo@pan21.com</a>,
          Telefon: +49 30 5684450-0.
        </p>

        <h2 style={h2}>2. Hosting</h2>
        <p style={p}>
          Diese Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, gehostet. Beim Aufruf der Website verarbeitet
          Vercel technisch notwendige Daten wie IP-Adresse, Datum und Uhrzeit, aufgerufene Seite, Referrer und Browserinformationen
          (Server-Logfiles), um die Website auszuliefern und vor Missbrauch zu schützen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO
          (berechtigtes Interesse an einem sicheren und stabilen Betrieb). Mit Vercel besteht ein Vertrag zur Auftragsverarbeitung;
          Datenübermittlungen in die USA erfolgen auf Grundlage der EU-Standardvertragsklauseln.
        </p>

        <h2 style={h2}>3. Cookies</h2>
        <p style={p}>Diese Website setzt keine Cookies zu Analyse- oder Werbezwecken.</p>

        <h2 style={h2}>4. Werbebanner</h2>
        <p style={p}>
          Werbebanner werden über unseren eigenen Adserver ads.pan21.com ausgeliefert. Dabei wird die IP-Adresse technisch bedingt
          verarbeitet, um das Banner auszuliefern; es werden keine Nutzerprofile erstellt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
        </p>

        <h2 style={h2}>5. Kontaktformular und E-Mail</h2>
        <p style={p}>
          Wenn Sie uns über das Kontaktformular oder per E-Mail schreiben, verarbeiten wir Ihre Angaben (z. B. Name, E-Mail-Adresse,
          Nachricht), um Ihre Anfrage zu beantworten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO, soweit Ihre Anfrage auf einen Vertrag
          zielt, sonst Art. 6 Abs. 1 lit. f DSGVO. Die Daten werden gelöscht, sobald sie nicht mehr benötigt werden und keine gesetzlichen
          Aufbewahrungspflichten bestehen. Der E-Mail-Versand erfolgt über Resend (Resend Inc., USA) auf Grundlage eines
          Auftragsverarbeitungsvertrags und der EU-Standardvertragsklauseln.
        </p>

        <h2 style={h2}>6. Bestellung und Zahlungen</h2>
        <p style={p}>
          Bei einer Bestellung verarbeiten wir die zur Vertragsabwicklung notwendigen Daten (z. B. Name, Firma, E-Mail-Adresse,
          Telefonnummer, gewählte Rufnummer und Optionen), um die Telefonanlage einzurichten und den Vertrag durchzuführen.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Zahlungen werden über Stripe (Stripe Payments Europe Ltd., 1 Grand Canal Street
          Lower, Dublin 2, Irland) abgewickelt. Dabei werden die für die Zahlung erforderlichen Daten an Stripe übermittelt.
          Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO. Bei Zahlung mit EUROPAN-Guthaben werden die dafür angegebenen Kontodaten zur
          Abwicklung der Zahlung verarbeitet (Art. 6 Abs. 1 lit. b DSGVO).
        </p>

        <h2 style={h2}>7. Online-Terminbuchung</h2>
        <p style={p}>
          Für die Buchung eines Beratungstermins werden Sie zu telefon-termin.com weitergeleitet. Dort gelten die Datenschutzhinweise des
          jeweiligen Anbieters.
        </p>

        <h2 style={h2}>8. Newsletter</h2>
        <p style={p}>
          Für den Newsletter nutzen wir beehiiv (Beehiiv Inc., USA). Wenn Sie sich anmelden, werden Ihre E-Mail-Adresse und Anmeldedaten bei
          beehiiv gespeichert. Rechtsgrundlage ist Ihre Einwilligung (Art. 6 Abs. 1 lit. a DSGVO), die Sie jederzeit über den Abmeldelink
          widerrufen können.
        </p>

        <h2 style={h2}>9. KI-Chat und Sprachanruf</h2>
        <p style={p}>
          Der KI-Chat bzw. Sprachanruf wird erst geladen, wenn Sie ihn aktiv starten. Dann werden Ihre Eingaben bzw. Ihre Stimme an den
          Anbieter übermittelt, um das Gespräch zu führen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b bzw. f DSGVO.
        </p>

        <h2 style={h2}>10. Schriftarten</h2>
        <p style={p}>
          Die Schriftarten dieser Website werden lokal von unserem Server geladen. Es findet keine Verbindung zu Servern von Google oder
          anderen Schriftanbietern statt.
        </p>

        <h2 style={h2}>11. Eingebettete Inhalte</h2>
        <p style={p}>
          Diese Website bindet Banner und Widgets von anderen Servern ein (z. B. Banner von Partnerseiten und das Support-Widget
          unseres KI-Assistenten). Beim Laden dieser Inhalte wird Ihre IP-Adresse technisch bedingt an den jeweiligen Server
          übertragen.
        </p>

        <h2 style={h2}>12. Ihre Rechte</h2>
        <p style={p}>
          Sie haben das Recht auf Auskunft (Art. 15 DSGVO), Berichtigung (Art. 16), Löschung (Art. 17), Einschränkung der Verarbeitung
          (Art. 18), Datenübertragbarkeit (Art. 20) und Widerspruch gegen Verarbeitungen auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO
          (Art. 21). Erteilte Einwilligungen können Sie jederzeit mit Wirkung für die Zukunft widerrufen. Außerdem haben Sie das Recht, sich
          bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Wenden Sie sich für Ihre Anliegen an{' '}
          <a href="mailto:dsgvo@pan21.com" style={a}>dsgvo@pan21.com</a>.
        </p>

        <p style={{ ...p, marginTop: '2rem' }}>Stand: Oktober 2026</p>
      </main>

      <footer style={{ background: 'var(--dark)', color: 'rgba(255,255,255,.5)', padding: '2rem', textAlign: 'center', fontSize: '.85rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <a href="/#impressum" style={{ color: 'var(--cyan)' }}>Impressum</a>
          <a href="/datenschutz" style={{ color: 'var(--cyan)' }}>Datenschutz</a>
          <a href="/#kontakt" style={{ color: 'var(--cyan)' }}>Kontakt</a>
        </div>
        <p>© 2026 i-PBX.eu – Cloud-Telefonanlage & VoIP · PAN21.com International LLC</p>
      </footer>
    </>
  )
}
