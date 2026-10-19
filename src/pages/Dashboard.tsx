import { useAquaStore } from '../store/useAquaStore'
import WatermelonDataCards from '../components/WatermelonDataCards'
import KalanchoePlantCard from '../components/KalanchoePlantCard'
import HardwareStatusCard from '../components/HardwareStatusCard'
import {
  Gauge,
  CloudRain,
  Wind,
  Wifi,
  WifiOff,
  Zap,
  MapPin,
  SlidersHorizontal,
  Flame,
  Droplet,
  AlertTriangle,
  Sun
} from 'lucide-react'

export default function Dashboard() {
  const {
    sensors,
    mode,
    weather,
    target_pwm,
    pwm_sent,
    esp32Connected,
    lastFetchTime,
    triggerMakeItRain,
    makeItRainActive,
    makeItRainCountdown,
    toggleDemoPanel,
  } = useAquaStore()

  // PWM gauge calculation
  const pwmPct = Math.round((target_pwm / 255) * 100)

  // Smog state for dashboard-wide atmospheric haze overlay
  const isSmog = weather.aqi_raw > 150

  // ── Dynamic Lighting calculations based on LDR light_raw ──
  const lightRaw = sensors.light_raw ?? 2048
  const solarRatio = lightRaw / 4095
  const isHighSun = lightRaw > 2800
  const isDark = lightRaw < 1000

  // Dynamic brightness: dims slightly in dark (0.88), radiates brightly under direct sun (1.08)
  const dynamicBrightness = (0.88 + solarRatio * 0.20).toFixed(3)

  const formatLastFetch = (ts: number | null) => {
    if (!ts) return 'Standby'
    const diff = Math.round((Date.now() - ts) / 1000)
    return diff < 4 ? 'Just now' : `${diff}s ago`
  }

  return (
    <div
      id="dashboard-bento-container"
      className="h-screen overflow-hidden flex flex-col p-2.5 sm:p-3 xl:p-4 gap-2 sm:gap-2.5 xl:gap-3 select-none relative transition-all duration-700"
      style={{
        filter: `brightness(${dynamicBrightness})`,
      }}
    >
      {/* ── DYNAMIC SOLAR LIGHTING ATMOSPHERIC LAYER ── */}
      <div
        id="dynamic-solar-lighting-layer"
        className="absolute inset-0 pointer-events-none transition-all duration-700 z-0"
        style={{
          background: isHighSun
            ? `radial-gradient(ellipse 90% 45% at 50% -10%, rgba(251, 191, 36, ${(solarRatio * 0.16).toFixed(2)}) 0%, rgba(245, 158, 11, ${(solarRatio * 0.06).toFixed(2)}) 50%, transparent 80%)`
            : isDark
            ? `radial-gradient(ellipse 100% 60% at 50% 100%, rgba(2, 6, 23, ${((1 - solarRatio) * 0.45).toFixed(2)}) 0%, transparent 75%)`
            : 'transparent',
        }}
      />

      {/* ── ATMOSPHERIC SMOG OVERLAY (Over Main Dashboard if AQI > 150) ── */}
      {isSmog && (
        <div
          id="dashboard-smog-haze-layer"
          className="dashboard-smog-overlay"
        >
          {/* Floating smog warning banner at top */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold shadow-lg shadow-amber-950/40 animate-pulse pointer-events-auto">
            <AlertTriangle size={13} className="text-amber-400" />
            <span>Atmospheric Smog Alert: AQI {weather.aqi_raw} &gt; 150 &bull; Transpiration Throttled</span>
          </div>
        </div>
      )}

      {/* ── Top Header Bar ── */}
      <header className="flex-shrink-0 flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-emerald-500/15 z-20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg xl:text-xl font-black tracking-tight flex items-center gap-2">
              <span>Botanical Bento Dashboard</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                100vh Responsive
              </span>
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Autonomous feedback loop: LDR Sunlight + Capacitive ADC + AQI Weather &rarr; ESP32 Flow Control
          </p>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-2">
          {/* Sunlight active bonus chip */}
          {isHighSun && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold animate-pulse shadow-sm shadow-amber-500/10">
              <Sun size={13} className="text-amber-400 animate-spin-slow" />
              <span>High Sun: 1.2x Boost</span>
            </div>
          )}

          {/* Demo panel toggle button (if in Demo mode) */}
          {mode === 'DEMO' && (
            <button
              onClick={toggleDemoPanel}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all"
            >
              <SlidersHorizontal size={13} />
              <span>Adjust Sliders</span>
            </button>
          )}

          {/* Connection status pill */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold ${
              mode === 'LIVE' && esp32Connected
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                : mode === 'LIVE'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            {mode === 'LIVE' ? (
              esp32Connected ? (
                <>
                  <Wifi size={13} className="animate-pulse" />
                  <span>ESP32 Polling ({formatLastFetch(lastFetchTime)})</span>
                </>
              ) : (
                <>
                  <WifiOff size={13} />
                  <span>ESP32 Disconnected</span>
                </>
              )
            ) : (
              <>
                <Zap size={13} />
                <span>Demo Sandbox</span>
              </>
            )}
          </div>

          {/* Prominent Make It Rain Quick Action */}
          <button
            id="make-it-rain-header-btn"
            onClick={triggerMakeItRain}
            disabled={makeItRainActive}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all duration-300 shadow-md ${
              makeItRainActive
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/30'
            }`}
          >
            <CloudRain size={14} className={makeItRainActive ? 'animate-bounce' : ''} />
            <span>{makeItRainActive ? `Raining ${makeItRainCountdown}s` : 'Make it Rain'}</span>
          </button>
        </div>
      </header>

      {/* ── Top Bento Row: 5 Watermelon UI Cards (Now includes Sunlight Intensity!) ── */}
      <section className="flex-shrink-0 z-20">
        <WatermelonDataCards />
      </section>

      {/* ── Main Bento Grid Body: 3 Balanced Columns (Fit in 100vh screen) ── */}
      <section className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-2.5 sm:gap-3 min-h-0 z-20">
        {/* ── BENTO COLUMN 1: Botanical PWM Radial Engine (4 cols) ── */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-3 xl:p-3.5 flex flex-col justify-between border border-emerald-500/25 relative overflow-hidden min-h-0">
          <div className="watermelon-strip" />

          {/* Card Header */}
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
                <Gauge size={16} />
              </div>
              <div>
                <h3 className="text-xs font-extrabold font-mono uppercase tracking-wider text-slate-300">
                  Botanical Flow Engine
                </h3>
                <p className="text-[10px] text-slate-400">Autonomous Target PWM</p>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              PWM {target_pwm}/255
            </span>
          </div>

          {/* Radial Arc Visualizer */}
          <div className="flex flex-col items-center justify-center my-auto py-1">
            <div className="relative w-36 h-36 xl:w-40 xl:h-40 flex items-center justify-center">
              <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                {/* Track background arc */}
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  fill="none"
                  stroke="rgba(30, 41, 59, 0.7)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={`${0.75 * 2 * Math.PI * 64} ${2 * Math.PI * 64}`}
                  strokeDashoffset={`${-0.125 * 2 * Math.PI * 64}`}
                />
                {/* Value arc */}
                <circle
                  cx="80"
                  cy="80"
                  r="64"
                  fill="none"
                  stroke="url(#bentoPwmGrad)"
                  strokeWidth="11"
                  strokeLinecap="round"
                  strokeDasharray={`${(pwmPct / 100) * 0.75 * 2 * Math.PI * 64} ${2 * Math.PI * 64}`}
                  strokeDashoffset={`${-0.125 * 2 * Math.PI * 64}`}
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="bentoPwmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="50%" stopColor="#34d399" />
                    <stop offset="75%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Center Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl xl:text-3xl font-black font-mono text-white text-glow-emerald">
                  {target_pwm}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-semibold mt-0.5">
                  {pwmPct}% Duty Cycle
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest mt-0.5">
                  {isHighSun ? '☀️ Solar 1.2x Boost' : pwmPct > 65 ? 'High Volume' : pwmPct > 35 ? 'Moderate' : 'Conservation'}
                </span>
              </div>
            </div>
          </div>

          {/* Formula Factor Chips */}
          <div className="space-y-1 pt-1.5 border-t border-slate-800/80">
            <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
              <div className="p-1.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Heat Factor</span>
                <span className="text-emerald-400 font-bold">
                  +{Math.max(0, (sensors.temperature - 20) * 4).toFixed(0)}
                </span>
              </div>
              <div className="p-1.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Humidity Offset</span>
                <span className="text-rose-400 font-bold">
                  -{Math.max(0, (sensors.humidity - 20) * 0.8).toFixed(0)}
                </span>
              </div>

              {/* Sunlight Multiplier Chip */}
              <div className="p-1.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between col-span-2">
                <span className="text-slate-400 flex items-center gap-1">
                  <Sun size={11} className={isHighSun ? 'text-amber-400 animate-spin-slow' : 'text-slate-500'} />
                  Solar Transpiration (LDR)
                </span>
                <span className={isHighSun ? 'text-amber-400 font-extrabold' : 'text-slate-400 font-bold'}>
                  {isHighSun ? '1.2x Flow Multiplier' : '1.0x (Standard)'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] px-1 py-0.5 text-slate-400 font-mono">
              <span>POST http://192.168.1.101/set_flow</span>
              <span className={mode === 'LIVE' && pwm_sent ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {mode === 'LIVE' ? (pwm_sent ? 'OK 200' : 'QUEUED') : 'SIMULATED'}
              </span>
            </div>
          </div>
        </div>

        {/* ── BENTO COLUMN 2: THE CENTERPIECE KALANCHOE PLANT CARD (4 cols) ── */}
        <div className="lg:col-span-4 flex flex-col min-h-0 h-full">
          <KalanchoePlantCard />
        </div>

        {/* ── BENTO COLUMN 3: Ambient Weather, AQI & ESP32 Telemetry (4 cols, 2 rows of 1fr) ── */}
        <div className="lg:col-span-4 grid grid-rows-2 gap-2.5 sm:gap-3 min-h-0 h-full">
          {/* Card: Ambient Conditions & AQI Stomata Throttle */}
          <div className="glass-card rounded-2xl p-3 xl:p-3.5 flex flex-col justify-between border border-emerald-500/25 min-h-0 overflow-hidden">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
                  <Wind size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold font-mono uppercase tracking-wider text-slate-300">
                    Ambient Environment & AQI
                  </h3>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin size={9} />
                    <span>{weather.city}</span>
                  </p>
                </div>
              </div>

              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  weather.aqi_raw > 150
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {weather.aqi_raw > 150 ? 'THROTTLED' : 'NOMINAL'}
              </span>
            </div>

            {/* AQI Readout Bar */}
            <div className="my-auto py-1">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-semibold text-slate-400">Air Quality Index</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {weather.aqi_raw} <span className="text-[10px] text-slate-500 font-normal">AQI</span>
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (weather.aqi_raw / 300) * 100)}%` }}
                />
              </div>
              {weather.aqi_raw > 150 ? (
                <p className="text-[9px] text-rose-400 font-mono mt-0.5">
                  ⚠️ Stomata closed under pollution (AQI &gt; 150). PWM -20%.
                </p>
              ) : (
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                  Clean atmospheric boundary layer. Full transpiration active.
                </p>
              )}
            </div>

            {/* Dual Ambient Stats */}
            <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-800 text-[10px] font-mono">
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-900/40">
                <Flame size={13} className="text-amber-400" />
                <div>
                  <span className="text-slate-400 block text-[9px]">Ambient Temp</span>
                  <span className="text-amber-300 font-bold">{weather.temp_outside.toFixed(1)}°C</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-900/40">
                <Droplet size={13} className="text-emerald-400" />
                <div>
                  <span className="text-slate-400 block text-[9px]">Outside RH</span>
                  <span className="text-emerald-300 font-bold">{weather.humidity_outside.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: New Hardware Status & Sensor Diagnostics Bento Card */}
          <HardwareStatusCard />
        </div>
      </section>
    </div>
  )
}
