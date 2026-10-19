import React, { useState } from 'react'
import { useAquaStore } from '../store/useAquaStore'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts'

export const TelemetryTab: React.FC = () => {
  const { soilHistory, sensors } = useAquaStore()
  const [selectedRange, setSelectedRange] = useState<'6h' | '24h' | '7d' | '30d'>('7d')

  // Filter or slice history according to selected range
  const chartData = soilHistory && soilHistory.length > 0 ? soilHistory : []

  const currentSoil = sensors.soil_moisture ?? 2420
  const currentSoilPercent = Math.max(0, Math.min(100, Math.round(((4095 - currentSoil) / (4095 - 1200)) * 100)))
  const currentTemp = (sensors.temperature ?? 22.8).toFixed(1)
  const currentHum = Math.round(sensors.humidity ?? 49)
  const currentLight = sensors.light_raw ?? 3150
  const currentRain = sensors.rain_raw ?? 3410

  // Export CSV functionality
  const handleExportCsv = () => {
    if (!chartData || chartData.length === 0) return
    const headers = 'Timestamp,Time,Soil_Moisture_ADC,Soil_Percent,Temperature_C,Humidity_Pct,Rain_ADC,Light_ADC\n'
    const rows = chartData
      .map(
        (p) =>
          `${p.timestamp},"${p.time}",${p.soil_moisture},${p.soil_percent},${p.temperature},${p.humidity},${p.rain_raw},${p.light_raw}`
      )
      .join('\n')
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `aquasync_telemetry_${selectedRange}_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full flex flex-col gap-space-lg max-w-[1720px] mx-auto pb-12 select-none animate-fadeIn">
      {/* ── Top Action & Filter Toolbar ── */}
      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-md p-space-md rounded-2xl bg-surface-container-lowest shadow-sm border border-outline-variant/15">
        <div className="flex flex-wrap items-center gap-space-md w-full xl:w-auto">
          {/* Plant Selector Dropdown */}
          <div className="relative min-w-[240px]">
            <label className="block font-label-caps text-label-caps text-outline uppercase tracking-wider mb-1">
              Target Cultivar / Node
            </label>
            <div className="flex items-center justify-between px-space-md py-2 rounded-xl bg-surface-container-low cursor-pointer transition-all hover:bg-surface-container border border-outline-variant/10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container" />
                <span className="font-body-bold text-body-bold text-on-surface">
                  Kalanchoe Blossfeldiana
                </span>
                <span className="font-label-sub text-label-sub text-outline font-mono">#NODE-04</span>
              </div>
              <span className="material-symbols-outlined text-outline text-[18px]">expand_more</span>
            </div>
          </div>

          {/* Range Pills */}
          <div>
            <label className="block font-label-caps text-label-caps text-outline uppercase tracking-wider mb-1">
              Telemetry Horizon
            </label>
            <div className="flex items-center p-1 rounded-xl bg-surface-container-low border border-outline-variant/10">
              {(['6h', '24h', '7d', '30d'] as const).map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setSelectedRange(range)}
                  className={`px-3 py-1.5 rounded-lg font-mono-metric text-mono-metric transition-all uppercase ${
                    selectedRange === range
                      ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                      : 'text-outline-variant hover:text-on-surface'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Stream Info + Export Actions */}
        <div className="flex flex-wrap items-center gap-space-sm w-full xl:w-auto justify-end">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container" />
            </span>
            <span className="font-label-sub text-label-sub text-on-surface-variant font-mono">
              Sampling: 1Hz (SD Sync 100%)
            </span>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface transition-all font-body-bold text-body-bold shadow-sm border border-outline-variant/15 cursor-pointer"
          >
            <span className="material-symbols-outlined text-primary text-[18px]">table_view</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Metric Summary Strip (Botanical Vital Signs) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-space-md">
        {/* Soil Hydration */}
        <div className="relative overflow-hidden p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="h-1 w-full bg-gradient-to-r from-primary-container via-primary-fixed-dim to-secondary-container absolute top-0 left-0" />
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">
              Avg Soil Hydration
            </span>
            <span className="p-1 rounded-lg bg-surface-container text-primary material-symbols-outlined text-[18px]">
              water_drop
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-stat-lg text-stat-lg text-on-surface">
              {currentSoilPercent}
              <span className="font-label-sub text-label-sub text-outline ml-0.5">%</span>
            </span>
            <span className="font-label-sub text-label-sub px-1.5 py-0.5 rounded-md bg-surface-container text-primary font-mono">
              Succulent Optimal
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between font-label-sub text-label-sub text-outline pt-1">
            <span>
              ADC Raw: <strong className="text-on-surface font-mono">{currentSoil}</strong>
            </span>
            <span className="text-primary font-mono">±0.2%/24h</span>
          </div>
        </div>

        {/* Temperature Span (DHT11) */}
        <div className="relative overflow-hidden p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="h-1 w-full bg-gradient-to-r from-primary-container via-secondary-container to-secondary absolute top-0 left-0" />
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">
              Thermal Span (DHT11)
            </span>
            <span className="p-1 rounded-lg bg-surface-container text-secondary material-symbols-outlined text-[18px]">
              device_thermostat
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-stat-lg text-stat-lg text-on-surface">
              {currentTemp}
              <span className="font-label-sub text-label-sub text-outline ml-0.5">°C</span>
            </span>
            <span className="font-label-sub text-label-sub text-outline font-mono">Mean</span>
          </div>
          <div className="mt-3 flex items-center justify-between font-label-sub text-label-sub text-outline pt-1">
            <span>
              Peak: <strong className="text-tertiary font-mono">25.1°C</strong>
            </span>
            <span>
              Trough: <strong className="text-secondary font-mono">19.2°C</strong>
            </span>
          </div>
        </div>

        {/* Relative Humidity */}
        <div className="relative overflow-hidden p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="h-1 w-full bg-gradient-to-r from-secondary-container via-primary-container to-primary-fixed-dim absolute top-0 left-0" />
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">
              Mean Rel. Humidity
            </span>
            <span className="p-1 rounded-lg bg-surface-container text-primary material-symbols-outlined text-[18px]">
              humidity_percentage
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-stat-lg text-stat-lg text-on-surface">
              {currentHum}
              <span className="font-label-sub text-label-sub text-outline ml-0.5">%</span>
            </span>
            <span className="font-label-sub text-label-sub px-1.5 py-0.5 rounded-md bg-surface-container text-primary font-mono">
              VPD Safe
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between font-label-sub text-label-sub text-outline pt-1">
            <span>Stomatal target</span>
            <span className="text-on-surface font-mono">45 - 55%</span>
          </div>
        </div>

        {/* Precipitation Plate */}
        <div className="relative overflow-hidden p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="h-1 w-full bg-gradient-to-r from-primary-fixed-dim to-primary absolute top-0 left-0" />
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">
              Precipitation Plate
            </span>
            <span className="p-1 rounded-lg bg-surface-container text-secondary material-symbols-outlined text-[18px]">
              rainy
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-stat-lg text-stat-lg text-on-surface">
              {currentRain < 3000 ? '0.8' : '0.0'}
              <span className="font-label-sub text-label-sub text-outline ml-0.5">mL</span>
            </span>
            <span className="font-label-sub text-label-sub px-1.5 py-0.5 rounded-md bg-surface-container text-on-surface-variant font-mono">
              {currentRain < 3000 ? 'Wet Surface' : 'Dry Plate'}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between font-label-sub text-label-sub text-outline pt-1">
            <span>
              Threshold: <strong className="text-on-surface font-mono">3,800 ADC</strong>
            </span>
            <span className="text-primary font-mono">Optimal</span>
          </div>
        </div>

        {/* Daily Light Integrator */}
        <div className="relative overflow-hidden p-space-md rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col justify-between col-span-2 md:col-span-1 border border-outline-variant/15">
          <div className="h-1 w-full bg-gradient-to-r from-primary-container via-secondary-container to-primary absolute top-0 left-0" />
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">
              Daily Light Integrator
            </span>
            <span className="p-1 rounded-lg bg-surface-container text-primary-container material-symbols-outlined text-[18px]">
              wb_sunny
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-stat-lg text-stat-lg text-on-surface">
              {((currentLight / 4095) * 10).toFixed(1)}
              <span className="font-label-sub text-label-sub text-outline ml-0.5">hrs</span>
            </span>
            <span className="font-label-sub text-label-sub px-1.5 py-0.5 rounded-md bg-surface-container text-primary font-mono">
              14.6 DLI
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between font-label-sub text-label-sub text-outline pt-1">
            <span>Short-Day Plant</span>
            <span className="text-primary font-mono">Floral Triggered</span>
          </div>
        </div>
      </div>

      {/* ── BIG CHART 1: Substrate Soil Moisture Dynamics & Evapotranspiration ── */}
      <div className="flex flex-col p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm relative overflow-hidden border border-outline-variant/15">
        <div className="h-[2.5px] w-full bg-gradient-to-r from-primary-container via-primary to-secondary absolute top-0 left-0" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md mb-space-md">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Substrate Soil Moisture Dynamics & Evapotranspiration Rate
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sub text-label-sub font-mono">
                Node ADC-CH2
              </span>
            </div>
            <p className="font-body-base text-body-base text-outline mt-0.5">
              Capacitive analog saturation tracking with automated irrigation cycle events over {selectedRange}.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 font-label-sub text-label-sub text-on-surface">
              <span className="w-3 h-0.5 rounded-full bg-primary-container" />
              <span>Soil Saturation (%)</span>
            </div>
            <div className="flex items-center gap-1.5 font-label-sub text-label-sub text-tertiary">
              <span className="w-3 h-0.5 rounded-full bg-tertiary" />
              <span>Dry Trigger (25%)</span>
            </div>
            <div className="flex items-center gap-1.5 font-label-sub text-label-sub text-secondary">
              <span className="w-3 h-0.5 rounded-full bg-secondary" />
              <span>Field Saturation Cap (45%)</span>
            </div>
          </div>
        </div>

        {/* Live Recharts Chart */}
        <div className="w-full h-72 md:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="soilAreaGradRecharts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="90%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.2} vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis
                domain={[0, 100]}
                stroke="#94a3b8"
                tick={{ fontSize: 11, fontFamily: 'monospace' }}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(20, 29, 39, 0.95)',
                  borderColor: '#10b981',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontFamily: 'monospace',
                }}
              />
              <Area
                type="monotone"
                dataKey="soil_percent"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#soilAreaGradRecharts)"
                name="Soil Saturation"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── BIG CHART 2: Thermal & Atmospheric Dynamics (DHT11) ── */}
      <div className="flex flex-col p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm relative overflow-hidden border border-outline-variant/15">
        <div className="flex items-center justify-between mb-space-sm">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Ambient Micro-Climate Correlation (DHT11)
            </h3>
            <p className="font-label-sub text-label-sub text-outline font-mono">
              Temperature (°C) & Relative Humidity (%) Synchronized Telemetry
            </p>
          </div>
          <div className="flex items-center gap-3 font-label-sub text-label-sub font-mono">
            <span className="text-primary flex items-center gap-1">
              <span className="w-2.5 h-1 rounded-full bg-primary" /> Temp (°C)
            </span>
            <span className="text-secondary flex items-center gap-1">
              <span className="w-2.5 h-1 rounded-full bg-secondary-container" /> Humidity (%)
            </span>
          </div>
        </div>

        <div className="w-full h-64 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.2} vertical={false} />
              <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(20, 29, 39, 0.95)',
                  borderColor: '#0284c7',
                  borderRadius: '12px',
                  color: '#f8fafc',
                  fontFamily: 'monospace',
                }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="Temperature (°C)"
              />
              <Line
                type="monotone"
                dataKey="humidity"
                stroke="#38bdf8"
                strokeWidth={2}
                strokeDasharray="4 2"
                dot={false}
                name="Humidity (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default TelemetryTab
