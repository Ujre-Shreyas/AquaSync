import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import SplashScreenModal from './SplashScreenModal'
import MakeItRainOverlay from './MakeItRainOverlay'
import DemoControlDrawer from './DemoControlDrawer'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300">
      {/* ── Initial Splash Screen Modal ── */}
      <SplashScreenModal />

      {/* ── 5-Second Make it Rain Animation Overlay ── */}
      <MakeItRainOverlay />

      {/* ── Persistent Sidebar Navigation ── */}
      <Sidebar />

      {/* ── Main Viewport Content ── */}
      <main className="flex-1 min-w-0 h-screen overflow-hidden relative flex flex-col">
        {children}
      </main>

      {/* ── Sleek Right-Side Slide-Out Demo Control Drawer ── */}
      <DemoControlDrawer />
    </div>
  )
}
