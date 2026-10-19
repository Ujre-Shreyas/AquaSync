import React from 'react'
import { useAquaStore } from '../store/useAquaStore'
import PlantOverviewTab from './PlantOverviewTab'
import IrrigationTab from './IrrigationTab'
import TelemetryTab from './TelemetryTab'
import DiagnosticsTab from './DiagnosticsTab'
import Calibration from './Calibration'
import { AlertTriangle } from 'lucide-react'

export const Dashboard: React.FC = () => {
  const { activeTab, sensors, weather } = useAquaStore()

  // Atmospheric haze condition when AQI > 150
  const isSmog = weather.aqi_raw > 150

  // Dynamic Lighting based on LDR light_raw
  const lightRaw = sensors.light_raw ?? 2048
  const solarRatio = lightRaw / 4095
  const isHighSun = lightRaw > 2800
  const isDark = lightRaw < 1000

  // Dynamic brightness: dims slightly in dark (0.88), radiates brightly under direct sun (1.08)
  const dynamicBrightness = (0.88 + solarRatio * 0.20).toFixed(3)

  return (
    <div
      id="dashboard-root-container"
      className="w-full min-h-full px-space-md sm:px-margin-desktop py-space-lg relative transition-all duration-700"
      style={{
        filter: `brightness(${dynamicBrightness})`,
      }}
    >
      {/* ── Dynamic Solar Lighting Atmospheric Layer ── */}
      <div
        id="dynamic-solar-lighting-layer"
        className="fixed inset-0 pointer-events-none transition-all duration-700 z-0"
        style={{
          background: isHighSun
            ? `radial-gradient(ellipse 90% 45% at 50% -10%, rgba(251, 191, 36, ${(solarRatio * 0.16).toFixed(2)}) 0%, rgba(245, 158, 11, ${(solarRatio * 0.06).toFixed(2)}) 50%, transparent 80%)`
            : isDark
            ? `radial-gradient(ellipse 100% 60% at 50% 100%, rgba(2, 6, 23, ${((1 - solarRatio) * 0.45).toFixed(2)}) 0%, transparent 75%)`
            : 'transparent',
        }}
      />

      {/* ── Atmospheric Smog Alert Overlay (if AQI > 150) ── */}
      {isSmog && (
        <div id="dashboard-smog-haze-layer" className="dashboard-smog-overlay">
          <div className="fixed top-20 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold shadow-lg shadow-amber-950/40 animate-pulse pointer-events-auto z-40 backdrop-blur-md">
            <AlertTriangle size={14} className="text-amber-400" />
            <span>Atmospheric Smog Alert: AQI {weather.aqi_raw} &gt; 150 • Transpiration Throttled</span>
          </div>
        </div>
      )}

      {/* ── Active Tab Viewport Router ── */}
      <div className="relative z-10 w-full">
        {activeTab === 'plant-overview' && <PlantOverviewTab />}
        {activeTab === 'irrigation-pump' && <IrrigationTab />}
        {activeTab === 'telemetry-charts' && <TelemetryTab />}
        {activeTab === 'diagnostics-sd' && <DiagnosticsTab />}
        {activeTab === 'calibration' && <Calibration />}
      </div>
    </div>
  )
}

export default Dashboard
