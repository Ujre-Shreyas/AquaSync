import { useMemo } from 'react'
import { useAquaStore } from '../store/useAquaStore'
import {
  CloudRain,
  Sprout,
  AlertTriangle,
  Heart,
  Sun
} from 'lucide-react'

export default function KalanchoePlantCard() {
  const { sensors, weather, triggerMakeItRain, makeItRainActive, makeItRainCountdown } =
    useAquaStore()

  // State checks based on prompt requirements
  // 1. Healthy vs Wilted: healthy when soil_moisture <= dry_threshold (2800 ADC)
  const DRY_THRESHOLD = 2800
  const isHealthy = sensors.soil_moisture <= DRY_THRESHOLD
  const isWilted = !isHealthy

  // 2. Sunlight / LDR: intense sunlight (>2800 ADC)
  const isHighSun = (sensors.light_raw ?? 2048) > 2800

  // 2. Smog / Pollution: AQI > 150
  const isSmog = weather.aqi_raw > 150

  // 3. Rain Effect: rain_raw < 3800
  const isRaining = sensors.rain_raw < 3800

  // Soil saturation percentage
  const soilPercent = Math.min(
    100,
    Math.max(0, Math.round(((4095 - sensors.soil_moisture) / (4095 - 1200)) * 100))
  )

  // Lightweight CSS keyframe raindrops for the card rain effect
  const cardRainDrops = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: `${(i * 4.6 + Math.random() * 2).toFixed(1)}%`,
        duration: `${(0.55 + Math.random() * 0.4).toFixed(2)}s`,
        delay: `${(Math.random() * 0.6).toFixed(2)}s`,
        height: `${14 + Math.floor(Math.random() * 16)}px`,
        opacity: (0.35 + Math.random() * 0.5).toFixed(2),
      })),
    []
  )

  return (
    <div
      id="centerpiece-kalanchoe-card"
      className="glass-card flex-1 rounded-2xl p-3 xl:p-3.5 flex flex-col justify-between border border-emerald-500/30 relative overflow-hidden transition-all duration-700 min-h-0 h-full"
      style={{
        boxShadow: isRaining
          ? '0 0 35px -5px rgba(6, 182, 212, 0.25), inset 0 0 25px rgba(2, 6, 23, 0.4)'
          : isSmog
          ? '0 0 35px -5px rgba(245, 158, 11, 0.25)'
          : isHealthy
          ? '0 0 30px -5px rgba(16, 185, 129, 0.2)'
          : '0 0 25px -5px rgba(244, 63, 94, 0.15)',
      }}
    >
      <div className="watermelon-strip" />

      {/* ── CARD HEADER: Plant Identification & Dynamic Botanical Status ── */}
      <div className="flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-2">
          <div
            className={`p-2 rounded-xl transition-colors duration-500 ${
              isRaining
                ? 'bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/30'
                : isSmog
                ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30'
                : isHealthy
                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 ring-1 ring-rose-500/30'
            }`}
          >
            <Sprout size={18} className={isHealthy ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-black font-mono uppercase tracking-wider text-white">
                Kalanchoe Blossfeldiana
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                Succulent
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono">
              Live Biomechanical Response Engine
            </p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-1.5">
          {isHighSun && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
              <Sun size={10} className="animate-spin-slow" /> Radiant Sun (1.2x)
            </span>
          )}
          {isRaining && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 animate-pulse">
              <CloudRain size={10} /> Rain Shower
            </span>
          )}
          {isSmog && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
              <AlertTriangle size={10} /> Smog Stress
            </span>
          )}
          <span
            className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border transition-colors ${
              isHealthy
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
            }`}
          >
            {isHealthy ? '● Turgid / Swaying' : '● Thirst Wilted'}
          </span>
        </div>
      </div>

      {/* ── ATMOSPHERIC WEATHER OVERLAYS ── */}

      {/* 1. SMOG OVERLAY (when AQI > 150) */}
      {isSmog && (
        <div
          id="card-smog-overlay"
          className="absolute inset-0 z-10 pointer-events-none transition-opacity duration-1000"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(180, 130, 40, 0.22) 0%, rgba(120, 90, 20, 0.35) 100%)',
            backdropFilter: 'blur(1.5px) contrast(90%) sepia(30%)',
            WebkitBackdropFilter: 'blur(1.5px) contrast(90%) sepia(30%)',
          }}
        >
          {/* Smog haze drift */}
          <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] opacity-25 animate-pulse" />
        </div>
      )}

      {/* 2. RAIN OVERLAY (when rain_raw < 3800) */}
      {isRaining && (
        <div
          id="card-rain-overlay"
          className="absolute inset-0 z-10 pointer-events-none overflow-hidden transition-opacity duration-700 bg-slate-950/40"
        >
          {/* Falling Rain Drops */}
          {cardRainDrops.map((drop) => (
            <div
              key={drop.id}
              className="rain-particle"
              style={{
                left: drop.left,
                height: drop.height,
                opacity: Number(drop.opacity),
                animationDuration: drop.duration,
                animationDelay: drop.delay,
                background: 'linear-gradient(180deg, transparent, #38bdf8, #10b981)',
              }}
            />
          ))}

          {/* Plant Splash Ripples */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-28 h-6 pointer-events-none">
            <div className="splash-ripple w-12 h-5 left-2 bottom-0" />
            <div
              className="splash-ripple w-16 h-6 right-2 bottom-0"
              style={{ animationDelay: '0.4s' }}
            />
          </div>
        </div>
      )}

      {/* ── THE CENTERPIECE PLANT: 2D STYLIZED SVG OF KALANCHOE PLANT ── */}
      <div className="relative my-auto flex items-center justify-center py-1 z-0">
        {/* Subtle radial glow behind plant */}
        <div
          className={`absolute w-44 h-44 rounded-full blur-2xl pointer-events-none transition-all duration-1000 ${
            isRaining
              ? 'bg-cyan-500/15'
              : isSmog
              ? 'bg-amber-500/15'
              : isHighSun
              ? 'bg-amber-400/30'
              : isHealthy
              ? 'bg-emerald-500/20'
              : 'bg-rose-500/10'
          }`}
        />

        <svg
          viewBox="0 0 320 300"
          className="w-44 h-40 sm:w-52 sm:h-44 xl:w-60 xl:h-48 max-h-[28vh] transition-all duration-1000"
        >
          <defs>
            {/* Emerald leaf gradient */}
            <linearGradient id="kalanchoeLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            {/* Wilted dry leaf gradient */}
            <linearGradient id="kalanchoeWiltedLeafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a3a3a3" />
              <stop offset="50%" stopColor="#78716c" />
              <stop offset="100%" stopColor="#57534e" />
            </linearGradient>

            {/* Kalanchoe coral flower gradient */}
            <linearGradient id="kalanchoeFlowerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fda4af" />
              <stop offset="40%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>

            {/* Modern geometric planter pot gradient */}
            <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="60%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>

            {/* Soil bed gradient */}
            <linearGradient id="soilBedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#451a03" />
              <stop offset="100%" stopColor="#291205" />
            </linearGradient>
          </defs>

          {/* ── 1. POT & SOIL BED (Static Base) ── */}
          <g id="pot-and-soil">
            {/* Soil mound */}
            <g id="soil-bed">
              <ellipse cx="160" cy="235" rx="58" ry="12" fill="url(#soilBedGrad)" />
              {/* Soil moisture indicator ring on soil surface */}
              <ellipse
                cx="160"
                cy="235"
                rx="54"
                ry="10"
                fill="none"
                stroke={isHealthy ? '#10b981' : '#f43f5e'}
                strokeWidth="1.5"
                opacity={isHealthy ? 0.6 : 0.3}
              />
            </g>

            {/* Minimalist Ceramic / Terracotta Planter */}
            <g id="pot">
              {/* Pot body */}
              <polygon
                points="102,235 218,235 204,285 116,285"
                fill="url(#potGrad)"
                stroke="rgba(16, 185, 129, 0.4)"
                strokeWidth="2"
              />
              {/* Pot rim */}
              <path
                d="M 98,232 C 98,228 222,228 222,232 L 222,237 C 222,241 98,241 98,237 Z"
                fill="#1e293b"
                stroke="rgba(16, 185, 129, 0.5)"
                strokeWidth="1.5"
              />
              {/* Watermelon accent stripe on pot */}
              <line
                x1="112"
                y1="255"
                x2="208"
                y2="255"
                stroke="#10b981"
                strokeWidth="2"
                strokeDasharray="4 4"
                opacity="0.8"
              />
              {/* Pot drainage base highlight */}
              <ellipse
                cx="160"
                cy="285"
                rx="44"
                ry="5"
                fill="#0f172a"
                stroke="rgba(16, 185, 129, 0.2)"
                strokeWidth="1"
              />
            </g>
          </g>

          {/* ── 2. DYNAMIC KALANCHOE PLANT (Swaying / Wilting) ── */}
          <g
            id="kalanchoe-plant"
            className={`transition-all duration-1000 ${
              isWilted ? 'plant-wilted' : 'plant-healthy'
            }`}
          >
            {/* ── Stem ── */}
            <g id="stem">
              {/* Main succulent stalk */}
              <path
                d="M 160,234 C 158,190 162,150 160,105"
                fill="none"
                stroke={isHealthy ? '#059669' : '#57534e'}
                strokeWidth="7"
                strokeLinecap="round"
              />
              {/* Central stalk highlight */}
              <path
                d="M 159,234 C 157,190 161,150 159,105"
                fill="none"
                stroke={isHealthy ? '#34d399' : '#78716c'}
                strokeWidth="2"
                strokeLinecap="round"
                opacity="0.6"
              />
            </g>

            {/* ── Lower Leaves (Thick, Scalloped) ── */}
            {/* Lower Left Leaf */}
            <g
              id="leaf-left-lower"
              className={isSmog ? 'leaf-smog-drop' : isHealthy ? 'leaf-sway-left' : ''}
            >
              <path
                d="M 158,210 C 130,225 90,210 75,185 C 80,165 110,160 140,185 C 152,195 158,205 158,210 Z"
                fill={isHealthy ? 'url(#kalanchoeLeafGrad)' : 'url(#kalanchoeWiltedLeafGrad)'}
                stroke={isHealthy ? '#047857' : '#44403c'}
                strokeWidth="1.5"
              />
              <path
                d="M 80,180 Q 88,184 96,182 Q 106,188 116,186 Q 128,192 138,190"
                fill="none"
                stroke="#6ee7b7"
                strokeWidth="1"
                opacity={isHealthy ? 0.7 : 0.2}
              />
            </g>

            {/* Lower Right Leaf */}
            <g
              id="leaf-right-lower"
              className={isSmog ? 'leaf-smog-drop' : isHealthy ? 'leaf-sway-right' : ''}
            >
              <path
                d="M 162,210 C 190,225 230,210 245,185 C 240,165 210,160 180,185 C 168,195 162,205 162,210 Z"
                fill={isHealthy ? 'url(#kalanchoeLeafGrad)' : 'url(#kalanchoeWiltedLeafGrad)'}
                stroke={isHealthy ? '#047857' : '#44403c'}
                strokeWidth="1.5"
              />
              <path
                d="M 240,180 Q 232,184 224,182 Q 214,188 204,186 Q 192,192 182,190"
                fill="none"
                stroke="#6ee7b7"
                strokeWidth="1"
                opacity={isHealthy ? 0.7 : 0.2}
              />
            </g>

            {/* ── Mid/Upper Leaves ── */}
            {/* Mid Left Leaf */}
            <g
              id="leaf-left"
              className={isSmog ? 'leaf-smog-drop' : isHealthy ? 'leaf-sway-left' : ''}
            >
              <path
                d="M 160,170 C 135,165 98,145 90,120 C 105,105 135,115 155,145 C 158,155 160,165 160,170 Z"
                fill={isHealthy ? 'url(#kalanchoeLeafGrad)' : 'url(#kalanchoeWiltedLeafGrad)'}
                stroke={isHealthy ? '#047857' : '#44403c'}
                strokeWidth="1.5"
              />
              <path
                d="M 94,120 Q 104,124 114,122 Q 124,128 134,126"
                fill="none"
                stroke="#6ee7b7"
                strokeWidth="1"
                opacity={isHealthy ? 0.8 : 0.2}
              />
            </g>

            {/* Mid Right Leaf */}
            <g
              id="leaf-right"
              className={isSmog ? 'leaf-smog-drop' : isHealthy ? 'leaf-sway-right' : ''}
            >
              <path
                d="M 160,170 C 185,165 222,145 230,120 C 215,105 185,115 165,145 C 162,155 160,165 160,170 Z"
                fill={isHealthy ? 'url(#kalanchoeLeafGrad)' : 'url(#kalanchoeWiltedLeafGrad)'}
                stroke={isHealthy ? '#047857' : '#44403c'}
                strokeWidth="1.5"
              />
              <path
                d="M 226,120 Q 216,124 206,122 Q 196,128 186,126"
                fill="none"
                stroke="#6ee7b7"
                strokeWidth="1"
                opacity={isHealthy ? 0.8 : 0.2}
              />
            </g>

            {/* Center Front Rosette Leaf */}
            <g id="leaf-center">
              <path
                d="M 160,165 C 145,185 145,215 160,225 C 175,215 175,185 160,165 Z"
                fill={isHealthy ? 'url(#kalanchoeLeafGrad)' : 'url(#kalanchoeWiltedLeafGrad)'}
                stroke={isHealthy ? '#047857' : '#44403c'}
                strokeWidth="1.5"
              />
            </g>

            {/* ── Blooming Flower Cluster (Kalanchoe 4-Petaled Blossoms) ── */}
            <g id="flowers" className={isHealthy ? 'flower-bloom' : 'flower-wilted'}>
              {/* Central dense blossom stemlets */}
              <line x1="160" y1="110" x2="140" y2="85" stroke="#059669" strokeWidth="2.5" />
              <line x1="160" y1="110" x2="180" y2="85" stroke="#059669" strokeWidth="2.5" />
              <line x1="160" y1="105" x2="160" y2="70" stroke="#059669" strokeWidth="3" />
              <line x1="160" y1="95" x2="125" y2="75" stroke="#059669" strokeWidth="2" />
              <line x1="160" y1="95" x2="195" y2="75" stroke="#059669" strokeWidth="2" />

              {/* Flower 1: Top Center Blossom */}
              <g transform="translate(160, 65)">
                <circle cx="-6" cy="0" r="5" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="6" cy="0" r="5" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="0" cy="-6" r="5" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="0" cy="6" r="5" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="0" cy="0" r="3" fill="#fef08a" />
              </g>

              {/* Flower 2: Left Mid Blossom */}
              <g transform="translate(138, 80)">
                <circle cx="-5" cy="0" r="4.5" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="5" cy="0" r="4.5" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="0" cy="-5" r="4.5" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="0" cy="5" r="4.5" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="0" cy="0" r="2.5" fill="#fef08a" />
              </g>

              {/* Flower 3: Right Mid Blossom */}
              <g transform="translate(182, 80)">
                <circle cx="-5" cy="0" r="4.5" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="5" cy="0" r="4.5" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="0" cy="-5" r="4.5" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="0" cy="5" r="4.5" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="0" cy="0" r="2.5" fill="#fef08a" />
              </g>

              {/* Flower 4: Left Outer Blossom */}
              <g transform="translate(122, 72)">
                <circle cx="-4" cy="0" r="4" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="4" cy="0" r="4" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="0" cy="-4" r="4" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="0" cy="4" r="4" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="0" cy="0" r="2" fill="#fef08a" />
              </g>

              {/* Flower 5: Right Outer Blossom */}
              <g transform="translate(198, 72)">
                <circle cx="-4" cy="0" r="4" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="4" cy="0" r="4" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="0" cy="-4" r="4" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="0" cy="4" r="4" fill="url(#kalanchoeFlowerGrad)" />
                <circle cx="0" cy="0" r="2" fill="#fef08a" />
              </g>
            </g>

            {/* ── Flower Buds (Tight Little Pearl Clusters) ── */}
            <g id="flower-buds">
              <circle cx="150" cy="52" r="3" fill="#fb7185" />
              <circle cx="170" cy="52" r="3" fill="#fb7185" />
              <circle cx="160" cy="48" r="3.5" fill="#fb7185" />
              <circle cx="132" cy="62" r="2.5" fill="#34d399" />
              <circle cx="188" cy="62" r="2.5" fill="#34d399" />
            </g>
          </g>
        </svg>
      </div>

      {/* ── BOTTOM CONTROLS & TELEMETRY FOOTER ── */}
      <div className="space-y-1.5 z-20 relative pt-1.5 border-t border-slate-800/80">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Heart
              size={12}
              className={isHealthy ? 'text-emerald-400 fill-emerald-400/30' : 'text-rose-400'}
            />
            <span className="text-[11px]">Soil Saturation:</span>
            <span
              className={`font-black text-[11px] ${
                isHealthy ? 'text-emerald-400 text-glow-emerald' : 'text-rose-400'
              }`}
            >
              {soilPercent}% ({sensors.soil_moisture} ADC)
            </span>
          </div>

          <span className="text-[10px] text-slate-400">
            Threshold: &le; {DRY_THRESHOLD} ADC
          </span>
        </div>

        {/* Moisture saturation status bar */}
        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isHealthy
                ? 'bg-gradient-to-r from-emerald-500 to-mint-400'
                : 'bg-gradient-to-r from-rose-600 to-amber-500'
            }`}
            style={{ width: `${soilPercent}%` }}
          />
        </div>

        {/* Action Button: Make it Rain Trigger */}
        <div>
          <button
            id="centerpiece-make-it-rain-btn"
            onClick={triggerMakeItRain}
            disabled={makeItRainActive}
            className={`w-full py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-md ${
              makeItRainActive
                ? 'bg-rose-500 text-white animate-pulse shadow-rose-500/30'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-emerald-500/20 hover:scale-[1.01]'
            }`}
          >
            <CloudRain size={15} className={makeItRainActive ? 'animate-bounce' : ''} />
            <span>
              {makeItRainActive
                ? `Discharging Hydration (${makeItRainCountdown}s)`
                : 'Hydrate Plant (Make it Rain)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
