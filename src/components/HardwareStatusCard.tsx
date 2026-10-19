import { useAquaStore } from '../store/useAquaStore'
import {
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

export default function HardwareStatusCard() {
  const { sensors, esp32Connected, lastFetchTime, mode } = useAquaStore()

  // 1. ESP32 Connection: Active if fetch interval returns 200 status (or active simulation in DEMO)
  const isEsp32Active = mode === 'LIVE' ? esp32Connected : true
  const esp32StatusText = mode === 'LIVE'
    ? (esp32Connected ? 'Connected (200 OK)' : 'Disconnected')
    : 'Online (Demo Mode)'

  // 2. DHT11 Sensor: Active if temperature and humidity are not null or NaN
  const isDhtActive =
    sensors.temperature !== null &&
    !isNaN(sensors.temperature) &&
    sensors.humidity !== null &&
    !isNaN(sensors.humidity)
  const dhtStatusText = isDhtActive
    ? `${sensors.temperature.toFixed(1)}°C · ${sensors.humidity.toFixed(0)}%`
    : 'Offline / NaN'

  // 3. Analog Sensors (Soil, Rain, LDR): Active if raw values are between 1 and 4094 (0 or 4095 indicates shorted/disconnected)
  const isSoilActive = sensors.soil_moisture >= 1 && sensors.soil_moisture <= 4094
  const soilStatusText = isSoilActive
    ? `${sensors.soil_moisture} ADC`
    : sensors.soil_moisture <= 0
    ? 'Shorted (0 ADC)'
    : 'Wire Fault (4095 ADC)'

  const isRainActive = sensors.rain_raw >= 1 && sensors.rain_raw <= 4094
  const rainStatusText = isRainActive
    ? `${sensors.rain_raw} ADC`
    : sensors.rain_raw <= 0
    ? 'Shorted (0 ADC)'
    : 'Wire Fault (4095 ADC)'

  const isLightActive = sensors.light_raw >= 1 && sensors.light_raw <= 4094
  const lightStatusText = isLightActive
    ? `${sensors.light_raw} ADC`
    : sensors.light_raw <= 0
    ? 'Shorted (0 ADC)'
    : 'Wire Fault (4095 ADC)'

  // 4. SD Card: Active if sd_active is true
  const isSdActive = Boolean(sensors.sd_active)
  const sdStatusText = isSdActive ? 'Mounted & Ready' : 'Unmounted / Error'

  // Diagnostic items list
  const diagnostics = [
    {
      id: 'diag-esp32',
      name: 'ESP32 MCU',
      active: isEsp32Active,
      status: esp32StatusText,
    },
    {
      id: 'diag-dht11',
      name: 'DHT11 Sensor',
      active: isDhtActive,
      status: dhtStatusText,
    },
    {
      id: 'diag-soil',
      name: 'Soil Probe',
      active: isSoilActive,
      status: soilStatusText,
    },
    {
      id: 'diag-rain',
      name: 'Rain Sensor',
      active: isRainActive,
      status: rainStatusText,
    },
    {
      id: 'diag-ldr',
      name: 'LDR Sunlight',
      active: isLightActive,
      status: lightStatusText,
    },
    {
      id: 'diag-sd',
      name: 'MicroSD Card',
      active: isSdActive,
      status: sdStatusText,
    },
  ]

  const totalActive = diagnostics.filter((d) => d.active).length
  const allNominal = totalActive === diagnostics.length

  const formatLastFetch = (ts: number | null) => {
    if (!ts) return mode === 'LIVE' ? 'Waiting...' : 'Active'
    const diff = Math.round((Date.now() - ts) / 1000)
    return diff < 4 ? 'Just now' : `${diff}s ago`
  }

  return (
    <div
      id="card-hardware-status"
      className="glass-card rounded-2xl p-2.5 sm:p-3 xl:p-3.5 flex flex-col justify-between border border-emerald-500/25 min-h-0 overflow-hidden select-none"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30">
            <Cpu size={15} />
          </div>
          <div>
            <h3 className="text-xs font-black font-mono uppercase tracking-wider text-slate-200">
              Hardware Status
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">ESP32 Sensor Bus Diagnostics</p>
          </div>
        </div>

        <span
          className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
            allNominal
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
              : 'bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse'
          }`}
        >
          {allNominal ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
          <span>{totalActive}/6 Active</span>
        </span>
      </div>

      {/* ── Diagnostics Grid with Color-Coded Status Dots ── */}
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-1 my-auto py-0.5 text-[11px] font-mono">
        {diagnostics.map((item) => (
          <div
            key={item.id}
            id={item.id}
            className="flex items-center justify-between p-1 px-1.5 rounded-lg bg-slate-900/40 border border-slate-800/60"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              {/* Color-coded Status Dot (Green = Active/Online, Red = Offline/Error) */}
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  item.active
                    ? 'bg-emerald-400 status-pulse shadow-sm shadow-emerald-400'
                    : 'bg-rose-500 animate-pulse shadow-sm shadow-rose-500'
                }`}
                title={item.active ? 'Active / Online' : 'Offline / Fault'}
              />
              <span className="text-slate-300 font-semibold truncate text-[10px]">{item.name}</span>
            </div>

            <span
              className={`text-[10px] font-bold truncate pl-1 ${
                item.active ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {item.status}
            </span>
          </div>
        ))}
      </div>

      {/* ── Footer ── */}
      <div className="pt-1.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <span className="flex items-center gap-1 text-slate-400">
          <Clock size={10} />
          <span>{formatLastFetch(lastFetchTime)}</span>
        </span>
        <span className="text-emerald-400 font-semibold truncate">
          http://192.168.1.101/
        </span>
      </div>
    </div>
  )
}
