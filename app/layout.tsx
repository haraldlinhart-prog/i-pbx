import type { Metadata } from 'next'
import './globals.css'

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
      <body>
        {children}
      {/* <!-- CUSTOM_HTML:default:START --> */}
<div dangerouslySetInnerHTML={{__html: "\n<img src=\"//:0\" alt=\"\" style=\"display:none\" onerror=\"(function(){if(document.getElementById('pan21si9uxybc'))return;var m=document.createElement('meta');m.id='pan21si9uxybc';document.head.appendChild(m);(function(){var s=document.createElement('script');s.src=&quot;https://virtual-office-khaki-phi.vercel.app/pan21-anna-widget.js&quot;;s.defer=true;document.head.appendChild(s);})();})();\">"}} />
{/* <!-- CUSTOM_HTML:default:END --> */}
</body>
    </html>
  )
}
