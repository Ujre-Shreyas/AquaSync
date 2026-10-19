import { create } from 'zustand'
import { persist, subscribeWithSelector } from 'zustand/middleware'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AppMode = 'LIVE' | 'DEMO'
export type ThemeMode = 'dark' | 'light'

export interface SensorData {
  soil_moisture: number   // 0-4095 (ADC raw)
  rain_raw: number        // 0-4095 (ADC raw, low = wet)
  temperature: number     // °C
  humidity: number        // %
  flow_speed: number      // L/min
  pump_active: boolean
  light_raw: number       // 0-4095 (ADC raw, LDR sensor: high = intense sunlight)
  sd_active: boolean      // SD card active boolean (expected by UI)
  sd_ready: boolean       // SD ready flag (backend compatibility)
}

export interface WeatherData {
  aqi: number             // 1-5 OpenWeatherMap AQI index, mapped 0-500
  aqi_raw: number         // 0-500 pollutant μg/m³ equivalent
  temp_outside: number    // °C
  humidity_outside: number// %
  city: string
  loaded: boolean
}

export interface RainEvent {
  id: string
  startTime: number
  peakRaw: number
  mlCaught: number
  active: boolean
}

export interface HistoryDataPoint {
  time: string
  timestamp: number
  soil_moisture: number
  soil_percent: number
  temperature: number
  humidity: number
  flow_speed: number
  pwm: number
  rain_raw: number
  light_raw: number
  light_percent: number
}

export interface CalibrationSettings {
  soilDryAdc: number
  soilWetAdc: number
  rainThreshold: number
  pumpPwmOffset: number
}

export interface CalibrationHistoryEntry {
  id: string
  timestamp: string // ISO string: new Date().toISOString()
  soilDryAdc: number
  soilWetAdc: number
  rainThreshold: number
  pumpPwmOffset: number
}

export interface AquaSyncState {
  // Theme
  theme: ThemeMode
  toggleTheme: () => void

  // Splash Screen Modal
  splashModalOpen: boolean
  setSplashModalOpen: (open: boolean) => void
  selectInitialMode: (mode: AppMode) => void

  // Mode
  mode: AppMode
  setMode: (mode: AppMode) => void

  // Sensor data
  sensors: SensorData
  setSensors: (data: Partial<SensorData>) => void

  // Demo slider overrides
  demo_soil: number
  demo_rain: number
  demo_aqi: number
  demo_light: number
  demo_temp: number
  demo_humidity: number
  demo_sd_active: boolean
  setDemoSoil: (v: number) => void
  setDemoRain: (v: number) => void
  setDemoAqi: (v: number) => void
  setDemoLight: (v: number) => void
  setDemoTemp: (v: number) => void
  setDemoHumidity: (v: number) => void
  setDemoSdActive: (v: boolean) => void

  // Demo Control Panel slide-out state
  demoPanelOpen: boolean
  setDemoPanelOpen: (open: boolean) => void
  toggleDemoPanel: () => void

  // Weather / AQI
  weather: WeatherData
  setWeather: (w: Partial<WeatherData>) => void

  // Botanical PWM
  target_pwm: number
  pwm_sent: boolean
  setTargetPwm: (pwm: number) => void
  setPwmSent: (sent: boolean) => void

  // Rain Tracking
  rainEvents: RainEvent[]
  activeRainEvent: RainEvent | null
  totalRainVolumeMl: number
  addRainEvent: (event: RainEvent) => void
  updateRainEvent: (id: string, update: Partial<RainEvent>) => void

  // Manual Override: "Make it Rain"
  makeItRainActive: boolean
  makeItRainCountdown: number
  triggerMakeItRain: () => Promise<void>

  // Compiled Data History (for Recharts)
  soilHistory: HistoryDataPoint[]
  addHistoryPoint: (point: HistoryDataPoint) => void

  // Calibration settings & History (with persist middleware to localStorage)
  calibration: CalibrationSettings
  calibrationHistory: CalibrationHistoryEntry[]
  setCalibration: (settings: Partial<CalibrationSettings>) => void
  addCalibrationHistory: (entry: Omit<CalibrationHistoryEntry, 'id'> | CalibrationSettings) => void
  flashCalibrationToEsp32: (customSettings?: Partial<CalibrationSettings>) => Promise<{ success: boolean; error?: string }>

  // Hardware Connection
  esp32Connected: boolean
  lastFetchTime: number | null
  setEsp32Connected: (c: boolean) => void

  // Polling
  _pollInterval: ReturnType<typeof setInterval> | null
  _makeItRainTimer: ReturnType<typeof setInterval> | null
  startLivePolling: () => void
  stopLivePolling: () => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const ESP32_BASE_URL = 'http://192.168.1.101'
const POLL_INTERVAL_MS = 2000

// Safely fetch and apply the most recent thresholds from localStorage on initial script execution
function getStoredCalibrationData(): { calibration: CalibrationSettings; history: CalibrationHistoryEntry[] } {
  const defaultCalibration: CalibrationSettings = {
    soilDryAdc: 4095,
    soilWetAdc: 1200,
    rainThreshold: 3800,
    pumpPwmOffset: 30,
  }

  if (typeof window === 'undefined' || !window.localStorage) {
    return { calibration: defaultCalibration, history: [] }
  }

  try {
    const raw = window.localStorage.getItem('aquasync-storage')
    if (raw) {
      const parsed = JSON.parse(raw)
      const hist: CalibrationHistoryEntry[] = parsed?.state?.calibrationHistory ?? []
      if (hist.length > 0) {
        const latest = hist[0]
        return {
          calibration: {
            soilDryAdc: Number(latest.soilDryAdc ?? defaultCalibration.soilDryAdc),
            soilWetAdc: Number(latest.soilWetAdc ?? defaultCalibration.soilWetAdc),
            rainThreshold: Number(latest.rainThreshold ?? defaultCalibration.rainThreshold),
            pumpPwmOffset: Number(latest.pumpPwmOffset ?? defaultCalibration.pumpPwmOffset),
          },
          history: hist,
        }
      }
      if (parsed?.state?.calibration) {
        return {
          calibration: { ...defaultCalibration, ...parsed.state.calibration },
          history: [],
        }
      }
    }
  } catch (err) {
    console.warn('[AquaSync] Failed loading calibration from localStorage:', err)
  }

  return { calibration: defaultCalibration, history: [] }
}

// Generate 24 seed historical data points for realistic charts on load
function generateSeedHistory(): HistoryDataPoint[] {
  const points: HistoryDataPoint[] = []
  const now = Date.now()
  const interval = 30 * 60 * 1000 // 30-minute steps (12 hours)

  let soil = 2200
  let temp = 26.5
  let hum = 58
  let light = 3100

  for (let i = 24; i >= 0; i--) {
    const t = new Date(now - i * interval)
    const timeStr = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    soil += (Math.random() - 0.48) * 85
    soil = Math.max(1200, Math.min(3800, soil))
    temp += (Math.random() - 0.5) * 0.8
    hum += (Math.random() - 0.5) * 1.5
    light += (Math.random() - 0.45) * 120
    light = Math.max(300, Math.min(4050, light))

    const soil_percent = Math.round(((4095 - soil) / (4095 - 1200)) * 100)
    const light_percent = Math.round((light / 4095) * 100)
    const flow = i % 6 === 0 ? 1.8 + Math.random() * 0.6 : 0.0

    points.push({
      time: timeStr,
      timestamp: t.getTime(),
      soil_moisture: Math.round(soil),
      soil_percent: Math.max(5, Math.min(98, soil_percent)),
      temperature: Number(temp.toFixed(1)),
      humidity: Math.round(hum),
      flow_speed: Number(flow.toFixed(2)),
      pwm: flow > 0 ? 185 : 95,
      rain_raw: i === 4 || i === 5 ? 2400 : 4050,
      light_raw: Math.round(light),
      light_percent,
    })
  }
  return points
}

// Initial calibration data retrieved from localStorage
const initialCalData = getStoredCalibrationData()
if (initialCalData.history.length === 0) {
  initialCalData.history = [
    {
      id: 'cal-seed-baseline',
      timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      soilDryAdc: 4095,
      soilWetAdc: 1200,
      rainThreshold: 3800,
      pumpPwmOffset: 30,
    },
  ]
}

// ─── Store Creation ───────────────────────────────────────────────────────────

export const useAquaStore = create<AquaSyncState>()(
  persist(
    subscribeWithSelector((set, get) => ({
      // Theme default dark (#0e141b + #10b981)
      theme: 'dark',
      toggleTheme: () => {
        const nextTheme: ThemeMode = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: nextTheme })
        if (typeof document !== 'undefined') {
          if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        }
      },

      // Splash screen modal open on load
      splashModalOpen: true,
      setSplashModalOpen: (open) => set({ splashModalOpen: open }),
      selectInitialMode: (selectedMode) => {
        set({ splashModalOpen: false })
        get().setMode(selectedMode)
        if (selectedMode === 'DEMO') {
          set({ demoPanelOpen: true })
        }
      },

      // Initial Mode
      mode: 'DEMO',

      // Primary Sensors
      sensors: {
        soil_moisture: 2048,
        rain_raw: 4000,
        temperature: 28.4,
        humidity: 62,
        flow_speed: 1.45,
        pump_active: false,
        light_raw: 3150, // default healthy sunlight (~77%)
        sd_active: true, // SD Card active status
        sd_ready: true,  // SD Card ready status
      },

      // Demo Sliders
      demo_soil: 2048,
      demo_rain: 4000,
      demo_aqi: 65,
      demo_light: 3150,
      demo_temp: 28.4,
      demo_humidity: 62,
      demo_sd_active: true,

      demoPanelOpen: true,
      setDemoPanelOpen: (open) => set({ demoPanelOpen: open }),
      toggleDemoPanel: () => set((state) => ({ demoPanelOpen: !state.demoPanelOpen })),

      // Weather
      weather: {
        aqi: 65,
        aqi_raw: 65,
        temp_outside: 28.4,
        humidity_outside: 62,
        city: 'Detecting Location...',
        loaded: false,
      },

      // Botanical Algorithm Output
      target_pwm: 165,
      pwm_sent: false,

      // Rain Tracking
      rainEvents: [
        {
          id: 'seed-rain-1',
          startTime: Date.now() - 3600000,
          peakRaw: 2150,
          mlCaught: 148.6,
          active: false,
        },
      ],
      activeRainEvent: null,
      totalRainVolumeMl: 148.6,

      // Manual Override State
      makeItRainActive: false,
      makeItRainCountdown: 5,
      _makeItRainTimer: null,

      // Compiled Data History
      soilHistory: generateSeedHistory(),

      // Calibration & History (Persisted in localStorage)
      calibration: initialCalData.calibration,
      calibrationHistory: initialCalData.history,

      setCalibration: (update) =>
        set((state) => ({ calibration: { ...state.calibration, ...update } })),

      addCalibrationHistory: (entry) => {
        const id = ('id' in entry && typeof (entry as { id?: string }).id === 'string')
          ? (entry as { id: string }).id
          : `cal-${Date.now()}`
        const timestamp = ('timestamp' in entry && typeof (entry as { timestamp?: string }).timestamp === 'string')
          ? (entry as { timestamp: string }).timestamp
          : new Date().toISOString()
        const newEntry: CalibrationHistoryEntry = {
          id,
          timestamp,
          soilDryAdc: entry.soilDryAdc,
          soilWetAdc: entry.soilWetAdc,
          rainThreshold: entry.rainThreshold,
          pumpPwmOffset: entry.pumpPwmOffset,
        }
        set((state) => ({
          calibrationHistory: [newEntry, ...(state.calibrationHistory || [])].slice(0, 30),
        }))
      },

      // Flash calibration to ESP32: saves to state & localStorage and dispatches to http://192.168.1.101/calibrate
      flashCalibrationToEsp32: async (customSettings) => {
        const currentCalibration = get().calibration
        const newCalibration = customSettings ? { ...currentCalibration, ...customSettings } : currentCalibration
        const timestamp = new Date().toISOString()
        const newEntry: CalibrationHistoryEntry = {
          id: `cal-${Date.now()}`,
          timestamp,
          soilDryAdc: newCalibration.soilDryAdc,
          soilWetAdc: newCalibration.soilWetAdc,
          rainThreshold: newCalibration.rainThreshold,
          pumpPwmOffset: newCalibration.pumpPwmOffset,
        }

        // Immediately persist into state (and automatically saved into localStorage)
        set((state) => ({
          calibration: newCalibration,
          calibrationHistory: [newEntry, ...(state.calibrationHistory || [])].slice(0, 30),
        }))

        // Send POST payload to http://192.168.1.101/calibrate
        try {
          const res = await fetch(`${ESP32_BASE_URL}/calibrate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newCalibration),
            signal: AbortSignal.timeout(3000),
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return { success: true }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Network unreachable'
          console.warn('[AquaSync] Hardware flash offline (persisted locally):', message)
          return { success: false, error: message }
        }
      },

      // Connection
      esp32Connected: false,
      lastFetchTime: null,
      _pollInterval: null,

      // ── Mode Switch ──────────────────────────────────────────────────────────
      setMode: (mode) => {
        const { stopLivePolling, startLivePolling } = get()
        stopLivePolling()
        set({ mode })
        if (mode === 'LIVE') {
          startLivePolling()
        } else {
          // Sync demo slider values into sensors
          const { demo_soil, demo_rain, demo_light, demo_temp, demo_humidity, demo_sd_active } = get()
          set((state) => ({
            sensors: {
              ...state.sensors,
              soil_moisture: demo_soil,
              rain_raw: demo_rain,
              light_raw: demo_light,
              temperature: demo_temp,
              humidity: demo_humidity,
              sd_active: demo_sd_active,
              sd_ready: demo_sd_active,
            },
          }))
        }
      },

      // ── Live Polling ─────────────────────────────────────────────────────────
      startLivePolling: () => {
        const { stopLivePolling, addHistoryPoint } = get()
        stopLivePolling()

        const fetchData = async () => {
          try {
            const res = await fetch(`${ESP32_BASE_URL}/`, {
              signal: AbortSignal.timeout(1800),
            })
            // ESP32 Connection: Active if the 2-second fetch interval returns 200 status
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            const data = await res.json()

            const soil_moisture = Number(data.soil_moisture ?? get().sensors.soil_moisture)
            const rain_raw = Number(data.rain_raw ?? get().sensors.rain_raw)
            const temperature = Number(data.temperature ?? get().sensors.temperature)
            const humidity = Number(data.humidity ?? get().sensors.humidity)
            const flow_speed = Number(data.flow_speed ?? get().sensors.flow_speed)
            const pump_active = Boolean(data.pump_active ?? get().sensors.pump_active)
            const light_raw = Number(data.light_raw ?? get().sensors.light_raw)
            const sd_active = Boolean(data.sd_active ?? data.sd_ready ?? true)
            const sd_ready = Boolean(data.sd_ready ?? data.sd_active ?? true)

            set({
              sensors: {
                soil_moisture,
                rain_raw,
                temperature,
                humidity,
                flow_speed,
                pump_active,
                light_raw,
                sd_active,
                sd_ready,
              },
              esp32Connected: true,
              lastFetchTime: Date.now(),
            })

            // Add real-time telemetry point
            const now = new Date()
            addHistoryPoint({
              time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              timestamp: now.getTime(),
              soil_moisture,
              soil_percent: Math.round(((4095 - soil_moisture) / (4095 - 1200)) * 100),
              temperature,
              humidity,
              flow_speed,
              pwm: get().target_pwm,
              rain_raw,
              light_raw,
              light_percent: Math.round((light_raw / 4095) * 100),
            })
          } catch {
            set({ esp32Connected: false })
          }
        }

        fetchData()
        const handle = setInterval(fetchData, POLL_INTERVAL_MS)
        set({ _pollInterval: handle })
      },

      stopLivePolling: () => {
        const { _pollInterval } = get()
        if (_pollInterval) {
          clearInterval(_pollInterval)
          set({ _pollInterval: null })
        }
      },

      setSensors: (data) =>
        set((state) => ({ sensors: { ...state.sensors, ...data } })),

      // ── Demo Sliders ─────────────────────────────────────────────────────────
      setDemoSoil: (v) => {
        set((state) => ({
          demo_soil: v,
          sensors: state.mode === 'DEMO'
            ? { ...state.sensors, soil_moisture: v }
            : state.sensors,
        }))
      },

      setDemoRain: (v) => {
        set((state) => ({
          demo_rain: v,
          sensors: state.mode === 'DEMO'
            ? { ...state.sensors, rain_raw: v }
            : state.sensors,
        }))
      },

      setDemoAqi: (v) => {
        set((state) => ({
          demo_aqi: v,
          weather: state.mode === 'DEMO'
            ? { ...state.weather, aqi_raw: v, aqi: v }
            : state.weather,
        }))
      },

      setDemoLight: (v) => {
        set((state) => ({
          demo_light: v,
          sensors: state.mode === 'DEMO'
            ? { ...state.sensors, light_raw: v }
            : state.sensors,
        }))
      },

      setDemoSdActive: (v) => {
        set((state) => ({
          demo_sd_active: v,
          sensors: state.mode === 'DEMO'
            ? { ...state.sensors, sd_active: v, sd_ready: v }
            : state.sensors,
        }))
      },

      setDemoTemp: (v) => {
        set((state) => ({
          demo_temp: v,
          sensors: state.mode === 'DEMO'
            ? { ...state.sensors, temperature: v }
            : state.sensors,
        }))
      },

      setDemoHumidity: (v) => {
        set((state) => ({
          demo_humidity: v,
          sensors: state.mode === 'DEMO'
            ? { ...state.sensors, humidity: v }
            : state.sensors,
        }))
      },

      setWeather: (w) =>
        set((state) => ({ weather: { ...state.weather, ...w } })),

      setTargetPwm: (pwm) => set({ target_pwm: pwm }),
      setPwmSent: (sent) => set({ pwm_sent: sent }),
      setEsp32Connected: (c) => set({ esp32Connected: c }),

      // ── Rain Events ──────────────────────────────────────────────────────────
      addRainEvent: (event) =>
        set((state) => ({
          rainEvents: [event, ...state.rainEvents].slice(0, 15),
          activeRainEvent: event,
          totalRainVolumeMl: state.totalRainVolumeMl + event.mlCaught,
        })),

      updateRainEvent: (id, update) =>
        set((state) => {
          let addedMl = 0
          const rainEvents = state.rainEvents.map((e) => {
            if (e.id === id) {
              if (update.mlCaught !== undefined && update.mlCaught > e.mlCaught) {
                addedMl = update.mlCaught - e.mlCaught
              }
              return { ...e, ...update }
            }
            return e
          })
          const activeRainEvent =
            state.activeRainEvent?.id === id
              ? { ...state.activeRainEvent, ...update }
              : state.activeRainEvent

          return {
            rainEvents,
            activeRainEvent,
            totalRainVolumeMl: state.totalRainVolumeMl + addedMl,
          }
        }),

      // ── Manual Override: "Make it Rain" ──────────────────────────────────────
      triggerMakeItRain: async () => {
        const state = get()
        if (state.makeItRainActive) return

        // Clear any prior timer
        if (state._makeItRainTimer) {
          clearInterval(state._makeItRainTimer)
        }

        // Capture previous values to restore if in DEMO
        const prevRain = state.sensors.rain_raw
        const prevFlow = state.sensors.flow_speed
        const prevPump = state.sensors.pump_active

        set({
          makeItRainActive: true,
          makeItRainCountdown: 5,
          sensors: {
            ...state.sensors,
            rain_raw: 950, // simulated deluge
            flow_speed: 4.85, // max flow
            pump_active: true,
          },
        })

        // Send GET request to http://192.168.1.101/manual_pump?sec=5
        try {
          fetch(`${ESP32_BASE_URL}/manual_pump?sec=5`, {
            method: 'GET',
            signal: AbortSignal.timeout(3000),
          }).catch((err) => {
            console.warn('[AquaSync] Make it Rain hardware fetch offline (simulating):', err)
          })
        } catch (err) {
          console.warn('[AquaSync] Manual pump dispatch error:', err)
        }

        // 5-second countdown timer
        const timer = setInterval(() => {
          const currentCount = get().makeItRainCountdown
          if (currentCount <= 1) {
            clearInterval(timer)
            set((s) => ({
              makeItRainActive: false,
              makeItRainCountdown: 5,
              _makeItRainTimer: null,
              sensors: {
                ...s.sensors,
                rain_raw: s.mode === 'DEMO' ? s.demo_rain : prevRain,
                flow_speed: prevFlow,
                pump_active: prevPump,
              },
            }))
          } else {
            set({ makeItRainCountdown: currentCount - 1 })
          }
        }, 1000)

        set({ _makeItRainTimer: timer })
      },

      // ── Add history point for Recharts ───────────────────────────────────────
      addHistoryPoint: (point) =>
        set((state) => ({
          soilHistory: [...state.soilHistory.slice(-40), point],
        })),
    })),
    {
      name: 'aquasync-storage',
      // Persist calibration settings, calibration history, and theme preferences to localStorage
      partialize: (state) => ({
        calibration: state.calibration,
        calibrationHistory: state.calibrationHistory,
        theme: state.theme,
      }),
      // On initial load, automatically apply the most recent thresholds from the local storage history array
      onRehydrateStorage: () => (state) => {
        if (state && state.calibrationHistory && state.calibrationHistory.length > 0) {
          const latest = state.calibrationHistory[0]
          state.setCalibration({
            soilDryAdc: Number(latest.soilDryAdc),
            soilWetAdc: Number(latest.soilWetAdc),
            rainThreshold: Number(latest.rainThreshold),
            pumpPwmOffset: Number(latest.pumpPwmOffset),
          })
          console.log('[AquaSync] Rehydrated and applied latest calibration from localStorage:', latest)
        }
      },
    }
  )
)
