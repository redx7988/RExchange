<div align="center">
  <h1>🚀 SkillSync</h1>
  <p><strong>The AI-Powered Collaborative Team Engine for Hackathons & Startups</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/Google_Gemini-3.6_Flash-8E75B2?style=for-the-badge&logo=google" alt="Gemini" />
  </p>
</div>

<hr />

## 🌟 What is SkillSync?

**SkillSync** is a next-generation platform designed to eliminate the chaos of team formation before the hackathon clock starts. By combining a **Firestore Skill Tag Matrix** with the **Google Gemini 3.6 API**, SkillSync evaluates synergy beyond simple keyword matching—calculating skill gaps, complementary strengths, domain affinities, and personalized outreach pitches to help you build the perfect squad.

---

## ✨ Core Features

### 🤖 Gemini Compatibility Engine
- **Smart Synergy Matching:** Calculates balance scores and synergy highlights between projects and candidates.
- **AI Gap Analysis:** Identifies missing skills in your team and suggests exactly who you need to recruit.
- **Automated Icebreakers:** Generates personalized outreach pitches based on the candidate's skills and your project's needs.

### 👥 Talent & Project Discovery
- **Granular Skill Matrix:** Users maintain verified proficiency levels and availability hours.
- **Project Board:** Post ideas (Hackathons, Startups, Open Source) with specific role requirements.
- **Advanced Filtering:** Search for talent by skill tags, experience, and commitment capacity.

### 🛡️ Squad Hub & Real-time Collaboration
- **Team Dashboards:** Track hackathon milestones, manage open roles, and organize demo links.
- **Squad Roster:** Manage invites and acceptances seamlessly.
- **Live Team Chat:** Real-time chat powered by Firestore for instant team coordination.

### 🧠 Interactive AI Copilot
- **Pitch & Strategy Assistant:** A dedicated AI copilot tab that helps formulate winning pitch hooks, architecture strategies, and brainstorms features using real-time generative intelligence.

### 🔒 Enterprise-Grade Security
- **Strict AuthGuards:** Completely protects routes and actions, ensuring only verified Google-authenticated users can participate.
- **Hardened Middleware:** Built-in HTTP security headers (`X-XSS-Protection`, `Strict-Transport-Security`, etc.) against common vulnerabilities.

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| **Frontend** | Next.js 15 (App Router), React, Tailwind CSS, Lucide Icons |
| **Backend / DB** | Firebase Authentication, Cloud Firestore |
| **AI Integration** | Google Gemini 3.6 Flash API (`@google/genai`) |
| **Deployment** | Vercel Ready (Optimized static & dynamic rendering) |

---

## 🚀 Getting Started

Follow these steps to run SkillSync locally.

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/skillsync.git
cd skillsync
npm install
```

### 2. Environment Setup
Create a `.env.local` file by copying the template:
```bash
cp .env.example .env.local
```
Fill in the required keys:
*   **Firebase Client Keys:** Used for client-side Auth and Firestore.
*   **Firebase Admin Credentials:** Required for secure server-side logic (`FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`).
*   **Gemini API Key:** `GEMINI_API_KEY` to power the AI compatibility engine.

### 3. Firebase Configuration
1. Create a project on the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Google Sign-In** in the Authentication tab.
3. Enable **Firestore Database** and update security rules to allow authenticated reads/writes.
4. Generate a **Service Account Key** and paste the JSON values into your `.env.local`.

### 4. Run the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to see your AI-powered team engine in action!

---

## 🌐 Deployment to Vercel

SkillSync is heavily optimized for zero-config Vercel deployment.

1. Push your code to a GitHub repository.
2. Import the repository in [Vercel](https://vercel.com).
3. **Important:** Add all your `.env.local` variables into the Vercel Environment Variables section.
   * *Tip: For `FIREBASE_PRIVATE_KEY`, ensure the newlines (`\n`) are preserved correctly.*
4. Click **Deploy**. The custom Firebase Admin guard will safely bypass init during the static build phase and activate smoothly in production!

---

<div align="center">
  <i>Built with ❤️ for Hackers & Builders</i>
</div>
