# 🛡️ Ultimate Triage Architect Portal

An autonomous, multi-domain support triage console and administrative mitigation portal. This platform features a high-fidelity dashboard built with React + Vite, customized with a modern glassmorphic interface, micro-animations, and full visual simulations.

The portal implements advanced triage workflows across two distinct enterprise profiles:
1. **🍕 Zomato Food Support**: Autonomous routing for food delivery complaints, missing items, cold food, or delivery partner delays.
2. **💻 SaaS Platform Triage**: Enterprise incident classification handling billing discrepancies, authentication recovery, technical crashes, and SecOps threat escalations.

---

## 🚀 Key Features

### 1. Dual-Domain Profile Switcher
- Instantly hot-swap contexts between Zomato Support and SaaS Platform rules.
- Theme accent shifts dynamically (Zomato Pink / SaaS Green) with fully updated key performance indicators (KPIs).

### 2. Tri-Mode Input Workspace
*   **✉️ Live Chat Simulator**: Simulates interactive text discussions between support operators and clients.
*   **📞 Voice Call Simulator**: Displays an animated CSS audio waveform synchronized with speech-to-text transcriptions.
*   **✍️ Write Ticket Editor**: Interactive free-form typing space featuring real-time regex-based NLP extraction for **Order IDs**, **User IDs**, and **Invoice IDs**.

### 3. Customer Sentiment Analysis Engine
- Evaluates raw customer inputs in real-time, visualizing sentiment across four categories: **Calm/Satisfied 😊**, **Neutral 😐**, **Frustrated 😟**, and **Furious 😡**.
- Color-coded progress bar scales dynamically according to emotional urgency.

### 4. Interactive Agent Tool Call Router
Simulates Native Function Calling, matching complaints to automated backend diagnostics:
*   `get_delivery_partner_status()`: Renders an active tracking map showing restaurant, rider, and customer pins alongside stationary delay metrics.
*   `verify_restaurant_bill()`: Performs a side-by-side comparison of billed vs. packed items, highlighting discrepancies.
*   `issue_refund_or_coupon()`: Processes instant credit returns with interactive wallet receipts.
*   `query_billing_system()`: Scans Stripe/ledger transaction histories.
*   `check_system_logs()` & `reset_mfa_credentials()`: Admin toolsets for technical and account recovery.
*   `human_in_the_loop_escalation()`: Intercepts threats and locks down origins.

---

## 🛠️ Tech Stack & Design System

- **Frontend Core**: React (Functional Components, Hooks)
- **Bundler & Dev Server**: Vite
- **Iconography**: Lucide React
- **Styling**: Vanilla CSS (including Glassmorphism, 3D buttons, dynamic parallax background layers, and custom keyframes)
- **Routing Engine**: Custom local NLP parser & rule-based decision matrix (`triageEngine.js`)

---

## 📂 Project Structure

```text
├── public/                 # Static assets (Favicons, Icons)
├── src/
│   ├── assets/            # Decorative vector elements
│   ├── App.css            # Component-specific styles and micro-animations
│   ├── App.jsx            # Main dashboard core logic and visual panels
│   ├── index.css          # Design system tokens (colors, variables, resets)
│   ├── main.jsx           # App mounting entry point
│   └── triageEngine.js    # NLP extraction, categorization, and routing rules
├── index.html             # HTML5 template wrapper
├── package.json           # Project dependencies and run scripts
└── vite.config.js         # Vite bundler configuration
```

---

## ⚙️ Local Development Setup

To run this application locally, follow these steps:

### 1. Install Dependencies
Ensure you have [Node.js](https://nodejs.org/) installed, then run:
```bash
npm install
```

### 2. Launch Development Server
Start the local Vite dev server:
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:5173`.

### 3. Build for Production
To build static assets for production deployment:
```bash
npm run build
```

---

## 📄 License
This project is proprietary and built as part of the AIML Support Triage Internship. All rights reserved.
