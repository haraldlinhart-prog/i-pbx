import type { Metadata } from 'next'
import './globals.css'
import CookieBanner from './CookieBanner'

export const metadata: Metadata = {
  title: 'i-PBX.eu – VoIP Telefonanlage, virtuelle Telefonanlage & Cloud-PBX',
  description: 'i-PBX bietet professionelle VoIP-Telefonanlagen, virtuelle Cloud-Telefonanlagen und Skype-kompatible Systeme für Unternehmen. Deutsche Rufnummern in Frankfurt und Berlin. Sofort online bestellen.',
  keywords: 'VoIP, Voice over IP, virtuelle Telefonanlage, Cloud-Telefonanlage, Skype-System, Telefonie over IP, IP-Telefonanlage, virtuelle Rufnummer, Frankfurt Telefonnummer, Berlin Telefonnummer, Cloud PBX, i-PBX',
  alternates: { canonical: 'https://www.i-pbx.eu' },
  openGraph: {
    title: 'i-PBX.eu – VoIP & Cloud-Telefonanlage',
    description: 'Professionelle virtuelle Telefonanlagen mit deutschen Rufnummern. Frankfurt & Berlin. Ab €4,90/Monat.',
    url: 'https://www.i-pbx.eu',
    locale: 'de_DE',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          var _paq = window._paq = window._paq || [];
          _paq.push(['requireConsent']);
          _paq.push(['trackPageView']);
          _paq.push(['enableLinkTracking']);
          (function() {
            var u="//counter.ixan.org/";
            _paq.push(['setTrackerUrl', u+'matomo.php']);
            _paq.push(['setSiteId', '77']);
            var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
            g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
          })();
        `}} />
      </head>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  )
}
