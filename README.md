# BrandBattle ⚔️
### Multi-Agent Brand Intelligence Arena

> **BrandBattle** is an AI-powered multi-agent brand intelligence platform built for the **Inkloom hackathon (DevCrest Buildathon '26)**. It transforms rough startup concepts into unassailable, launch-ready brand ecosystems through real-time market grounding and multi-agent adversarial debate.

---

## 🚀 Core Workflow & Architecture

BrandBattle orchestrates a 3-stage intelligence pipeline powered by **Google Gemini** and **Google Search Grounding**:

1. **Stage 1: Idea Intake & Real-Time Market Grounding**
   - Ingests the founder's raw product concept[cite: 1].
   - Executes live Google Search grounding to discover top competitors, analyze market saturation risk, and identify unoccupied strategic white space[cite: 1].

2. **Stage 2: Multi-Agent Debate Arena**
   - Pits three specialized AI personas against each other in a high-stakes war room:
     - **Marcus Vance (Growth VC):** Evaluates unit economics, scalability, and defensible moats.
     - **Solenne Moreau (Creative Director):** Focuses on narrative soul, emotional resonance, and cultural distinction.
     - **Jax 'Zero-BS' Sterling (Brutal Skeptic):** Relentlessly hunts for startup clichés, fatal assumptions, and operational blind spots.

3. **Stage 3: Synthesis & Brand Kit**
   - Synthesizes the debate into a definitive brand strategy dossier featuring:
     - 3 distinct naming archetypes (Functional Anchor, Evocative Muse, Provocative Rebel).
     - Curated visual direction, hex color palettes, and typography hierarchy.
     - Short-form promotional launch video scripts (TikTok/Reels/Shorts) and viral tweet threads.
     - D3.js strategy radar evaluation matrix and live interactive brand simulator.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, D3.js.
- **Backend:** Node.js, Express, TypeScript (`tsx`).
- **AI Integration:** `@google/genai` (Gemini 3.8 Flash, Imagen 3 image generation, and Google Search Grounding).
- **Persistence & Sharing:** Firebase Authentication & Cloud Firestore (for secure cloud saving and public read-only dossier links)[cite: 1].

---

## 💻 Local Development Setup

Follow these steps to run BrandBattle locally on your laptop:

### 1. Clone the Repository
```bash
git clone [https://github.com/your-username/brand-battle.git](https://github.com/your-username/brand-battle.git)
cd brand-battle
