import { describe, expect, it, vi } from "vitest";

// Preserve the configuration values without loading Vite's plugins into tests.
vi.mock("@lovable.dev/vite-tanstack-config", () => ({
  defineConfig: (config: unknown) => config,
}));
import config from "../../vite.config";

const settings = config as unknown as {
  nitro: { preset: string; output: { publicDir: string; serverDir: string } };
  tanstackStart: {
    server: { entry: string };
    pages: { path: string }[];
    prerender: { enabled: boolean; autoStaticPathsDiscovery: boolean; crawlLinks: boolean; failOnError: boolean };
  };
};

describe("Static deployment configuration", () => {
  it("enables prerendering without discovering private pages", () => {
    expect(settings.tanstackStart.prerender.enabled).toBe(true);
    expect(settings.tanstackStart.prerender.autoStaticPathsDiscovery).toBe(false);
    expect(settings.tanstackStart.prerender.crawlLinks).toBe(false);
    expect(settings.tanstackStart.prerender.failOnError).toBe(true);
    expect(settings.tanstackStart.pages.some(({ path }) => path.startsWith("/admin"))).toBe(false);
  });

  it("keeps the existing server entry and writes public output to .output/public", () => {
    expect(settings.tanstackStart.server.entry).toBe("server");
    expect(settings.nitro.output.publicDir).toBe(".output/public");
    expect(settings.nitro.preset).toBe("cloudflare-module");
    expect(settings.nitro.output.serverDir).toBe(".output/server");
  });

  it("enumerates only CMS-independent public pages in each supported locale", () => {
    expect(settings.tanstackStart.pages.map(({ path }) => path)).toEqual([
      "/", "/impressum", "/datenschutz",
      "/de", "/de/impressum", "/de/datenschutz",
      "/en", "/en/impressum", "/en/datenschutz",
      "/es", "/es/impressum", "/es/datenschutz",
    ]);
  });
});