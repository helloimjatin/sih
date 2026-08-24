import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function Home() {
  const features = [
    { icon: 'mic', title: 'Bilingual Voice', desc: 'English & Hindi STT/TTS', color: 'bg-secondary-container text-secondary' },
    { icon: 'monitor_heart', title: 'Red-Flag Triage', desc: 'Emergency priority queue', color: 'bg-error-container text-error' },
    { icon: 'document_scanner', title: 'Gemini OCR', desc: 'Prescription extraction', color: 'bg-tertiary-fixed text-tertiary' },
    { icon: 'health_and_safety', title: 'FHIR R4 Bundles', desc: 'ABDM interoperability', color: 'bg-primary-fixed text-primary' },
  ]

  return (
    <main className="min-h-screen bg-surface-bright flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 py-10 max-w-5xl mx-auto w-full text-center gap-8 animate-fade-in pb-28 sm:pb-10">

        {/* Hackathon Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container"
          style={{ boxShadow: '3px 3px 8px #dbd9d9, -3px -3px 8px #ffffff' }}>
          <span className="material-symbols-outlined text-[18px] icon-fill text-primary">school</span>
          <span className="text-label-sm font-body">SIH 2026 College Hackathon Prototype</span>
        </div>

        {/* Headline */}
        <div className="flex flex-col gap-3">
          <h1 className="font-display font-bold text-[32px] sm:text-[44px] text-on-surface tracking-tight leading-tight max-w-3xl mx-auto">
            AI-Assisted Patient Intake &{' '}
            <span className="text-primary">Smart OPD Console</span>
          </h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl mx-auto">
            MediKiosk automates pre-consultation triage with bilingual voice assist,
            clinical question trees, OCR document extraction, and emergency red-flag prioritization.
          </p>
        </div>

        {/* ── CTA Buttons — Clear primary vs secondary hierarchy ── */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
          {/* PRIMARY — dominant, solid filled green */}
          <Link href="/patient" id="launch-patient-kiosk"
            className="btn-primary flex-1 text-body-lg py-4 rounded-2xl justify-center">
            <span className="material-symbols-outlined text-[22px] icon-fill">personal_injury</span>
            Patient Kiosk
          </Link>
          {/* SECONDARY — outlined, clearly second */}
          <Link href="/doctor" id="launch-doctor-console"
            className="btn-secondary flex-1 text-body-lg py-4 rounded-2xl justify-center">
            <span className="material-symbols-outlined text-[22px]">stethoscope</span>
            Doctor Console
          </Link>
        </div>

        {/* Feature Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl">
          {features.map((f) => (
            <div key={f.title} className="p-4 rounded-2xl bg-surface-container-low flex flex-col gap-2"
              style={{ boxShadow: '4px 4px 8px #dbd9d9, -4px -4px 8px #ffffff' }}>
              <div className={`w-11 h-11 rounded-full ${f.color} flex items-center justify-center`}>
                <span className="material-symbols-outlined text-[22px] icon-fill">{f.icon}</span>
              </div>
              <span className="text-label-sm font-body text-on-surface font-bold leading-tight text-left">{f.title}</span>
              <span className="text-[12px] font-body text-on-surface-variant leading-tight text-left">{f.desc}</span>
            </div>
          ))}
        </div>

        {/* Tech Stack Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {['Next.js 14', 'FastAPI', 'Gemini AI', 'FHIR R4', 'SQLite', 'ABHA'].map((tech) => (
            <span key={tech}
              className="text-label-sm font-body text-on-surface-variant px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant">
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low border-t border-outline-variant mb-16 sm:mb-0">
        <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 gap-3 max-w-7xl mx-auto">
          <span className="text-body-md text-on-surface-variant text-center">
            © 2026 MediKiosk — SIH Hackathon Demo
          </span>
          <div className="flex gap-6">
            <a href="#" className="text-body-md text-on-surface-variant hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-body-md text-on-surface-variant hover:text-primary transition-colors">Terms</a>
            <a href="#" className="text-body-md text-on-surface-variant hover:text-primary transition-colors">SIH Info</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
