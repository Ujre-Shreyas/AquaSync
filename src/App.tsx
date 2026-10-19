import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAquaStore } from './store/useAquaStore'
import { fetchWeatherAndAqi, computeAndSendPwm } from './lib/botanicalAlgorithm'
import { startRainWatcher } from './lib/rainEstimator'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Calibration from './pages/Calibration'
import CompiledData from './pages/CompiledData'

export default function App() {
  const { theme, sensors, weather } = useAquaStore()

  // On mount: ensure dark mode class is applied, fetch weather + AQI, start rain watcher
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    fetchWeatherAndAqi()
    startRainWatcher()
  }, [])

  // Sync theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Recompute PWM whenever relevant sensor or weather parameters change
  useEffect(() => {
    computeAndSendPwm()
  }, [
    sensors.temperature,
    sensors.humidity,
    sensors.soil_moisture,
    sensors.light_raw,
    weather.aqi_raw,
    weather.temp_outside,
    weather.humidity_outside,
  ])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/overview" element={<Dashboard />} />
        <Route path="/irrigation" element={<Dashboard />} />
        <Route path="/telemetry" element={<Dashboard />} />
        <Route path="/diagnostics" element={<Dashboard />} />
        <Route path="/calibration" element={<Calibration />} />
        <Route path="/compiled-data" element={<CompiledData />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}
