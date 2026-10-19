import { NavLink } from 'react-router-dom'
import { useAquaStore } from '../store/useAquaStore'
import {
  LayoutDashboard,
  Sliders,
  LineChart,
  Sun,
  Moon,
  Droplets,
  CloudRain,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react'

export default function Sidebar() {
  const {
    theme,
    toggleTheme,
    mode,
    setMode,
    esp32Connected,
    sensors,
    triggerMakeItRain,
    makeItRainActive,
    makeItRainCountdown,
  } = useAquaStore()

  const navLinks = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: 'Bento',
    },
    {
      to: '/calibration',
      label: 'Calibration',
      icon: Sliders,
      badge: 'ADC',
    },
    {
      to: '/compiled-data',
      label: 'Compiled Data',
      icon: LineChart,
      badge: 'Recharts',
    },
  ]

  return (
    <aside
      id="main-sidebar"
      className="w-64 xl:w-72 flex-shrink-0 flex flex-col h-screen border-r transition-all duration-300 z-30 select-none"
      style={{
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--border-app)',
      }}
    >
      {/* ── Brand Header ── */}
      <div className="p-5 xl:p-6 border-b border-emerald-500/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/25">
            <Droplets className="w-5 h-5 text-white" />
            <span className="pulse-ring absolute text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight">Aqua</span>
              <span className="font-extrabold text-xl text-emerald-500 text-glow-emerald">Sync</span>
            </div>
            <p className="text-[10px] font-mono tracking-widest uppercase text-slate-400">
              Botanical OS v2.4
            </p>
          </div>
        </div>
      </div>

      {/* ── Mode & Hardware Status pill ── */}
      <div className="px-4 py-3 border-b border-emerald-500/10">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
          <div className="flex items-center gap-2">
            {mode === 'LIVE' ? (
              esp32Connected ? (
                <Wifi size={15} className="text-emerald-500 animate-pulse" />
              ) : (
                <WifiOff size={15} className="text-rose-500" />
              )
            ) : (
              <Zap size={15} className="text-amber-400" />
            )}
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight">
                {mode === 'LIVE' ? (esp32Connected ? 'ESP32 Online' : 'ESP32 Offline') : 'Demo Sandbox'}
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {mode === 'LIVE' ? '192.168.1.101' : 'Simulated Sliders'}
              </span>
            </div>
          </div>

          <button
            id="sidebar-mode-toggle"
            onClick={() => setMode(mode === 'LIVE' ? 'DEMO' : 'LIVE')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all shadow-sm ${
              mode === 'LIVE'
                ? 'bg-emerald-500 text-white shadow-emerald-500/25 hover:bg-emerald-600'
                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 font-extrabold'
            }`}
          >
            {mode}
          </button>
        </div>
      </div>

      {/* ── Navigation Links ── */}
      <nav className="flex-1 p-3 xl:p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
          Navigation
        </div>

        {navLinks.map(({ to, label, icon: Icon, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/35 shadow-sm shadow-emerald-500/10'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
              }`
            }
          >
            <div className="flex items-center gap-3">
              <Icon size={18} className="transition-transform group-hover:scale-110" />
              <span>{label}</span>
            </div>
            {badge && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30">
                {badge}
              </span>
            )}
          </NavLink>
        ))}

        {/* ── Manual Override Quick Trigger ── */}
        <div className="pt-6">
          <div className="px-3 pb-2 text-[10px] font-bold font-mono tracking-wider text-slate-400 uppercase">
            Emergency Action
          </div>
          <button
            id="sidebar-make-it-rain-btn"
            onClick={triggerMakeItRain}
            disabled={makeItRainActive}
            className={`w-full group relative flex items-center justify-between p-3.5 rounded-2xl border transition-all duration-300 font-bold text-sm ${
              makeItRainActive
                ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/20'
                : 'bg-gradient-to-r from-emerald-600/25 to-rose-600/20 hover:from-emerald-600/40 hover:to-rose-600/35 border-emerald-500/40 text-emerald-300 hover:text-white shadow-md'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <CloudRain
                size={18}
                className={makeItRainActive ? 'animate-bounce text-rose-400' : 'text-emerald-400'}
              />
              <span className="tracking-tight">
                {makeItRainActive ? `Raining (${makeItRainCountdown}s)` : 'Make it Rain'}
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
              5s Pump
            </span>
          </button>
        </div>
      </nav>

      {/* ── Bottom Section: Pump Indicator & Light/Dark Mode Toggle ── */}
      <div className="p-4 border-t border-emerald-500/15 space-y-3">
        {/* Pump Live Telemetry Status */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/40 border border-slate-800">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                sensors.pump_active ? 'bg-emerald-400 status-pulse shadow-sm shadow-emerald-400' : 'bg-slate-600'
              }`}
            />
            <span className="text-xs font-semibold">Submersible Pump</span>
          </div>
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              sensors.pump_active
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {sensors.pump_active ? 'FLOW ACTIVE' : 'OFF'}
          </span>
        </div>

        {/* Light / Dark Mode Toggle */}
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-xs font-semibold text-slate-400">Interface Theme</span>
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 p-1.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-all text-xs font-bold"
            title="Toggle Light / Dark mode"
          >
            {theme === 'dark' ? (
              <>
                <Moon size={14} />
                <span>Dark</span>
              </>
            ) : (
              <>
                <Sun size={14} className="text-amber-500" />
                <span className="text-amber-500">Light</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}
