import { useState } from 'react'
import { useAquaStore } from '../store/useAquaStore'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts'
import {
  LineChart as ChartIcon,
  Download,
  Sprout,
  Waves,
  Thermometer,
  CloudRain,
  Activity,
  Sun
} from 'lucide-react'

export default function CompiledData() {
  const { soilHistory, rainEvents, totalRainVolumeMl } = useAquaStore()
  const [timeRange, setTimeRange] = useState<'1H' | '6H' | '24H' | 'ALL'>('24H')

  // Filter history based on timeRange
  const displayedHistory =
    timeRange === '1H'
      ? soilHistory.slice(-10)
      : timeRange === '6H'
      ? soilHistory.slice(-20)
      : soilHistory

  // Telemetry stats
  const soilValues = displayedHistory.map((d) => d.soil_percent)
  const maxSoil = soilValues.length ? Math.max(...soilValues) : 0
  const minSoil = soilValues.length ? Math.min(...soilValues) : 0
  const avgSoil = soilValues.length
    ? Math.round(soilValues.reduce((a, b) => a + b, 0) / soilValues.length)
    : 0

  const avgFlow = displayedHistory.length
    ? (
        displayedHistory.reduce((a, b) => a + b.flow_speed, 0) / displayedHistory.length
      ).toFixed(2)
    : '0.00'

  const lightValues = displayedHistory.map((d) => d.light_percent ?? Math.round(((d.light_raw ?? 2048) / 4095) * 100))
  const avgLight = lightValues.length
    ? Math.round(lightValues.reduce((a, b) => a + b, 0) / lightValues.length)
    : 0

  // Export CSV handler
  const handleExportCsv = () => {
    const headers = [
      'Timestamp',
      'Time',
      'Soil_Moisture_ADC',
      'Soil_Saturation_Percent',
      'Temperature_C',
      'Humidity_Percent',
      'Flow_Speed_L_per_min',
      'Target_PWM',
      'Rain_Raw_ADC',
      'Light_Raw_ADC',
      'Light_Intensity_Percent'
    ]

    const rows = displayedHistory.map((d) => [
      d.timestamp,
      `"${d.time}"`,
      d.soil_moisture,
      d.soil_percent,
      d.temperature,
      d.humidity,
      d.flow_speed,
      d.pwm,
      d.rain_raw,
      d.light_raw,
      d.light_percent
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `aquasync_telemetry_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div
      id="compiled-data-container"
      className="min-h-screen overflow-y-auto p-4 xl:p-8 space-y-6 pb-16 select-none"
    >
      {/* ── Page Header ── */}
      <header className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <ChartIcon size={22} />
            </div>
            <div>
              <h1 className="text-2xl xl:text-3xl font-black tracking-tight flex items-center gap-3">
                <span>Compiled Telemetry Analytics</span>
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Recharts Engine
                </span>
              </h1>
              <p className="text-xs xl:text-sm text-slate-400 font-mono mt-0.5">
                Continuous logging of capacitive soil moisture gradients, hydraulic discharge, and atmospheric fluctuations
              </p>
            </div>
          </div>
        </div>

        {/* Right actions: Range filter + Export CSV */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 rounded-xl bg-slate-900/60 border border-slate-800">
            {(['1H', '6H', '24H', 'ALL'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  timeRange === range
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <button
            id="export-csv-btn"
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-400 text-xs font-bold transition-all shadow-sm"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        </div>
      </header>

      {/* ── Summary Metrics KPI Bar ── */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="watermelon-card rounded-2xl p-4 xl:p-5 flex flex-col justify-between">
          <div className="watermelon-strip" />
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>Average Saturation</span>
            <Sprout size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 text-glow-emerald">
            {avgSoil}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Field capacity &ge; 45%</p>
        </div>

        <div className="watermelon-card rounded-2xl p-4 xl:p-5 flex flex-col justify-between">
          <div className="watermelon-strip" />
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>Solar Intensity (LDR)</span>
            <Sun size={16} className="text-amber-400 animate-spin-slow" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400 text-glow-amber">
            {avgLight}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Direct solar transpiration</p>
        </div>

        <div className="watermelon-card rounded-2xl p-4 xl:p-5 flex flex-col justify-between">
          <div className="watermelon-strip" />
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>Min &bull; Max Saturation</span>
            <Activity size={16} className="text-amber-400" />
          </div>
          <div className="text-2xl xl:text-3xl font-extrabold font-mono text-amber-300">
            {minSoil}% &bull; {maxSoil}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Hysteresis span</p>
        </div>

        <div className="watermelon-card rounded-2xl p-4 xl:p-5 flex flex-col justify-between">
          <div className="watermelon-strip" />
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>Avg Irrigation Velocity</span>
            <Waves size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 text-glow-emerald">
            {avgFlow} <span className="text-sm font-normal text-slate-400">L/min</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">PWM duty response</p>
        </div>

        <div className="watermelon-card rounded-2xl p-4 xl:p-5 flex flex-col justify-between">
          <div className="watermelon-strip" />
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>Precipitation Caught</span>
            <CloudRain size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400 text-glow-emerald">
            {totalRainVolumeMl.toFixed(1)} <span className="text-sm font-normal text-slate-400">mL</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{rainEvents.length} downpours logged</p>
        </div>
      </section>

      {/* ── PRIMARY CHART: Soil Moisture Over Time (Recharts) ── */}
      <section className="glass-card rounded-3xl p-5 xl:p-7 border border-emerald-500/25 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg xl:text-xl font-extrabold tracking-tight flex items-center gap-2">
              <Sprout className="text-emerald-400" size={20} />
              <span>Soil Moisture Saturation Over Time (%)</span>
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Recharts Area Plot &bull; Capacitive inverse ADC transfer function
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              Soil Saturation (%)
            </span>
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-3 h-0.5 bg-rose-400" />
              Wilting Limit (25%)
            </span>
          </div>
        </div>

        {/* Recharts Area Container */}
        <div className="h-80 xl:h-96 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayedHistory} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="soilColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.4)" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#64748b"
                tick={{ fontSize: 11, fontFamily: 'monospace' }}
              />
              <YAxis
                domain={[0, 100]}
                stroke="#64748b"
                tick={{ fontSize: 11, fontFamily: 'monospace' }}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0e141b',
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  borderRadius: '16px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
                itemStyle={{ color: '#34d399' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
              />
              <ReferenceLine y={25} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: 'Wilting Point', fill: '#f43f5e', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={75} stroke="#38bdf8" strokeDasharray="4 4" label={{ value: 'Field Capacity', fill: '#38bdf8', fontSize: 10, position: 'right' }} />
              <Area
                type="monotone"
                dataKey="soil_percent"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#soilColor)"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── SECONDARY CHARTS ROW: Dual Visualizers ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 2: Hydraulic Velocity vs Botanical PWM */}
        <div className="glass-card rounded-3xl p-5 xl:p-6 border border-emerald-500/25 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base xl:text-lg font-extrabold tracking-tight flex items-center gap-2">
                <Waves className="text-emerald-400" size={18} />
                <span>Hydraulic Velocity & PWM Correlation</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">Discharge rate (L/min) vs Target PWM (0-255)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayedHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.4)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis yAxisId="left" stroke="#10b981" tick={{ fontSize: 10, fontFamily: 'monospace' }} unit="L" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 255]} stroke="#fb7185" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0e141b',
                    borderColor: 'rgba(16, 185, 129, 0.4)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="flow_speed"
                  name="Flow (L/min)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="pwm"
                  name="PWM (0-255)"
                  stroke="#fb7185"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Temperature vs Humidity & Solar Correlation */}
        <div className="glass-card rounded-3xl p-5 xl:p-6 border border-emerald-500/25 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base xl:text-lg font-extrabold tracking-tight flex items-center gap-2">
                <Thermometer className="text-rose-400" size={18} />
                <span>Atmospheric & Solar Microclimate</span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">Temp (°C) vs Air Moisture (%) vs LDR Solar Intensity (%)</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayedHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.4)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis yAxisId="temp" domain={[10, 50]} stroke="#f43f5e" tick={{ fontSize: 10, fontFamily: 'monospace' }} unit="°" />
                <YAxis yAxisId="hum" orientation="right" domain={[0, 100]} stroke="#38bdf8" tick={{ fontSize: 10, fontFamily: 'monospace' }} unit="%" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0e141b',
                    borderColor: 'rgba(244, 63, 94, 0.4)',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                  }}
                />
                <Line
                  yAxisId="temp"
                  type="monotone"
                  dataKey="temperature"
                  name="Temperature (°C)"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  yAxisId="hum"
                  type="monotone"
                  dataKey="humidity"
                  name="Humidity (%)"
                  stroke="#38bdf8"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  yAxisId="hum"
                  type="monotone"
                  dataKey="light_percent"
                  name="Solar (%)"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* ── Rain Events History Table ── */}
      <section className="glass-card rounded-3xl p-5 xl:p-7 border border-emerald-500/25 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CloudRain size={20} className="text-emerald-400" />
            <h3 className="text-lg font-extrabold tracking-tight">Precipitation Log Register</h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400">
            Trigger rule: rain_raw &lt; 3800 ADC
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Event ID</th>
                <th className="pb-3 font-semibold">Start Time</th>
                <th className="pb-3 font-semibold">Peak Wetness (ADC)</th>
                <th className="pb-3 font-semibold">Precipitation Volume</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rainEvents.map((e) => (
                <tr key={e.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 text-slate-300 font-bold">{e.id}</td>
                  <td className="py-3 text-slate-400">
                    {new Date(e.startTime).toLocaleTimeString()}
                  </td>
                  <td className="py-3 text-emerald-400 font-bold">{e.peakRaw} ADC</td>
                  <td className="py-3 text-white font-extrabold">
                    {e.mlCaught.toFixed(2)} mL
                  </td>
                  <td className="py-3 text-right">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        e.active
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {e.active ? 'ACTIVE RAIN' : 'COMPLETED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
