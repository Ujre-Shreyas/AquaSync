import { useAquaStore } from '../store/useAquaStore'
import {
  SlidersHorizontal,
  X,
  Sparkles,
  Sprout,
  CloudRain,
  Wind,
  Sun,
  RotateCcw,
  Gauge,
  HardDrive,
  Flame,
  Droplets
} from 'lucide-react'

export default function DemoControlDrawer() {
  const {
    mode,
    demoPanelOpen,
    setDemoPanelOpen,
    toggleDemoPanel,
    demo_soil,
    demo_rain,
    demo_aqi,
    demo_light,
    demo_temp,
    demo_humidity,
    demo_sd_active,
    setDemoSoil,
    setDemoRain,
    setDemoAqi,
    setDemoLight,
    setDemoTemp,
    setDemoHumidity,
    setDemoSdActive,
    sensors,
    target_pwm,
  } = useAquaStore()

  // Only visible when DEMO mode is active
  if (mode !== 'DEMO') return null

  const soilPct = Math.round(((4095 - demo_soil) / (4095 - 1200)) * 100)
  const isRaining = demo_rain < 3800
  const rainPct = Math.round(((4095 - demo_rain) / 4095) * 100)
  const lightPct = Math.round((demo_light / 4095) * 100)
  const isHighSun = demo_light > 2800

  const handleResetSliders = () => {
    setDemoSoil(2048)
    setDemoRain(4000)
    setDemoAqi(50)
    setDemoLight(3150)
    setDemoTemp(28.4)
    setDemoHumidity(62)
    setDemoSdActive(true)
  }

  return (
    <>
      {/* ── Slide-out Tab Trigger (Right Edge) ── */}
      <button
        id="demo-drawer-toggle-tab"
        onClick={toggleDemoPanel}
        className={`fixed top-24 right-0 z-40 flex items-center gap-2 py-3 px-3.5 rounded-l-2xl shadow-xl transition-all duration-300 font-bold text-xs select-none ${
          demoPanelOpen
            ? 'translate-x-full opacity-0 pointer-events-none'
            : 'bg-emerald-500 text-slate-950 shadow-emerald-500/30 hover:pr-5'
        }`}
        title="Open Demo Sliders"
      >
        <SlidersHorizontal size={16} className="animate-pulse" />
        <span className="hidden sm:inline">Demo Sliders</span>
        <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
      </button>

      {/* ── Right-Side Slide-Out Panel ── */}
      <div
        id="demo-slideout-panel"
        className={`fixed top-0 right-0 h-screen w-80 sm:w-96 z-40 glass-panel border-l border-emerald-500/30 shadow-2xl flex flex-col transition-transform duration-300 ease-out select-none ${
          demoPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          backgroundColor: 'var(--bg-card)',
        }}
      >
        {/* Top Watermelon strip */}
        <div className="watermelon-strip" />

        {/* Header */}
        <div className="p-5 border-b border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <SlidersHorizontal size={18} />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-tight">Demo Control Panel</h2>
              <p className="text-[11px] text-slate-400">Real-Time Reactive Sliders</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetSliders}
              title="Reset sliders to defaults"
              className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            >
              <RotateCcw size={15} />
            </button>
            <button
              onClick={() => setDemoPanelOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Sliders */}
        <div className="flex-1 p-5 space-y-5 overflow-y-auto">
          {/* Banner */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-start gap-2">
            <Sparkles size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Moving these sliders instantly updates all UI cards, dynamic solar radiance, the Botanical PWM engine, and triggers simulated rain/light reactions.
            </p>
          </div>

          {/* Slider 1: Soil Moisture */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900/30 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sprout size={16} className="text-emerald-400" />
                <label htmlFor="drawer-soil-slider" className="text-xs font-bold uppercase tracking-wider">
                  Soil Moisture
                </label>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-emerald-400 text-sm">
                  {demo_soil}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">ADC ({soilPct}%)</span>
              </div>
            </div>

            <input
              id="drawer-soil-slider"
              type="range"
              min={0}
              max={4095}
              value={demo_soil}
              onChange={(e) => setDemoSoil(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #10b981 0%, #10b981 ${(demo_soil / 4095) * 100}%, #334155 ${(demo_soil / 4095) * 100}%, #334155 100%)`,
              }}
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span className="text-emerald-400 font-semibold">0 (Wet/Submerged)</span>
              <span className="text-slate-400 font-semibold">
                {demo_soil < 1600 ? 'Submerged / Wet' : demo_soil < 2800 ? 'Optimal' : 'Dry Soil'}
              </span>
              <span className="text-rose-400 font-semibold">4095 (Dry/In Air)</span>
            </div>
          </div>

          {/* Slider 2: Sunlight Intensity (LDR Sensor) */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900/30 border border-amber-500/30 shadow-sm shadow-amber-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sun size={16} className={isHighSun ? 'text-amber-400 animate-spin-slow' : 'text-amber-500'} />
                <label htmlFor="drawer-light-slider" className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Sunlight Intensity (LDR)
                </label>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {lightPct}%
                </span>
                <span className="text-[10px] text-slate-400 ml-1">({demo_light} ADC)</span>
              </div>
            </div>

            <input
              id="drawer-light-slider"
              type="range"
              min={0}
              max={4095}
              value={demo_light}
              onChange={(e) => setDemoLight(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #fbbf24 ${(demo_light / 4095) * 100}%, #334155 ${(demo_light / 4095) * 100}%, #334155 100%)`,
              }}
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>0 (Dark Night)</span>
              <span className={isHighSun ? 'text-amber-400 font-bold' : 'text-slate-400 font-semibold'}>
                {demo_light > 2800 ? 'Direct Sunlight (1.2x Boost)' : demo_light > 1000 ? 'Ambient Daylight' : 'Low Light'}
              </span>
              <span>4095 (Max Lux)</span>
            </div>
            {isHighSun && (
              <p className="text-[10px] text-amber-300 font-mono">
                ☀️ High Transpiration: 1.2x multiplier applied to target PWM flow!
              </p>
            )}
          </div>

          {/* Slider 3: Rain Raw Sensor */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900/30 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudRain size={16} className={isRaining ? 'text-emerald-400 animate-bounce' : 'text-slate-400'} />
                <label htmlFor="drawer-rain-slider" className="text-xs font-bold uppercase tracking-wider">
                  Rain Sensor Raw
                </label>
              </div>
              <div className="text-right">
                <span className={`font-mono font-bold text-sm ${isRaining ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {demo_rain}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">ADC</span>
              </div>
            </div>

            <input
              id="drawer-rain-slider"
              type="range"
              min={0}
              max={4095}
              value={demo_rain}
              onChange={(e) => setDemoRain(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${(demo_rain / 4095) * 100}%, #334155 ${(demo_rain / 4095) * 100}%, #334155 100%)`,
              }}
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span className="text-emerald-400">0 (Deluge)</span>
              <span className={isRaining ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                {isRaining ? `Rain Active (${rainPct}% wet)` : 'Dry (>3800)'}
              </span>
              <span>4095 (Dry)</span>
            </div>
            {isRaining && (
              <p className="text-[10px] text-emerald-400/90 font-mono">
                ⚡ Below 3800: Rain volume estimator is actively ticking!
              </p>
            )}
          </div>

          {/* Slider 4: AQI (Air Quality Index) */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900/30 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wind size={16} className={demo_aqi > 150 ? 'text-rose-400' : 'text-emerald-400'} />
                <label htmlFor="drawer-aqi-slider" className="text-xs font-bold uppercase tracking-wider">
                  Air Quality Index (AQI)
                </label>
              </div>
              <div className="text-right">
                <span className={`font-mono font-bold text-sm ${demo_aqi > 150 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {demo_aqi}
                </span>
                <span className="text-[10px] text-slate-400 ml-1">AQI</span>
              </div>
            </div>

            <input
              id="drawer-aqi-slider"
              type="range"
              min={0}
              max={500}
              value={demo_aqi}
              onChange={(e) => setDemoAqi(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #10b981 0%, #f59e0b 35%, #f43f5e 65%, #9333ea 100%)`,
              }}
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span className="text-emerald-400">0 Good</span>
              <span className="text-amber-400">100 Mod</span>
              <span className="text-rose-400">150+ Throttle</span>
              <span className="text-purple-400">500</span>
            </div>
            {demo_aqi > 150 && (
              <p className="text-[10px] text-rose-400 font-mono">
                ⚠️ Botanical Throttle: AQI &gt; 150 reduces target PWM flow rate!
              </p>
            )}
          </div>

          {/* Slider 5: Temperature (Pre-Calibration Sanity Check: 10°C - 45°C) */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900/30 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame size={16} className={demo_temp < 10 || demo_temp > 45 ? 'text-rose-400 animate-pulse' : 'text-amber-400'} />
                <label htmlFor="drawer-temp-slider" className="text-xs font-bold uppercase tracking-wider">
                  Temperature
                </label>
              </div>
              <div className="text-right">
                <span className={`font-mono font-bold text-sm ${demo_temp < 10 || demo_temp > 45 ? 'text-rose-400' : 'text-amber-300'}`}>
                  {demo_temp.toFixed(1)}°C
                </span>
                <span className="text-[10px] text-slate-400 ml-1">DHT11</span>
              </div>
            </div>

            <input
              id="drawer-temp-slider"
              type="range"
              min={0}
              max={60}
              step={0.5}
              value={demo_temp}
              onChange={(e) => setDemoTemp(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(demo_temp / 60) * 100}%, #334155 ${(demo_temp / 60) * 100}%, #334155 100%)`,
              }}
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span className={demo_temp < 10 ? 'text-rose-400 font-bold' : ''}>0°C (&lt;10 Anomaly)</span>
              <span className={demo_temp >= 10 && demo_temp <= 45 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {demo_temp >= 10 && demo_temp <= 45 ? 'Safe: 10–45°C' : 'Pre-Check Blocked!'}
              </span>
              <span className={demo_temp > 45 ? 'text-rose-400 font-bold' : ''}>60°C (&gt;45 Anomaly)</span>
            </div>
          </div>

          {/* Slider 6: Relative Humidity (Pre-Calibration Sanity Check: 20% - 95%) */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-900/30 border border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets size={16} className={demo_humidity < 20 || demo_humidity > 95 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'} />
                <label htmlFor="drawer-humidity-slider" className="text-xs font-bold uppercase tracking-wider">
                  Relative Humidity
                </label>
              </div>
              <div className="text-right">
                <span className={`font-mono font-bold text-sm ${demo_humidity < 20 || demo_humidity > 95 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {demo_humidity.toFixed(0)}%
                </span>
                <span className="text-[10px] text-slate-400 ml-1">RH</span>
              </div>
            </div>

            <input
              id="drawer-humidity-slider"
              type="range"
              min={0}
              max={100}
              step={1}
              value={demo_humidity}
              onChange={(e) => setDemoHumidity(Number(e.target.value))}
              style={{
                background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${demo_humidity}%, #334155 ${demo_humidity}%, #334155 100%)`,
              }}
            />

            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span className={demo_humidity < 20 ? 'text-rose-400 font-bold' : ''}>0% (&lt;20 Anomaly)</span>
              <span className={demo_humidity >= 20 && demo_humidity <= 95 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {demo_humidity >= 20 && demo_humidity <= 95 ? 'Safe: 20–95%' : 'Pre-Check Blocked!'}
              </span>
              <span className={demo_humidity > 95 ? 'text-rose-400 font-bold' : ''}>100% (&gt;95 Anomaly)</span>
            </div>
          </div>

          {/* Item 7: MicroSD Card Diagnostics Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/30 border border-slate-800">
            <div className="flex items-center gap-2.5">
              <HardDrive size={16} className={demo_sd_active ? 'text-emerald-400' : 'text-rose-400'} />
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block text-slate-200">
                  MicroSD Card (sd_active)
                </span>
                <span className="text-[10px] text-slate-400">
                  Toggle to test hardware status card diagnostics
                </span>
              </div>
            </div>
            <button
              type="button"
              id="drawer-toggle-sd-btn"
              onClick={() => setDemoSdActive(!demo_sd_active)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                demo_sd_active
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
              }`}
            >
              {demo_sd_active ? 'Online' : 'Offline'}
            </button>
          </div>

          {/* Real-time Computed Botanical PWM Readout */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-slate-900/80 border border-emerald-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Gauge size={15} className="text-emerald-400" />
                Target Flow PWM
              </span>
              <span className="text-xl font-extrabold font-mono text-emerald-400 text-glow-emerald">
                {target_pwm} <span className="text-xs text-slate-500">/ 255</span>
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-rose-400 transition-all duration-300"
                style={{ width: `${(target_pwm / 255) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-mono">
              <span>Duty: {Math.round((target_pwm / 255) * 100)}%</span>
              <span>Flow: {sensors.flow_speed.toFixed(2)} L/min</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-emerald-500/20 text-center">
          <button
            onClick={() => setDemoPanelOpen(false)}
            className="w-full py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 font-bold text-xs transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </>
  )
}
