# VisionVoice AI — Backend (Node + Express + MongoDB)

Real-ML backend for the VisionVoice AI accessibility assistant. It powers every
frontend feature: OCR text reading, object/scene detection, medicine label
parsing, currency recognition, colour & outfit analysis, the voice companion,
emergency SOS, scan history, and user settings — all persisted in MongoDB.

## Tech & real AI
- **Express** REST API, prefixed `/api/v1`
- **MongoDB + Mongoose** (works directly with MongoDB Compass on `localhost:27017`)
- **Tesseract.js** — real OCR (English + Tamil) → OCR Reader, Medicine, Currency
- **TensorFlow.js + COCO-SSD** — real object detection → Object Detection / Scene
- **node-vibrant + color-namer** — real dominant-colour extraction → Colour & Outfit
- **sharp** — image validation, auto-orient, resize to 1024px (per spec)
- **Voice Companion** — uses OpenAI if `OPENAI_API_KEY` is set, else a built-in
  rule-based intent engine (no key required)
- **Emergency SOS** — sends real SMS via Twilio if configured, else simulates + logs
- Heavy ML models are **lazy-loaded** on first use, so the server boots instantly.

## Quick start
```bash
cd backend
# If a partial "node_modules" folder exists, delete it first for a clean install:
#   Windows:  rmdir /s /q node_modules
cp .env.example .env        # adjust if needed
npm install                 # express, mongoose, tesseract.js, tfjs, sharp, node-vibrant…
npm run seed                # (optional) demo contacts + history for deviceId "demo-device"
npm run dev                 # or: npm start  → http://localhost:8000
```
Make sure **MongoDB is running** (open MongoDB Compass, or run `mongod`). The
default connection is `mongodb://127.0.0.1:27017/visionvoice`. The server still
boots if the DB is down — scan endpoints work, but history/contacts return a
clear "database not connected" error until Mongo is up.

> The first call to OCR or Object Detection downloads model/language data (a few MB),
> so the first scan is slower; subsequent scans are fast.

## Endpoints (`/api/v1`)
| Feature | Method & path | Body |
|---|---|---|
| OCR text | `POST /ocr/scan` | multipart `file` |
| Object / scene | `POST /vision/scene/describe` | multipart `file` |
| Colour & outfit | `POST /vision/outfit/analyze` | multipart `file` |
| Medicine | `POST /health/medicine/scan` | multipart `file` |
| Currency | `POST /finance/currency/detect` | multipart `file` |
| Voice companion | `POST /ai/companion/chat` | JSON `{ message, context }` |
| Emergency trigger | `POST /emergency/trigger` | JSON `{ location }` |
| Contacts | `GET / POST /emergency/contacts`, `DELETE /emergency/contacts/:id` | JSON |
| History | `GET /history?search=&type=`, `POST /history`, `DELETE /history/:id`, `DELETE /history` | JSON |
| User settings | `GET /user`, `PUT /user/settings` | JSON |
| Health check | `GET /health` | — |

### Identity & language
- Every request carries an `X-Device-Id` header (the frontend generates and stores
  one per browser). All history / contacts / settings are keyed by this device id.
- `Accept-Language: ta-IN` localises voice summaries to Tamil; default is English.

## Configuration (`.env`)
`PORT`, `MONGODB_URI`, `CLIENT_ORIGIN`, `OCR_LANGS`, `OPENAI_API_KEY`,
`OPENAI_MODEL`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`.
All optional keys degrade gracefully when left blank.

## Project layout
```
backend/src/
  config/      index.js, db.js
  models/      User.js, History.js, EmergencyContact.js
  services/    ocrService, visionService, colorService, medicineService,
               currencyService, nlpService, notificationService
  routes/      ocr, vision, medicine, currency, companion, emergency, history, user
  middleware/  upload (multer), error, device
  utils/       image (sharp), localization, numberToWords, history, errors
  scripts/     seed.js
  server.js
```
