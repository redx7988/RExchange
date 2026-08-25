# ProjectMatch — Team Formation Platform

> Helping people find the right teammates for hackathons, competitions, research, and startups — matched on skills, interests, availability, and experience, not just who they already know.

**Hackathon:** F.AST — Problem Statement 2
**Team:** Ritik Raj (RA2511003011558, Section F2)

---

## 📋 Problem Statement

Build a platform that helps people form effective project teams based on skills, interests, availability, experience, and project requirements.

## 🧩 Problem Context

When people need to form teams for projects, competitions, hackathons, research, or startups, they often rely on existing social connections. This makes it hard to discover people with complementary skills — a developer may need a designer and a domain expert, a researcher may need someone with data engineering experience — but neither knows who is available or interested.

## 💡 Solution Overview

ProjectMatch is a matchmaking platform for team formation. Users build a profile describing their skills, interests, experience, and availability. They can either **post a project** that needs specific roles filled, or **browse/get matched** to projects and people that fit what they're looking for. A matching engine scores compatibility between people and projects so teams form around complementary skills instead of pre-existing social circles.

---

## 🚀 Core Features

### 1. Rich User Profiles
- Skills (tagged, e.g. `React`, `ML`, `UI/UX`, `Data Engineering`)
- Interests / domains (e.g. fintech, healthtech, climate)
- Experience level (beginner / intermediate / advanced) per skill
- Availability (hours/week, timezone, event-based availability)
- Bio, portfolio/GitHub/LinkedIn links

### 2. Project Posting
- Create a project with title, description, goals, and timeline
- Define **open roles** with required skills and experience level per role
- Set team size limit and project type (hackathon, startup, research, competition)

### 3. Smart Matching Engine
- Match people ↔ projects based on skill-requirement overlap, interest alignment, availability compatibility, and experience fit
- Match score/ranking shown to both sides ("87% match")
- Two-sided: project owners see recommended people; people see recommended projects

### 4. Discovery & Search
- Browse feed of open projects or available people
- Filters: skill, role, availability, experience level, project type
- Search bar with tag-based filtering

### 5. Interest & Invite System
- "I'm interested" button from a person → project owner
- "Invite to team" button from a project owner → person
- Accept / decline flow with optional message

### 6. Team Formation & Management
- Once matched, an official **Team** is created for the project
- Team dashboard: members, roles filled/open, project status
- Remove/replace members, reopen a role if someone drops out

### 7. In-App Messaging
- 1:1 chat before committing to a team
- Team group chat after formation

### 8. Notifications
- New match suggestions, invites received, invite accepted/declined, new messages

### 9. Skill Verification / Endorsements (optional but recommended)
- Teammates can endorse each other's skills after a project ends
- Builds a lightweight reputation signal for future matches

---

## ✨ Stretch Features (if time permits)

- AI-powered semantic matching using embeddings (vector similarity on skills/bio instead of just tag overlap)
- Auto-fill skills/experience by importing a GitHub or LinkedIn profile
- "Event Mode" — spin up a matching pool scoped to a specific hackathon/event with a deadline
- Post-project rating & reputation system
- Short video/audio intro on profiles
- Swipe-style discovery UI for quick browsing

---

## 🏗️ Suggested Tech Stack (fast to build, good for a hackathon)

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + Tailwind CSS |
| Backend | Next.js API routes (or a small Express server) |
| Database | Supabase (Postgres) — gives you DB + Auth + Realtime in one |
| Auth | Supabase Auth (email/password or GitHub OAuth — nice for a dev-matching app) |
| Realtime chat | Supabase Realtime channels |
| Matching logic | Simple weighted-score algorithm in a backend function; optional embeddings via OpenAI/Cohere for stretch goal |
| Hosting | Vercel (frontend) + Supabase (backend/db) |

---

## 🗃️ Data Model (high-level)

```
User
 - id, name, email, avatar_url
 - skills: [{ name, level }]
 - interests: [string]
 - availability: { hoursPerWeek, timezone }
 - bio, links: { github, linkedin, portfolio }

Project
 - id, owner_id, title, description, type, timeline
 - roles: [{ title, requiredSkills: [string], experienceLevel, filled: bool }]
 - status: open | full | completed

MatchRequest
 - id, from_user_id, to_user_id (nullable), project_id (nullable)
 - direction: user_to_project | project_to_user
 - status: pending | accepted | declined

Team
 - id, project_id
 - members: [{ user_id, role }]

Message
 - id, team_id or thread_id, sender_id, content, created_at
```

---

## 🧭 User Flow

1. Sign up → build profile (skills, interests, availability)
2. Choose a path: **post a project** or **browse to join one**
3. See ranked matches (people ↔ projects)
4. Send/receive interest or invite
5. Accept → team is formed → team dashboard + chat unlocked
6. Collaborate; optionally endorse teammates when the project wraps up

---

## 🖥️ Pages / Screens

- Landing page
- Sign up / Login
- Profile setup wizard (multi-step: skills → interests → availability → bio)
- Discover feed (toggle: People / Projects)
- Project detail page
- Person profile page
- Requests inbox (sent + received invites/interests)
- Team dashboard
- Chat (1:1 and team)
- Notifications
- Settings

---

## 📦 Getting Started (once scaffolded)

```bash
npm install
cp .env.example .env.local   # add Supabase URL + anon key
npm run dev
```

---

## 🏆 Why This Wins

- Solves a real, universal problem (every hackathon/team-project has this exact pain point)
- Demoable in minutes: profile → post project → get matched → form team → chat
- Clear stretch path (AI matching) to show technical depth if judges probe further