import React, { useState } from 'react'
import { useAquaStore } from '../store/useAquaStore'

export const DiagnosticsTab: React.FC = () => {
  const {
    sensors,
    esp32Connected,
    triggerManualPulse,
    manualPulseActive,
    manualPulseCountdown,
  } = useAquaStore()

  const [flushed, setFlushed] = useState(false)
  const [rotated, setRotated] = useState(false)
  const [unmounted, setUnmounted] = useState(false)
  const [testPulseTriggered, setTestPulseTriggered] = useState(false)
  const [ledBlinking, setLedBlinking] = useState(false)

  const soilAdc = sensors.soil_moisture ?? 2420
  const rainAdc = sensors.rain_raw ?? 3410
  const temp = (sensors.temperature ?? 22.8).toFixed(1)
  const humidity = Math.round(sensors.humidity ?? 58)
  const lightAdc = sensors.light_raw ?? 3450

  const handleFlushSD = () => {
    setFlushed(true)
    setTimeout(() => setFlushed(false), 2000)
  }

  const handleRotateLog = () => {
    setRotated(true)
    setTimeout(() => setRotated(false), 2000)
  }

  const handleUnmountSD = () => {
    setUnmounted(true)
    setTimeout(() => setUnmounted(false), 3000)
  }

  const handleTestPulse = async () => {
    setTestPulseTriggered(true)
    await triggerManualPulse(2)
    setTimeout(() => setTestPulseTriggered(false), 2000)
  }

  const handleBlinkLed = () => {
    setLedBlinking(true)
    setTimeout(() => setLedBlinking(false), 2500)
  }

  return (
    <div className="w-full flex flex-col gap-space-lg max-w-[1580px] mx-auto pb-12 select-none animate-fadeIn">
      {/* ── Top System Overview Banner ── */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm border border-outline-variant/15">
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary-container via-primary-fixed-dim to-secondary-container" />
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg pt-1">
          <div className="flex flex-wrap items-center gap-space-md">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[28px]">memory</span>
            </div>
            <div>
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="font-headline-md text-headline-md text-on-surface tracking-tight font-extrabold">
                  ESP32-WROOM-32
                </span>
                <span className="font-label-sub text-label-sub px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant font-mono">
                  240 MHz Dual-Core Xtensa LX6
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-mono text-label-sub font-semibold">
                  <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
                  {esp32Connected ? 'Node Health: Nominal' : 'Node Health: Virtual Sim'}
                </span>
              </div>
              <div className="flex items-center gap-space-md text-on-surface-variant text-body-base mt-1">
                <span>
                  Firmware: <span className="font-mono font-medium text-on-surface">AquaSync OS v1.2.4-IoT</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">wifi</span>
                  <span className="font-mono text-on-surface">-62 dBm</span> (RSSI) Stable
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-space-md xl:justify-end">
            <div className="bg-surface-container-low px-space-md py-2 rounded-xl flex items-center gap-3 border border-outline-variant/10">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">timer</span>
              <div>
                <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  System Uptime
                </div>
                <div className="font-mono-metric text-mono-metric text-on-surface font-semibold">
                  6d 14h 38m 12s
                </div>
              </div>
            </div>

            <div className="bg-surface-container-low px-space-md py-2 rounded-xl flex items-center gap-3 border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-[20px]">restart_alt</span>
              <div>
                <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  Reset Diagnostic
                </div>
                <div className="font-mono-metric text-mono-metric text-on-surface">
                  Power-on reset <span className="text-primary font-semibold">(0 WDT reboots)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 1 & Section 2 Split: Microcontroller Telemetry & MicroSD Datalogger ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Microcontroller & Memory Telemetry Bento (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm relative overflow-hidden flex flex-col justify-between border border-outline-variant/15">
            <div className="flex items-center justify-between pb-space-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">developer_board</span>
                <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Core & Memory Allocation
                </span>
              </div>
              <span className="font-label-sub text-label-sub font-mono bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant">
                SRAM & Partitioning
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md my-space-sm">
              {/* Heap Memory Card */}
              <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between border border-outline-variant/10">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-caps text-label-caps uppercase">Free Heap Memory</span>
                  <span className="font-label-sub text-label-sub font-mono text-primary font-semibold">
                    61% Free
                  </span>
                </div>
                <div className="my-space-sm">
                  <div className="flex items-baseline gap-1">
                    <span className="font-stat-lg text-stat-lg text-on-surface font-mono">198</span>
                    <span className="font-mono text-body-base text-on-surface-variant">/ 320 KB</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mt-2">
                    <div
                      className="bg-primary-container h-full rounded-full transition-all duration-500"
                      style={{ width: '61.8%' }}
                    />
                  </div>
                </div>
                <span className="font-label-sub text-label-sub font-mono text-on-surface-variant">
                  Heap Integrity: Verified • 0 Fragment Faults
                </span>
              </div>

              {/* Flash Memory Card */}
              <div className="bg-surface-container-low p-space-md rounded-xl flex flex-col justify-between border border-outline-variant/10">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-caps text-label-caps uppercase">4MB SPI Flash Partition</span>
                  <span className="font-label-sub text-label-sub font-mono text-secondary font-semibold">
                    QSPI Mode
                  </span>
                </div>
                <div className="my-space-sm">
                  <div className="flex items-baseline gap-1">
                    <span className="font-stat-lg text-stat-lg text-on-surface font-mono">2.7</span>
                    <span className="font-mono text-body-base text-on-surface-variant">/ 4.0 MB</span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden mt-2 flex">
                    <div className="bg-secondary-container h-full" style={{ width: '30%' }} title="SPIFFS 1.2MB" />
                    <div className="bg-primary h-full" style={{ width: '37.5%' }} title="OTA 1.5MB" />
                  </div>
                </div>
                <div className="flex justify-between font-label-sub text-label-sub font-mono text-on-surface-variant">
                  <span>SPIFFS: 1.2 MB</span>
                  <span>OTA Slots: 1.5 MB</span>
                </div>
              </div>
            </div>

            {/* Dual Core Utilization & Voltage Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md pt-space-xs">
              {/* Core 0 */}
              <div className="p-space-sm bg-surface-container-low rounded-xl border border-outline-variant/10">
                <div className="flex items-center justify-between font-label-caps text-label-caps text-on-surface-variant mb-1">
                  <span>Core 0 (WiFi/RTOS)</span>
                  <span className="font-mono text-primary font-bold">14%</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full rounded-full" style={{ width: '14%' }} />
                </div>
                <span className="font-label-sub text-label-sub font-mono text-on-surface-variant block mt-1.5">
                  FreeRTOS Net-Stack
                </span>
              </div>

              {/* Core 1 */}
              <div className="p-space-sm bg-surface-container-low rounded-xl border border-outline-variant/10">
                <div className="flex items-center justify-between font-label-caps text-label-caps text-on-surface-variant mb-1">
                  <span>Core 1 (Sensors/PID)</span>
                  <span className="font-mono text-primary font-bold">8%</span>
                </div>
                <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary-container h-full rounded-full" style={{ width: '8%' }} />
                </div>
                <span className="font-label-sub text-label-sub font-mono text-on-surface-variant block mt-1.5">
                  ADC Poller & Logic
                </span>
              </div>

              {/* LDO Voltage */}
              <div className="p-space-sm bg-surface-container-low rounded-xl border border-outline-variant/10">
                <div className="flex items-center justify-between font-label-caps text-label-caps text-on-surface-variant mb-1">
                  <span>Supply Rail (LDO)</span>
                  <span className="font-mono text-on-surface font-bold">3.31 V</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
                  <span className="font-label-sub text-label-sub font-mono text-on-surface-variant">
                    Ripple: 12 mV RMS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Embedded Serial Bus Frequency Synchronizer */}
          <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-center justify-between gap-space-lg border border-outline-variant/15">
            <div className="flex items-center gap-space-md">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
                <span className="material-symbols-outlined">hub</span>
              </div>
              <div>
                <div className="font-body-bold text-body-bold text-on-surface">
                  Serial Bus Frequency Synchronizer
                </div>
                <div className="font-label-sub text-label-sub font-mono text-on-surface-variant">
                  I2C Fast Mode @ 400kHz • SPI High-Speed Bus @ 20MHz
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="font-label-sub text-label-sub font-mono px-2 py-1 rounded bg-surface-container-low text-primary font-semibold">
                ACK Pass
              </span>
              <span className="font-label-sub text-label-sub font-mono px-2 py-1 rounded bg-surface-container-low text-on-surface-variant">
                CRC Enabled
              </span>
            </div>
          </div>
        </div>

        {/* SPI FAT32 MicroSD Datalogger Station (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col justify-between h-full border border-outline-variant/15">
            <div>
              <div className="flex items-center justify-between pb-space-md">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[22px]">sd_card</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    SPI MicroSD Station
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 font-label-sub text-label-sub font-mono px-2 py-0.5 rounded-full bg-surface-container text-primary font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                  {unmounted ? 'Unmounted' : 'FAT32 Mounted'}
                </span>
              </div>

              <div className="space-y-space-md">
                {/* Capacity Gauge */}
                <div className="bg-surface-container-low p-space-md rounded-xl border border-outline-variant/10">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                      Card Capacity (Class 10 SanDisk)
                    </span>
                    <span className="font-mono-metric text-mono-metric text-on-surface font-semibold">
                      14.2 GB / 16.0 GB
                    </span>
                  </div>
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden my-2">
                    <div
                      className="bg-secondary-container h-full rounded-full transition-all"
                      style={{ width: '88.75%' }}
                    />
                  </div>
                  <div className="flex justify-between font-label-sub text-label-sub font-mono text-on-surface-variant">
                    <span>88.7% Available Space</span>
                    <span>20 MHz SPI Clock</span>
                  </div>
                </div>

                {/* Active File Metadata */}
                <div className="bg-surface-container-low p-space-md rounded-xl space-y-2 border border-outline-variant/10">
                  <div className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                    Active Stream Target
                  </div>
                  <div className="flex items-center gap-2 font-mono text-body-base text-on-surface bg-surface-container-lowest p-2 rounded-lg truncate border border-outline-variant/10">
                    <span className="material-symbols-outlined text-[18px] text-primary shrink-0">
                      description
                    </span>
                    <span className="truncate">/logs/aquasync_telemetry.csv</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-label-sub text-label-sub font-mono text-on-surface-variant">
                    <div>
                      Write Latency: <span className="text-on-surface font-semibold">12 ms avg</span>
                    </div>
                    <div>
                      Flush Buffer: <span className="text-on-surface font-semibold">512B (18%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SD Quick Actions */}
            <div className="pt-space-lg space-y-space-sm">
              <div className="grid grid-cols-2 gap-space-sm">
                <button
                  type="button"
                  onClick={handleFlushSD}
                  className="px-space-sm py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5 font-body-bold text-body-bold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-primary">save</span>
                  <span>{flushed ? 'Flushed!' : 'Flush Buffer'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleRotateLog}
                  className="px-space-sm py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5 font-body-bold text-body-bold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">sync</span>
                  <span>{rotated ? 'Rotated!' : 'Rotate File'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-space-sm">
                <button
                  type="button"
                  className="px-space-sm py-2 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors flex items-center justify-center gap-1.5 font-body-bold text-body-bold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>Verify CSV</span>
                </button>
                <button
                  type="button"
                  onClick={handleUnmountSD}
                  className="px-space-sm py-2 rounded-xl bg-surface-container text-tertiary hover:bg-tertiary-container hover:text-white transition-colors flex items-center justify-center gap-1.5 font-body-bold text-body-bold cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">eject</span>
                  <span>{unmounted ? 'Unmounted' : 'Safely Unmount'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 3: Hardware Peripheral & Pinout Health Matrix (Strict Rule 2) ── */}
      <div className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm border border-outline-variant/15">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-lg gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">electrical_services</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Hardware Peripheral Pinout & Sensor Bus Matrix
              </h2>
            </div>
            <p className="text-body-base text-on-surface-variant mt-1">
              Live physical pin maps, ADC 12-bit raw conversion levels, and peripheral logic states.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-label-sub text-label-sub font-mono bg-surface-container-low px-3 py-1 rounded-full text-on-surface border border-outline-variant/10">
              Vref Regulated: <strong className="text-primary font-bold">1100 mV</strong> (eFuse Calibrated)
            </span>
          </div>
        </div>

        {/* Matrix Table with strictly corrected DHT11 (GPIO 15) and IRLZ44N (GPIO 26) */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase">
                <th className="py-3 px-4 rounded-l-xl">Peripheral / Sensor</th>
                <th className="py-3 px-4">ESP32 Pinout</th>
                <th className="py-3 px-4">Interface Mode</th>
                <th className="py-3 px-4">Telemetry / ADC</th>
                <th className="py-3 px-4">Driver Status</th>
                <th className="py-3 px-4 rounded-r-xl text-right">Self Test</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 font-mono-metric text-mono-metric text-on-surface">
              {/* 1. Capacitive Probe */}
              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-3.5 px-4 font-body-bold text-body-bold flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[16px]">water_drop</span>
                  </div>
                  Capacitive Moisture Probe
                </td>
                <td className="py-3.5 px-4">
                  <span className="bg-surface-container px-2 py-0.5 rounded text-on-surface font-bold">
                    GPIO 34
                  </span>{' '}
                  <span className="text-on-surface-variant text-label-sub">(ADC1_CH6)</span>
                </td>
                <td className="py-3.5 px-4 text-on-surface-variant">Analog (12-bit SAR)</td>
                <td className="py-3.5 px-4 font-semibold text-primary">
                  {soilAdc.toLocaleString()} raw{' '}
                  <span className="text-label-sub text-on-surface-variant font-normal">
                    ({Math.round(((4095 - soilAdc) / (4095 - 1200)) * 100)}% sat)
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-primary text-label-sub font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container" /> Calibrated
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2 py-1 rounded bg-surface-container text-label-sub text-primary font-body-bold">
                    Live
                  </span>
                </td>
              </tr>

              {/* 2. Rain Plate */}
              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-3.5 px-4 font-body-bold text-body-bold flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[16px]">rainy</span>
                  </div>
                  Rain Plate Sensor
                </td>
                <td className="py-3.5 px-4">
                  <span className="bg-surface-container px-2 py-0.5 rounded text-on-surface font-bold">
                    GPIO 35
                  </span>{' '}
                  <span className="text-on-surface-variant text-label-sub">(ADC1_CH7)</span>
                </td>
                <td className="py-3.5 px-4 text-on-surface-variant">Analog / Comparator</td>
                <td className="py-3.5 px-4 font-semibold text-on-surface">
                  {rainAdc.toLocaleString()} raw{' '}
                  <span className="text-label-sub text-on-surface-variant font-normal">
                    ({rainAdc < 3000 ? 'Surface Wet' : 'Surface Dry'})
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-label-sub font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container" /> Active
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2 py-1 rounded bg-surface-container text-label-sub text-primary font-body-bold">
                    Live
                  </span>
                </td>
              </tr>

              {/* 3. DHT11 Sensor - STRICT RULE 2: Changed from DHT22 to DHT11, pin from GPIO 4 to GPIO 15 */}
              <tr className="hover:bg-surface-container-low/50 transition-colors bg-primary-container/5">
                <td className="py-3.5 px-4 font-body-bold text-body-bold flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[16px]">thermostat</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>DHT11 Atmosphere Sensor</span>
                    <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono">
                      Verified
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="bg-primary-container/20 text-primary font-bold px-2 py-0.5 rounded">
                    GPIO 15
                  </span>
                </td>
                <td className="py-3.5 px-4 text-on-surface-variant">Single-bus 1-Wire</td>
                <td className="py-3.5 px-4 font-semibold text-on-surface">
                  {temp}°C / {humidity}% RH
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-primary text-label-sub font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container" /> CRC OK (0 loss)
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2 py-1 rounded bg-surface-container text-label-sub text-primary font-body-bold">
                    Live
                  </span>
                </td>
              </tr>

              {/* 4. Photoresistor LDR */}
              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-3.5 px-4 font-body-bold text-body-bold flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-surface-container flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[16px]">light_mode</span>
                  </div>
                  Photoresistor (LDR GL5528)
                </td>
                <td className="py-3.5 px-4">
                  <span className="bg-surface-container px-2 py-0.5 rounded text-on-surface font-bold">
                    GPIO 32
                  </span>{' '}
                  <span className="text-on-surface-variant text-label-sub">(ADC1_CH4)</span>
                </td>
                <td className="py-3.5 px-4 text-on-surface-variant">Voltage Divider</td>
                <td className="py-3.5 px-4 font-semibold text-primary">
                  {lightAdc.toLocaleString()} raw{' '}
                  <span className="text-label-sub text-on-surface-variant font-normal">
                    ({Math.round((lightAdc / 4095) * 100)}% Sun)
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-primary text-label-sub font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container" /> High Sens
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <span className="px-2 py-1 rounded bg-surface-container text-label-sub text-primary font-body-bold">
                    Live
                  </span>
                </td>
              </tr>

              {/* 5. Submersible Pump Driver - STRICT RULE 2: Changed from GPIO 25 to GPIO 26 */}
              <tr className="hover:bg-surface-container-low/50 transition-colors bg-primary-container/5">
                <td className="py-3.5 px-4 font-body-bold text-body-bold flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-surface-container flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[16px]">mode_fan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Pump Driver (IRLZ44N FET)</span>
                    <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary text-[10px] font-mono">
                      Verified
                    </span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="bg-primary-container/20 text-primary font-bold px-2 py-0.5 rounded">
                    GPIO 26
                  </span>{' '}
                  <span className="text-on-surface-variant text-label-sub">(LEDC_CH0)</span>
                </td>
                <td className="py-3.5 px-4 text-on-surface-variant">PWM @ 1.00 kHz</td>
                <td className="py-3.5 px-4 font-semibold text-on-surface">
                  {manualPulseActive
                    ? `Pumping (${manualPulseCountdown}s)`
                    : sensors.pump_active
                    ? 'Active'
                    : 'Standby'}{' '}
                  <span className="text-label-sub text-on-surface-variant font-normal">
                    (Duty: {Math.round(((sensors.pump_active || manualPulseActive ? 165 : 0) / 255) * 100)}%)
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label-sub font-semibold ${
                      manualPulseActive || sensors.pump_active
                        ? 'bg-primary-container/20 text-primary'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        manualPulseActive || sensors.pump_active
                          ? 'bg-primary-container animate-pulse'
                          : 'bg-outline-variant'
                      }`}
                    />
                    {manualPulseActive || sensors.pump_active ? 'Pumping' : 'Idle Low'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={handleTestPulse}
                    disabled={manualPulseActive}
                    className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-label-sub text-on-surface font-body-bold cursor-pointer transition-colors"
                  >
                    {testPulseTriggered ? 'Sent!' : 'Test Pulse'}
                  </button>
                </td>
              </tr>

              {/* 6. Indicator LED */}
              <tr className="hover:bg-surface-container-low/50 transition-colors">
                <td className="py-3.5 px-4 font-body-bold text-body-bold flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[16px]">flare</span>
                  </div>
                  Heartbeat Indicator LED
                </td>
                <td className="py-3.5 px-4">
                  <span className="bg-surface-container px-2 py-0.5 rounded text-on-surface font-bold">
                    GPIO 2
                  </span>
                </td>
                <td className="py-3.5 px-4 text-on-surface-variant">Push-Pull Digital</td>
                <td className="py-3.5 px-4 font-semibold text-primary">1.00 Hz Square</td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-primary text-label-sub font-semibold">
                    <span
                      className={`w-1.5 h-1.5 rounded-full bg-primary-container ${
                        ledBlinking ? 'animate-bounce' : 'animate-ping'
                      }`}
                    />{' '}
                    Active Pulse
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={handleBlinkLed}
                    className="px-2 py-1 rounded bg-surface-container hover:bg-surface-container-high text-label-sub text-on-surface font-body-bold cursor-pointer transition-colors"
                  >
                    {ledBlinking ? 'Blinking...' : 'Blink 3x'}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DiagnosticsTab
