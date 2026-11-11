import { describe, expect, it, vi } from "vitest";

// Preserve the configuration values without loading Vite's plugins into tests.
vi.mock("@lovable.dev/vite-tanstack-config", () => ({
  defineConfig: (config: unknown) => config,
}));
import config from "../../vite.config";

const settings = config as unknown as {
  nitro: { output: { publicDir: string } };
  tanstackStart: {
    server: { entry: string };
    pages: { path: string }[];
    prerender: { enabled: boolean; autoStaticPathsDiscovery: boolean };
  };
};

describe("Static deployment configuration", () => {
  it("enables prerendering without discovering private pages", () => {
    expect(settings.tanstackStart.prerender.enabled).toBe(true);
    expect(settings.tanstackStart.prerender.autoStaticPathsDiscovery).toBe(false);
    expect(settings.tanstackStart.pages.some(({ path }) => path.startsWith("/admin"))).toBe(false);
  });

  it("keeps the existing server entry and writes public output to .output/public", () => {
    expect(settings.tanstackStart.server.entry).toBe("server");
    expect(settings.nitro.output.publicDir).toBe(".output/public");
  });

  it("enumerates all four public page types in each supported locale", () => {
    expect(settings.tanstackStart.pages.map(({ path }) => path)).toEqual([
      "/", "/blog", "/impressum", "/datenschutz",
      "/de", "/de/blog", "/de/impressum", "/de/datenschutz",
      "/en", "/en/blog", "/en/impressum", "/en/datenschutz",
      "/es", "/es/blog", "/es/impressum", "/es/datenschutz",
    ]);
  });
});