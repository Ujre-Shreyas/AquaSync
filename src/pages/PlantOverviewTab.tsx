import React, { useState } from 'react'
import { useAquaStore } from '../store/useAquaStore'
import BotanicalPlantSvg from '../components/BotanicalPlantSvg'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export const PlantOverviewTab: React.FC = () => {
  const {
    sensors,
    target_pwm,
    triggerManualPulse,
    manualPulseActive,
    manualPulseCountdown,
    setActiveTab,
    soilHistory,
    themeVariant,
    setThemeVariant,
  } = useAquaStore()

  const [selectedVariety, setSelectedVariety] = useState('Kalanchoe Blossfeldiana')

  // Calculate live values
  const soilAdc = sensors.soil_moisture ?? 2420
  const soilPercent = Math.max(0, Math.min(100, Math.round(((4095 - soilAdc) / (4095 - 1200)) * 100)))

  const rainAdc = sensors.rain_raw ?? 3410
  const isRaining = rainAdc < 3000

  const temp = (sensors.temperature ?? 22.8).toFixed(1)
  const humidity = Math.round(sensors.humidity ?? 48)

  const lightAdc = sensors.light_raw ?? 3150
  const lightPercent = Math.round((lightAdc / 4095) * 100)

  const pwmPct = Math.round((target_pwm / 255) * 100)
  const isPumpActive = sensors.pump_active || manualPulseActive

  return (
    <div className="w-full flex flex-col gap-space-lg max-w-[1720px] mx-auto pb-12 select-none animate-fadeIn">
      {/* ── Top Sub-Header & Variety Selector (UI Alignment Fix) ── */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-space-md p-space-md bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl shadow-sm border border-outline-variant/15">
        {/* Left Side: Profile select badge & Plant species pills center-aligned on Y-axis */}
        <div className="flex flex-col lg:flex-row items-center gap-space-md w-full lg:w-auto">
          <div className="flex items-center gap-1.5 px-space-sm py-1.5 rounded-xl bg-primary-container/15 text-primary shrink-0">
            <span className="material-symbols-outlined text-[18px]">psychiatry</span>
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-primary-container font-bold">
              Profile Select
            </span>
          </div>

          {/* Plant Species Pills: Center-aligned on Y-axis */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar shrink-0">
            {[
              { name: 'Kalanchoe Blossfeldiana', icon: '🌱' },
              { name: 'Ficus Microcarpa', icon: '🌿' },
              { name: 'Monstera Deliciosa', icon: '🪴' },
              { name: 'Aloe Vera', icon: '🌵' },
            ].map((variety) => (
              <button
                key={variety.name}
                type="button"
                onClick={() => setSelectedVariety(variety.name)}
                className={`px-space-md py-1.5 rounded-xl font-body-base text-body-base flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                  selectedVariety === variety.name
                    ? 'bg-primary text-on-primary font-body-bold shadow-sm shadow-primary/20 scale-[1.02]'
                    : 'bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="text-xs">{variety.icon}</span>
                <span>{variety.name}</span>
                {selectedVariety === variety.name && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed ml-0.5" />
                )}
              </button>
            ))}
          </div>

          <div className="hidden xl:flex items-center gap-space-xs text-body-base text-on-surface-variant">
            <span className="text-outline">|</span>
            <span className="font-label-sub text-label-sub font-mono px-2 py-0.5 rounded bg-surface-container">
              Crassulaceae Succulent
            </span>
          </div>
        </div>

        {/* Right Side: ESP32 Live Stream Status & Dynamic Theme Switcher Buttons (Center-aligned on Y-axis) */}
        <div className="flex items-center gap-space-sm flex-wrap justify-end shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-container-low text-on-surface font-label-sub text-label-sub font-mono shadow-xs border border-outline-variant/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container" />
            </span>
            <span>ESP32 Live Stream</span>
            <span className="text-outline">|</span>
            <span className="text-primary font-bold">2.0s</span>
            <span className="text-outline">|</span>
            <span className="text-on-surface-variant">WiFi -62 dBm</span>
          </div>

          {/* Theme Switcher: Wired to Frost, Minimal, and Midnight root CSS variables */}
          <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl border border-outline-variant/20">
            <button
              type="button"
              onClick={() => setThemeVariant('frost')}
              className={`px-2.5 py-1 rounded-lg font-label-sub text-label-sub font-semibold transition-all cursor-pointer ${
                themeVariant === 'frost'
                  ? 'bg-surface-container-lowest text-primary shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
              }`}
              title="Activate Botanical Frost Theme"
            >
              Frost
            </button>
            <button
              type="button"
              onClick={() => setThemeVariant('minimal')}
              className={`px-2.5 py-1 rounded-lg font-label-sub text-label-sub font-semibold transition-all cursor-pointer ${
                themeVariant === 'minimal'
                  ? 'bg-surface-container-lowest text-primary shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
              }`}
              title="Activate Stark Minimal Monochrome Theme"
            >
              Minimal
            </button>
            <button
              type="button"
              onClick={() => setThemeVariant('midnight')}
              className={`px-2.5 py-1 rounded-lg font-label-sub text-label-sub font-semibold transition-all cursor-pointer ${
                themeVariant === 'midnight'
                  ? 'bg-surface-container-lowest text-primary shadow-xs ring-1 ring-black/5 dark:ring-white/10'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container/60'
              }`}
              title="Activate Deep OLED Midnight Cyber Theme"
            >
              Midnight
            </button>
          </div>
        </div>
      </div>

      {/* ── Telemetry Cards Strip (6 strict hardware metrics) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-space-md">
        {/* 1. Soil Moisture */}
        <div className="relative overflow-hidden bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl p-space-md flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group border border-outline-variant/15">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-primary-container via-primary-fixed-dim to-secondary-container" />
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
              Soil Moisture
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">water_drop</span>
          </div>
          <div className="my-space-xs">
            <div className="flex items-baseline gap-1">
              <span className="font-stat-lg text-stat-lg text-on-surface">{soilPercent}</span>
              <span className="font-mono-metric text-mono-metric text-primary">%</span>
            </div>
            <span className="font-label-sub text-label-sub text-on-surface-variant font-mono">
              ADC: {soilAdc.toLocaleString()} / 4095
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary-container h-full rounded-full transition-all duration-500"
                style={{ width: `${soilPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center font-label-sub text-label-sub text-on-surface-variant">
              <span>Target: 25-45%</span>
              <span className="text-primary font-semibold">
                {soilPercent < 25 ? 'Wilting Risk' : 'Dry-Tolerant'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Rain Sensor */}
        <div className="relative overflow-hidden bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl p-space-md flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group border border-outline-variant/15">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-secondary via-secondary-container to-primary-fixed-dim" />
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
              Rain Sensor
            </span>
            <span className="material-symbols-outlined text-[18px] text-secondary">cloud_queue</span>
          </div>
          <div className="my-space-xs">
            <div className="flex items-baseline gap-1">
              <span className="font-stat-lg text-stat-lg text-on-surface">
                {isRaining ? '0.8' : '0.0'}
              </span>
              <span className="font-mono-metric text-mono-metric text-secondary">mL</span>
            </div>
            <span className="font-label-sub text-label-sub text-on-surface-variant font-mono">
              ADC: {rainAdc.toLocaleString()} ({isRaining ? 'Precipitation' : 'Dry'})
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-secondary-container h-full rounded-full transition-all"
                style={{ width: isRaining ? '65%' : '4%' }}
              />
            </div>
            <div className="flex justify-between items-center font-label-sub text-label-sub text-on-surface-variant">
              <span>Plate: {isRaining ? 'Wet' : 'Clear'}</span>
              <span className="text-primary font-semibold">Shield Active</span>
            </div>
          </div>
        </div>

        {/* 3. Ambient Temp (DHT11) */}
        <div className="relative overflow-hidden bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl p-space-md flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group border border-outline-variant/15">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-primary via-primary-container to-secondary-fixed" />
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
              Ambient Temp
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary">device_thermostat</span>
          </div>
          <div className="my-space-xs">
            <div className="flex items-baseline gap-1">
              <span className="font-stat-lg text-stat-lg text-on-surface">{temp}</span>
              <span className="font-mono-metric text-mono-metric text-primary">°C</span>
            </div>
            <span className="font-label-sub text-label-sub text-on-surface-variant font-mono">
              Sensor: DHT11 (GPIO 15)
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full" style={{ width: '65%' }} />
            </div>
            <div className="flex justify-between items-center font-label-sub text-label-sub text-on-surface-variant">
              <span>Ideal: 18-24°C</span>
              <span className="text-primary font-semibold">Balanced</span>
            </div>
          </div>
        </div>

        {/* 4. Rel. Humidity (DHT11) */}
        <div className="relative overflow-hidden bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl p-space-md flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group border border-outline-variant/15">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-secondary-container via-primary to-primary-fixed" />
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
              Rel. Humidity
            </span>
            <span className="material-symbols-outlined text-[18px] text-secondary">humidity_mid</span>
          </div>
          <div className="my-space-xs">
            <div className="flex items-baseline gap-1">
              <span className="font-stat-lg text-stat-lg text-on-surface">{humidity}</span>
              <span className="font-mono-metric text-mono-metric text-secondary">%</span>
            </div>
            <span className="font-label-sub text-label-sub text-on-surface-variant font-mono">
              VPD: 1.4 kPa
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-secondary-container h-full rounded-full"
                style={{ width: `${humidity}%` }}
              />
            </div>
            <div className="flex justify-between items-center font-label-sub text-label-sub text-on-surface-variant">
              <span>Dry succulent air</span>
              <span className="text-primary font-semibold">Optimal</span>
            </div>
          </div>
        </div>

        {/* 5. Sunlight (LDR) */}
        <div className="relative overflow-hidden bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl p-space-md flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group border border-outline-variant/15">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-secondary-container via-primary-fixed-dim to-primary" />
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
              Sunlight (LDR)
            </span>
            <span className="material-symbols-outlined text-[18px] text-primary-container">
              wb_sunny
            </span>
          </div>
          <div className="my-space-xs">
            <div className="flex items-baseline gap-1">
              <span className="font-stat-lg text-stat-lg text-on-surface">{lightPercent}</span>
              <span className="font-mono-metric text-mono-metric text-primary-container">%</span>
            </div>
            <span className="font-label-sub text-label-sub text-on-surface-variant font-mono">
              ADC: {lightAdc.toLocaleString()} (7.4h)
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary-container h-full rounded-full"
                style={{ width: `${lightPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center font-label-sub text-label-sub text-on-surface-variant">
              <span>Bright Filtered</span>
              <span className="text-primary font-semibold">Induction Ok</span>
            </div>
          </div>
        </div>

        {/* 6. Water Pump */}
        <div className="relative overflow-hidden bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl p-space-md flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow group border border-outline-variant/15">
          <div className="absolute top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-primary-container via-primary to-secondary" />
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
              Water Pump
            </span>
            <span
              className={`material-symbols-outlined text-[18px] ${
                isPumpActive ? 'text-primary animate-spin' : 'text-on-surface-variant'
              }`}
            >
              mode_fan
            </span>
          </div>
          <div className="my-space-xs">
            <div className="flex items-baseline gap-1">
              <span className="font-stat-lg text-stat-lg text-on-surface">
                {isPumpActive ? 'FLOW' : 'IDLE'}
              </span>
              <span className="font-mono-metric text-mono-metric text-primary-container">
                {isPumpActive ? 'ON' : 'OFF'}
              </span>
            </div>
            <span className="font-label-sub text-label-sub text-on-surface-variant font-mono">
              Duty: {pwmPct}% PWM
            </span>
          </div>
          <div className="space-y-1">
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-primary-container h-full rounded-full"
                style={{ width: `${pwmPct}%` }}
              />
            </div>
            <div className="flex justify-between items-center font-label-sub text-label-sub text-on-surface-variant">
              <span>Driver: GPIO 26</span>
              <span className="text-on-surface font-semibold font-mono">
                {manualPulseActive ? `${manualPulseCountdown}s active` : '80 mL pulse'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Hero / Profile Card for Kalanchoe Blossfeldiana ── */}
      <div className="relative overflow-hidden bg-surface-container-lowest/90 backdrop-blur-xl rounded-3xl p-space-lg shadow-sm border border-outline-variant/15">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary via-primary-fixed-dim via-secondary-container to-primary-container" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl items-center">
          {/* Left Side: Botanical Illustration & Container Specs */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-space-lg bg-surface-container-low/70 rounded-2xl relative overflow-hidden border border-outline-variant/10">
            <div className="absolute top-space-md left-space-md flex flex-col gap-1 z-10">
              <span className="px-2.5 py-1 rounded-full bg-primary-container/20 text-on-primary-container font-label-sub text-label-sub font-semibold flex items-center gap-1 w-max">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse" />
                {soilPercent < 25 ? 'Moisture Stress / Wilting' : 'Vegetative / Pre-budding'}
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-surface-container-lowest text-on-surface-variant font-label-sub text-label-sub font-mono w-max">
                Terracotta Pot #02 (Gritty Mix)
              </span>
            </div>

            {/* Re-bound 2D Animated SVG Plant Illustration */}
            <div className="w-full h-64 relative z-10 flex items-center justify-center py-2">
              <BotanicalPlantSvg />
            </div>

            <div className="w-full flex items-center justify-between pt-space-xs text-on-surface-variant font-label-sub text-label-sub font-mono">
              <span>Substrate: Pumice & Pine Bark (70/30)</span>
              <span className="text-primary font-bold">Moisture Decay: -1.8%/day</span>
            </div>
          </div>

          {/* Right Side: Species Details & Irrigation Automations */}
          <div className="lg:col-span-7 flex flex-col justify-between h-full gap-space-md">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-extrabold">
                  {selectedVariety}
                </span>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-label-caps text-label-caps uppercase font-bold">
                  Flaming Katy
                </span>
              </div>
              <p className="font-body-base text-body-base text-on-surface-variant leading-relaxed">
                Succulent perennial with thick, scalloped fleshy leaves that store internal water reserves.
                Highly sensitive to root rot and waterlogging; strictly requires soak-and-dry irrigation
                cycles and minimum 12–14 hours of continuous dark cycles in autumn for floral induction.
              </p>
            </div>

            {/* Automated Irrigation Protocol Card */}
            <div className="p-space-md bg-surface-container-low/90 rounded-2xl flex flex-col gap-space-sm shadow-xs border border-outline-variant/15">
              <div className="flex items-center justify-between">
                <span className="font-body-bold text-body-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-primary text-[18px]">autorenew</span>
                  Irrigation Automation Logic
                </span>
                <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-on-primary-container font-label-sub text-label-sub font-mono">
                  Hardware Safe: Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm font-label-sub text-label-sub">
                <div className="p-2.5 rounded-xl bg-surface-container-lowest flex flex-col gap-0.5 border border-outline-variant/10">
                  <span className="text-on-surface-variant">Next Auto-Irrigation Target</span>
                  <span className="font-mono text-on-surface text-body-base font-semibold">
                    Triggers when Moisture &lt; 25%
                  </span>
                  <span className="text-outline">
                    Current {soilPercent}% gives ~{(soilPercent / 8).toFixed(1)} days runway
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-surface-container-lowest flex flex-col gap-0.5 border border-outline-variant/10">
                  <span className="text-on-surface-variant">Previous Irrigation Event</span>
                  <span className="font-mono text-on-surface text-body-base font-semibold">
                    2 days ago (80 mL pulse)
                  </span>
                  <span className="text-outline">PWM: {pwmPct}% duty cycle | 0 overflow</span>
                </div>
              </div>

              {/* Manual Trigger Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-space-sm pt-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    shield_with_heart
                  </span>
                  <span className="font-label-sub text-label-sub text-on-surface-variant">
                    MOSFET IRLZ44N (GPIO 26) auto-locks at 12s timeout
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => triggerManualPulse(4)}
                  disabled={manualPulseActive}
                  className="px-space-md py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-container hover:from-primary/90 hover:to-primary-container/90 text-on-primary font-body-bold text-body-base shadow-sm shadow-primary/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[18px]">water</span>
                  <span>
                    {manualPulseActive
                      ? `Pulsing... (${manualPulseCountdown}s remaining)`
                      : 'Trigger 4s Manual Pulse (PWM 40%)'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Live Chart Rendering (Mapped directly to Zustand soilHistory) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {/* Chart 1: Real-time Soil Moisture Dynamics (Recharts) */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl p-space-lg shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                <span>Soil Moisture Dynamics</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-container/15 text-primary border border-primary-container/30">
                  Live ESP32
                </span>
              </span>
              <span className="font-label-sub text-label-sub text-on-surface-variant font-mono">
                Real-time capacitive saturation curve & irrigation events
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-md bg-primary-container/20 text-on-primary-container font-label-sub text-label-sub font-mono font-bold">
                {soilPercent}% Active
              </span>
              <span className="px-2 py-1 rounded-md bg-surface-container-high text-on-surface-variant font-label-sub text-label-sub font-mono">
                Min 25%
              </span>
            </div>
          </div>

          {/* Live Recharts Area Component mapped to Zustand soilHistory */}
          <div className="w-full h-56 pt-2">
            {soilHistory && soilHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={soilHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="moistureLiveGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} vertical={false} />
                  <XAxis dataKey="time" stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" tick={{ fontSize: 11, fontFamily: 'monospace' }} unit="%" />
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
                    fill="url(#moistureLiveGrad)"
                    name="Soil Saturation"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center rounded-xl bg-surface-container-low/40 border border-dashed border-outline-variant/30 text-on-surface-variant font-mono text-label-sub gap-2">
                <span className="material-symbols-outlined text-primary text-[24px] animate-pulse">sync</span>
                <span>Awaiting live ESP32 telemetry ingestion (2.0s polling)...</span>
                <span className="text-[10px] text-outline">Curves populate dynamically as real sensor frames arrive</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-space-xs font-label-sub text-label-sub text-on-surface-variant font-mono">
            <span>Live Telemetry Window: {soilHistory.length} frames</span>
            <span className="text-primary font-bold">Current: {soilPercent}% Saturation</span>
          </div>
        </div>

        {/* Chart 2: Real-time Ambient Micro-Climate (Recharts) */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl p-space-lg shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold flex items-center gap-2">
                <span>Ambient Micro-Climate</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary-container/15 text-secondary border border-secondary-container/30">
                  DHT11
                </span>
              </span>
              <span className="font-label-sub text-label-sub text-on-surface-variant font-mono">
                Live Temperature (°C) vs Relative Humidity (%)
              </span>
            </div>
            <div className="flex items-center gap-3 font-label-sub text-label-sub font-mono">
              <span className="flex items-center gap-1 text-primary">
                <span className="w-2.5 h-1 rounded-full bg-primary" /> Temp ({temp}°C)
              </span>
              <span className="flex items-center gap-1 text-secondary">
                <span className="w-2.5 h-1 rounded-full bg-secondary-container" /> Humidity ({humidity}%)
              </span>
            </div>
          </div>

          {/* Live Recharts Line Component mapped to Zustand soilHistory */}
          <div className="w-full h-56 pt-2">
            {soilHistory && soilHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={soilHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.15} vertical={false} />
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
                    strokeWidth={2.5}
                    dot={false}
                    name="Temp (°C)"
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
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center rounded-xl bg-surface-container-low/40 border border-dashed border-outline-variant/30 text-on-surface-variant font-mono text-label-sub gap-2">
                <span className="material-symbols-outlined text-secondary text-[24px] animate-pulse">thermostat</span>
                <span>Awaiting live DHT11 telemetry ingestion...</span>
                <span className="text-[10px] text-outline">Real-time thermal and humidity curves populate automatically</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-space-xs font-label-sub text-label-sub text-on-surface-variant font-mono">
            <span>DHT11 Atmosphere Stream</span>
            <span className="text-on-surface font-semibold">Active Sampling</span>
          </div>
        </div>
      </div>

      {/* ── Bottom Link to Irrigation Tab ── */}
      <div className="p-space-md bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl flex items-center justify-between border border-outline-variant/15">
        <div className="flex items-center gap-space-md">
          <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">water_pump</span>
          </div>
          <div>
            <div className="font-body-bold text-body-bold text-on-surface">
              Need Fine-Grained Actuator Control?
            </div>
            <div className="font-label-sub text-label-sub text-on-surface-variant font-mono">
              Configure 2s/4s/6s dynamic manual pulses, PWM duty cycles, and MOSFET safety interlocks.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setActiveTab('irrigation-pump')}
          className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-body-bold text-body-base flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>Open Irrigation Tab</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    </div>
  )
}

export default PlantOverviewTab
