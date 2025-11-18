import { isServer } from "@builder.io/qwik";

/**
 * Note entity representation.
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

type CreateNoteInput = {
  title?: string;
  content?: string;
};

const STORAGE_KEY = "notes.app.items.v1";

/**
 * Get the API base URL from environment variables if configured.
 * Prefers VITE_API_BASE over VITE_BACKEND_URL.
 */
function getApiBase(): string | undefined {
  // Use import.meta.env safely; in SSR, not available in the same way. Qwik's vite injects it for both.
  const base = (import.meta as any).env?.VITE_API_BASE || (import.meta as any).env?.VITE_BACKEND_URL;
  if (!base || typeof base !== "string" || base.trim().length === 0) return undefined;
  return base.replace(/\/+$/, "");
}

/**
 * Simple util to generate a random id.
 */
function uid(): string {
  // Time-based + random to avoid collisions in local context
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * LocalStorage-backed repository with optional HTTP API routing.
 * If API base is configured, methods are prepared to switch to fetch() calls.
 */
export class NotesRepository {
  private apiBase?: string;

  constructor() {
    this.apiBase = getApiBase();
  }

  private safeReadAll(): Note[] {
    if (isServer) return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw) as Note[];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  private safeWriteAll(notes: Note[]) {
    if (isServer) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
      // ignore quota or serialization errors
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Returns all notes, optionally filtered by a query matching title or content.
   */
  async list(query?: string): Promise<Note[]> {
    if (this.apiBase) {
      // Placeholder for future API call
      // const res = await fetch(`${this.apiBase}/notes`);
      // return (await res.json()) as Note[];
      // Fallback to local storage until API is ready
    }
    let items = this.safeReadAll().sort((a, b) => b.updatedAt - a.updatedAt);
    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q),
      );
    }
    return items;
  }

  // PUBLIC_INTERFACE
  /**
   * Retrieves a note by id.
   */
  async get(id: string): Promise<Note | undefined> {
    if (this.apiBase) {
      // Placeholder for future API call
      // const res = await fetch(`${this.apiBase}/notes/${id}`);
      // return (await res.json()) as Note;
    }
    return this.safeReadAll().find((n) => n.id === id);
  }

  // PUBLIC_INTERFACE
  /**
   * Creates a new note with optional title/content.
   */
  async create(input: CreateNoteInput = {}): Promise<Note> {
    if (this.apiBase) {
      // Placeholder for future API call
      // const res = await fetch(`${this.apiBase}/notes`, { method: 'POST', body: JSON.stringify(input) });
      // return (await res.json()) as Note;
    }
    const now = Date.now();
    const newNote: Note = {
      id: uid(),
      title: input.title?.trim() || "Untitled note",
      content: input.content || "",
      createdAt: now,
      updatedAt: now,
    };
    const items = this.safeReadAll();
    items.unshift(newNote);
    this.safeWriteAll(items);
    return newNote;
  }

  // PUBLIC_INTERFACE
  /**
   * Updates a note by id with partial fields.
   */
  async update(id: string, patch: Partial<Pick<Note, "title" | "content">>): Promise<Note | undefined> {
    if (this.apiBase) {
      // Placeholder for future API call
      // const res = await fetch(`${this.apiBase}/notes/${id}`, { method: 'PATCH', body: JSON.stringify(patch) });
      // return (await res.json()) as Note;
    }
    const items = this.safeReadAll();
    const idx = items.findIndex((n) => n.id === id);
    if (idx === -1) return undefined;
    const updated: Note = {
      ...items[idx],
      ...patch,
      updatedAt: Date.now(),
    };
    items[idx] = updated;
    this.safeWriteAll(items);
    return updated;
  }

  // PUBLIC_INTERFACE
  /**
   * Deletes a note by id. Returns true if deleted.
   */
  async remove(id: string): Promise<boolean> {
    if (this.apiBase) {
      // Placeholder for future API call
      // await fetch(`${this.apiBase}/notes/${id}`, { method: 'DELETE' });
    }
    const items = this.safeReadAll();
    const next = items.filter((n) => n.id !== id);
    this.safeWriteAll(next);
    return next.length !== items.length;
  }
}

/**
 * Singleton repository for convenience.
 */
export const notesRepo = new NotesRepository();
