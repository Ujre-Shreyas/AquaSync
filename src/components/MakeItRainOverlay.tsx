import { useAquaStore } from '../store/useAquaStore'
import { CloudRain } from 'lucide-react'

export default function MakeItRainOverlay() {
  const { makeItRainActive, makeItRainCountdown } = useAquaStore()

  if (!makeItRainActive) return null

  // Generate 45 rain particles with staggered positions & speeds
  const rainDrops = Array.from({ length: 45 }, (_, i) => ({
    id: i,
    left: `${(i * 2.2 + Math.random() * 2).toFixed(1)}%`,
    duration: `${(0.4 + Math.random() * 0.5).toFixed(2)}s`,
    delay: `${(Math.random() * 0.4).toFixed(2)}s`,
    height: `${18 + Math.floor(Math.random() * 25)}px`,
    opacity: (0.4 + Math.random() * 0.6).toFixed(2),
  }))

  return (
    <div
      id="make-it-rain-deluge-overlay"
      className="fixed inset-0 z-50 pointer-events-none overflow-hidden select-none"
    >
      {/* Dark storm atmospheric tint with emerald aura */}
      <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-[1px] animate-pulse" />

      {/* Rain drops */}
      {rainDrops.map((drop) => (
        <div
          key={drop.id}
          className="rain-particle"
          style={{
            left: drop.left,
            height: drop.height,
            opacity: Number(drop.opacity),
            animationDuration: drop.duration,
            animationDelay: drop.delay,
          }}
        />
      ))}

      {/* Bottom splash ripples */}
      <div className="absolute bottom-6 left-1/4 w-32 h-16 pointer-events-none">
        <div className="splash-ripple w-20 h-10 -bottom-2 left-6" />
        <div className="splash-ripple w-32 h-16 -bottom-4 -left-4" style={{ animationDelay: '0.4s' }} />
      </div>
      <div className="absolute bottom-6 right-1/4 w-32 h-16 pointer-events-none">
        <div className="splash-ripple w-24 h-12 -bottom-2 left-4" style={{ animationDelay: '0.2s' }} />
        <div className="splash-ripple w-36 h-16 -bottom-4 -left-6" style={{ animationDelay: '0.7s' }} />
      </div>

      {/* Floating Center HUD Notification */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3.5 rounded-2xl bg-[#0e141b]/95 border-2 border-emerald-400 shadow-2xl shadow-emerald-500/40 animate-bounce">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-rose-500 text-slate-950 font-extrabold shadow-lg">
          <CloudRain className="w-6 h-6 text-white animate-pulse" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white tracking-wide">
              Manual Override Dispatched
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase">
              GET /manual_pump?sec=5
            </span>
          </div>
          <p className="text-xs text-emerald-400 font-mono">
            Submersible pump energized at max flow · Atmospheric deluge active
          </p>
        </div>

        {/* Circular Countdown Ring */}
        <div className="relative w-11 h-11 flex items-center justify-center font-mono font-extrabold text-lg text-emerald-400">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="#1e293b"
              strokeWidth="3.5"
            />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              stroke="#10b981"
              strokeWidth="3.5"
              strokeDasharray={2 * Math.PI * 18}
              strokeDashoffset={((5 - makeItRainCountdown) / 5) * 2 * Math.PI * 18}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          <span className="absolute">{makeItRainCountdown}s</span>
        </div>
      </div>
    </div>
  )
}
