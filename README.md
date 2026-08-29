# SkillSync

SkillSync is a platform for finding teammates, forming squads, and building projects. It leverages AI (Google Gemini) and Firebase.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env.local` file by copying `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Firebase config keys and Gemini API key.

3. **Firebase Setup**
   You need a Firebase project with Authentication (Google Sign-In) and Firestore enabled.
   Ensure that your Firestore rules allow authenticated users to read and write data.

4. **Firebase Admin Credentials (for Production / API)**
   To use server-side AI matching and secured API routes, provide your Firebase Service Account details in `.env.local`:
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY` (ensure `\n` is handled properly in your secrets manager)

   **Note:** In Vercel or Netlify, add these as environment variables in the project settings.

5. **Run Locally**
   ```bash
   npm run dev
   ```
   Visit http://localhost:3000 to see the app.

## Security & Architecture

- **AuthGuard**: The application uses a robust Authentication Guard that prevents unauthenticated users from accessing protected views.
- **Middleware**: A `middleware.ts` applies Strict Transport Security, Content Security Policy, and XSS protection to all routes.
- **Firebase Admin Guard**: Firebase Admin is safely initialized in `src/lib/firebaseAdmin.ts`. If credentials are not present during a static build, it gracefully skips initialization without crashing the build pipeline.

