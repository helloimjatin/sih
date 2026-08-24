import Navbar from '@/components/Navbar'
import DoctorConsole from '@/components/DoctorConsole'

export const metadata = {
  title: 'Doctor Console — MediKiosk',
  description: 'Real-time OPD priority queue and AI clinical summary console',
}

export default function DoctorPage() {
  return (
    <main className="h-screen overflow-hidden bg-surface-bright flex flex-col">
      <Navbar />
      <div className="flex-1 min-h-0">
        <DoctorConsole />
      </div>
    </main>
  )
}
