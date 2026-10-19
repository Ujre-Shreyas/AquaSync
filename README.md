# 🌿 AquaSync – Botanical Irrigation & Telemetry Intelligence

A high-performance React + TypeScript + Vite web application for real-time ESP32-based autonomous botanical irrigation, sensor bus diagnostics, and closed-loop PWM flow control.

[![React](https://img.shields.io/badge/React-19.x-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand-443e38.svg?style=flat-square)](https://github.com/pmndrs/zustand)

---

## ✨ Features

* **Autonomous Botanical Flow Engine**: Real-time PWM drive (0–255) dynamically calculated using soil moisture deficits, ambient temperature, relative humidity, stomata air quality throttles (AQI), and solar transpiration factors.
* **LDR Sunlight Sensor & Dynamic Radiance**: 12-bit ADC sunlight intensity tracking with adaptive circadian radiance backgrounds and a **1.2x solar transpiration boost**.
* **Dual Operation Modes**:
  * **LIVE Mode**: 2-second HTTP polling loop connected directly to `http://192.168.1.101/`.
  * **DEMO Mode**: Interactive slide-out drawer with real-time sliders for soil moisture, rain raw, AQI, sunlight, temperature, humidity, and MicroSD mount state.
* **Hardware Diagnostics Panel**:
  * **ESP32 MCU**: HTTP 200 health monitoring.
  * **DHT11 Sensor**: Valid range and NaN check for temperature & humidity.
  * **Analog ADC Bus (Soil, Rain, LDR)**: Automated short-circuit (`0 ADC`) and open-circuit wire fault (`4095 ADC`) detection.
  * **MicroSD Storage**: Real-time mount status (`sd_active` / `sd_ready`).
* **Persistent Calibration Registry**:
  * Zustand `persist` middleware synchronization with `localStorage`.
  * Historical calibration logs with ISO timestamps and one-click profile restoration.
  * Direct HTTP EEPROM writing to `http://192.168.1.101/calibrate`.
* **Pre-Calibration Guard**:
  * Pre-write sanity validation preventing baseline EEPROM corruption.
  * Red **Watermelon UI** floating toast and inline alert banners highlighting out-of-bounds telemetry.
* **Precipitation Volume Estimator**: Traps discrete rain events below threshold ADC and calculates cumulative mL water caught.
* **OpenWeatherMap Integration**: Browser geolocation-powered AQI and ambient weather lookup.

---

## 🚀 Quick Start

### Prerequisites
* Node.js 18+ (tested on Node v24)
* npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/Ujre-Shreyas/AquaSync.git
cd AquaSync

# Install dependencies
npm install

# Copy environment variables (optional for live weather)
cp .env.example .env

# Start development server
npm run dev
```

The web dashboard will be available at `http://localhost:5173/`.

---

## 🌐 ESP32 Hardware API Endpoints

AquaSync communicates directly with the ESP32 microcontroller over HTTP:

| Endpoint | Method | Payload / Params | Description |
|---|---|---|---|
| `/` | `GET` | — | Returns live sensor telemetry JSON (soil, rain, temp, humidity, flow, pump, light, SD) |
| `/set_flow` | `POST` | `?pwm={0-255}` | Dispatches target botanical PWM drive to the MOSFET DC pump |
| `/manual_pump` | `GET` | `?duration=5` | Triggers a 5-second manual watering irrigation burst |
| `/calibrate` | `POST` | `{ soilDryAdc, soilWetAdc, rainThreshold, pumpPwmOffset }` | Writes sensor ADC baseline curves to non-volatile EEPROM |

---

## 🏛️ Project Architecture

```
src/
├── components/
│   ├── DemoControlDrawer.tsx      # Slide-out interactive hardware simulator
│   ├── HardwareStatusCard.tsx     # 6-point sensor bus diagnostics panel
│   ├── KalanchoePlantCard.tsx     # Centerpiece plant status card & animation
│   ├── Layout.tsx                 # App scaffolding, topbar & navigation
│   ├── MakeItRainOverlay.tsx      # Manual watering override overlay
│   ├── Sidebar.tsx                # Responsive navigation sidebar
│   ├── SplashScreenModal.tsx      # Initial mode selection modal
│   └── WatermelonDataCards.tsx    # Glowing bento sensor cards
├── pages/
│   ├── Calibration.tsx            # ADC transfer curves, guard, & history registry
│   ├── CompiledData.tsx           # Telemetry charts & Recharts analytics
│   ├── Dashboard.tsx              # 100vh responsive Bento Grid interface
│   └── DemoControl.tsx            # Dedicated hardware simulation lab
├── store/
│   └── useAquaStore.ts            # Zustand store with persist middleware & live polling
├── index.css                      # Watermelon theme, glassmorphism, & animations
└── main.tsx                       # App entry point
```

---

## 📜 License

MIT License. Designed and engineered for sustainable, autonomous smart agriculture.
