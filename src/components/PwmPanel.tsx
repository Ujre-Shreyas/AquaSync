import { useAquaStore } from '../store/useAquaStore'
import { Gauge, Send, CheckCircle, XCircle } from 'lucide-react'

export default function PwmPanel() {
  const { target_pwm, pwm_sent, mode, sensors } = useAquaStore()

  const pct = Math.round((target_pwm / 255) * 100)

  const getLabel = () => {
    if (pct < 25) return { text: 'Low Flow', color: 'text-emerald-400' }
    if (pct < 50) return { text: 'Moderate', color: 'text-emerald-400' }
    if (pct < 75) return { text: 'High Flow', color: 'text-amber-400' }
    return { text: 'Max Flow', color: 'text-rose-400' }
  }

  const label = getLabel()

  return (
    <div
      id="pwm-panel"
      className="glass rounded-2xl p-6 ring-1 ring-emerald-500/20 card-hover"
    >
      <div className="flex items-center gap-2 mb-4">
        <Gauge size={18} className="text-emerald-400" />
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">
          Botanical PWM
        </h3>
      </div>

      {/* Radial gauge */}
      <div className="flex flex-col items-center mb-4">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 144 144" className="w-full h-full -rotate-90">
            {/* Track */}
            <circle
              cx="72" cy="72" r="56"
              fill="none"
              stroke="#1e293b"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${0.75 * 2 * Math.PI * 56} ${2 * Math.PI * 56}`}
              strokeDashoffset={`${-0.125 * 2 * Math.PI * 56}`}
            />
            {/* Value arc */}
            <circle
              cx="72" cy="72" r="56"
              fill="none"
              stroke="url(#pwmGrad)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 0.75 * 2 * Math.PI * 56} ${2 * Math.PI * 56}`}
              strokeDashoffset={`${-0.125 * 2 * Math.PI * 56}`}
              className="transition-all duration-700"
            />
            <defs>
              <linearGradient id="pwmGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
          </svg>
          {/* Center value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold font-mono text-white count-up">
              {target_pwm}
            </span>
            <span className="text-xs text-slate-500">/ 255</span>
          </div>
        </div>

        <span className={`text-sm font-semibold mt-2 ${label.color}`}>
          {label.text}
        </span>
        <span className="text-xs text-slate-500 font-mono mt-0.5">{pct}% duty cycle</span>
      </div>

      {/* Status */}
      <div className="border-t border-white/5 pt-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs">
          {mode === 'LIVE' ? (
            pwm_sent ? (
              <><CheckCircle size={13} className="text-emerald-400" /><span className="text-emerald-400">Sent to ESP32</span></>
            ) : (
              <><XCircle size={13} className="text-rose-400" /><span className="text-rose-400">Not sent</span></>
            )
          ) : (
            <><Send size={13} className="text-slate-500" /><span className="text-slate-500">Demo mode – not sent</span></>
          )}
        </div>
        <span className="text-xs text-slate-600 font-mono">
          Pump: {sensors.pump_active ? '🟢' : '⚫'}
        </span>
      </div>
    </div>
  )
}
