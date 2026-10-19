import { useState, useRef, useEffect } from 'react'
import { useAquaStore, type CalibrationHistoryEntry } from '../store/useAquaStore'
import {
  Sliders,
  CheckCircle,
  Save,
  Sprout,
  CloudRain,
  Info,
  History,
  RotateCcw,
  AlertOctagon,
  ShieldAlert,
  ShieldCheck,
  X,
  SlidersHorizontal
} from 'lucide-react'

export interface PreCalibrationAnomaly {
  sensor: string
  currentValue: string
  safeRange: string
  faultType: 'out_of_range' | 'hard_short' | 'disconnected' | 'invalid'
  description: string
}

// ─── Sanity Check Logic ────────────────────────────────────────────────────────
// Temperature: Must be between 10°C and 45°C.
// Humidity: Must be between 20% and 95%.
// Soil & Rain Raw: Must be between 1 and 4094 (exactly 0 or 4095 indicates a disconnected pin or hard short).
export function checkPreCalibrationSensors(sensors: {
  temperature: number
  humidity: number
  soil_moisture: number
  rain_raw: number
}): { passed: boolean; anomalies: PreCalibrationAnomaly[] } {
  const anomalies: PreCalibrationAnomaly[] = []

  // 1. Temperature: Must be between 10°C and 45°C
  const temp = sensors.temperature
  if (temp === null || temp === undefined || isNaN(temp) || temp < 10 || temp > 45) {
    const isNanOrNull = temp === null || temp === undefined || isNaN(temp)
    const valText = isNanOrNull ? 'NaN / Null' : `${temp.toFixed(1)}°C`
    anomalies.push({
      sensor: 'DHT11 Temperature',
      currentValue: valText,
      safeRange: '10.0°C – 45.0°C',
      faultType: isNanOrNull ? 'invalid' : 'out_of_range',
      description: `Ambient temperature (${valText}) is outside the safe threshold (10°C – 45°C). Thermal drift invalidates ADC slope calibration.`,
    })
  }

  // 2. Humidity: Must be between 20% and 95%
  const hum = sensors.humidity
  if (hum === null || hum === undefined || isNaN(hum) || hum < 20 || hum > 95) {
    const isNanOrNull = hum === null || hum === undefined || isNaN(hum)
    const valText = isNanOrNull ? 'NaN / Null' : `${hum.toFixed(0)}%`
    anomalies.push({
      sensor: 'DHT11 Humidity',
      currentValue: valText,
      safeRange: '20% – 95%',
      faultType: isNanOrNull ? 'invalid' : 'out_of_range',
      description: `Relative humidity (${valText}) is outside the safe operating envelope (20% – 95%). Extreme dry air or condensing humidity detected.`,
    })
  }

  // 3. Soil Moisture Raw: Must be between 1 and 4094 (0 = short, 4095 = disconnected wire)
  const soil = sensors.soil_moisture
  if (soil === null || soil === undefined || isNaN(soil) || soil < 1 || soil > 4094) {
    const isShort = soil <= 0
    const isDisc = soil >= 4095
    const faultType = isShort ? 'hard_short' : isDisc ? 'disconnected' : 'out_of_range'
    const statusLabel = isShort
      ? '0 ADC (Hard Short / Grounded)'
      : isDisc
      ? '4095 ADC (Disconnected / Open Wire)'
      : `${soil} ADC`
    anomalies.push({
      sensor: 'Soil Moisture Sensor (ADC)',
      currentValue: statusLabel,
      safeRange: '1 – 4094 ADC',
      faultType,
      description: isShort
        ? 'Soil sensor signal line is grounded (0 ADC). Hard short detected on GPIO pin.'
        : isDisc
        ? 'Soil sensor signal line is floating / pulled high (4095 ADC). Disconnected or loose probe wire detected.'
        : `Soil sensor reading ${soil} ADC is out of allowable 12-bit analog bounds.`,
    })
  }

  // 4. Rain Sensor Raw: Must be between 1 and 4094 (0 = short, 4095 = disconnected wire)
  const rain = sensors.rain_raw
  if (rain === null || rain === undefined || isNaN(rain) || rain < 1 || rain > 4094) {
    const isShort = rain <= 0
    const isDisc = rain >= 4095
    const faultType = isShort ? 'hard_short' : isDisc ? 'disconnected' : 'out_of_range'
    const statusLabel = isShort
      ? '0 ADC (Hard Short / Grounded)'
      : isDisc
      ? '4095 ADC (Disconnected / Open Wire)'
      : `${rain} ADC`
    anomalies.push({
      sensor: 'Rain Sensor (ADC)',
      currentValue: statusLabel,
      safeRange: '1 – 4094 ADC',
      faultType,
      description: isShort
        ? 'Rain detector trace is shorted to GND (0 ADC). PCB comparator short circuit detected.'
        : isDisc
        ? 'Rain detector trace is open / disconnected (4095 ADC). Signal wire unplugged or corroded.'
        : `Rain sensor reading ${rain} ADC is out of allowable 12-bit analog bounds.`,
    })
  }

  return {
    passed: anomalies.length === 0,
    anomalies,
  }
}

export default function Calibration() {
  const {
    calibration,
    setCalibration,
    calibrationHistory,
    flashCalibrationToEsp32,
    sensors,
    mode,
    toggleDemoPanel,
  } = useAquaStore()
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [restoredId, setRestoredId] = useState<string | null>(null)
  const [preCheckErrors, setPreCheckErrors] = useState<PreCalibrationAnomaly[]>([])
  const [showErrorToast, setShowErrorToast] = useState(false)
  const toastTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    }
  }, [])

  // Live real-time check status
  const livePreCheck = checkPreCalibrationSensors(sensors)

  // Presets
  const applyPreset = (preset: 'standard' | 'sandy' | 'rockwool') => {
    if (preset === 'standard') {
      setCalibration({ soilDryAdc: 4095, soilWetAdc: 1200, rainThreshold: 3800, pumpPwmOffset: 30 })
    } else if (preset === 'sandy') {
      setCalibration({ soilDryAdc: 3950, soilWetAdc: 1450, rainThreshold: 3750, pumpPwmOffset: 45 })
    } else if (preset === 'rockwool') {
      setCalibration({ soilDryAdc: 4095, soilWetAdc: 900, rainThreshold: 3850, pumpPwmOffset: 25 })
    }
  }

  // Pre-Calibration Guarded Save Action
  const handleSaveCalibration = async () => {
    // Run the Pre-Calibration Sanity Check against live Zustand sensors
    const checkResult = checkPreCalibrationSensors(sensors)

    if (!checkResult.passed) {
      // BLOCK the save action and render red Watermelon UI toast & alert banner
      setPreCheckErrors(checkResult.anomalies)
      setShowErrorToast(true)

      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = setTimeout(() => {
        setShowErrorToast(false)
      }, 8000)
      return
    }

    // All checks passed! Proceed with saving to localStorage and POST to http://192.168.1.101/calibrate
    setShowErrorToast(false)
    setPreCheckErrors([])
    await flashCalibrationToEsp32(calibration)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  // Restore historical calibration
  const handleRestore = (entry: CalibrationHistoryEntry) => {
    setCalibration({
      soilDryAdc: entry.soilDryAdc,
      soilWetAdc: entry.soilWetAdc,
      rainThreshold: entry.rainThreshold,
      pumpPwmOffset: entry.pumpPwmOffset,
    })
    setRestoredId(entry.id)
    setTimeout(() => setRestoredId(null), 2000)
  }

  // Live calibrated soil moisture calculation
  const liveCalibratedPercent = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        ((calibration.soilDryAdc - sensors.soil_moisture) /
          (calibration.soilDryAdc - calibration.soilWetAdc)) *
          100
      )
    )
  )

  return (
    <div
      id="calibration-page-container"
      className="min-h-screen overflow-y-auto p-4 xl:p-8 space-y-6 pb-16 select-none relative"
    >
      {/* ── RED WATERMELON UI TOAST (POPS UP ON PRE-CHECK REJECTION) ── */}
      {showErrorToast && (
        <div
          id="watermelon-pre-check-toast"
          role="alert"
          className="fixed top-5 right-5 sm:right-6 z-50 w-[92vw] sm:w-[460px] max-w-lg rounded-2xl bg-gradient-to-br from-[#1c0d14] via-[#12080e] to-[#0a120e] border-2 border-rose-500/90 shadow-2xl shadow-rose-950/80 p-4 sm:p-5 text-slate-100 backdrop-blur-2xl relative overflow-hidden ring-1 ring-rose-400/40 animate-in fade-in slide-in-from-top-4 duration-300 select-none"
        >
          {/* Watermelon Strip: Red/Pink to Emerald Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-rose-400 to-emerald-400 animate-pulse" />

          {/* Toast Header */}
          <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-rose-500/20">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm shadow-rose-500/30">
                <AlertOctagon size={18} className="animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-extrabold text-white tracking-tight">
                    Pre-Calibration Guard
                  </h4>
                  <span className="text-[9px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-rose-500/25 text-rose-300 border border-rose-500/40 tracking-wider uppercase">
                    Watermelon Shield
                  </span>
                </div>
                <p className="text-[11px] text-rose-300/80 font-mono">
                  Save Action Blocked • Telemetry Anomaly
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowErrorToast(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-rose-500/20 transition-colors"
              title="Dismiss Toast"
            >
              <X size={16} />
            </button>
          </div>

          {/* Toast Description */}
          <p className="text-xs text-rose-200/90 font-mono mt-2.5 mb-2 leading-relaxed">
            Threshold save was blocked to prevent corrupting baseline curves. The following {preCheckErrors.length} sensor{preCheckErrors.length > 1 ? 's are' : ' is'} out of safe operational bounds:
          </p>

          {/* List of Anomalous Sensors */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 my-2.5">
            {preCheckErrors.map((anomaly, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 space-y-1 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    {anomaly.sensor}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/25 text-rose-200 border border-rose-500/40 font-bold">
                    {anomaly.currentValue}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">{anomaly.description}</p>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 pt-0.5 font-bold">
                  <span>Safe Range Required:</span>
                  <span>{anomaly.safeRange}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Toast Actions */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-rose-500/20 text-xs font-mono">
            {mode === 'DEMO' ? (
              <button
                onClick={() => {
                  toggleDemoPanel()
                  setShowErrorToast(false)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold transition-all text-[11px]"
              >
                <SlidersHorizontal size={13} />
                <span>Adjust Demo Sliders</span>
              </button>
            ) : (
              <span className="text-[10px] text-slate-400">Inspect wiring on ESP32 bus</span>
            )}

            <button
              onClick={() => setShowErrorToast(false)}
              className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold transition-all ml-auto text-[11px]"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Sliders size={22} />
            </div>
            <div>
              <h1 className="text-2xl xl:text-3xl font-black tracking-tight flex items-center gap-3">
                <span>Hardware Sensor Calibration</span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ESP32 ADC Vref
                </span>
              </h1>
              <p className="text-xs xl:text-sm text-slate-400 font-mono mt-0.5">
                Tune 12-bit ADC attenuation curves, dry/wet capacitance baselines, and DC pump PWM offsets
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Live Telemetry Status Pill */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold ${
              livePreCheck.passed
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse'
            }`}
            title={livePreCheck.passed ? 'All sensors nominal' : 'Sensor anomalies detected'}
          >
            {livePreCheck.passed ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
            <span>
              {livePreCheck.passed
                ? 'Pre-Check: Safe'
                : `Pre-Check: ${livePreCheck.anomalies.length} Anomaly`}
            </span>
          </div>

          <button
            onClick={() => applyPreset('standard')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-all"
          >
            Reset Defaults
          </button>
          <button
            id="save-calibration-btn"
            data-testid="save-calibration-btn"
            onClick={handleSaveCalibration}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg ${
              savedSuccess
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/30'
                : !livePreCheck.passed
                ? 'bg-gradient-to-r from-emerald-500 to-rose-500 hover:from-emerald-400 hover:to-rose-400 text-slate-950 shadow-rose-500/20'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/30'
            }`}
          >
            {savedSuccess ? <CheckCircle size={15} /> : <Save size={15} />}
            <span>{savedSuccess ? 'Calibration Saved!' : 'Save Calibration'}</span>
          </button>
          {/* Backwards compatibility selector for write-eeprom-btn */}
          <button
            id="write-eeprom-btn"
            onClick={handleSaveCalibration}
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          >
            Write to EEPROM
          </button>
        </div>
      </header>

      {/* ── INLINE RED WATERMELON ALERT BANNER (IF ANOMALIES DETECTED) ── */}
      {preCheckErrors.length > 0 && (
        <section
          id="watermelon-pre-check-banner"
          role="alert"
          className="rounded-3xl bg-gradient-to-r from-rose-950/70 via-slate-900/90 to-emerald-950/40 border-2 border-rose-500/60 p-4 xl:p-5 relative overflow-hidden shadow-xl shadow-rose-950/40 space-y-3"
        >
          {/* Top Watermelon strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-rose-400 to-emerald-400" />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Pre-Calibration Check: Save Blocked</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    {preCheckErrors.length} ANOMALIES
                  </span>
                </h3>
                <p className="text-xs text-rose-200/80 font-mono mt-0.5">
                  Threshold writing was halted to prevent corrupted EEPROM baselines.
                </p>
              </div>
            </div>

            <button
              onClick={() => setPreCheckErrors([])}
              className="text-xs font-mono font-bold text-slate-400 hover:text-white px-3 py-1 rounded-lg bg-slate-800/60 hover:bg-slate-700/60 transition-colors"
            >
              Dismiss Banner
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {preCheckErrors.map((anomaly, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-950/60 border border-rose-500/30 space-y-1 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    {anomaly.sensor}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                    {anomaly.currentValue}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">{anomaly.description}</p>
                <div className="text-[10px] text-emerald-400 font-bold">
                  Acceptable Range: {anomaly.safeRange}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Preset Chips */}
      <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
        <span className="text-slate-400 font-bold">Soil Matrix Presets:</span>
        <button
          onClick={() => applyPreset('standard')}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold transition-all"
        >
          Potting Soil (Std)
        </button>
        <button
          onClick={() => applyPreset('sandy')}
          className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold transition-all"
        >
          Sandy Loam
        </button>
        <button
          onClick={() => applyPreset('rockwool')}
          className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-300 font-bold transition-all"
        >
          Hydroponic Rockwool
        </button>
      </div>

      {/* ── Main Calibration Cards Grid ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Soil Moisture ADC Span Calibration */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-500/25 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Sprout size={20} className="text-emerald-400" />
              <div>
                <h3 className="text-base font-extrabold tracking-tight">Soil Sensor ADC Transfer Function</h3>
                <p className="text-xs text-slate-400 font-mono">Capacitive probe 0–3.3V ADC span</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              12-bit ADC
            </span>
          </div>

          {/* Dry Point */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold">Dry Baseline (In Air)</span>
              <span className="text-rose-400 font-extrabold">{calibration.soilDryAdc} ADC</span>
            </div>
            <input
              type="range"
              min={3000}
              max={4095}
              value={calibration.soilDryAdc}
              onChange={(e) => setCalibration({ soilDryAdc: Number(e.target.value) })}
            />
            <p className="text-[11px] text-slate-500">Maximum resistance point in bone dry soil</p>
          </div>

          {/* Wet Point */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold">Wet Baseline (Waterlogged)</span>
              <span className="text-emerald-400 font-extrabold">{calibration.soilWetAdc} ADC</span>
            </div>
            <input
              type="range"
              min={500}
              max={2500}
              value={calibration.soilWetAdc}
              onChange={(e) => setCalibration({ soilWetAdc: Number(e.target.value) })}
            />
            <p className="text-[11px] text-slate-500">Minimum resistance point in 100% water</p>
          </div>

          {/* Live Calibrated Output */}
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 block">Current Real-Time Input</span>
              <span className="text-lg font-mono font-bold text-slate-200">{sensors.soil_moisture} ADC</span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-400 block">Calibrated Saturation</span>
              <span className="text-2xl font-mono font-black text-emerald-400 text-glow-emerald">
                {liveCalibratedPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Rain Sensor & Pump PWM Calibration */}
        <div className="glass-card rounded-3xl p-6 border border-emerald-500/25 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <CloudRain size={20} className="text-emerald-400" />
              <div>
                <h3 className="text-base font-extrabold tracking-tight">Precipitation & Pump PWM Tuning</h3>
                <p className="text-xs text-slate-400 font-mono">Trigger thresholds & MOSFET pump deadband offsets</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              Sensor Intercept
            </span>
          </div>

          {/* Rain Threshold */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold">Rain Threshold (Low ADC = Wet)</span>
              <span className="text-emerald-400 font-extrabold">{calibration.rainThreshold} ADC</span>
            </div>
            <input
              type="range"
              min={3000}
              max={4000}
              value={calibration.rainThreshold}
              onChange={(e) => setCalibration({ rainThreshold: Number(e.target.value) })}
            />
            <p className="text-[11px] text-slate-500">
              Readings below this threshold trigger the simulated volume accumulator
            </p>
          </div>

          {/* Pump Minimum Starting PWM */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-300 font-bold">Pump Minimum Starting PWM Offset</span>
              <span className="text-rose-400 font-extrabold">{calibration.pumpPwmOffset} PWM</span>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              value={calibration.pumpPwmOffset}
              onChange={(e) => setCalibration({ pumpPwmOffset: Number(e.target.value) })}
            />
            <p className="text-[11px] text-slate-500">
              Overcomes impeller static friction (deadband offset)
            </p>
          </div>
        </div>
      </section>

      {/* ── Calibration History & Local Storage Registry ── */}
      <section className="glass-card rounded-3xl p-6 border border-emerald-500/25 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <History size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold tracking-tight">Calibration History & Local Storage Registry</h3>
              <p className="text-xs text-slate-400 font-mono">
                Persisted in localStorage; automatically applied on initial load
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            {calibrationHistory.length} Recorded Profiles
          </span>
        </div>

        {calibrationHistory.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono py-4 text-center">
            No calibrations logged yet. Click &quot;Write to EEPROM&quot; to flash and record a new profile.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 font-semibold">Logged Timestamp (ISO)</th>
                  <th className="pb-3 font-semibold">Dry ADC (Air)</th>
                  <th className="pb-3 font-semibold">Wet ADC (Water)</th>
                  <th className="pb-3 font-semibold">Rain Threshold</th>
                  <th className="pb-3 font-semibold">Pump Offset</th>
                  <th className="pb-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {calibrationHistory.map((entry, index) => {
                  const isCurrent =
                    calibration.soilDryAdc === entry.soilDryAdc &&
                    calibration.soilWetAdc === entry.soilWetAdc &&
                    calibration.rainThreshold === entry.rainThreshold &&
                    calibration.pumpPwmOffset === entry.pumpPwmOffset

                  const dateFormatted = new Date(entry.timestamp).toLocaleString()

                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 text-slate-300 font-medium">
                        <div className="flex items-center gap-2">
                          <span>{dateFormatted}</span>
                          {index === 0 && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                              LATEST
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate max-w-xs">{entry.timestamp}</span>
                      </td>
                      <td className="py-3 text-rose-400 font-bold">{entry.soilDryAdc}</td>
                      <td className="py-3 text-emerald-400 font-bold">{entry.soilWetAdc}</td>
                      <td className="py-3 text-sky-400 font-bold">{entry.rainThreshold}</td>
                      <td className="py-3 text-amber-400 font-bold">{entry.pumpPwmOffset}</td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => handleRestore(entry)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ml-auto ${
                            isCurrent
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                              : 'bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 border border-slate-700'
                          }`}
                        >
                          <RotateCcw size={12} />
                          <span>{restoredId === entry.id ? 'Restored!' : isCurrent ? 'Active' : 'Restore'}</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Info Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <Info size={16} className="text-emerald-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Calibration profiles are automatically synchronized with local storage using Zustand persist middleware. When in LIVE mode, values can be flashed to ESP32 non-volatile EEPROM storage at <span className="font-mono text-emerald-400">http://192.168.1.101/calibrate</span> over HTTP.
        </p>
      </div>
    </div>
  )
}
