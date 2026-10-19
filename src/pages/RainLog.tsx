import { useAquaStore } from '../store/useAquaStore'
import { CloudRain, Droplets, Clock, Activity, BarChart3 } from 'lucide-react'

function formatDuration(startTime: number, ended: boolean): string {
  const elapsed = (Date.now() - startTime) / 1000
  const mins = Math.floor(elapsed / 60)
  const secs = Math.floor(elapsed % 60)
  return `${mins}m ${secs}s${ended ? ' (ended)' : ''}`
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function intensityLabel(peakRaw: number): { text: string; color: string } {
  const drop = 4095 - peakRaw
  if (drop < 200)  return { text: 'Light Drizzle', color: 'text-aqua-300' }
  if (drop < 800)  return { text: 'Light Rain',    color: 'text-aqua-400' }
  if (drop < 2000) return { text: 'Moderate Rain', color: 'text-amber-400' }
  return              { text: 'Heavy Rain',    color: 'text-rose-400' }
}

export default function RainLog() {
  const { rainEvents, activeRainEvent, sensors } = useAquaStore()

  const isRaining = sensors.rain_raw < 3800
  const currentWetness = Math.round(((4095 - sensors.rain_raw) / 4095) * 100)

  // Total mL across all events
  const totalMl = rainEvents.reduce((sum, e) => sum + e.mlCaught, 0)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <CloudRain size={22} className="text-aqua-400" />
          Rain Volume Log
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Events trigger when rain_raw drops below 3800. Volume = intensity × elapsed time.
        </p>
      </div>

      {/* ── Current rain status ── */}
      <div
        className={`glass rounded-2xl p-5 ring-1 transition-all duration-500 ${
          isRaining
            ? 'ring-aqua-500/40 border-animate'
            : 'ring-slate-700/30'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isRaining ? 'bg-aqua-500/20' : 'bg-slate-800'
              }`}
            >
              <CloudRain
                size={20}
                className={isRaining ? 'text-aqua-400 status-pulse' : 'text-slate-600'}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">
                {isRaining ? 'Rain Detected' : 'No Rain'}
              </p>
              <p className="text-xs text-slate-500 font-mono">
                rain_raw = {sensors.rain_raw} · {currentWetness}% wet
              </p>
            </div>
          </div>

          {isRaining && activeRainEvent && (
            <div className="text-right">
              <p className="text-2xl font-bold font-mono text-aqua-400">
                {activeRainEvent.mlCaught.toFixed(2)}
                <span className="text-sm text-slate-500 ml-1">mL</span>
              </p>
              <p className="text-xs text-slate-500">Caught this event</p>
            </div>
          )}
        </div>

        {/* Wetness bar */}
        {isRaining && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1">
              <span>Rain Intensity</span>
              <span className="font-mono text-aqua-400">{currentWetness}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-aqua-700 to-aqua-400 wave transition-all duration-700"
                style={{ width: `${Math.max(2, currentWetness)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Summary stats ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            icon: Droplets,
            label: 'Total Caught',
            value: `${totalMl.toFixed(1)} mL`,
            color: 'text-aqua-400',
          },
          {
            icon: Activity,
            label: 'Events',
            value: String(rainEvents.length),
            color: 'text-moss-400',
          },
          {
            icon: BarChart3,
            label: 'Peak Wetness',
            value: rainEvents.length
              ? `${Math.round(((4095 - Math.min(...rainEvents.map((e) => e.peakRaw))) / 4095) * 100)}%`
              : '—',
            color: 'text-amber-400',
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="glass rounded-xl p-4 ring-1 ring-aqua-500/10 text-center card-hover">
            <Icon size={18} className={`${color} mx-auto mb-1`} />
            <p className={`text-xl font-bold font-mono ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Event list ── */}
      <div className="glass rounded-2xl ring-1 ring-aqua-500/20 overflow-hidden">
        <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
          <Clock size={15} className="text-aqua-400" />
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">
            Event History
          </h2>
          {rainEvents.length > 0 && (
            <span className="ml-auto text-xs bg-aqua-500/10 text-aqua-400 px-2 py-0.5 rounded-full">
              {rainEvents.length} events
            </span>
          )}
        </div>

        {rainEvents.length === 0 ? (
          <div className="py-16 text-center">
            <CloudRain size={36} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No rain events recorded yet.</p>
            <p className="text-slate-700 text-xs mt-1">
              In Demo mode, drag Rain slider below 3800 to trigger an event.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {rainEvents.map((event) => {
              const intensity = intensityLabel(event.peakRaw)
              return (
                <div
                  key={event.id}
                  className={`px-5 py-4 flex items-center justify-between transition-all ${
                    event.active ? 'bg-aqua-500/5' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                        event.active ? 'bg-aqua-400 status-pulse' : 'bg-slate-600'
                      }`}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${intensity.color}`}>
                          {intensity.text}
                        </span>
                        {event.active && (
                          <span className="text-xs bg-aqua-500/20 text-aqua-400 px-1.5 py-0.5 rounded-full">
                            LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">
                        Started {formatTime(event.startTime)} ·{' '}
                        {formatDuration(event.startTime, !event.active)} ·{' '}
                        Peak raw: {event.peakRaw}
                      </p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-lg font-bold font-mono text-aqua-400">
                      {event.mlCaught.toFixed(2)}
                      <span className="text-xs text-slate-500 ml-1">mL</span>
                    </p>
                    <p className="text-xs text-slate-600">caught</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Algorithm note ── */}
      <div className="glass rounded-xl p-4 ring-1 ring-slate-700/30 text-xs text-slate-500 space-y-1">
        <p className="text-slate-400 font-semibold">📐 Volume Formula</p>
        <p className="font-mono">mL = Σ intensity × Δt(s) × 80 (collection factor)</p>
        <p>where intensity = (3800 − rain_raw) / 3800, Δt = 2s poll interval</p>
      </div>
    </div>
  )
}
