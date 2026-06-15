<p align="center">
  <img src="https://img.shields.io/badge/VisionVoice-AI-blueviolet?style=for-the-badge&logo=eye&logoColor=white" alt="VisionVoice AI"/>
</p>

<h1 align="center">👁️ VisionVoice AI — OSC AI Build 1.0</h1>

<p align="center">
  <strong>AI-Powered Accessibility Assistant for Blind, Low-Vision & Elderly Users</strong><br/>
  <em>Voice-first · High-contrast · Mobile-first · Real-time Computer Vision</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-5.1-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-8.x-47A248?style=flat-square&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/TensorFlow.js-4.x-FF6F00?style=flat-square&logo=tensorflow&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_AI-2.0-4285F4?style=flat-square&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" />
</p>

---

## 📌 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Endpoints](#-api-endpoints)
- [Configuration](#-configuration)
- [How It Works](#-how-it-works)
- [Screenshots](#-screenshots)
- [Team & Contributors](#-team--contributors)
- [License](#-license)

---

## 🧠 About the Project

**VisionVoice AI** is a full-stack, AI-powered accessibility platform designed to empower **blind, low-vision, and elderly users** to perceive and interact with the world independently. The application uses **real-time computer vision**, **natural language processing**, and **voice-first interaction** to bridge the gap between visual information and auditory understanding.

Built as part of **OSC AI Build 1.0**, the system features a **React + Vite** frontend with 13 purpose-built screens and a **Node.js + Express** backend powered by multiple AI/ML engines — including **Google Gemini AI**, **TensorFlow.js COCO-SSD**, **Tesseract.js OCR**, and **GPT-4o Vision** — all communicating through a RESTful API with **MongoDB** persistence.

> The app speaks every result aloud using the **Web Speech API**, operates entirely in the browser (no native app install required), and gracefully degrades when specific API keys or the database are unavailable.

---

## ✨ Key Features

| Feature | Description |
|:---|:---|
| 📖 **OCR Text Reader** | Extracts text from images using Tesseract.js, OCR.space, or GPT-4o Vision. Reads documents, signs, labels, and handwritten notes aloud. |
| 🔍 **Object & Scene Detection** | Identifies objects in real-time using TensorFlow.js COCO-SSD or Gemini AI. Describes scenes with spatial context. |
| 💊 **Medicine Label Reader** | Scans medicine packaging to extract drug name, dosage, warnings, and expiry — critical for safe self-medication. |
| 💰 **Currency Recognition** | Identifies currency denominations from banknote images — enables independent financial transactions. |
| 🎨 **Color & Outfit Analyzer** | Extracts dominant colors using node-vibrant and names them. Provides outfit coordination suggestions. |
| 🗣️ **Voice Companion (AI Chat)** | Conversational AI assistant powered by Gemini / GPT-4o with built-in NLP fallback. Supports voice input via Web Speech API. |
| 🚨 **Emergency SOS** | One-tap emergency alert with live GPS location. Sends real SMS via **Fast2SMS / Twilio / TextBelt** to saved contacts. |
| 📜 **Scan History** | All scan results are persisted in MongoDB. Search, filter by type, and review past scans. |
| ⚙️ **Settings & Preferences** | High-contrast mode, voice speed, language (English / Tamil), and personalization — all persisted server-side. |
| 🌐 **Multilingual Support** | Full **English** and **Tamil** localization. Language preference sent via `Accept-Language` header on every API call. |
| 🎤 **Voice-First Design** | Every result is spoken aloud. Microphone input available on supported browsers. Designed for zero-visual-dependency usage. |
| 📱 **Mobile-First & PWA-Ready** | Responsive design optimized for mobile devices. High-contrast UI with large touch targets. |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|:---|:---|
| **React 18** | Component-based UI framework |
| **Vite 5** | Lightning-fast build tool & dev server |
| **Tailwind CSS 3.4** | Utility-first responsive styling |
| **React Router v6** | Client-side routing (13 screens) |
| **Lucide React** | Modern icon library |
| **Web Speech API** | Text-to-speech & speech recognition |

### Backend
| Technology | Purpose |
|:---|:---|
| **Node.js 18+** | JavaScript runtime |
| **Express 4** | REST API framework |
| **MongoDB + Mongoose 8** | NoSQL database & ODM |
| **Tesseract.js 5** | On-device OCR (English + Tamil) |
| **TensorFlow.js + COCO-SSD** | Real-time object detection |
| **node-vibrant** | Dominant color extraction from images |
| **color-namer** | Human-readable color name mapping |
| **Sharp** | Image processing, validation & optimization |
| **Multer** | Multipart file upload handling |
| **Google Gemini AI** | Advanced vision, OCR, chat & scene analysis |
| **OpenAI GPT-4o** | Premium vision model (optional) |
| **Fast2SMS / Twilio / TextBelt** | SMS delivery for Emergency SOS |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  React UI   │  │ Web Speech   │  │  Camera API  │               │
│  │  13 Screens │  │ TTS + STT    │  │  MediaStream │               │
│  └──────┬──────┘  └──────────────┘  └──────┬───────┘               │
│         │              REST API             │                        │
│         └──────────────┬────────────────────┘                        │
└────────────────────────┼─────────────────────────────────────────────┘
                         │  HTTP (JSON + Multipart)
                         ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Node.js + Express)                      │
│                                                                      │
│  ┌────────────┐  ┌──────────────┐  ┌───────────────┐               │
│  │  Routes     │  │  Middleware   │  │  Services     │               │
│  │  /api/v1/*  │  │  CORS,Upload │  │  OCR,Vision,  │               │
│  │            │  │  Device,Error │  │  Color,NLP,   │               │
│  │            │  │              │  │  Gemini,LLM   │               │
│  └─────┬──────┘  └──────────────┘  └───────┬───────┘               │
│        │                                     │                       │
│  ┌─────▼─────────────────────────────────────▼──────┐               │
│  │               AI / ML Engines                     │               │
│  │  ┌───────────┐ ┌──────────┐ ┌─────────────────┐ │               │
│  │  │Tesseract  │ │TF.js     │ │  Gemini / GPT-4o│ │               │
│  │  │OCR Engine │ │COCO-SSD  │ │  Vision LLM     │ │               │
│  │  └───────────┘ └──────────┘ └─────────────────┘ │               │
│  │  ┌───────────┐ ┌──────────┐ ┌─────────────────┐ │               │
│  │  │OCR.space  │ │node-     │ │  Fast2SMS /     │ │               │
│  │  │Cloud OCR  │ │vibrant   │ │  Twilio SMS     │ │               │
│  │  └───────────┘ └──────────┘ └─────────────────┘ │               │
│  └──────────────────────────────────────────────────┘               │
│                         │                                            │
│                         ▼                                            │
│              ┌─────────────────────┐                                │
│              │    MongoDB          │                                │
│              │  ┌───────────────┐  │                                │
│              │  │ Users         │  │                                │
│              │  │ History       │  │                                │
│              │  │ Contacts      │  │                                │
│              │  └───────────────┘  │                                │
│              └─────────────────────┘                                │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Project Structure

```
VisionVoice-OSC-AI-Build-1.0/
│
├── README.md                          # This file
├── .gitignore                         # Root gitignore
│
├── backend/                           # 🖥️ Node.js + Express API
│   ├── .env.example                   # Environment template
│   ├── .gitignore
│   ├── package.json
│   ├── README.md                      # Backend-specific docs & API reference
│   └── src/
│       ├── server.js                  # Express app entry point
│       ├── config/
│       │   ├── index.js               # Centralized config from .env
│       │   └── db.js                  # MongoDB connection manager
│       ├── models/
│       │   ├── User.js                # User preferences schema
│       │   ├── History.js             # Scan history schema
│       │   └── EmergencyContact.js    # SOS contacts schema
│       ├── routes/
│       │   ├── index.js               # Route aggregator
│       │   ├── ocr.js                 # POST /ocr/scan
│       │   ├── vision.js              # POST /vision/scene/describe, /vision/outfit/analyze
│       │   ├── medicine.js            # POST /health/medicine/scan
│       │   ├── currency.js            # POST /finance/currency/detect
│       │   ├── companion.js           # POST /ai/companion/chat
│       │   ├── emergency.js           # POST /emergency/trigger, GET/POST contacts
│       │   ├── history.js             # CRUD /history
│       │   └── user.js                # GET/PUT /user, /user/settings
│       ├── services/
│       │   ├── ocrService.js          # Tesseract.js OCR engine
│       │   ├── ocrSpaceService.js     # OCR.space cloud fallback
│       │   ├── visionService.js       # TensorFlow.js COCO-SSD
│       │   ├── visionLLM.js           # Gemini / GPT-4o vision dispatcher
│       │   ├── geminiService.js       # Google Gemini AI integration
│       │   ├── colorService.js        # node-vibrant color extraction
│       │   ├── medicineService.js     # Medicine label parsing
│       │   ├── currencyService.js     # Currency denomination detection
│       │   ├── nlpService.js          # NLP intent engine & chat
│       │   └── notificationService.js # SMS via Fast2SMS / Twilio / TextBelt
│       ├── middleware/
│       │   ├── upload.js              # Multer file upload config
│       │   ├── device.js              # X-Device-Id extraction
│       │   └── error.js               # Global error handler
│       ├── utils/
│       │   ├── image.js               # Sharp image processing
│       │   ├── localization.js        # i18n utilities
│       │   ├── numberToWords.js       # Numeric to text conversion
│       │   ├── history.js             # History helpers
│       │   └── errors.js              # Custom error classes
│       └── scripts/
│           └── seed.js                # Database seeder (demo data)
│
└── visionvoice-ai/                    # 🌐 React + Vite Frontend
    ├── .env.example                   # Frontend env template
    ├── .gitignore
    ├── package.json
    ├── index.html                     # SPA entry point
    ├── vite.config.js                 # Vite configuration
    ├── tailwind.config.js             # Tailwind CSS config
    ├── postcss.config.js              # PostCSS config
    ├── eslint.config.js               # ESLint config
    └── src/
        ├── main.jsx                   # React DOM render
        ├── App.jsx                    # Router & 13 route definitions
        ├── App.css                    # Global styles
        ├── index.css                  # Tailwind directives & design tokens
        ├── context/
        │   └── AppContext.jsx         # Global state (lang, theme, device ID)
        ├── hooks/
        │   └── useCamera.js           # Camera stream & capture hook
        ├── components/
        │   ├── BottomNav.jsx          # Bottom navigation bar
        │   ├── CameraViewfinder.jsx   # Camera preview with capture
        │   ├── PageHeader.jsx         # Reusable page header
        │   ├── ResultCard.jsx         # Scan result display card
        │   ├── LoadingState.jsx       # Loading spinner / skeleton
        │   ├── ErrorBanner.jsx        # Error notification banner
        │   └── VoiceWave.jsx          # Voice activity animation
        ├── pages/
        │   ├── SplashScreen.jsx       # Animated splash / loading
        │   ├── OnboardingScreen.jsx   # First-time user onboarding
        │   ├── HomeScreen.jsx         # Main dashboard with feature grid
        │   ├── OCRReaderScreen.jsx    # Text recognition scanner
        │   ├── ObjectDetectionScreen.jsx  # Object & scene detector
        │   ├── MedicineReaderScreen.jsx   # Medicine label scanner
        │   ├── CurrencyReaderScreen.jsx   # Currency identifier
        │   ├── ColorOutfitScreen.jsx  # Color & outfit analyzer
        │   ├── VoiceCompanionScreen.jsx   # AI chat assistant
        │   ├── EmergencySOSScreen.jsx # Emergency alert system
        │   ├── LanguageScreen.jsx     # Language selection
        │   ├── SettingsScreen.jsx     # App preferences
        │   └── HistoryScreen.jsx      # Scan history viewer
        ├── utils/
        │   ├── api.js                 # Axios-like API client
        │   └── i18n.js                # Internationalization strings
        └── assets/                    # Static assets (icons, images)
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|:---|:---|
| **Node.js** | ≥ 18.17.0 |
| **npm** | ≥ 9.x |
| **MongoDB** | Running locally (MongoDB Compass or `mongod`) |
| **Git** | Latest |

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/DhanushyaS01/VisionVoice-OSC-AI-Build-1.0.git
cd VisionVoice-OSC-AI-Build-1.0
```

### 2️⃣ Setup & Run the Backend

```bash
cd backend
cp .env.example .env          # Create env file from template
# Edit .env — add your API keys (see Configuration section below)
npm install                   # Install all dependencies
npm run seed                  # (Optional) Seed demo data
npm run dev                   # Start dev server → http://localhost:8000
```

### 3️⃣ Setup & Run the Frontend

Open a **new terminal**:

```bash
cd visionvoice-ai
cp .env.example .env          # Set VITE_API_URL if needed
npm install                   # Install all dependencies
npm run dev                   # Start Vite dev server → http://localhost:3000
```

### 4️⃣ Open in Browser

Navigate to the frontend URL (e.g. `http://localhost:3000`) on your phone or desktop browser. **Grant camera and microphone permissions** when prompted for the full experience.

> 💡 **Tip:** The frontend gracefully falls back to **sample data** if the backend is offline, so the UI always demos cleanly. A small notice indicates when a sample result is shown.

---

## 📡 API Endpoints

All endpoints are prefixed with `/api/v1`.

| Feature | Method | Endpoint | Body |
|:---|:---|:---|:---|
| 📖 OCR Text Scan | `POST` | `/ocr/scan` | `multipart/form-data` → `file` |
| 🔍 Object / Scene Detection | `POST` | `/vision/scene/describe` | `multipart/form-data` → `file` |
| 🎨 Color & Outfit Analysis | `POST` | `/vision/outfit/analyze` | `multipart/form-data` → `file` |
| 💊 Medicine Label Scan | `POST` | `/health/medicine/scan` | `multipart/form-data` → `file` |
| 💰 Currency Detection | `POST` | `/finance/currency/detect` | `multipart/form-data` → `file` |
| 🗣️ Voice Companion Chat | `POST` | `/ai/companion/chat` | `JSON { message, context }` |
| 🚨 Emergency SOS Trigger | `POST` | `/emergency/trigger` | `JSON { location }` |
| 📇 Manage Contacts | `GET` `POST` | `/emergency/contacts` | JSON |
| 📇 Delete Contact | `DELETE` | `/emergency/contacts/:id` | — |
| 📜 Scan History | `GET` | `/history?search=&type=` | — |
| 📜 Save to History | `POST` | `/history` | JSON |
| 📜 Delete History | `DELETE` | `/history/:id` or `/history` | — |
| 👤 User Profile | `GET` | `/user` | — |
| ⚙️ Update Settings | `PUT` | `/user/settings` | JSON |
| 🏥 Health Check | `GET` | `/health` | — |

### Headers

| Header | Purpose |
|:---|:---|
| `X-Device-Id` | Unique per-browser device identifier. All data is keyed by this. |
| `Accept-Language` | `en` (default) or `ta-IN` for Tamil localization of voice summaries. |

---

## ⚙️ Configuration

### Backend Environment Variables (`backend/.env`)

```env
# Server
PORT=8000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/visionvoice

# CORS Origins
CLIENT_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002

# OCR
OCR_LANGS=eng+tam
OCR_SPACE_API_KEY=your_ocr_space_key          # Free: https://ocr.space/ocrapi/freekey

# Google Gemini AI (FREE — powers all smart features)
GEMINI_API_KEY=your_gemini_key                # Free: https://aistudio.google.com/app/apikey
GEMINI_MODEL=gemini-2.0-flash

# OpenAI (Optional — premium accuracy)
OPENAI_API_KEY=your_openai_key                # Optional: enables GPT-4o Vision
OPENAI_MODEL=gpt-4o

# SMS for Emergency SOS (choose one)
FAST2SMS_API_KEY=your_fast2sms_key            # Best for India
TEXTBELT_KEY=textbelt                          # 1 free SMS/day for testing
TWILIO_ACCOUNT_SID=                            # Optional: Twilio
TWILIO_AUTH_TOKEN=
TWILIO_FROM_NUMBER=
```

### Frontend Environment Variables (`visionvoice-ai/.env`)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

### AI Engine Priority

The backend uses a **smart fallback chain** for maximum reliability:

```
Gemini AI (if GEMINI_API_KEY set)
    ↓ fallback
GPT-4o Vision (if OPENAI_API_KEY set)
    ↓ fallback
Local ML Models (Tesseract.js + TensorFlow.js + node-vibrant)
    ↓ fallback
Sample / Demo Data (UI always works)
```

---

## 🔄 How It Works

### Scan Flow
1. **User opens a scan screen** (OCR, Object Detection, Medicine, Currency, or Color)
2. **Camera captures a frame** or user uploads a photo
3. **Image is sent to backend** as multipart form data
4. **Backend processes the image** through the AI engine chain:
   - Image is validated and optimized via **Sharp** (auto-orient, resize to 1024px)
   - Processed by **Gemini AI / GPT-4o / local ML** depending on available keys
   - Structured result + `voice_summary` is generated
5. **Frontend receives the result** and displays it visually
6. **Web Speech API reads the result aloud** automatically
7. **Result is saved to History** in MongoDB

### Emergency SOS Flow
1. User taps the **Emergency SOS** button
2. Browser captures **live GPS coordinates** via Geolocation API
3. Backend sends **real SMS** with location link to all saved emergency contacts
4. SMS is delivered via **Fast2SMS** (India), **Twilio**, or **TextBelt**

### Voice Companion Flow
1. User speaks or types a message
2. Message is sent to `/ai/companion/chat`
3. Backend processes via **Gemini AI / GPT-4o** or built-in **NLP intent engine**
4. Response is spoken aloud via **Web Speech API**

---

## 📸 Screenshots

| Screen | Description |
|:---|:---|
| 🏠 Home Dashboard | Feature grid with large, accessible touch targets |
| 📖 OCR Reader | Real-time text extraction from camera |
| 🔍 Object Detection | Scene description with identified objects |
| 💊 Medicine Reader | Drug name, dosage & warning extraction |
| 💰 Currency Reader | Banknote denomination identification |
| 🎨 Color Analyzer | Dominant color palette with outfit suggestions |
| 🗣️ Voice Companion | AI chat with voice input/output |
| 🚨 Emergency SOS | One-tap emergency alert with GPS |
| ⚙️ Settings | Accessibility preferences & customization |

---

## 👥 Team & Contributors

<table>
  <tr>
    <td align="center"><strong>Team VisionVoice</strong></td>
  </tr>
  <tr>
    <td align="center">Built with ❤️ for OSC AI Build 1.0</td>
  </tr>
</table>

---

## 📄 License

This project is developed as part of **OSC AI Build 1.0** hackathon/competition.

---

<p align="center">
  <strong>⭐ Star this repo if VisionVoice AI inspires you!</strong><br/>
  <em>Making the world more accessible, one scan at a time.</em>
</p>
