import { component$, useSignal, useTask$, $ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import Header from "~/components/Header";
import NotesList from "~/components/NotesList";
import NoteEditor from "~/components/NoteEditor";
import { notesRepo, type Note } from "~/services/notes.service";
import "~/styles/theme.css";

// PUBLIC_INTERFACE
export default component$(() => {
  const notes = useSignal<Note[]>([]);
  const selectedId = useSignal<string | undefined>(undefined);
  const query = useSignal("");

  // initial load
  useTask$(async () => {
    notes.value = await notesRepo.list();
    if (notes.value.length > 0) selectedId.value = notes.value[0].id;
  });

  const reload = $(async () => {
    notes.value = await notesRepo.list(query.value);
    // keep selection if exists
    if (selectedId.value) {
      const stillThere = notes.value.find((n) => n.id === selectedId.value);
      if (!stillThere) selectedId.value = notes.value[0]?.id;
    }
  });

  const onSelect = $((id: string) => {
    selectedId.value = id;
  });

  const onCreate = $(async () => {
    const created = await notesRepo.create({ title: "New note", content: "" });
    await reload();
    selectedId.value = created.id;
  });

  const onSearchChange = $(async (q: string) => {
    query.value = q;
    await reload();
  });

  const onSave = $(async (fields: { title: string; content: string }) => {
    if (!selectedId.value) return;
    await notesRepo.update(selectedId.value, fields);
    await reload();
  });

  const onDelete = $(async () => {
    if (!selectedId.value) return;
    await notesRepo.remove(selectedId.value);
    await reload();
  });

  const active = () => notes.value.find((n) => n.id === selectedId.value);

  return (
    <div class="app-shell">
      <Header total={notes.value.length} />
      <div class="app-content">
        <NotesList
          notes={notes.value}
          activeId={selectedId.value}
          onSelect$={onSelect}
          onCreate$={onCreate}
          onSearchChange$={onSearchChange}
        />
        <NoteEditor
          note={active()}
          onSave$={onSave}
          onDelete$={onDelete}
          autoSave={true}
        />
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Ocean Notes",
  meta: [
    {
      name: "description",
      content: "Simple note-taking app built with Qwik.",
    },
    { name: "theme-color", content: "#2563EB" },
  ],
};
