# StudyDesk AI setup (Gemini + Vercel)

The GitHub Pages site is static, so it cannot safely store a Gemini API key or run the AI endpoint. This repository includes a Vercel serverless function at `api/chat.js`.

## Deploy the managed backend

1. Import `AdamAbdelrahhman/StudyDesk` into a Vercel project.
2. In **Project Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = your Google AI Studio Gemini API key (keep it secret).
   - `ALLOWED_ORIGIN` = `https://adamabdelrahhman.github.io` (optional; this is the default).
3. Deploy the project. The endpoint will be `https://YOUR-VERCEL-PROJECT.vercel.app/api/chat`.
4. In `index.html`, set `window.STUDYDESK_AI_API` to that exact endpoint before the assistant script runs, or replace the fallback `https://YOUR-VERCEL-PROJECT.vercel.app/api/chat` in `STUDYDESK_AI_API`.
5. Commit the change to GitHub. GitHub Pages will serve the updated frontend; Vercel will host the API.

## Security and data

- The Gemini key is read only from the Vercel environment and is never sent to the browser.
- The browser sends the student's current tasks, exam dates, notes, flashcards, and focus totals only when the student sends a chat message.
- Chat history is stored locally in that browser, separately from the StudyDesk backup data.
- The endpoint has basic per-instance rate limiting. For a public production deployment, add a persistent rate limiter (for example Upstash) and monitor Gemini usage/billing.
