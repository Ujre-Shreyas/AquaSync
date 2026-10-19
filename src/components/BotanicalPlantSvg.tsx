import React from 'react'
import { useAquaStore } from '../store/useAquaStore'

interface BotanicalPlantSvgProps {
  className?: string
}

export const BotanicalPlantSvg: React.FC<BotanicalPlantSvgProps> = ({ className = '' }) => {
  const { sensors, manualPulseActive, makeItRainActive } = useAquaStore()

  // Calculate soil moisture percentage (0 - 100%)
  const soilAdc = sensors.soil_moisture ?? 2420
  // In our calibration: 4095 is dry, 1200 is wet.
  const soilPercent = Math.max(0, Math.min(100, Math.round(((4095 - soilAdc) / (4095 - 1200)) * 100)))

  // Wilting threshold: if soil moisture < 25% (or ADC > 3300)
  const isWilting = soilPercent < 25 || soilAdc > 3300
  const isPumpActive = sensors.pump_active || manualPulseActive || makeItRainActive

  // LDR sunlight raw (0-4095)
  const lightRaw = sensors.light_raw ?? 3150
  const lightRatio = Math.min(1, Math.max(0.2, lightRaw / 4095))

  return (
    <div
      className={`relative flex items-center justify-center select-none ${isWilting ? 'is-wilting' : ''} ${className}`}
    >
      {/* Ambient botanical aura glow - dynamically sized by sunlight */}
      <div
        className="absolute w-52 h-52 rounded-full blur-2xl pointer-events-none transition-all duration-700"
        style={{
          background: isWilting
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(239, 68, 68, 0.12) 60%, transparent 80%)'
            : isPumpActive
            ? 'radial-gradient(circle, rgba(56, 189, 248, 0.35) 0%, rgba(16, 185, 129, 0.2) 60%, transparent 80%)'
            : `radial-gradient(circle, rgba(16, 185, 129, ${(0.18 * lightRatio).toFixed(2)}) 0%, rgba(94, 234, 212, ${(0.12 * lightRatio).toFixed(2)}) 50%, transparent 75%)`,
        }}
      />

      {/* 2D Botanical SVG Plant Canvas */}
      <svg
        className="w-full h-full max-h-56 mx-auto drop-shadow-md overflow-visible relative z-10"
        viewBox="0 0 240 280"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="potGradStitch" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>

          {/* Healthy leaf gradients */}
          <linearGradient id="leafGrad1Stitch" x1="0%" x2="100%" y1="100%" y2="0%">
            <stop offset="0%" stopColor={isWilting ? '#92400e' : '#059669'} />
            <stop offset="100%" stopColor={isWilting ? '#d97706' : '#34d399'} />
          </linearGradient>

          <linearGradient id="leafGrad2Stitch" x1="0%" x2="100%" y1="100%" y2="0%">
            <stop offset="0%" stopColor={isWilting ? '#b45309' : '#10b981'} />
            <stop offset="100%" stopColor={isWilting ? '#fbbf24' : '#6ee7b7'} />
          </linearGradient>

          <filter id="softGlowStitch" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient botanical aura */}
        <circle
          cx="120"
          cy="140"
          r="85"
          fill={isWilting ? '#f59e0b' : '#10b981'}
          filter="url(#softGlowStitch)"
          opacity={isWilting ? 0.06 : 0.09}
        />

        {/* Potted plant container */}
        <g id="pot">
          {/* Pot rim shadow & rim */}
          <ellipse cx="120" cy="195" rx="46" ry="9" fill="#cbd5e1" opacity="0.5" />
          <path
            d="M78 194 Q120 200 162 194 L154 246 Q120 256 86 246 Z"
            fill="url(#potGradStitch)"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />
          {/* Soil base inside pot */}
          <ellipse cx="120" cy="194" rx="42" ry="7" fill={isWilting ? '#451a03' : '#334155'} />
          <ellipse cx="120" cy="193" rx="39" ry="5.5" fill={isWilting ? '#78350f' : '#475569'} />

          {/* Moisture droplets/sparkle on soil */}
          <circle
            className="water-glow"
            cx="105"
            cy="194"
            r={isPumpActive ? '2.5' : '1.5'}
            fill={isPumpActive ? '#0284c7' : '#38bdf8'}
          />
          <circle
            className="water-glow"
            cx="132"
            cy="193"
            r={isPumpActive ? '2.5' : '1.5'}
            fill={isPumpActive ? '#38bdf8' : '#34d399'}
          />

          {/* Minimal botanical pot emblem */}
          <path
            d="M120 220 L120 232 M116 226 Q120 223 124 226"
            stroke="#94a3b8"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
        </g>

        {/* Plant Stem and Foliage with Swaying & Wilting animations */}
        <g className="stem-anim">
          {/* Main stem */}
          <path
            d="M120 193 Q118 145 120 85"
            fill="none"
            stroke={isWilting ? '#78350f' : '#059669'}
            strokeLinecap="round"
            strokeWidth="3.5"
          />

          {/* Left Leaf 1 (Low) */}
          <g className="leaf-left">
            <path
              d="M119 165 C85 160 70 142 66 128 C82 126 104 140 119 165 Z"
              fill="url(#leafGrad1Stitch)"
              stroke={isWilting ? '#92400e' : '#047857'}
              strokeWidth="1"
            />
            <path
              d="M119 165 Q92 147 70 132"
              fill="none"
              opacity="0.7"
              stroke={isWilting ? '#fde68a' : '#6ee7b7'}
              strokeWidth="1"
            />
          </g>

          {/* Right Leaf 1 (Mid) */}
          <g className="leaf-right">
            <path
              d="M120 142 C154 136 170 118 174 104 C158 102 136 116 120 142 Z"
              fill="url(#leafGrad2Stitch)"
              stroke={isWilting ? '#78350f' : '#059669'}
              strokeWidth="1"
            />
            <path
              d="M120 142 Q148 123 170 108"
              fill="none"
              opacity="0.8"
              stroke={isWilting ? '#fef08a' : '#a7f3d0'}
              strokeWidth="1"
            />
          </g>

          {/* Left Leaf 2 (Upper) */}
          <g className="leaf-left" style={{ animationDelay: '-1.2s' }}>
            <path
              d="M120 118 C92 110 82 92 80 80 C94 80 108 94 120 118 Z"
              fill="url(#leafGrad2Stitch)"
              stroke={isWilting ? '#92400e' : '#059669'}
              strokeWidth="1"
            />
            <path
              d="M120 118 Q100 100 83 83"
              fill="none"
              opacity="0.7"
              stroke={isWilting ? '#fde68a' : '#a7f3d0'}
              strokeWidth="0.8"
            />
          </g>

          {/* Sprouting Crown / Top Leaves */}
          <g className="leaf-top">
            <path
              d="M120 86 C114 62 108 50 120 38 C132 50 126 62 120 86 Z"
              fill="url(#leafGrad1Stitch)"
              stroke={isWilting ? '#78350f' : '#047857'}
              strokeWidth="1"
            />
            <path
              d="M120 86 L120 44"
              fill="none"
              opacity="0.8"
              stroke={isWilting ? '#fde68a' : '#6ee7b7'}
              strokeWidth="1"
            />
            <path
              d="M120 86 C134 72 144 64 150 56 C144 68 132 78 120 86 Z"
              fill="url(#leafGrad2Stitch)"
              opacity="0.9"
            />
          </g>
        </g>

        {/* Floating Photosynthetic / Hydration Indicators */}
        <g className="water-glow" style={{ animationDelay: '0.5s' }}>
          <circle
            cx="72"
            cy="115"
            r={isPumpActive ? '4.5' : '3.5'}
            fill={isPumpActive ? '#38bdf8' : '#10b981'}
            filter="url(#softGlowStitch)"
            opacity="0.7"
          />
          <path d="M72 112 Q74 115 72 118 Q70 115 72 112 Z" fill="#ffffff" opacity="0.85" />
        </g>

        <g className="water-glow" style={{ animationDelay: '1.8s' }}>
          <circle
            cx="168"
            cy="90"
            r={isPumpActive ? '4' : '3'}
            fill={isPumpActive ? '#0284c7' : '#38bdf8'}
            filter="url(#softGlowStitch)"
            opacity="0.7"
          />
        </g>

        {/* Dynamic rain stream animation when pump is active */}
        {isPumpActive && (
          <g className="animate-pulse">
            <line x1="110" y1="50" x2="108" y2="70" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="130" y1="45" x2="128" y2="65" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="120" y1="35" x2="119" y2="55" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 2" />
          </g>
        )}
      </svg>
    </div>
  )
}

export default BotanicalPlantSvg
