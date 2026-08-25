# ProjectMatch — AI-Powered Team Formation Platform

> Connecting students, developers, designers, and domain experts into balanced hackathon and project teams using **Firestore skill tags** and **Google Gemini** intelligent compatibility match scoring.

**Hackathon:** F.AST — Problem Statement 2  
**Team:** Ritik Raj (RA2511003011558, Section F2)  

---

## 💡 Overview & Features

1. **Intelligent Gemini Compatibility Scoring (`/api/ai/match`)**:
   - Evaluates multi-dimensional fit (skills overlap, proficiency tiers, domain interests, and hackathon availability).
   - Generates detailed synergy reports, skill gap analysis, and tailored outreach pitches using Google Gemini.
2. **AI Team Auto-Balancer (`/api/ai/team-balance`)**:
   - Synthesizes balanced, cross-functional squads (Frontend, Backend, AI/ML, UI/UX, Product) from candidate pools with 1-click batch invites.
3. **Firestore Skill Tags Matrix (`/profile`)**:
   - Granular skill tags with proficiency levels (`beginner`, `intermediate`, `advanced`, `expert`), weekly commitment hours, and hackathon sprint readiness.
4. **Two-Sided Match Discovery (`/discover`)**:
   - **"Find Projects for Me"**: Projects ranked by AI compatibility with your profile.
   - **"Find Candidates for My Project"**: Candidates ranked for specific project vacancies.
5. **Project Creation with AI Assistant (`/projects/new`)**:
   - Define open roles with required skills, or click **"AI Auto-Suggest Roles"** to let Gemini configure optimal team positions based on your project description.
6. **Collaboration Workspace & Live Chat (`/teams/[id]`)**:
   - Member roster, milestone task tracker, and realtime in-app collaboration chat with AI icebreakers.
7. **Demo Persona Switcher**:
   - Quickly switch between pre-seeded personas (Ritik Raj, Sarah Chen, Marcus Vance, Priya Sharma, Alex Rivera) via the top navigation bar to test two-sided invites and squad workflows.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **AI Engine**: Google Gemini API (`@google/genai`, model `gemini-2.5-flash`)
- **Database**: Cloud Firestore (Modular Web SDK `firebase/firestore`) with instant local fallback mode

---

## 🚀 Getting Started

### 1. Installation

```bash
npm install
```

### 2. Environment Configuration

Copy the sample environment file:

```bash
cp .env.example .env.local
```

Add your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/):

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

*(Firebase credentials are optional; the application includes a full in-browser state engine and sample data for instant zero-config testing).*

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Production Build & Verification

```bash
npm run build
npm run start
```