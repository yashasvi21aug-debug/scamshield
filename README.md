# 🛡️ FraudLens AI — Digital Fraud Detection & Prevention Platform

> **"See the Fraud Before You Trust It."**
> An AI-powered, explainable cybersecurity web application designed to evaluate suspicious SMS text, QR codes, and web URLs before clicking, paying, or disclosing confidential credentials.

---

> [!IMPORTANT]
> **Safety Assessment Disclaimer**
> The Trust Score (0–100) is a risk assessment based on available threat indicators, behavioral heuristics, and configured threat intelligence feeds. **It does not guarantee that a message, URL, or payment destination is safe.** Always independently verify the sender or payee before confirming financial transactions or sharing identity tokens.

---

## 📌 1. Core Problem & Solution

### The Problem
Digital fraud is surging worldwide with sophisticated social engineering attacks:
- **Fake KYC & Account Block Panics:** Coercive SMS messages threatening immediate bank account freezes or electricity disconnection to compel unvetted logins.
- **Malicious & Reverse-Charge QR Codes:** Fraudulent payment requests claiming you need to scan or enter your UPI PIN to "receive" refunds, lottery winnings, or marketplace advances.
- **Homoglyph & Phishing URLs:** Lookalike domains (`secure-hdfc-kyc.top`, `sbi-kyc-verify.xyz`) disguised as legitimate financial institutions.
- **Opaque Traditional Checkers:** Most traditional security tools output a binary "Safe" or "Dangerous" label without explaining the underlying evidence or providing actionable defensive steps.

### The FraudLens AI Solution
FraudLens AI provides a centralized Security Command Center where users can inspect suspicious SMS text, URLs, and QR codes before taking action:
1. **Explainable Trust Score (0–100):** Mathematical risk categorization (0–30 High Risk, 31–60 Suspicious, 61–80 Caution, 81–100 Likely Safe).
2. **Granular Threat Breakdown:** Plain-English explanations of detected indicators (Urgency Manipulation, Credential Harvesting, Homoglyph Domains, Shortener Obfuscation, SSRF Risk).
3. **Context-Aware Safety Recommendations:** Immediate, tailored defensive checklists based on the detected attack vector.
4. **Community Scam Intelligence:** Real-time crowd-sourced threat incident reports with upvoting, duplicate vote prevention, and confidence classification.
5. **AI Cybersecurity Advisor & Emergency Triage:** Interactive guidance and direct links to official statutory reporting resources (e.g. National Cyber Crime Helpline **1930** in India).

---

## 🏗️ 2. System Architecture

```
scamshield-ai/
├── backend/
│   ├── server.js                     # Express server, Helmet security, rate limiting, REST endpoints
│   ├── .env.example                  # Environment configuration template
│   ├── config/
│   │   └── db.js                     # MongoDB connection manager with degraded mode tracking
│   ├── models/
│   │   ├── Scan.js                   # Mongoose Scan schema
│   │   ├── CommunityReport.js        # Mongoose CommunityReport schema
│   │   ├── CommunityVote.js          # Mongoose CommunityVote schema (unique session constraint)
│   │   ├── ThreatCampaign.js         # Mongoose ThreatCampaign schema
│   │   └── AnalysisEvent.js          # Mongoose AnalysisEvent schema
│   ├── controllers/
│   │   ├── analyzerController.js     # SMS, URL, and QR analysis handlers
│   │   ├── communityController.js    # Community threat reports & confirmation
│   │   ├── dashboardController.js    # Database aggregations, timeline, & taxonomy
│   │   └── advisorController.js      # AI & local safety advisor chat
│   ├── services/
│   │   ├── evidenceEngine.js         # Multi-tier evidence coordinator
│   │   ├── aiService.js              # Real server-side AI provider (OpenAI/Gemini/Anthropic)
│   │   ├── domainIntelligence.js     # DNS, safe TLS cert check, and RDAP registration lookup
│   │   ├── detectionEngine.js        # Heuristic rules & social engineering parser
│   │   ├── urlIntelligence.js        # Static domain, TLD, IP, and homoglyph scanner
│   │   ├── qrDecoderService.js       # UPI payload and QR destination decoder
│   │   ├── storageService.js         # Unified repository (MongoDB + Disk Degraded Mode)
│   │   └── threatIntel/
│   │       ├── ThreatIntelProvider.js        # Base provider interface
│   │       ├── GoogleSafeBrowsingProvider.js # Google Safe Browsing v4 adapter
│   │       ├── VirusTotalProvider.js         # VirusTotal v3 adapter
│   │       ├── UrlhausProvider.js            # URLhaus abuse.ch adapter
│   │       ├── PhishTankProvider.js          # PhishTank adapter
│   │       └── threatIntelManager.js         # Threat intelligence coordinator
│   └── utils/
│       ├── scamPatterns.js           # Lexicons of fraud indicators and TLD lists
│       ├── scoring.js                # Evidence-based Trust Score calculation
│       ├── ssrfProtection.js         # SSRF protection and private IP rejection
│       └── emergencyResources.js     # Verified official statutory helplines
└── frontend/
    ├── src/
    │   ├── App.jsx                   # Application controller & navigation router
    │   ├── index.css                 # Dark cybersecurity styling & glassmorphism
    │   ├── components/
    │   │   ├── Navbar.jsx            # Responsive navigation & mobile menu
    │   │   ├── TrustScoreGauge.jsx   # Radial animated 0–100 Trust Score gauge
    │   │   ├── ThreatReasons.jsx     # Explainable AI reason cards with severity badges
    │   │   ├── ActionChecklist.jsx   # Actionable defense checklist
    │   │   ├── UrlRiskBreakdown.jsx  # Domain reputation & phishing meters
    │   │   ├── QrScannerModal.jsx    # Webcam live scanner & image dropzone
    │   │   ├── DemoPresetSelector.jsx# 1-Click live hackathon test scenarios
    │   │   └── ReportScamModal.jsx   # Community threat reporting form
    │   ├── pages/
    │   │   ├── LandingPage.jsx       # Hero, value props, 4-step workflow
    │   │   ├── DashboardPage.jsx     # Security Command Center with Recharts analytics
    │   │   ├── AnalyzeCenter.jsx     # SMS, URL, and QR multi-mode scanner
    │   │   ├── CommunityPage.jsx     # Real-time crowdsourced campaigns & upvoting
    │   │   ├── CategoriesPage.jsx    # Threat intelligence taxonomy & dossiers
    │   │   ├── HistoryPage.jsx       # Telemetry audit log & inspection modal
    │   │   ├── AdvisorPage.jsx       # Interactive AI cybersecurity chat assistant
    │   │   ├── StatusPage.jsx        # Real-time architecture & provider diagnostics
    │   │   └── EmergencyPage.jsx     # Emergency triage & incident log generator
    │   └── services/
    │       └── api.js                # Frontend API client with session tracking
```

---

## 🔄 3. Detection Pipeline

```
SMS / URL / QR Input
       ↓
Input Normalization & Sanitization
       ↓
SSRF & Private Network Filter (Blocks localhost, 127.0.0.1, 192.168.x.x, 10.x.x.x)
       ↓
Local Heuristic Analysis (Urgency, KYC pressure, Brand lookalikes, TLD risk, UPI parse)
       ↓
Domain Intelligence (Real DNS resolution, Port 443 TLS SNI check, RDAP domain age)
       ↓
External Threat Intelligence (Google Safe Browsing, VirusTotal, URLhaus, PhishTank)
       ↓
Server-Side AI Semantic Analysis (OpenAI / Gemini / Anthropic structured JSON)
       ↓
Evidence Aggregation & Deduction Weighting
       ↓
Trust Score (0–100) & Risk Classification
       ↓
Database Persistence (MongoDB or Degraded Disk Persistence)
```

---

## 🧮 4. Transparent Scoring Weights

| Indicator Type | Severity | Weight Deduction | Source |
|---|---|---|---|
| Direct IP Address Hostname | Critical | -45 | Local Heuristics |
| Suspected Brand Impersonation | Critical | -50 | Local Heuristics |
| High-Risk Throwaway TLD (`.top`, `.xyz`, etc.) | High | -35 | Local Heuristics |
| URL Shortener Obfuscation | High | -30 | Local Heuristics |
| Insecure Plaintext HTTP | Medium | -15 | Local Heuristics |
| Extreme Urgency Manipulation | High | -25 | Local Heuristics |
| Account Freeze / Block Threat | High | -35 | Local Heuristics |
| Unsolicited KYC / Identity Demand | Critical | -35 | Local Heuristics |
| Sensitive Credential Solicit (OTP/PIN/CVV) | Critical | -40 | Local Heuristics |
| Remote Desktop App Trap (AnyDesk/TeamViewer) | Critical | -45 | Local Heuristics |
| Google Safe Browsing Match | Critical | -55 | External Threat Intel |
| VirusTotal Engine Positives | Critical/High | -20 to -60 | External Threat Intel |
| URLhaus Active Malware Match | Critical | -50 | External Threat Intel |
| PhishTank Verified Phishing Match | Critical | -55 | External Threat Intel |
| AI Semantic Evaluation Flag | Critical / High | -20 to -30 | AI Provider |

---

## 💾 5. Database Architecture & Degraded Mode

- **Primary Database:** MongoDB with Mongoose ODM (`MONGODB_URI`).
- **Models:** `Scan`, `CommunityReport`, `CommunityVote`, `ThreatCampaign`, `AnalysisEvent`.
- **Zero-Crash Degraded Mode:** If `MONGODB_URI` is not set or MongoDB is unreachable, ScamShield automatically activates degraded mode using a persistent local disk store (`backend/data/scamshield_store.json`).
- **Audit Diagnostics:** The status is reported via `GET /api/health` as `"database": "connected"` or `"database": "degraded"` and displayed clearly on the System Status page.

---

## 🚀 6. Setup & Running Instructions

### Prerequisites
- Node.js (v18 or newer)
- npm

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env    # Configure optional keys if desired
npm start               # Starts server on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev             # Starts Vite server on http://localhost:3000
```

---

## ⚙️ 7. Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `5000` | Backend API port |
| `MONGODB_URI` | No | `""` | MongoDB connection string. If blank, operates in degraded disk mode. |
| `AI_PROVIDER` | No | `openai` | AI provider (`openai`, `gemini`, `anthropic`, `openai-compatible`) |
| `AI_API_KEY` | No | `""` | External AI API key (OpenAI or Gemini) |
| `AI_MODEL` | No | `gpt-4o-mini` | Model identifier |
| `AI_BASE_URL` | No | Provider default | Base URL for OpenAI-compatible proxies |
| `GOOGLE_SAFE_BROWSING_API_KEY` | No | `""` | Google Safe Browsing Lookup v4 API key |
| `VIRUSTOTAL_API_KEY` | No | `""` | VirusTotal v3 API key |
| `URLHAUS_API_KEY` | No | `""` | Abuse.ch URLhaus API key |
| `PHISHTANK_API_KEY` | No | `""` | PhishTank verification API key |

---

## 📡 8. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Real diagnostic status of DB, AI, Threat Intel, and local engines |
| `POST` | `/api/analyze/sms` | Analyzes SMS content and records Scan in DB |
| `POST` | `/api/analyze/url` | Analyzes URL structure, SSRF check, domain DNS, and threat feeds |
| `POST` | `/api/analyze/qr` | Decodes QR payload, checks UPI parameters, records in DB |
| `GET` | `/api/dashboard/stats` | Aggregated metrics from real database scan records |
| `GET` | `/api/dashboard/timeline` | Activity trend over time from real scans |
| `GET` | `/api/dashboard/threat-distribution` | Risk category breakdown from real scans |
| `GET` | `/api/dashboard/categories` | Threat category taxonomy grouped from real scans |
| `GET` | `/api/history` | Filterable chronological audit log of past scans |
| `GET` | `/api/threat-categories` | Static dossier catalog of scam taxonomies & red flags |
| `GET` | `/api/emergency/resources` | Official statutory cyber fraud helplines and portals |
| `GET` | `/api/community/reports` | Real crowdsourced scam reports from database |
| `POST` | `/api/community/report` | Submits and validates a new threat report |
| `POST` | `/api/community/reports/:id/upvote` | Increments confirmation count (blocks duplicate session votes) |
| `POST` | `/api/advisor/chat` | AI Advisor or Local Safety Advisor guidance |

---

## 🔒 9. Security & Privacy Controls

- **SSRF Protection:** Pre-flight validation blocks access to `localhost`, `127.0.0.1`, `::1`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `.local`, and internal cloud metadata hostnames.
- **Zero URL Execution:** URLs are analyzed statically. FraudLens never browses, renders, or executes target websites.
- **HTTP Security Headers:** Powered by `helmet` to mitigate cross-site scripting and injection vectors.
- **Rate Limiting:** `express-rate-limit` enforces strict request ceilings across all `/api/` endpoints.
- **No Secret Leakage:** All API keys are loaded strictly on the backend. Frontend code contains zero secrets.
- **Duplicate Vote Prevention:** Prevents vote manipulation by enforcing single-vote constraints per session ID.

---

## 📱 11. FraudLens Quick Scan — Native Android Companion

FraudLens includes a lightweight, native Android companion in **Kotlin** (`android/`) called **FraudLens Quick Scan**. It integrates directly into the Android system Share menu (`ACTION_SEND`), allowing users to evaluate suspicious content instantly from any app without copying and pasting.

### Privacy & Security Guarantee
- **Zero Background Surveillance:** FraudLens Quick Scan requests **no SMS reading permissions** (`READ_SMS` / `RECEIVE_SMS`). It processes content **only when the user explicitly taps "Share → 🛡️ FraudLens Quick Scan"**.
- **No Client-Side Secrets:** Android contains no API keys or database credentials. All analysis is performed by the FraudLens backend.
- **Local QR Decoding:** Images are decoded locally via ZXing before sending only the extracted payload to the server.
- **No Auto-Execution:** The app never automatically navigates to links or initiates UPI payments.

---

### How to Use Quick Scan

| Content Type | How to Share | What FraudLens Does |
|---|---|---|
| **Suspicious SMS / Text** | In Messages / WhatsApp: Long-press message → **Share** → **🛡️ FraudLens Quick Scan** | Analyzes urgency heuristics, brand impersonation, and embedded URLs via `/api/analyze/sms`. |
| **Phishing / Banking URL** | In Chrome / Browser: Tap **⋮** → **Share** → **🛡️ FraudLens Quick Scan** | Inspects domain age, lookalikes, SSRF, and threat intel via `/api/analyze/url`. |
| **Payment QR Screenshot** | In Gallery: Open QR screenshot → **Share** → **🛡️ FraudLens Quick Scan** | Decodes QR locally via ZXing, validates UPI fields (`pa`, `pn`, `am`, `tn`), and checks for fake refund traps via `/api/analyze/qr`. |

---

### How to Build & Install the Android APK

#### Prerequisites
- OpenJDK 17 (`JAVA_HOME` set to JDK 17)
- Android SDK (API 34 platform & build-tools)

#### 1. Build the Debug APK
```powershell
cd android
.\gradlew.bat assembleDebug
```
The compiled APK will be generated at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

#### 2. Install on Android Device or Emulator via ADB
```powershell
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

#### 3. Backend URL Configuration
- **Android Emulator:** Defaults automatically to `http://10.0.2.2:5000` (which routes to your computer's `localhost:5000`).
- **Physical Android Device:** Ensure phone and computer are on the same Wi-Fi network. Open FraudLens Quick Scan → Tap **"Configure Backend URL"** → Enter `http://<YOUR_COMPUTER_IP>:5000`.
- **Production:** Set `SCAMSHIELD_API_BASE_URL=https://your-production-domain.com` at build time or configure via in-app settings.

---

### Running Tests

#### Backend Real Engine Tests (35 Tests)
```powershell
node backend/test-real.js
```

#### Full End-to-End Test Suite
```powershell
node test-e2e.js
```

#### Android Quick Scan Integration Test Suite (26 Tests)
```powershell
node test-android-integration.js
```

#### Android Native Unit Tests
```powershell
cd android
.\gradlew.bat testDebugUnitTest
```

#### Frontend Production Build
```powershell
npm run build
```

