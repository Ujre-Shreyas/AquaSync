import { useAquaStore } from '../store/useAquaStore'
import {
  Thermometer,
  Droplets,
  CloudRain,
  Waves,
  Sun
} from 'lucide-react'

export default function WatermelonDataCards() {
  const { sensors, activeRainEvent, totalRainVolumeMl, target_pwm } = useAquaStore()

  // Rain calculations
  const isRaining = sensors.rain_raw < 3800
  const displayedRainMl = totalRainVolumeMl.toFixed(1)

  // Sunlight calculations
  const lightRaw = sensors.light_raw ?? 2048
  const lightPercent = Math.min(100, Math.max(0, Math.round((lightRaw / 4095) * 100)))
  const isHighSun = lightRaw > 2800

  // Flow animation wave speed calculation based on flow_speed
  const waveDuration = sensors.flow_speed > 0
    ? `${Math.max(1, 5 - sensors.flow_speed).toFixed(1)}s`
    : '8s'

  // Correct dynamic calculation for PWM Drive (0-255 mapped to 0-100%)
  const pwmPercentage = Math.round((target_pwm / 255) * 100)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5 xl:gap-3 w-full">
      {/* ── CARD 1: Temperature ── */}
      <div
        id="card-temperature"
        className="watermelon-card rounded-2xl p-3 xl:p-3.5 flex flex-col justify-between"
      >
        <div className="watermelon-strip" />

        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30">
              <Thermometer size={17} />
            </div>
            <div>
              <p className="text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400">
                Temperature
              </p>
              <h4 className="text-xs font-semibold text-rose-300">Thermal Gradient</h4>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            {sensors.temperature > 30 ? 'High Heat' : 'Normal'}
          </span>
        </div>

        <div className="my-0.5 flex items-baseline gap-1">
          <span className="text-2xl xl:text-3xl font-extrabold font-mono text-rose-400 text-glow-ruby">
            {sensors.temperature.toFixed(1)}
          </span>
          <span className="text-xs font-bold text-slate-400">°C</span>
        </div>

        <div className="space-y-1 pt-1.5 border-t border-slate-800/60 text-xs">
          <div className="flex justify-between text-slate-400 text-[10px] font-mono">
            <span>Range: 15°C – 45°C</span>
            <span className="text-emerald-400 font-semibold">
              +{Math.max(0, (sensors.temperature - 20) * 4).toFixed(0)} PWM
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(5, ((sensors.temperature - 15) / 30) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── CARD 2: Humidity ── */}
      <div
        id="card-humidity"
        className="watermelon-card rounded-2xl p-3 xl:p-3.5 flex flex-col justify-between"
      >
        <div className="watermelon-strip" />

        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
              <Droplets size={17} />
            </div>
            <div>
              <p className="text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400">
                Air Moisture
              </p>
              <h4 className="text-xs font-semibold text-emerald-300">Relative Humidity</h4>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {sensors.humidity < 40 ? 'Arid Air' : 'Transpiring'}
          </span>
        </div>

        <div className="my-0.5 flex items-baseline gap-1">
          <span className="text-2xl xl:text-3xl font-extrabold font-mono text-emerald-400 text-glow-emerald">
            {sensors.humidity.toFixed(0)}
          </span>
          <span className="text-xs font-bold text-slate-400">%</span>
        </div>

        <div className="space-y-1 pt-1.5 border-t border-slate-800/60 text-xs">
          <div className="flex justify-between text-slate-400 text-[10px] font-mono">
            <span>Stomata Vapor Deficit</span>
            <span className="text-rose-400 font-semibold">
              -{Math.max(0, (sensors.humidity - 20) * 0.8).toFixed(0)} PWM
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-mint-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(5, sensors.humidity))}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── CARD 3: Sunlight Intensity (LDR Sensor) ── */}
      <div
        id="card-sunlight-intensity"
        className={`watermelon-card rounded-2xl p-3 xl:p-3.5 flex flex-col justify-between ${
          isHighSun ? 'ring-2 ring-amber-400/80 shadow-amber-500/20' : ''
        }`}
      >
        <div className="watermelon-strip" />

        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isHighSun ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-400 shadow-md shadow-amber-500/30' : 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20'}`}>
              <Sun size={17} className={isHighSun ? 'animate-spin-slow text-amber-300' : 'text-amber-400'} />
            </div>
            <div>
              <p className="text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400">
                Sunlight Intensity
              </p>
              <h4 className="text-xs font-semibold text-amber-300">LDR Solar Sensor</h4>
            </div>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              isHighSun
                ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isHighSun ? '1.2x BOOST' : `${lightRaw} ADC`}
          </span>
        </div>

        <div className="my-0.5 flex items-baseline gap-1.5">
          <span className="text-2xl xl:text-3xl font-extrabold font-mono text-amber-400 text-glow-amber">
            {lightPercent}
          </span>
          <span className="text-xs font-bold text-slate-400">% intensity</span>
        </div>

        <div className="space-y-1 pt-1.5 border-t border-slate-800/60 text-xs">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Raw: {lightRaw} ADC</span>
            <span className={isHighSun ? 'text-amber-300 font-bold' : 'text-slate-400'}>
              {isHighSun ? 'Direct Sunlight' : lightRaw > 1000 ? 'Ambient Day' : 'Twilight / Night'}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, lightPercent)}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── CARD 4: Rain Volume (mL Caught) ── */}
      <div
        id="card-rain-volume"
        className={`watermelon-card rounded-2xl p-3 xl:p-3.5 flex flex-col justify-between ${
          isRaining ? 'ring-2 ring-emerald-400 shadow-emerald-500/30' : ''
        }`}
      >
        <div className="watermelon-strip" />

        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isRaining ? 'bg-emerald-500 text-slate-950 animate-bounce' : 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30'}`}>
              <CloudRain size={17} />
            </div>
            <div>
              <p className="text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400">
                Rain Volume Caught
              </p>
              <h4 className="text-xs font-semibold text-emerald-300">
                {isRaining ? 'Active Precipitation' : 'Simulated Catchment'}
              </h4>
            </div>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              isRaining
                ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {isRaining ? 'PRECIP' : '<3800 ADC'}
          </span>
        </div>

        <div className="my-0.5 flex items-baseline gap-1.5">
          <span className="text-2xl xl:text-3xl font-extrabold font-mono text-emerald-400 text-glow-emerald">
            {displayedRainMl}
          </span>
          <span className="text-xs font-bold text-slate-400">mL caught</span>
        </div>

        <div className="space-y-1 pt-1.5 border-t border-slate-800/60 text-xs">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>Raw: {sensors.rain_raw} ADC</span>
            {isRaining ? (
              <span className="text-emerald-400 font-bold animate-pulse">
                +{(activeRainEvent?.mlCaught ?? 0).toFixed(1)} mL
              </span>
            ) : (
              <span className="text-slate-500">Dry &gt; 3800</span>
            )}
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isRaining ? 'bg-gradient-to-r from-emerald-400 to-rose-400' : 'bg-emerald-500/40'
              }`}
              style={{
                width: `${Math.min(100, Math.max(5, ((4095 - sensors.rain_raw) / 4095) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── CARD 5: Dynamic Flow Rate Indicator ── */}
      <div
        id="card-flow-rate"
        className="watermelon-card rounded-2xl p-3 xl:p-3.5 flex flex-col justify-between"
      >
        <div className="watermelon-strip" />

        <div className="flex items-start justify-between mb-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
              <Waves size={17} className={sensors.flow_speed > 0 ? 'animate-pulse text-emerald-400' : ''} />
            </div>
            <div>
              <p className="text-[10px] font-bold font-mono tracking-wider uppercase text-slate-400">
                Flow Dynamics
              </p>
              <h4 className="text-xs font-semibold text-emerald-300">Hydraulic Velocity</h4>
            </div>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              sensors.pump_active
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {sensors.pump_active ? 'DISCHARGING' : 'STANDBY'}
          </span>
        </div>

        <div className="my-0.5 flex items-baseline gap-1">
          <span className="text-2xl xl:text-3xl font-extrabold font-mono text-emerald-400 text-glow-emerald">
            {sensors.flow_speed.toFixed(2)}
          </span>
          <span className="text-xs font-bold text-slate-400">L/min</span>
        </div>

        <div className="space-y-1 pt-1.5 border-t border-slate-800/60 text-xs">
          <div className="flex justify-between text-[10px] font-mono text-slate-400">
            <span>PWM Drive: {target_pwm}/255</span>
            <span className="text-emerald-400 font-semibold">
              {pwmPercentage}% Capacity
            </span>
          </div>

          <div className="h-2.5 rounded-lg bg-slate-900/60 overflow-hidden relative border border-emerald-500/20">
            <svg
              className="absolute inset-0 w-full h-full opacity-70"
              preserveAspectRatio="none"
              viewBox="0 0 100 20"
              style={{
                animation: `wave ${waveDuration} linear infinite`,
              }}
            >
              <path
                d="M 0,10 C 25,5 25,15 50,10 C 75,5 75,15 100,10 L 100,20 L 0,20 Z"
                fill="url(#flowGrad)"
              />
              <defs>
                <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="60%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
