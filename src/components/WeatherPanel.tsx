import { useAquaStore } from '../store/useAquaStore'
import { Wind, Thermometer, Droplets, MapPin } from 'lucide-react'

export default function WeatherPanel() {
  const { weather } = useAquaStore()

  const aqiLabel = () => {
    const a = weather.aqi_raw
    if (a <= 50)  return { text: 'Good',       color: 'text-moss-400',  bg: 'bg-moss-500/10'  }
    if (a <= 100) return { text: 'Moderate',   color: 'text-amber-400', bg: 'bg-amber-500/10' }
    if (a <= 150) return { text: 'Sensitive',  color: 'text-amber-400', bg: 'bg-amber-500/10' }
    if (a <= 200) return { text: 'Unhealthy',  color: 'text-rose-400',  bg: 'bg-rose-500/10'  }
    return           { text: 'Hazardous',  color: 'text-rose-400',  bg: 'bg-rose-500/10'  }
  }

  const aqi = aqiLabel()
  const aqiPct = Math.min(100, (weather.aqi_raw / 500) * 100)

  return (
    <div
      id="weather-panel"
      className="glass rounded-2xl p-6 ring-1 ring-aqua-500/20 card-hover"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wind size={18} className="text-aqua-400" />
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">
            Ambient Conditions
          </h3>
        </div>
        {weather.loaded && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <MapPin size={11} />
            <span className="truncate max-w-24">{weather.city}</span>
          </div>
        )}
      </div>

      {!weather.loaded ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded-lg shimmer" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Temperature */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Thermometer size={16} className="text-amber-400" />
              <span className="text-sm">Temperature</span>
            </div>
            <span className="text-xl font-bold font-mono text-amber-400">
              {weather.temp_outside.toFixed(1)}°C
            </span>
          </div>

          {/* Humidity */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400">
              <Droplets size={16} className="text-aqua-400" />
              <span className="text-sm">Humidity</span>
            </div>
            <span className="text-xl font-bold font-mono text-aqua-400">
              {weather.humidity_outside.toFixed(0)}%
            </span>
          </div>

          {/* AQI */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-slate-400">
                <Wind size={16} className="text-slate-400" />
                <span className="text-sm">Air Quality Index</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold font-mono ${aqi.color}`}>
                  {weather.aqi_raw}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${aqi.color} ${aqi.bg}`}>
                  {aqi.text}
                </span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-moss-500 via-amber-500 to-rose-500 transition-all duration-700"
                style={{ width: `${Math.max(2, aqiPct)}%` }}
              />
            </div>
            {weather.aqi_raw > 150 && (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                ⚠️ High AQI: PWM reduced by{' '}
                {Math.round(((weather.aqi_raw - 150) / 350) * 20)}%
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
