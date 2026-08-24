import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MediKiosk — AI-Assisted Patient Pre-Consultation System',
  description:
    'Smart bilingual patient intake kiosk and real-time clinical console for high-throughput OPDs.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600&family=Quicksand:wght@600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-bright text-on-surface min-h-screen flex flex-col font-body antialiased">
        {children}
      </body>
    </html>
  )
}
