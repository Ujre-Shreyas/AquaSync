import React, { useState } from 'react'
import { useAquaStore } from '../store/useAquaStore'

export const IrrigationTab: React.FC = () => {
  const {
    sensors,
    target_pwm,
    setTargetPwm,
    manualPulseDuration,
    setManualPulseDuration,
    manualPulseActive,
    manualPulseCountdown,
    triggerManualPulse,
    emergencyHalt,
    triggerChirpTest,
  } = useAquaStore()

  const [emergencyHalted, setEmergencyHalted] = useState(false)
  const [chirping, setChirping] = useState(false)

  const isPumpActive = (sensors.pump_active || manualPulseActive) && !emergencyHalted
  const pwmPct = Math.round((target_pwm / 255) * 100)

  // Handle Dynamic Manual Pulse Trigger
  const handleTriggerPulse = async (seconds?: number) => {
    if (emergencyHalted) return
    const sec = seconds ?? manualPulseDuration
    setManualPulseDuration(sec)
    await triggerManualPulse(sec)
  }

  // Bind Emergency Halt: instantly POSTs http://192.168.1.101/set_flow?pwm=0 and clears active timers in Zustand
  const handleEmergencyHalt = async () => {
    setEmergencyHalted(true)
    await emergencyHalt()
  }

  // Bind 1s Chirp Test: sends GET to http://192.168.1.101/manual_pump?sec=1
  const handleChirpTest = async () => {
    setChirping(true)
    await triggerChirpTest()
    setTimeout(() => setChirping(false), 1000)
  }

  return (
    <div className="w-full flex flex-col gap-space-lg max-w-[1720px] mx-auto pb-12 select-none animate-fadeIn">
      {/* ── Top Context & Action Strip ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md bg-surface-container-lowest/80 backdrop-blur-md rounded-2xl p-space-md shadow-sm border border-outline-variant/15">
        <div className="flex flex-wrap items-center gap-space-sm sm:gap-space-md">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container text-on-surface">
            <span className="material-symbols-outlined text-primary text-[20px]">psychiatry</span>
            <span className="font-label-caps text-label-caps tracking-wider uppercase text-on-surface-variant">
              Profile:
            </span>
            <span className="font-body-bold text-body-bold text-on-surface">
              Target: Kalanchoe Blossfeldiana
            </span>
            <span className="font-label-sub text-label-sub px-2 py-0.5 rounded-full bg-primary-container/20 text-on-primary-container font-mono">
              Succulent Regime
            </span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container-low text-on-surface font-label-sub font-mono">
            <span>Submersible Pump Driver:</span>
            <strong className="text-primary font-bold">MOSFET IRLZ44N (GPIO 26)</strong>
          </div>
        </div>

        {/* Emergency & Diagnostic Header Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleChirpTest}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-body-bold text-body-base shadow-sm transition-all active:scale-95 ${
              chirping
                ? 'bg-secondary text-on-secondary animate-bounce'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">volume_up</span>
            <span>{chirping ? 'Chirping...' : '1s Chirp Test'}</span>
          </button>

          <button
            type="button"
            onClick={emergencyHalted ? () => setEmergencyHalted(false) : handleEmergencyHalt}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-body-bold text-body-base shadow-md hover:shadow-lg transition-all active:scale-95 ${
              emergencyHalted
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-tertiary hover:bg-tertiary-container text-on-tertiary'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {emergencyHalted ? 'restart_alt' : 'eject'}
            </span>
            <span>{emergencyHalted ? 'Resume System' : 'Emergency Halt'}</span>
          </button>
        </div>
      </div>

      {/* ── Quick Stats Metric Header Rack (5-Column Bento Strip) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-space-md">
        {/* Metric 1: Pump Status */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest/90 backdrop-blur-lg p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Actuator State
            </span>
            <span
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-label-sub font-mono font-semibold ${
                isPumpActive
                  ? 'bg-primary-container/25 text-primary'
                  : 'bg-surface-container text-on-surface-variant'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isPumpActive ? 'bg-primary-container animate-pulse' : 'bg-outline-variant'
                }`}
              />
              {isPumpActive ? 'PUMPING' : 'STANDBY'}
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-stat-lg text-stat-lg text-on-surface">
                {isPumpActive ? 'ACTIVE' : 'IDLE'}
              </span>
              <span className="font-mono-metric text-mono-metric text-on-surface-variant font-mono">
                {isPumpActive ? '/ 1850 RPM' : '/ 0 RPM'}
              </span>
            </div>
            <p className="font-label-sub text-label-sub text-on-surface-variant mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">bolt</span>{' '}
              {isPumpActive ? '2.4 W draw (480 mA gate)' : '0.0 W draw (0 mA gate)'}
            </p>
          </div>
        </div>

        {/* Metric 2: PWM Duty Cycle */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest/90 backdrop-blur-lg p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              PWM Duty Calibration
            </span>
            <span className="font-mono-metric text-mono-metric text-secondary font-mono">Soft Flow</span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-stat-lg text-stat-lg text-on-surface">{pwmPct}</span>
              <span className="font-stat-lg text-stat-lg text-primary">%</span>
            </div>
            <p className="font-label-sub text-label-sub text-on-surface-variant mt-1 truncate">
              Submersible 5V Gritty Mix Trickle
            </p>
          </div>
        </div>

        {/* Metric 3: Water Volume MTD */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest/90 backdrop-blur-lg p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Water Delivered
            </span>
            <span className="font-label-sub text-label-sub text-primary font-mono font-bold">Cycle MTD</span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-stat-lg text-stat-lg text-on-surface">380</span>
              <span className="font-mono-metric text-mono-metric text-on-surface-variant font-mono">mL</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-primary-container h-full rounded-full" style={{ width: '38%' }} />
            </div>
            <p className="font-label-sub text-label-sub text-on-surface-variant mt-1">
              38% of 1,000 mL monthly budget
            </p>
          </div>
        </div>

        {/* Metric 4: Run Safety Cutoff */}
        <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest/90 backdrop-blur-lg p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Run Safety Limit
            </span>
            <span className="material-symbols-outlined text-[16px] text-tertiary">security</span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-stat-lg text-stat-lg text-on-surface">12.0</span>
              <span className="font-mono-metric text-mono-metric text-on-surface-variant font-mono">
                sec max
              </span>
            </div>
            <p className="font-label-sub text-label-sub text-on-surface-variant mt-1 flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-primary-container" /> Hardware
              Interrupt Armed
            </p>
          </div>
        </div>

        {/* Metric 5: Last Hydration Timestamp */}
        <div className="col-span-2 md:col-span-1 relative overflow-hidden rounded-2xl bg-surface-container-lowest/90 backdrop-blur-lg p-space-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-outline-variant/15">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
              Last Dispensed
            </span>
            <span className="material-symbols-outlined text-[16px] text-primary">history</span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1">
              <span className="font-stat-lg text-stat-lg text-on-surface">48</span>
              <span className="font-mono-metric text-mono-metric text-on-surface-variant font-mono">
                hrs ago
              </span>
            </div>
            <p className="font-label-sub text-label-sub text-on-surface-variant mt-1">
              80 mL pulse (Manual Standard)
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Center Stage: 7 / 5 Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column: Pump Actuator Hardware & Dynamic Manual Pulses (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          {/* Bento Card: Actuator Real-Time Control & PWM Gate */}
          <div className="rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">water_pump</span>
                </div>
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Pump Actuator & PWM Gate
                  </h2>
                  <p className="font-label-sub text-label-sub text-on-surface-variant font-mono">
                    Optocoupled IRLZ44N MOSFET Driver Stage · GPIO 26
                  </p>
                </div>
              </div>

              {/* Live Amperage / Load badge */}
              <div className="flex items-center gap-2 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/15">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  Current Draw:
                </span>
                <span className="font-mono text-mono-metric font-bold text-on-surface">
                  {isPumpActive ? '480 mA' : '0 mA'}
                </span>
                <span className="text-label-sub text-on-surface-variant font-mono">
                  {isPumpActive ? '(Active Load)' : '(Idle)'}
                </span>
              </div>
            </div>

            {/* PWM Slider Module */}
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-3 border border-outline-variant/15">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-body-bold text-body-bold text-on-surface">
                    Duty Cycle PWM Rate
                  </span>
                  <p className="font-label-sub text-label-sub text-on-surface-variant">
                    Recommended 35%-45% to prevent surface erosion in gritty succulent soil
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-lowest px-3 py-1 rounded-lg shadow-inner border border-outline-variant/15">
                  <span className="font-stat-lg text-stat-lg text-primary">{pwmPct}</span>
                  <span className="font-stat-lg text-stat-lg text-primary">%</span>
                </div>
              </div>

              {/* Custom Clean Slider */}
              <div className="relative py-2 flex items-center">
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="5"
                  value={pwmPct}
                  onChange={(e) => setTargetPwm(Math.round((Number(e.target.value) / 100) * 255))}
                  className="w-full h-2.5 bg-surface-container-high rounded-full appearance-none cursor-pointer accent-primary-container focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center text-label-sub font-mono text-on-surface-variant">
                <span>10% (Ultra Gentle)</span>
                <span>40% (Recommended Trickle)</span>
                <span>75% (Aeration)</span>
                <span>100% (Purge Mode)</span>
              </div>
            </div>

            {/* ── Rule 3: Dynamic Manual Pulses (2s, 4s, 6s) ── */}
            <div className="flex flex-col gap-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-body-bold text-body-bold text-on-surface">
                  Manual Hydration Dose Presets
                </span>
                <span className="font-label-sub text-label-sub text-on-surface-variant font-mono">
                  Target: http://192.168.1.101/manual_pump?sec=X
                </span>
              </div>

              <div className="grid grid-cols-3 gap-space-sm">
                {/* 2s Micro-Pulse */}
                <button
                  type="button"
                  onClick={() => handleTriggerPulse(2)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all text-center group cursor-pointer active:scale-95 border ${
                    manualPulseDuration === 2
                      ? 'ring-2 ring-primary-container bg-surface-container-lowest shadow-sm border-primary-container/30'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-outline-variant/15'
                  }`}
                >
                  <span
                    className={`font-stat-lg text-stat-lg transition-colors ${
                      manualPulseDuration === 2 ? 'text-primary' : 'text-on-surface group-hover:text-primary'
                    }`}
                  >
                    2s
                  </span>
                  <span className="font-body-bold text-body-bold text-on-surface">Micro-Pulse</span>
                  <span className="font-label-sub text-label-sub text-on-surface-variant font-mono">
                    ~40 mL
                  </span>
                </button>

                {/* 4s Standard Pulse */}
                <button
                  type="button"
                  onClick={() => handleTriggerPulse(4)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all text-center group cursor-pointer active:scale-95 border ${
                    manualPulseDuration === 4
                      ? 'ring-2 ring-primary-container bg-surface-container-lowest shadow-sm border-primary-container/30'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-outline-variant/15'
                  }`}
                >
                  <span
                    className={`font-stat-lg text-stat-lg transition-colors ${
                      manualPulseDuration === 4 ? 'text-primary' : 'text-on-surface group-hover:text-primary'
                    }`}
                  >
                    4s
                  </span>
                  <span className="font-body-bold text-body-bold text-on-surface">Standard Pulse</span>
                  <span className="font-label-sub text-label-sub text-on-surface-variant font-mono">
                    ~80 mL
                  </span>
                </button>

                {/* 6s Deep Soak */}
                <button
                  type="button"
                  onClick={() => handleTriggerPulse(6)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all text-center group cursor-pointer active:scale-95 border ${
                    manualPulseDuration === 6
                      ? 'ring-2 ring-primary-container bg-surface-container-lowest shadow-sm border-primary-container/30'
                      : 'bg-surface-container-low hover:bg-surface-container text-on-surface border-outline-variant/15'
                  }`}
                >
                  <span
                    className={`font-stat-lg text-stat-lg transition-colors ${
                      manualPulseDuration === 6 ? 'text-primary' : 'text-on-surface group-hover:text-primary'
                    }`}
                  >
                    6s
                  </span>
                  <span className="font-body-bold text-body-bold text-on-surface">Deep Soak</span>
                  <span className="font-label-sub text-label-sub text-on-surface-variant font-mono">
                    ~120 mL
                  </span>
                </button>
              </div>

              {/* Primary Dispatch Action */}
              <div className="mt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md bg-surface-container-low p-space-md rounded-xl border border-outline-variant/15">
                <button
                  type="button"
                  onClick={() => handleTriggerPulse(manualPulseDuration)}
                  disabled={manualPulseActive || emergencyHalted}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-primary-container hover:opacity-95 text-on-primary font-body-bold text-body-lg shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[22px]">shower</span>
                  <span>
                    {manualPulseActive
                      ? `Dispatching Pulse (${manualPulseCountdown}s remaining)...`
                      : `Trigger ${manualPulseDuration}s Pulse (~${manualPulseDuration * 20} mL)`}
                  </span>
                </button>

                <div className="flex items-center justify-center sm:justify-start gap-3 px-3 py-1">
                  <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">timer</span>
                  </div>
                  <div>
                    <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                      Active Timer
                    </div>
                    <div className="font-stat-lg text-stat-lg font-mono text-on-surface">
                      {manualPulseActive ? `0${manualPulseCountdown}.0s` : '00.0s'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hardware Interlocks & Watchdog Diagnostics */}
            <div className="mt-1 pt-3 bg-surface-container-low/50 rounded-xl p-space-md flex flex-col gap-2 border border-outline-variant/10">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                Subsystem Safety Matrix & Interlocks (GPIO 26)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="flex items-center gap-2 bg-surface-container-lowest p-2.5 rounded-lg shadow-2xs border border-outline-variant/10">
                  <span className="material-symbols-outlined text-primary text-[18px]">lock_reset</span>
                  <div className="min-w-0">
                    <p className="font-label-caps text-label-caps text-on-surface truncate">IRLZ44N Gate</p>
                    <p className="font-label-sub text-label-sub text-on-surface-variant font-mono">
                      GPIO 26 Pull-down OK
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-surface-container-lowest p-2.5 rounded-lg shadow-2xs border border-outline-variant/10">
                  <span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
                  <div className="min-w-0">
                    <p className="font-label-caps text-label-caps text-on-surface truncate">Optocoupler</p>
                    <p className="font-label-sub text-label-sub text-on-surface-variant font-mono">
                      Galvanic ISO: Pass
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-surface-container-lowest p-2.5 rounded-lg shadow-2xs border border-outline-variant/10">
                  <span className="material-symbols-outlined text-primary text-[18px]">timer_off</span>
                  <div className="min-w-0">
                    <p className="font-label-caps text-label-caps text-on-surface truncate">Timeout Circuit</p>
                    <p className="font-label-sub text-label-sub text-on-surface-variant font-mono">
                      12s Hard Limit OK
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Irrigation Dispatch Log */}
          <div className="rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-space-lg shadow-sm flex flex-col gap-space-md border border-outline-variant/15">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">manage_search</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Irrigation Dispatch Log
                  </h3>
                  <p className="font-label-sub text-label-sub text-on-surface-variant">
                    Timestamped hardware pulses with pre/post capacitive soil delta
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-label-sub text-label-sub font-mono px-2 py-1 rounded bg-surface-container text-primary font-semibold">
                  FAT32 Logged
                </span>
              </div>
            </div>

            <div className="overflow-x-auto -mx-space-lg px-space-lg">
              <table className="w-full text-left font-body-base text-body-base">
                <thead>
                  <tr className="text-label-caps font-label-caps text-on-surface-variant uppercase tracking-wider bg-surface-container-low/70">
                    <th className="py-2.5 px-3 rounded-l-lg">Timestamp</th>
                    <th className="py-2.5 px-3">Trigger Mode</th>
                    <th className="py-2.5 px-3">Duration / PWM</th>
                    <th className="py-2.5 px-3">Dose</th>
                    <th className="py-2.5 px-3">Soil Moisture Δ</th>
                    <th className="py-2.5 px-3 rounded-r-lg">Watchdog</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-mono-metric divide-y divide-outline-variant/10">
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-3 text-on-surface font-medium whitespace-nowrap">Today 14:12</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/10 text-secondary text-label-sub font-sans font-medium">
                        Manual Pulse
                      </span>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant">4.0s @ 40%</td>
                    <td className="py-3 px-3 font-semibold text-primary">80 mL</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-tertiary">23%</span>
                        <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                          arrow_forward
                        </span>
                        <span className="text-primary font-bold">41%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-label-sub text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                        Clean 0x00
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-3 text-on-surface font-medium whitespace-nowrap">Oct 24, 08:30</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-container/15 text-primary text-label-sub font-sans font-medium">
                        Auto Threshold
                      </span>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant">4.0s @ 40%</td>
                    <td className="py-3 px-3 font-semibold text-primary">80 mL</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-tertiary">24%</span>
                        <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                          arrow_forward
                        </span>
                        <span className="text-primary font-bold">43%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-label-sub text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                        Clean 0x00
                      </span>
                    </td>
                  </tr>

                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3 px-3 text-on-surface font-medium whitespace-nowrap">Oct 19, 19:05</td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary-container/15 text-primary text-label-sub font-sans font-medium">
                        Auto Threshold
                      </span>
                    </td>
                    <td className="py-3 px-3 text-on-surface-variant">2.0s @ 35%</td>
                    <td className="py-3 px-3 font-semibold text-primary">40 mL</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-tertiary">22%</span>
                        <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                          arrow_forward
                        </span>
                        <span className="text-primary font-bold">36%</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-label-sub text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                        Clean 0x00
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Botanical Flow Engine & Strategies (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          {/* Automated Moisture Trigger Strategy */}
          <div className="rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-space-lg shadow-sm border border-outline-variant/15 flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">psychology</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Autonomous Soak & Dry Logic
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary-container/20 text-on-primary-container font-label-sub font-mono">
                PID Loop Enabled
              </span>
            </div>

            <p className="font-body-base text-body-base text-on-surface-variant leading-relaxed">
              Kalanchoe Blossfeldiana strictly avoids wet feet. The botanical controller holds back
              watering until soil capacitance decays below 25%, delivering small pulses to reach 45% field capacity.
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                    Lower Trigger Threshold
                  </div>
                  <div className="font-mono text-body-base font-bold text-tertiary">25% Soil Saturation</div>
                </div>
                <span className="font-label-sub font-mono text-on-surface-variant">ADC: ~3,350</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                    Field Saturation Cap
                  </div>
                  <div className="font-mono text-body-base font-bold text-primary">45% Max Cap</div>
                </div>
                <span className="font-label-sub font-mono text-on-surface-variant">ADC: ~2,250</span>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div>
                  <div className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                    Hardware Watchdog Limit
                  </div>
                  <div className="font-mono text-body-base font-bold text-on-surface">12 Seconds Max</div>
                </div>
                <span className="font-label-sub font-mono text-primary font-semibold">Active & Armed</span>
              </div>
            </div>
          </div>

          {/* Botanical Flow Calibrator Card */}
          <div className="rounded-2xl bg-surface-container-lowest/90 backdrop-blur-xl p-space-lg shadow-sm border border-outline-variant/15 flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[22px]">tune</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Pump Output Calibration
                </h3>
              </div>
              <span className="font-label-sub text-label-sub text-secondary font-mono">
                IRLZ44N FET Driven
              </span>
            </div>

            <div className="grid grid-cols-2 gap-space-sm text-label-sub font-mono">
              <div className="p-3 rounded-xl bg-surface-container-low">
                <div className="text-on-surface-variant">Calibrated Rate</div>
                <div className="text-lg font-bold text-on-surface mt-1">20.0 mL / sec</div>
                <div className="text-outline">at 40% PWM duty</div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-low">
                <div className="text-on-surface-variant">FET Gate Resistor</div>
                <div className="text-lg font-bold text-primary mt-1">10kΩ Pull-down</div>
                <div className="text-outline">100Ω Gate current</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-surface-container-low/70 text-label-sub text-on-surface-variant flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-primary">info</span>
              <span>All manual pulses send HTTP GET queries directly to http://192.168.1.101/manual_pump?sec=X</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IrrigationTab
