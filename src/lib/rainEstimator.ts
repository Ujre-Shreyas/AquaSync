/**
 * Rain Volume Estimator
 * ─────────────────────
 * Triggers when rain_raw drops below 3800 (sensor flooded = lower ADC).
 * Tracks elapsed time and drop intensity to calculate "Milliliters Caught".
 *
 * Formula:  mL = Σ (intensity_per_tick × Δt_seconds × COLLECTION_AREA_FACTOR)
 *
 * intensity: how far below 3800 the reading is (normalized 0-1)
 * Δt: elapsed seconds since last tick
 * COLLECTION_AREA_FACTOR: represents funnel/collection area coefficient
 */

import { useAquaStore } from '../store/useAquaStore'

const RAIN_THRESHOLD = 3800
const COLLECTION_AREA_FACTOR = 0.08 // mL per intensity-second (tunable)
const POLL_MS = 2000

let lastTickTime: number | null = null
let watchInterval: ReturnType<typeof setInterval> | null = null

export function startRainWatcher(): void {
  if (watchInterval) return

  watchInterval = setInterval(() => {
    const { sensors, addRainEvent, updateRainEvent, activeRainEvent } =
      useAquaStore.getState()

    const rainRaw = sensors.rain_raw
    const now = Date.now()

    if (rainRaw < RAIN_THRESHOLD) {
      const intensity = (RAIN_THRESHOLD - rainRaw) / RAIN_THRESHOLD
      const dtSeconds = lastTickTime ? (now - lastTickTime) / 1000 : POLL_MS / 1000

      const mlThisTick = intensity * dtSeconds * COLLECTION_AREA_FACTOR * 1000

      if (!activeRainEvent || !activeRainEvent.active) {
        // Start a new rain event
        const newEvent = {
          id: `rain-${now}`,
          startTime: now,
          peakRaw: rainRaw,
          mlCaught: mlThisTick,
          active: true,
        }
        addRainEvent(newEvent)
        console.log(`[Rain] New event started. Intensity: ${(intensity * 100).toFixed(1)}%`)
      } else {
        // Update the existing active event
        const updatedMl = activeRainEvent.mlCaught + mlThisTick
        const newPeak = Math.min(activeRainEvent.peakRaw, rainRaw)
        updateRainEvent(activeRainEvent.id, {
          mlCaught: updatedMl,
          peakRaw: newPeak,
        })
      }

      lastTickTime = now
    } else {
      // Rain stopped – close active event
      if (activeRainEvent?.active) {
        updateRainEvent(activeRainEvent.id, { active: false })
        console.log(
          `[Rain] Event ended. Total: ${activeRainEvent.mlCaught.toFixed(2)} mL`
        )
      }
      lastTickTime = null
    }
  }, POLL_MS)
}

export function stopRainWatcher(): void {
  if (watchInterval) {
    clearInterval(watchInterval)
    watchInterval = null
  }
  lastTickTime = null
}
