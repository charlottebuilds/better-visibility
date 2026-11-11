// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Build a server only for prerendering; never emit a Pages Worker in the static directory.
  // The server stays outside the Pages upload and can be hosted separately for the CMS.
  nitro: {
    preset: "node-server",
    output: { dir: ".output", publicDir: ".output/public", serverDir: ".output/server" },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Optional locale routes need concrete URLs. Do not discover private CMS pages.
    pages: ["", "/de", "/en", "/es"].flatMap((locale) =>
      ["/", "/blog", "/impressum", "/datenschutz"].map((path) => ({
        path: path === "/" ? locale || "/" : `${locale}${path}`,
      })),
    ),
    prerender: { enabled: true, autoStaticPathsDiscovery: false, failOnError: true },
  },
});
