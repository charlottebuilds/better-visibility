// Timestamped build phases for external CI (Cloudflare Pages), plus a last-resort exit
// that arms once the Worker build (dist/client + dist/server) has finished.

const started = Date.now();
const stamp = (phase, detail = "") =>
  console.log(`[build ${new Date().toISOString()} +${((Date.now() - started) / 1000).toFixed(1)}s] ${phase}${detail ? ` – ${detail}` : ""}`);

const openHandles = () => {
  const counts = {};
  for (const type of process.getActiveResourcesInfo?.() ?? []) counts[type] = (counts[type] ?? 0) + 1;
  return Object.entries(counts).map(([t, n]) => `${t}×${n}`).join(", ") || "none";
};

export function buildDiagnostics({ graceMs = 30_000 } = {}) {
  return [
    {
      name: "better-visibility:build-diagnostics-start",
      apply: "build",
      enforce: "pre",
      buildStart() { stamp(`bundling ${this.environment?.name ?? "app"} started`); },
      writeBundle() { stamp(`bundling ${this.environment?.name ?? "app"} written`); },
      buildApp: { order: "pre", handler() { stamp("build started"); } },
    },
    {
      name: "better-visibility:build-diagnostics-finish",
      apply: "build",
      enforce: "post",
      buildApp: {
        order: "post",
        async handler() {
          stamp("prerendering finished");
          // Lovable's own build writes to dist/ with its own checks; verify only external builds.
          if (process.env.LOVABLE_SANDBOX === "1" || process.env.DEV_SERVER__PROJECT_PATH) {
            stamp("verification skipped", "Lovable build environment");
            return;
          }
          stamp("cleanup", `open handles: ${openHandles()}`);
          process.once("beforeExit", () => stamp("finalization – process exiting normally"));
          // Fallback only: everything is built and verified; normal cleanup gets graceMs to finish.
          setTimeout(() => {
            stamp("finalization fallback", `still alive after ${graceMs}ms, handles: ${openHandles()}`);
            process.exit(Number(process.exitCode ?? 0) || 0);
          }, graceMs).unref();
        },
      },
    },
  ];
}
