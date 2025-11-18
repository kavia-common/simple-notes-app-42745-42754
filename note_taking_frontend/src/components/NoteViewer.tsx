import { component$ } from "@builder.io/qwik";
import type { Note } from "~/services/notes.service";

type ViewerProps = {
  note?: Note;
};

// PUBLIC_INTERFACE
export default component$<ViewerProps>(({ note }) => {
  if (!note) {
    return <div class="editor-pane"><div class="empty-state">No note selected.</div></div>;
  }
  return (
    <section class="editor-pane" aria-label="Note viewer">
      <div class="editor-toolbar" style={{ justifyContent: "flex-start" }}>
        <div style={{ fontWeight: 700 }}>{note.title || "Untitled"}</div>
        <div style={{ marginLeft: "auto", fontSize: "0.85rem", color: "var(--ocean-muted)" }}>
          Updated {new Date(note.updatedAt).toLocaleString()}
        </div>
      </div>
      <div style={{ padding: "16px", whiteSpace: "pre-wrap" }}>{note.content || "No content"}</div>
    </section>
  );
});
