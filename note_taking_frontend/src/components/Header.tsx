import { component$ } from "@builder.io/qwik";

type HeaderProps = {
  total: number;
};

// PUBLIC_INTERFACE
export default component$<HeaderProps>(({ total }) => {
  /** Header with brand and count */
  return (
    <header class="app-header">
      <div class="header-title">
        <span class="brand-dot" />
        <div>
          <div style={{ fontWeight: "700" }}>Ocean Notes</div>
          <div style={{ fontSize: "0.8rem", color: "var(--ocean-muted)" }}>
            {total} {total === 1 ? "note" : "notes"}
          </div>
        </div>
      </div>
    </header>
  );
});
