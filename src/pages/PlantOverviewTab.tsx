import React, { useState } from 'react'
import { useAquaStore } from '../store/useAquaStore'
import BotanicalPlantSvg from '../components/BotanicalPlantSvg'

export const PlantOverviewTab: React.FC = () => {
  const {
    sensors,
    target_pwm,
    triggerManualPulse,
    manualPulseActive,
    manualPulseCountdown,
    setActiveTab,
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
      {/* ── Top Sub-Header & Variety Selector ── */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-space-md p-space-md bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl shadow-sm border border-outline-variant/15">
        <div className="flex flex-col gap-space-xs w-full lg:w-auto">
          <div className="flex items-center gap-space-xs flex-wrap">
            <div className="flex items-center gap-1.5 px-space-sm py-1 rounded-xl bg-primary-container/15 text-primary">
              <span className="material-symbols-outlined text-[16px]">psychiatry</span>
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-primary-container">
                Profile Select
              </span>
            </div>

            <div className="flex items-center gap-1 overflow-x-auto py-0.5 no-scrollbar">
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
                  className={`px-space-md py-1.5 rounded-xl font-body-base text-body-base flex items-center gap-1.5 shrink-0 transition-all ${
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
          </div>

          <div className="flex items-center gap-space-xs flex-wrap pt-0.5">
            <span className="font-body-bold text-body-bold text-on-surface flex items-center gap-1">
              Selected:{' '}
              <span className="text-primary font-headline-sm text-headline-sm">
                {selectedVariety}
              </span>{' '}
              <span className="font-body-base text-body-base text-on-surface-variant font-normal">
                (Flaming Katy)
              </span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-label-sub text-label-sub font-mono">
              Succulent / Crassulaceae
            </span>
            <span className="px-2 py-0.5 rounded-md bg-secondary-container/20 text-secondary font-label-sub text-label-sub font-mono">
              Short-Day Blooming Cycle
            </span>
          </div>
        </div>

        {/* Live Stream Status Chips */}
        <div className="flex items-center gap-space-xs flex-wrap self-end lg:self-auto shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-surface-container-low text-on-surface font-label-sub text-label-sub font-mono shadow-xs border border-outline-variant/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-container opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-container" />
            </span>
            <span>ESP32 Live Stream</span>
            <span className="text-outline">|</span>
            <span className="text-primary">2.0s</span>
            <span className="text-outline">|</span>
            <span className="text-on-surface-variant">WiFi -62 dBm</span>
          </div>

          <div className="flex items-center gap-1 p-1 bg-surface-container-low rounded-xl border border-outline-variant/20">
            <span className="px-2 py-1 rounded-lg bg-surface-container-lowest text-primary font-label-sub text-label-sub font-semibold shadow-xs">
              Frost
            </span>
            <span className="px-2 py-1 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sub text-label-sub cursor-pointer transition-colors">
              Minimal
            </span>
            <span className="px-2 py-1 rounded-lg text-on-surface-variant hover:text-on-surface font-label-sub text-label-sub cursor-pointer transition-colors">
              Midnight
            </span>
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

      {/* ── Telemetry Charts Grid (Simplified High-Precision 2-Column Split) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
        {/* Chart 1: Soil Moisture Dynamics (7-Day Soak & Dry Cycle) */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl p-space-lg shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Soil Moisture Dynamics
              </span>
              <span className="font-label-sub text-label-sub text-on-surface-variant font-mono">
                7-Day Soak & Dry Cycle (Succulent Gritty Substrate)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-md bg-primary-container/20 text-on-primary-container font-label-sub text-label-sub font-mono">
                {soilPercent}% Active
              </span>
              <span className="px-2 py-1 rounded-md bg-surface-container-high text-on-surface-variant font-label-sub text-label-sub font-mono">
                Min 25%
              </span>
            </div>
          </div>

          {/* SVG Line Chart: Evaporation curves with pulse peaks */}
          <div className="w-full h-56 pt-2">
            <svg
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 600 200"
            >
              <line
                className="text-surface-container-high"
                stroke="currentColor"
                strokeDasharray="4 4"
                strokeWidth="1"
                x1="0"
                x2="600"
                y1="40"
                y2="40"
              />
              <line
                className="text-surface-container-high"
                stroke="currentColor"
                strokeDasharray="4 4"
                strokeWidth="1"
                x1="0"
                x2="600"
                y1="90"
                y2="90"
              />
              <line
                className="text-primary-container/40"
                stroke="currentColor"
                strokeDasharray="2 2"
                strokeWidth="1"
                x1="0"
                x2="600"
                y1="140"
                y2="140"
              />
              <line
                className="text-surface-container-high"
                stroke="currentColor"
                strokeWidth="1"
                x1="0"
                x2="600"
                y1="180"
                y2="180"
              />

              {/* Optimal Band (30% to 50%) */}
              <rect
                className="text-primary-container/10"
                fill="currentColor"
                height="60"
                width="600"
                x="0"
                y="80"
              />

              <defs>
                <linearGradient id="moistureGradStitch" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path
                d="M 0 160 L 40 150 L 50 60 Q 100 75, 180 115 T 310 155 L 320 70 Q 380 90, 480 125 L 600 138"
                fill="none"
                stroke="#006c49"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
              />

              <path
                d="M 0 160 L 40 150 L 50 60 Q 100 75, 180 115 T 310 155 L 320 70 Q 380 90, 480 125 L 600 138 L 600 190 L 0 190 Z"
                fill="url(#moistureGradStitch)"
              />

              <circle cx="50" cy="60" r="4.5" fill="#006c49" stroke="#ffffff" strokeWidth="2" />
              <circle cx="320" cy="70" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <circle
                className="animate-pulse"
                cx="600"
                cy="138"
                r="5"
                fill="#10b981"
                stroke="#ffffff"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between pt-space-xs font-label-sub text-label-sub text-on-surface-variant font-mono">
            <span>7 Days Ago</span>
            <span>5 Days Ago (Pulse #1)</span>
            <span>2 Days Ago (80mL Pulse)</span>
            <span className="text-primary font-bold">Today: {soilPercent}% (Equilibrated)</span>
          </div>
        </div>

        {/* Chart 2: Ambient Temperature & Relative Humidity (24h Correlation) */}
        <div className="bg-surface-container-lowest/80 backdrop-blur-xl rounded-2xl p-space-lg shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between mb-space-sm">
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Ambient Micro-Climate
              </span>
              <span className="font-label-sub text-label-sub text-on-surface-variant font-mono">
                24h Correlation: DHT11 Temp (°C) vs Rel. Humidity (%)
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

          <div className="w-full h-56 pt-2">
            <svg
              className="w-full h-full overflow-visible"
              preserveAspectRatio="none"
              viewBox="0 0 600 200"
            >
              <line
                className="text-surface-container-high"
                stroke="currentColor"
                strokeDasharray="4 4"
                strokeWidth="1"
                x1="0"
                x2="600"
                y1="40"
                y2="40"
              />
              <line
                className="text-surface-container-high"
                stroke="currentColor"
                strokeDasharray="4 4"
                strokeWidth="1"
                x1="0"
                x2="600"
                y1="100"
                y2="100"
              />
              <line
                className="text-surface-container-high"
                stroke="currentColor"
                strokeDasharray="4 4"
                strokeWidth="1"
                x1="0"
                x2="600"
                y1="160"
                y2="160"
              />

              <path
                d="M 0 130 C 100 135, 180 120, 260 70 C 320 40, 400 45, 480 85 C 540 115, 580 100, 600 95"
                fill="none"
                stroke="#006c49"
                strokeLinecap="round"
                strokeWidth="2.5"
              />

              <path
                d="M 0 75 C 100 68, 180 85, 260 140 C 320 165, 400 155, 480 115 C 540 95, 580 105, 600 110"
                fill="none"
                stroke="#5bb8fe"
                strokeDasharray="3 3"
                strokeLinecap="round"
                strokeWidth="2.5"
              />

              <circle cx="600" cy="95" r="4.5" fill="#006c49" stroke="#ffffff" strokeWidth="2" />
              <circle cx="600" cy="110" r="4.5" fill="#5bb8fe" stroke="#ffffff" strokeWidth="2" />
            </svg>
          </div>

          <div className="flex items-center justify-between pt-space-xs font-label-sub text-label-sub text-on-surface-variant font-mono">
            <span>00:00 (Night Phase)</span>
            <span>06:00 (Dawn)</span>
            <span>12:00 (Peak Light)</span>
            <span>18:00 (Dark Induction)</span>
            <span className="text-on-surface font-semibold">23:59 (Current)</span>
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
