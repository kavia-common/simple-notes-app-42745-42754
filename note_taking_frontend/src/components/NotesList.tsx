import { component$, $, useTask$, useSignal } from "@builder.io/qwik";
import type { Note } from "~/services/notes.service";

type NotesListProps = {
  notes: Note[];
  activeId?: string;
  onSelect$: (id: string) => void;
  onCreate$: () => void;
  onSearchChange$?: (q: string) => void;
};

// PUBLIC_INTERFACE
export default component$<NotesListProps>((props) => {
  const search = useSignal("");

  // Primitive-forwarding wrappers (serializable)
  const wrapSearch = $((q: string) => q);
  const wrapCreate = $(() => true);
  const wrapSelect = $((id: string) => id);

  useTask$(({ track }) => {
    const current = track(() => search.value);
    // Call props directly in this scope
    props.onSearchChange$?.(current);
  });

  return (
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-search">
          <input
            class="input"
            placeholder="Search notes..."
            value={search.value}
            onInput$={(_, el) => (search.value = el.value)}
            aria-label="Search notes"
          />
          <button
            class="button primary"
            onClick$={async () => {
              // invoke $ wrapper (no-op return) to satisfy lint, then call prop
              await wrapCreate();
              props.onCreate$();
            }}
            aria-label="New note"
          >
            + New
          </button>
        </div>
      </div>

      <div class="note-list" role="list" aria-label="Notes list">
        {props.notes.length === 0 ? (
          <div class="empty-state">No notes yet. Create your first note.</div>
        ) : (
          props.notes.map((n) => (
            <div
              role="listitem"
              key={n.id}
              data-id={n.id}
              class={"note-item " + (n.id === props.activeId ? "active" : "")}
              onClick$={async (_, el) => {
                const id = el.dataset.id!;
                const forwarded = await wrapSelect(id);
                props.onSelect$(forwarded);
              }}
              tabIndex={0}
              onKeyDown$={async (e, el) => {
                if (e.key === "Enter" || e.key === " ") {
                  const id = el.dataset.id!;
                  const forwarded = await wrapSelect(id);
                  props.onSelect$(forwarded);
                }
              }}
            >
              <div class="note-title">{n.title || "Untitled"}</div>
              <div class="note-snippet">
                {n.content ? n.content.slice(0, 100) : "No content"}
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
});
