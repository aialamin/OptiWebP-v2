# OptiWebP — High-Fidelity Client-Side WebP Converter & Image SEO

> **Built & Maintained by:** [Al Amin Hossain](https://github.com/aialamin) (Software Engineer)  
> **GitHub:** [@aialamin](https://github.com/aialamin)  
> **Contact:** [alamiwp@gmail.com](mailto:alamiwp@gmail.com)  
> **License:** MIT

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8.svg)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-orange.svg)](https://ai.google.dev/)

---

## 🌟 Overview

**OptiWebP** is an ultra-fast, privacy-first, client-side WebP image optimization and conversion suite. It processes PNG, JPEG, and AVIF files directly inside your browser with off-thread decoding (`createImageBitmap`), zero server uploads, and smart auto compression.

In addition to in-browser conversion, OptiWebP includes:
1. **Free WordPress Plugin Generator**: Complete with an on/off WebP delivery switch, media library image-by-image audit, and functions.php speed snippets.
2. **AI Image SEO Assistant**: Powered by Google Gemini (`gemini-3.8-flash`) to generate human-readable Titles, accessibility-compliant Alt Text, captions, and crawl-friendly file names.
3. **Core Web Vitals & Market Benchmark Calculator**: Interactive comparison against cloud-based alternatives like Squoosh, TinyPNG, ShortPixel, and Imagify.
4. **Web3 IPFS Integration**: Browser wallet connector and deterministic metadata generation for IPFS/NFT workflows.

---

## 🚀 Key Features

### 1. 100% Client-Side & Private
- Zero cloud uploads for image conversion.
- All canvas rendering, color quantization, and WebP compression run locally.
- Safe for confidential brand guidelines, client photography, and NDA assets.

### 2. High-Performance Processing
- Off-thread asynchronous decoding using `createImageBitmap` prevents UI stutter.
- Concurrent batch queues with live per-file compression ratios and savings calculations.
- Instant batch ZIP generation using `JSZip`.

### 3. Google Gemini AI SEO Assistant
- Formulates Google Image Search-optimized titles (under 60 characters).
- Generates descriptive alt attributes compliant with WCAG accessibility standards (under 125 characters).
- Suggests hyphenated, crawl-friendly target file names.
- Exports standard HTML5 `<picture>` tags and Schema.org JSON metadata.

### 4. Free WordPress Plugin (`optiwebp-image-optimizer.zip`)
- One-click ZIP download with full GPLv2 compliance.
- Master toggle switch to enable/disable WebP delivery on live sites.
- Automated on-upload WebP generation via GD or Imagick.
- HTML5 `<picture>` filter for backward-compatible fallback.

### 5. Untitled UI & React Bits Pro Design
- Clean typographic scale with Plus Jakarta Sans and JetBrains Mono.
- Interactive split before/after comparison slider.
- Magnetic spring interactions and smooth tabbed filters.
- Native Dark Mode with zero theme flash.

---

## 📁 Project Structure

```
optiwebp/
├── src/
│   ├── components/
│   │   ├── AiSeoModal.tsx                  # Google Gemini AI SEO metadata editor
│   │   ├── ComparisonModal.tsx             # Interactive before/after split slider
│   │   ├── DropZone.tsx                    # Drag-and-drop batch upload area
│   │   ├── Header.tsx                      # Navbar with GitHub link & theme toggle
│   │   ├── Hero.tsx                        # Hero section with magnetic CTA
│   │   ├── ImageList.tsx                   # Processed items list & actions
│   │   ├── Logo.tsx                        # Brand SVG icon and badge
│   │   ├── MarketComparisonSection.tsx     # Competitor benchmark & LCP estimator
│   │   ├── OptimizationExplainerAnimation.tsx # Visual pipeline explanation
│   │   ├── PrivacyBanner.tsx               # Security and zero-upload trust bar
│   │   ├── SeoFaqSection.tsx               # Core Web Vitals guide & Schema FAQ
│   │   ├── SettingsBar.tsx                 # Quality slider & preset selectors
│   │   ├── Web3Section.tsx                 # IPFS metadata & wallet connector
│   │   ├── WebpGuide.tsx                   # Format documentation & specs
│   │   ├── WordPressPluginSection.tsx      # WP Plugin downloader & speed audit
│   │   ├── animations/                     # React Bits Pro spring & magnetic animations
│   │   └── untitledui/                     # Untitled UI components (Badge, Button, MetricCard)
│   ├── types/
│   │   └── index.ts                        # TypeScript interfaces & definitions
│   ├── utils/
│   │   ├── converter.ts                    # In-browser Canvas WebP encoding engine
│   │   ├── web3.ts                         # Web3 wallet & IPFS CID simulator
│   │   └── wordpressPlugin.ts              # Self-contained WordPress plugin generator
│   ├── App.tsx                             # Main application orchestrator
│   └── main.tsx                            # React entry point
├── server.ts                               # Express backend for Gemini AI SEO proxy
├── index.html                              # Semantic HTML5 with Schema.org JSON-LD
├── metadata.json                           # Applet capabilities & metadata
├── package.json                            # Package dependencies and author scripts
├── tsconfig.json                           # TypeScript strict compiler options
└── vite.config.ts                          # Vite build pipeline configuration
```

---

## 🛠️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun** / **pnpm**

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/aialamin/optiwebp.git
   cd optiwebp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Add your Google Gemini API key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   PORT=3000
   ```

4. Start development server:
   ```bash
   npm run dev
   ```
   The app will run at `http://localhost:3000`.

5. Build for production:
   ```bash
   npm run build
   ```

6. Start production server:
   ```bash
   npm start
   ```

---

## 🧩 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS 4 |
| **Animation & UX** | React Bits Pro (Magnetic, ShinyText), Motion (Framer Motion) |
| **Design System** | Untitled UI components & Lucide React |
| **Image Processing** | HTML5 Canvas API, Offscreen Decoding, JSZip |
| **Backend / AI** | Node.js, Express, `@google/genai` (Gemini 3.8 Flash) |
| **SEO & Schema** | JSON-LD (WebApplication, FAQPage, HowTo), OpenGraph, Twitter Cards |

---

## 👨‍💻 Author

**Al Amin Hossain**  
Software Engineer  
- **GitHub:** [@aialamin](https://github.com/aialamin)  
- **Email:** [alamiwp@gmail.com](mailto:alamiwp@gmail.com)  

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
The generated WordPress plugin inside this repository is licensed under [GPLv2](https://www.gnu.org/licenses/gpl-2.0.html).
