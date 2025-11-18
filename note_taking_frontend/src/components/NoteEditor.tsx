import { component$, $, useSignal, useTask$ } from "@builder.io/qwik";
import type { Note } from "~/services/notes.service";

type EditorProps = {
  note?: Note;
  onSave$: (fields: { title: string; content: string }) => Promise<void>;
  onDelete$: () => Promise<void>;
  autoSave?: boolean;
};

// PUBLIC_INTERFACE
export default component$<EditorProps>((props) => {
  const title = useSignal(props.note?.title ?? "");
  const content = useSignal(props.note?.content ?? "");
  const saving = useSignal(false);
  const debounce = useSignal<{ pending: boolean }>({ pending: false });

  // Primitive-forwarding wrappers
  const wrapSave = $((titleV: string, contentV: string) => ({ title: titleV, content: contentV }));
  const wrapDelete = $(() => true);
  const wrapTick = $(() => true);

  // Sync when note changes; track only serializable values
  useTask$(({ track }) => {
    const id = track(() => props.note?.id);
    void id;
    title.value = props.note?.title ?? "";
    content.value = props.note?.content ?? "";
  });

  const doSave = $(async () => {
    if (!props.note) return;
    saving.value = true;
    const payload = await wrapSave(title.value, content.value);
    await props.onSave$(payload);
    await wrapTick();
    saving.value = false;
  });

  const triggerAutoSave = $(() => {
    const shouldAuto = (props.autoSave ?? true) && !!props.note;
    if (!shouldAuto) return;
    if (debounce.value.pending) return;
    debounce.value = { pending: true };
    setTimeout(async () => {
      await doSave();
      debounce.value = { pending: false };
    }, 600);
  });

  const onDeleteClick = $(async () => {
    if (!props.note) return;
    const ok = confirm("Delete this note? This cannot be undone.");
    if (ok) {
      await wrapDelete();
      await props.onDelete$();
    }
  });

  if (!props.note) {
    return <div class="editor-pane"><div class="empty-state">Select a note or create a new one.</div></div>;
  }

  return (
    <section class="editor-pane" aria-label="Note editor">
      <div class="editor-toolbar">
        <div style={{ display: "flex", gap: "8px" }}>
          <button class="button" onClick$={doSave} aria-label="Save note">Save</button>
          <button class="button danger" onClick$={onDeleteClick} aria-label="Delete note">Delete</button>
        </div>
        <div style={{ fontSize: "0.85rem", color: "var(--ocean-muted)" }}>
          {saving.value ? "Saving..." : "Saved"}
        </div>
      </div>
      <input
        class="title-input"
        placeholder="Note title"
        value={title.value}
        onInput$={async (_, el) => {
          title.value = el.value;
          await triggerAutoSave();
        }}
        aria-label="Note title"
      />
      <textarea
        class="textarea"
        placeholder="Start typing your note..."
        value={content.value}
        onInput$={async (_, el) => {
          content.value = el.value;
          await triggerAutoSave();
        }}
        aria-label="Note content"
      />
    </section>
  );
});
