import { useAquaStore } from '../store/useAquaStore'
import { Droplets, Wifi, SlidersHorizontal, ArrowRight, ShieldCheck, Cpu } from 'lucide-react'

export default function SplashScreenModal() {
  const { splashModalOpen, selectInitialMode } = useAquaStore()

  if (!splashModalOpen) return null

  return (
    <div
      id="splash-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#0e141b]/90 backdrop-blur-xl animate-fade-in"
    >
      {/* Background ambient emerald glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-3xl glass-card rounded-3xl p-6 sm:p-10 border border-emerald-500/30 shadow-2xl shadow-emerald-950/50">
        {/* Top Watermelon strip */}
        <div className="watermelon-strip rounded-t-3xl" />

        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 mb-4 ring-4 ring-emerald-500/20">
            <Droplets className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Aqua<span className="text-emerald-400 text-glow-emerald">Sync</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-md mx-auto">
            Autonomous ESP32 Botanical Irrigation & Environmental Telemetry Architecture
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck size={14} /> Initial Calibration Required
          </div>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
          {/* Card 1: Real Time Data */}
          <button
            id="select-live-mode-btn"
            onClick={() => selectInitialMode('LIVE')}
            className="group relative flex flex-col items-start text-left p-6 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-emerald-500/25 hover:border-emerald-400/80 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-emerald-500/25 transition-transform">
              <Wifi size={24} />
            </div>

            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Real Time Data
              </span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                ESP32 Stream
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Polls live JSON data from <span className="font-mono text-emerald-400">http://192.168.1.101/</span> every 2s. Directly reads capacitive ADC soil sensors and rain levels.
            </p>

            <div className="mt-auto pt-3 border-t border-slate-800/80 w-full flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Connect Hardware</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Demo Mode */}
          <button
            id="select-demo-mode-btn"
            onClick={() => selectInitialMode('DEMO')}
            className="group relative flex flex-col items-start text-left p-6 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-emerald-500/25 hover:border-emerald-400/80 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/15 hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-rose-500/25 transition-transform">
              <SlidersHorizontal size={24} />
            </div>

            <div className="flex items-center justify-between w-full mb-1">
              <span className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                Demo Mode
              </span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-400">
                Sandbox
              </span>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Pauses network polling and unlocks interactive hardware sliders. Simulate soil saturation, rain downpours, and AQI pollution spikes instantly.
            </p>

            <div className="mt-auto pt-3 border-t border-slate-800/80 w-full flex items-center justify-between text-xs font-semibold text-emerald-400">
              <span>Launch Simulator</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800/60">
          <div className="flex items-center gap-1.5 font-mono">
            <Cpu size={14} className="text-emerald-500" />
            <span>Target Layout: 1600p Bento Engine</span>
          </div>
          <span>Mode can be switched anytime in top navigation</span>
        </div>
      </div>
    </div>
  )
}
