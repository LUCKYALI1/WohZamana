# वो ज़माना (The Era We Never Forgot) 🎵

An interactive, responsive 2000s Bollywood nostalgic web player built with React, Tailwind CSS, and custom queue-buffering audio management logic. The project features full-screen dynamic backgrounds, continuous stream auto-refilling, glassmorphism UI overlay, lazy-loaded administrative tools, and responsive image loading optimized across viewports.

---

## 🌟 Key Features

* **Infinite Queue Engine**: Continuous track streaming via dynamic batch fetching (`QUEUE_BATCH_SIZE = 5`) triggered whenever remaining tracks reach the refill threshold (`REFILL_THRESHOLD = 2`).
* **Track Deduplication**: Synchronizes history in `playlistRef` to send played/loaded track IDs (`excludeIds`) to the backend, guaranteeing zero redundant tracks per session.
* **Responsive Background Optimization**: Implements HTML5 `<picture>` element with media queries (`min-width: 640px`) to load desktop (`bg.png`) or mobile (`mobile.png`) assets on demand, minimizing unnecessary network payload.
* **Nostalgic UI & Typography**: Custom layout with Google Fonts (`Khand` font family for Devanagari typography), glassmorphic control overlays, and active audio indicators.
* **Code Splitting & Route Optimization**: Route-level code splitting using `React.lazy()` and `Suspense` fallback boundaries for deferred route loading (`/admin`).
* **Smooth Global Scrolling**: Configured scroll behavior using native CSS manipulations or smooth inertial physics integrations (Lenis).

---

## 🛠️ Tech Stack

### Frontend
* **Core Framework**: React 18 / 19, React Router DOM (v6)
* **Styling & Assets**: Tailwind CSS, Google Fonts (`Khand`), Custom CSS animations
* **Performance & Architecture**: React Hooks (`useCallback`, `useRef`, `useState`, `useEffect`), `React.memo`, Code Splitting

### Backend / API Integration
* **Data Fetching**: Custom API Client layer using RESTful endpoints (`getRandomSongs`)
* **Audio Handling**:Howler js Audio API wrapped in custom React control abstractions

---

## 📁 Project Structure

```text
├── src/
│   ├── api/
│   │   └── Client.api.js        # API layer for random track fetching & upload operations
│   ├── assets/
│   │   ├── bg.png               # High-res desktop background asset
│   │   └── mobile.png           # Mobile viewport background asset
│   ├── component/
│   │   └── Header.jsx           # Global application header navigation
│   ├── Layout/
│   │   └── Layout.jsx           # Master layout wrapper component
│   ├── pages/
│   │   ├── Admin.jsx            # Dynamic lazy-loaded administrative panel
│   │   └── Home.jsx             # Main landing player view with auto-queue logic
│   ├── ui/
│   │   └── Player.jsx           # Embedded custom audio player component
│   ├── App.jsx                  # Main routing entry point with global scroll setup
│   ├── main.jsx                 # Application DOM mount
│   └── index.css                # Tailwind directives and custom utility classes
├── public/
├── package.json
└── README.md