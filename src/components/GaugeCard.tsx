interface GaugeCardProps {
  id: string
  label: string
  value: number
  min?: number
  max: number
  unit: string
  color?: 'aqua' | 'green' | 'amber' | 'rose'
  decimals?: number
  icon?: string
  reverse?: boolean // true = high value is bad
  formatter?: (v: number) => string
}

const colorMap = {
  aqua:  { bar: 'from-emerald-500 to-mint-400', text: 'text-emerald-400', ring: 'ring-emerald-500/30', glow: 'glow-emerald' },
  green: { bar: 'from-emerald-600 to-emerald-400', text: 'text-emerald-400', ring: 'ring-emerald-500/30', glow: 'glow-emerald' },
  amber: { bar: 'from-amber-500 to-amber-400', text: 'text-amber-400', ring: 'ring-amber-500/30', glow: 'glow-amber' },
  rose:  { bar: 'from-rose-500 to-rose-400', text: 'text-rose-400', ring: 'ring-rose-500/30', glow: 'glow-rose' },
}

export default function GaugeCard({
  id,
  label,
  value,
  min = 0,
  max,
  unit,
  color = 'aqua',
  decimals = 1,
  icon,
  reverse = false,
  formatter,
}: GaugeCardProps) {
  const pct = Math.round(((value - min) / (max - min)) * 100)
  const displayPct = reverse ? 100 - pct : pct

  const c = colorMap[color]
  const displayValue = formatter ? formatter(value) : value.toFixed(decimals)

  return (
    <div
      id={id}
      className={`glass card-hover rounded-2xl p-5 ring-1 ${c.ring} transition-all duration-300`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          {icon && <span className="text-2xl mb-1 block">{icon}</span>}
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
            {label}
          </p>
        </div>
        <div className="text-right">
          <span className={`text-3xl font-bold font-mono ${c.text} count-up`}>
            {displayValue}
          </span>
          <span className="text-sm text-slate-500 ml-1">{unit}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2">
        <div className="flex justify-between text-xs text-slate-600 mb-1 font-mono">
          <span>{min}</span>
          <span className={`font-semibold ${c.text}`}>{displayPct}%</span>
          <span>{max}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${c.bar} transition-all duration-700 ease-out`}
            style={{ width: `${Math.max(2, pct)}%` }}
          />
        </div>
      </div>
    </div>
  )
}
