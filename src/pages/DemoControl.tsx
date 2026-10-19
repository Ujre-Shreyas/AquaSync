import { useAquaStore } from '../store/useAquaStore'
import { SlidersHorizontal, Zap, Info, HardDrive } from 'lucide-react'

interface SliderRowProps {
  id: string
  label: string
  value: number
  min: number
  max: number
  unit: string
  step?: number
  color?: string
  description?: string
  onChange: (v: number) => void
  formatter?: (v: number) => string
  minLabel?: string
  maxLabel?: string
}

function SliderRow({
  id,
  label,
  value,
  min,
  max,
  unit,
  step = 1,
  color = '#06b3de',
  description,
  onChange,
  formatter,
  minLabel,
  maxLabel,
}: SliderRowProps) {
  const pct = ((value - min) / (max - min)) * 100
  const display = formatter ? formatter(value) : value.toString()

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <label htmlFor={id} className="text-sm font-semibold text-slate-300">
            {label}
          </label>
          {description && (
            <p className="text-xs text-slate-600 mt-0.5">{description}</p>
          )}
        </div>
        <div className="text-right">
          <span
            className="text-xl font-bold font-mono"
            style={{ color }}
          >
            {display}
          </span>
          <span className="text-xs text-slate-500 ml-1">{unit}</span>
        </div>
      </div>

      <div className="relative">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #1e293b ${pct}%, #1e293b 100%)`,
          }}
        />
        <div className="flex justify-between text-xs text-slate-500 mt-1 font-mono">
          <span className="text-emerald-400 font-semibold">{minLabel ?? min}</span>
          <span className="text-slate-400">{Math.round(pct)}%</span>
          <span className="text-rose-400 font-semibold">{maxLabel ?? max}</span>
        </div>
      </div>
    </div>
  )
}

export default function DemoControl() {
  const {
    mode,
    setMode,
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

  const isDemoMode = mode === 'DEMO'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <SlidersHorizontal size={22} className="text-aqua-400" />
          Demo Control Panel
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Simulate sensor readings without an ESP32. Enable Demo mode to unlock sliders.
        </p>
      </div>

      {/* ── Mode banner ── */}
      <div
        className={`glass rounded-2xl p-4 flex items-center justify-between border ${
          isDemoMode
            ? 'border-amber-500/30 bg-amber-500/5'
            : 'border-slate-700/30'
        }`}
      >
        <div className="flex items-center gap-3">
          <Zap size={18} className={isDemoMode ? 'text-amber-400' : 'text-slate-600'} />
          <div>
            <p className="text-sm font-semibold text-slate-300">
              {isDemoMode ? 'Demo Mode Active' : 'LIVE Mode Active'}
            </p>
            <p className="text-xs text-slate-500">
              {isDemoMode
                ? 'Sliders directly control all UI components in real time.'
                : 'ESP32 is polled every 2 seconds. Sliders are locked.'}
            </p>
          </div>
        </div>
        <button
          id="demo-mode-btn"
          onClick={() => setMode(isDemoMode ? 'LIVE' : 'DEMO')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
            isDemoMode
              ? 'bg-aqua-500 text-white hover:bg-aqua-400'
              : 'bg-amber-500 text-white hover:bg-amber-400'
          }`}
        >
          Switch to {isDemoMode ? 'LIVE' : 'DEMO'}
        </button>
      </div>

      {/* ── Sliders ── */}
      <div className={`glass rounded-2xl p-6 space-y-8 ring-1 ring-aqua-500/20 transition-opacity duration-300 ${
        !isDemoMode ? 'opacity-50 pointer-events-none select-none' : ''
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <SlidersHorizontal size={16} className="text-aqua-400" />
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest">
            Sensor Simulation Sliders
          </h2>
        </div>

        {!isDemoMode && (
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-3 text-xs text-slate-400 -mt-4">
            <Info size={13} />
            Switch to DEMO mode above to enable slider control.
          </div>
        )}

        <SliderRow
          id="slider-soil"
          label="Soil Moisture"
          value={demo_soil}
          min={0}
          max={4095}
          unit="ADC"
          color="#22c55e"
          description="0 = Wet/Submerged (high capacitance), 4095 = Dry/In Air (capacitive probe)"
          onChange={setDemoSoil}
          formatter={(v) => `${v} (${Math.min(100, Math.max(0, Math.round(((4095 - v) / (4095 - 1200)) * 100)))}% wet)`}
          minLabel="0 (Wet/Submerged)"
          maxLabel="4095 (Dry/In Air)"
        />

        <SliderRow
          id="slider-rain"
          label="Rain Sensor"
          value={demo_rain}
          min={0}
          max={4095}
          unit="ADC"
          color="#06b3de"
          description="4095 = completely dry, below 3800 triggers rain detection"
          onChange={setDemoRain}
          formatter={(v) => {
            const wetness = Math.round(((4095 - v) / 4095) * 100)
            return `${v} (${wetness}% wet)`
          }}
        />

        <SliderRow
          id="slider-light"
          label="Sunlight Intensity (LDR)"
          value={demo_light}
          min={0}
          max={4095}
          unit="ADC"
          color="#f59e0b"
          description="0 = dark night, 4095 = peak lux (>2800 ADC triggers 1.2x botanical boost)"
          onChange={setDemoLight}
          formatter={(v) => {
            const pct = Math.round((v / 4095) * 100)
            return `${v} (${pct}% intensity)`
          }}
        />

        <SliderRow
          id="slider-aqi"
          label="Air Quality Index"
          value={demo_aqi}
          min={0}
          max={500}
          unit="AQI"
          color={demo_aqi > 150 ? '#f43f5e' : demo_aqi > 100 ? '#f59e0b' : '#22c55e'}
          description="0-50 Good · 51-100 Moderate · 101-150 Sensitive · 151+ Unhealthy"
          onChange={setDemoAqi}
        />

        <SliderRow
          id="slider-temp"
          label="Temperature (DHT11)"
          value={demo_temp}
          min={0}
          max={60}
          step={0.5}
          unit="°C"
          color={demo_temp < 10 || demo_temp > 45 ? '#f43f5e' : '#f59e0b'}
          description="Pre-Calibration Check requires 10°C – 45°C. Values outside trigger Pre-Calibration Guard."
          onChange={setDemoTemp}
          formatter={(v) => `${v.toFixed(1)}°C ${v < 10 || v > 45 ? '⚠️ OUT OF BOUNDS' : '✅ Nominal'}`}
          minLabel="0°C"
          maxLabel="60°C"
        />

        <SliderRow
          id="slider-humidity"
          label="Relative Humidity (DHT11)"
          value={demo_humidity}
          min={0}
          max={100}
          step={1}
          unit="%"
          color={demo_humidity < 20 || demo_humidity > 95 ? '#f43f5e' : '#06b3de'}
          description="Pre-Calibration Check requires 20% – 95%. Values outside trigger Pre-Calibration Guard."
          onChange={setDemoHumidity}
          formatter={(v) => `${v.toFixed(0)}% ${v < 20 || v > 95 ? '⚠️ OUT OF BOUNDS' : '✅ Nominal'}`}
          minLabel="0%"
          maxLabel="100%"
        />

        {/* MicroSD Card Status Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <HardDrive size={18} className={demo_sd_active ? 'text-emerald-400' : 'text-rose-400'} />
            <div>
              <p className="text-sm font-semibold text-slate-300">MicroSD Card State (sd_active / sd_ready)</p>
              <p className="text-xs text-slate-500">Simulate SD card insertion or storage fault in diagnostics panel</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDemoSdActive(!demo_sd_active)}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border ${
              demo_sd_active
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/40 hover:bg-rose-500/30'
            }`}
          >
            {demo_sd_active ? 'Mounted & Active' : 'Unmounted (Fault)'}
          </button>
        </div>
      </div>

      {/* ── Live readouts ── */}
      <div className="glass rounded-2xl p-6 ring-1 ring-aqua-500/20">
        <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-4">
          Live State Preview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Soil',       value: sensors.soil_moisture.toFixed(0), unit: 'ADC', color: '#22c55e' },
            { label: 'Rain',       value: sensors.rain_raw.toFixed(0),       unit: 'ADC', color: '#06b3de' },
            { label: 'Sunlight',   value: `${Math.round(((sensors.light_raw ?? 2048) / 4095) * 100)}%`, unit: `(${sensors.light_raw ?? 2048} ADC)`, color: '#f59e0b' },
            { label: 'SD Card',    value: sensors.sd_active ? 'Online' : 'Fault', unit: '', color: sensors.sd_active ? '#22c55e' : '#f43f5e' },
            { label: 'AQI',        value: String(demo_aqi),                  unit: '',    color: demo_aqi > 150 ? '#f43f5e' : '#22c55e' },
            { label: 'Temp',       value: sensors.temperature.toFixed(1),    unit: '°C',  color: '#f59e0b' },
            { label: 'Humidity',   value: sensors.humidity.toFixed(0),       unit: '%',   color: '#06b3de' },
            { label: 'Target PWM', value: String(target_pwm),                unit: '/255',color: '#06b3de' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="bg-slate-800/40 rounded-xl p-3">
              <p className="text-xs text-slate-500 uppercase tracking-wider">{label}</p>
              <p className="font-mono font-bold text-lg mt-0.5" style={{ color }}>
                {value}
                <span className="text-xs text-slate-600 ml-1">{unit}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
