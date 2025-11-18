# Ocean Notes (Qwik) ⚡️

A simple note-taking app built with Qwik & Qwik City.

Features:
- Create, view, edit, and delete notes
- Search/filter notes by title/content
- Local persistence via localStorage (fallback)
- Optional API-ready service (reads VITE_API_BASE or VITE_BACKEND_URL)
- Ocean Professional theme with modern, minimal UI

Env:
- Defaults to localStorage.
- If VITE_API_BASE or VITE_BACKEND_URL is set (non-empty), the service is structured to switch to HTTP calls where noted. No backend is required for local use.

Scripts:
- npm start        # dev
- npm run preview  # production preview
- npm run build    # build

Structure highlights:
- src/styles/theme.css           # Ocean Professional theme
- src/services/notes.service.ts  # Notes repository (localStorage + API-ready)
- src/components/*               # Header, NotesList, NoteEditor, NoteViewer
- src/routes/index.tsx           # App shell and wiring
