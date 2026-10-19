/**
 * Botanical Algorithm
 * ───────────────────
 * Calculates target_pwm (0-255) based on:
 *   - Temperature  → higher heat = more water
 *   - Humidity     → lower humidity = more water
 *   - Soil dryness → dry soil adds PWM boost
 *   - AQI          → AQI > 150 triggers a 20% reduction (stomata close under pollution)
 *   - Sunlight/LDR → Intense direct sunlight increases plant transpiration;
 *                    If LDR detects high sunlight (>2800 ADC), apply a 1.2x multiplier.
 *
 * Then POSTs the calculated value to http://192.168.1.101/set_flow?pwm=X
 */

import { useAquaStore } from '../store/useAquaStore'

const ESP32_FLOW_URL = 'http://192.168.1.101/set_flow'

// OpenWeatherMap API key – replace with your actual key
const OWM_API_KEY = import.meta.env.VITE_OWM_API_KEY ?? 'DEMO_KEY'

// ─── Geolocation + OpenWeatherMap ─────────────────────────────────────────────

export async function fetchWeatherAndAqi(): Promise<void> {
  const { setWeather } = useAquaStore.getState()

  if (!navigator.geolocation) {
    console.warn('[AquaSync] Geolocation not supported')
    setWeather({ city: 'Unavailable', loaded: true })
    return
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      timeout: 10000,
      maximumAge: 300000,
    })
  ).catch((err) => {
    console.warn('[AquaSync] Geolocation denied:', err.message)
    return null
  })

  if (!position) {
    setWeather({ city: 'Location denied', loaded: true })
    return
  }

  const { latitude: lat, longitude: lon } = position.coords

  try {
    // Parallel fetch: current weather + AQI
    const [weatherRes, aqiRes] = await Promise.all([
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}&units=metric`
      ),
      fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OWM_API_KEY}`
      ),
    ])

    const weatherJson = await weatherRes.json()
    const aqiJson = await aqiRes.json()

    const temp_outside = weatherJson.main?.temp ?? 28
    const humidity_outside = weatherJson.main?.humidity ?? 60
    const city = weatherJson.name ?? 'Unknown'

    // OWM AQI index 1-5; map to 0-500 using PM2.5 as proxy
    const aqiIndex = aqiJson.list?.[0]?.main?.aqi ?? 1
    const pm25 = aqiJson.list?.[0]?.components?.pm2_5 ?? 0
    const aqi_raw = Math.round(pm25 * 4.5) // rough US AQI conversion from PM2.5

    setWeather({
      aqi: aqiIndex,
      aqi_raw,
      temp_outside,
      humidity_outside,
      city,
      loaded: true,
    })

    // Run botanical algorithm after weather loads
    computeAndSendPwm()
  } catch (err) {
    console.error('[AquaSync] Weather fetch failed:', err)
    setWeather({ city: 'API Error', loaded: true })
  }
}

// ─── Botanical PWM Algorithm ──────────────────────────────────────────────────

export function computeAndSendPwm(): void {
  const { sensors, weather, mode, setTargetPwm, setPwmSent } = useAquaStore.getState()

  const temp = weather.loaded ? weather.temp_outside : sensors.temperature
  const humidity = weather.loaded ? weather.humidity_outside : sensors.humidity
  const aqi = weather.aqi_raw
  const light = sensors.light_raw ?? 2048

  // Base PWM: 128 (50%)
  let pwm = 128

  // 1. Temperature contribution: +0 at 20°C, +64 at 36°C (linear)
  const tempDelta = Math.max(0, temp - 20)
  pwm += tempDelta * 4 // +4 per °C above 20°C

  // 2. Humidity reduction: -0 at 20%, -64 at 100%
  const humidityOffset = Math.max(0, humidity - 20)
  pwm -= humidityOffset * 0.8

  // 3. Soil moisture feedback: dry soil (high ADC > 2048) → more water needed
  // soil_moisture: 0 = Wet/Submerged, 4095 = Dry/In Air
  const soilDry = Math.max(0, sensors.soil_moisture - 2048) // 0-2047
  pwm += (soilDry / 2047) * 30

  // 4. AQI pollution throttle (stomata close in high AQI → less transpiration needed)
  if (aqi > 150) {
    const aqiExcess = Math.min(aqi - 150, 350) // cap at 350 excess
    pwm -= (aqiExcess / 350) * 0.2 * pwm
  }

  // 5. Sunlight / LDR Factor:
  // Direct, intense sunlight increases plant transpiration.
  // If LDR detects high sunlight (> 2800 ADC, or ~68%+ solar intensity), apply 1.2x multiplier.
  const isHighSunlight = light > 2800
  if (isHighSunlight) {
    pwm *= 1.2
  }

  // Clamp to 0-255
  const finalPwm = Math.round(Math.max(0, Math.min(255, pwm)))
  setTargetPwm(finalPwm)

  if (mode === 'LIVE') {
    sendPwmToEsp32(finalPwm)
  } else {
    setPwmSent(false)
  }
}

async function sendPwmToEsp32(pwm: number): Promise<void> {
  const { setPwmSent } = useAquaStore.getState()
  try {
    await fetch(`${ESP32_FLOW_URL}?pwm=${pwm}`, {
      method: 'POST',
      signal: AbortSignal.timeout(2000),
    })
    setPwmSent(true)
    console.log(`[AquaSync] PWM ${pwm} sent to ESP32`)
  } catch (err) {
    setPwmSent(false)
    console.warn('[AquaSync] Failed to send PWM:', err)
  }
}
