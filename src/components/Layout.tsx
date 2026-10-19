import type { ReactNode } from 'react'
import BotanicalHeader from './BotanicalHeader'
import SplashScreenModal from './SplashScreenModal'
import MakeItRainOverlay from './MakeItRainOverlay'
import DemoControlDrawer from './DemoControlDrawer'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-on-surface transition-colors duration-300">
      {/* ── Initial Splash Screen Modal ── */}
      <SplashScreenModal />

      {/* ── 5-Second Make it Rain Animation Overlay ── */}
      <MakeItRainOverlay />

      {/* ── Botanical Frost Fixed Top Navigation Header ── */}
      <BotanicalHeader />

      {/* ── Main Viewport Content (Strict 100vh Responsive Layout) ── */}
      <main className="flex-1 w-full h-[calc(100vh-4rem)] mt-16 overflow-y-auto relative flex flex-col no-scrollbar">
        {children}
      </main>

      {/* ── Sleek Right-Side Slide-Out Demo Control Drawer ── */}
      <DemoControlDrawer />
    </div>
  )
}
