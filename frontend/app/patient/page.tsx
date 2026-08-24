import Navbar from '@/components/Navbar'
import PatientKiosk from '@/components/PatientKiosk'

export const metadata = {
  title: 'Patient Kiosk — MediKiosk',
  description: 'Self-service bilingual patient intake kiosk for OPD pre-consultation',
}

export default function PatientPage() {
  return (
    <main className="min-h-screen bg-surface-bright flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PatientKiosk />
      </div>
    </main>
  )
}
