# ⚔️ BrandBattle — Multi-Agent Brand Intelligence Platform

**BrandBattle** is an AI-powered intelligence platform where specialized autonomous agents debate, challenge, and synthesize high-impact brand strategies, visual identities, market positioning, and ready-to-launch brand kits for any venture idea.

---

## 🌟 Key Features

- **Stage 01: Grounding Dossier & Problem Architecture**
  - Instant idea dissection, target market constraints, and competitive reality checks with live web grounding.
- **Stage 02: Multi-Agent Debate Arena**
  - Watch autonomous agent personas with competing priorities debate your brand's core positioning in real time:
    - ⚡ *Visionary Innovator*
    - 🎯 *Pragmatic Operator*
    - 💎 *Brand Strategist*
    - 👥 *Consumer Advocate*
    - 📊 *Financial Realist*
- **Stage 03: Brand Synthesis & Identity Matrix**
  - Dynamic naming matrices, archetype scoring, tagline generations, and harmonious color palettes.
- **Stage 04: Interactive Brand Preview & Canvas Studio**
  - Live procedural SVG vector logo generator with multiple emblem styles (Geometric Crest, Dynamic Abstract, Minimalist Monogram, Tech Modern).
  - High-res Canvas mockup previews (Business Card, Letterhead, Billboard, App Icon, Social Cards).
  - Customizable studio backdrops (Dark Slate, Clean Studio, Warm Beige, Cyber Grid, Deep Obsidian).
- **Instant Sharing & Collaboration**
  - Generate compact public share links with dynamic Open Graph social preview cards.
  - Export complete Brand Strategy Dossiers as JSON or print-ready PDF/reports.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Vite, Motion, Lucide Icons, D3.js
- **Backend:** Node.js, Express, tsx
- **AI Models:** Google Gemini API (Gemini 2.5 Pro / Flash)
- **Deployment:** Render.com (Native Node Web Service via `render.yaml`)

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 20 or higher recommended)
- A Gemini API Key from [Google AI / Google Cloud](https://aistudio.google.com/app/apikey)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AnkitaaPanpatil/BrandBattle---Multi-Agent-Brand-Intelligence-Platform.git
   cd BrandBattle---Multi-Agent-Brand-Intelligence-Platform
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY="your_gemini_api_key_here"
   PORT=3000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ☁️ Deployment

### Deploy to Render

This repository includes a [`render.yaml`](render.yaml) blueprint configuration for 1-click deployment on [Render.com](https://render.com):

1. Fork or push this repository to your GitHub account.
2. In the Render Dashboard, click **New +** → **Blueprint** (or connect your repo as a **Web Service**).
3. Set your `GEMINI_API_KEY` in Render's Environment Variables.
4. Render will automatically build (`npm install && npm run build`) and start your service (`npm run start`).

---

## 📄 License

This project is licensed under the MIT License.
