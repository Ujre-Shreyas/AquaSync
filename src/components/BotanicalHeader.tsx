import React from 'react'
import { useAquaStore } from '../store/useAquaStore'

interface BotanicalHeaderProps {
  onOpenDemo?: () => void
}

export const BotanicalHeader: React.FC<BotanicalHeaderProps> = () => {
  const {
    activeTab,
    setActiveTab,
    mode,
    setMode,
    themeVariant,
    setThemeVariant,
    esp32Connected,
    toggleDemoPanel,
    makeItRainActive,
    triggerMakeItRain,
  } = useAquaStore()

  const navItems = [
    { id: 'plant-overview', label: 'Plant Overview', icon: 'yard' },
    { id: 'irrigation-pump', label: 'Irrigation & Pump', icon: 'water_pump' },
    { id: 'telemetry-charts', label: 'Telemetry Charts', icon: 'monitoring' },
    { id: 'diagnostics-sd', label: 'Diagnostics & SD', icon: 'memory' },
    { id: 'calibration', label: 'Calibration', icon: 'tune' },
  ] as const

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-primary-container/15 select-none transition-colors duration-300">
      <div className="h-16 w-full px-margin-desktop flex items-center justify-between gap-space-lg max-w-[1780px] mx-auto">
        {/* ── Brand Logo & Live ESP32 Hardware Status ── */}
        <div className="flex items-center gap-space-md shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-on-primary shadow-sm shadow-primary-container/20">
            <span className="material-symbols-outlined text-[22px]">potted_plant</span>
          </div>

          <div className="flex items-center gap-space-xs">
            <span className="font-headline-sm text-headline-sm text-on-surface tracking-tight font-extrabold">
              AquaSync
            </span>
            <span className="font-label-sub text-label-sub px-1.5 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-mono border border-outline-variant/30">
              v1.2 IoT
            </span>
          </div>

          <div className="hidden xl:flex items-center gap-2 pl-space-sm">
            <div
              className={`flex items-center gap-1.5 px-space-sm py-1 rounded-full border transition-colors ${
                mode === 'LIVE' && esp32Connected
                  ? 'bg-surface-container-low text-primary border-primary-container/30'
                  : mode === 'LIVE'
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                  : 'bg-amber-500/10 text-amber-500 border-amber-500/30'
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    mode === 'LIVE' && esp32Connected
                      ? 'bg-primary-container'
                      : mode === 'LIVE'
                      ? 'bg-rose-500'
                      : 'bg-amber-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    mode === 'LIVE' && esp32Connected
                      ? 'bg-primary-container'
                      : mode === 'LIVE'
                      ? 'bg-rose-500'
                      : 'bg-amber-400'
                  }`}
                />
              </span>

              <span className="font-label-sub text-label-sub font-mono font-semibold text-on-surface">
                {mode === 'LIVE'
                  ? esp32Connected
                    ? 'ESP32 Node: Online'
                    : 'ESP32 Node: Reconnecting...'
                  : 'ESP32 Node: Demo Sim'}
              </span>

              <span className="font-label-sub text-label-sub text-primary font-mono">
                {mode === 'LIVE' && esp32Connected ? '(42ms)' : mode === 'LIVE' ? '(Offline)' : '(Virtual)'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Multi-Tab Switcher ── */}
        <nav
          className="hidden md:flex items-center gap-1 p-1 bg-surface-container-low/80 rounded-xl border border-outline-variant/20 shadow-inner"
          aria-label="Navigation Tabs"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 text-body-base ${
                  isActive
                    ? 'bg-surface-container-lowest text-primary font-body-bold shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container font-body-base'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* ── Right Quick Actions & Theme Control ── */}
        <div className="flex items-center gap-space-sm shrink-0">
          {/* Quick Mode Badge (LIVE vs DEMO) */}
          <button
            type="button"
            onClick={() => setMode(mode === 'LIVE' ? 'DEMO' : 'LIVE')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sub font-mono border border-outline-variant/20 transition-all cursor-pointer"
            title={`Switch to ${mode === 'LIVE' ? 'DEMO' : 'LIVE'} mode`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                mode === 'LIVE' ? 'bg-primary-container' : 'bg-amber-400'
              }`}
            />
            <span className="font-bold">{mode}</span>
          </button>

          {/* Theme Selector (Frost, Minimal, Midnight) */}
          <button
            type="button"
            onClick={() => {
              if (themeVariant === 'frost') setThemeVariant('minimal')
              else if (themeVariant === 'minimal') setThemeVariant('midnight')
              else setThemeVariant('frost')
            }}
            className="relative hidden sm:flex items-center bg-surface-container-low hover:bg-surface-container rounded-full p-1 pl-2.5 pr-2 gap-1.5 text-on-surface-variant border border-primary-container/20 cursor-pointer transition-colors"
            title="Click to cycle themes: Frost -> Minimal -> Midnight"
          >
            <span className="h-2 w-2 rounded-full bg-primary-container" />
            <span className="font-label-sub text-label-sub font-mono text-on-surface font-semibold capitalize">
              {themeVariant} Theme
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
              palette
            </span>
          </button>

          {/* Quick Make It Rain Override Button */}
          <button
            type="button"
            onClick={triggerMakeItRain}
            disabled={makeItRainActive}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/20 hover:bg-secondary-container/30 text-secondary border border-secondary/30 transition-all font-body-bold text-xs"
            title="Trigger 5s emergency irrigation rain deluge"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">
              water_drop
            </span>
            <span>{makeItRainActive ? 'Raining...' : 'Make It Rain'}</span>
          </button>

          {/* Demo Drawer Trigger */}
          <button
            type="button"
            onClick={toggleDemoPanel}
            aria-label="Open Demo Controls"
            className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-surface-container border border-outline-variant/20 transition-all relative"
            title="Open Demo Sliders & Parameters"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            {mode === 'DEMO' && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 ring-2 ring-surface" />
            )}
          </button>

          {/* User Profile avatar */}
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/20 ring-1 ring-primary-container/40 text-on-primary">
            <span className="material-symbols-outlined text-[18px]">spa</span>
          </div>
        </div>
      </div>

      {/* Signature Watermelon Ambient Precision Gradient Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-primary via-primary-fixed-dim to-secondary-container opacity-90" />
    </header>
  )
}

export default BotanicalHeader
