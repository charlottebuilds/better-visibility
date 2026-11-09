import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadGoogleAnalytics, readConsent, saveConsent, trackPageView } from "@/lib/consent";

type Script = { src: string; dataset: Record<string, string> };
type Args = ArrayLike<unknown>;

function installBrowser() {
  const store = new Map<string, string>();
  const appended: Script[] = [];
  const win = {
    localStorage: {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => { store.set(k, v); },
      removeItem: (k: string) => { store.delete(k); },
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  };
  const doc = {
    querySelector: () => (appended.length > 0 ? {} : null),
    createElement: () => ({ src: "", dataset: {} }) as Script,
    head: { appendChild: (el: Script) => { appended.push(el); } },
  };
  const g = globalThis as unknown as { window?: unknown; document?: unknown };
  g.window = win;
  g.document = doc;
  return { store, appended, win: win as unknown as { dataLayer?: Args[] } };
}

const g = globalThis as unknown as { window?: unknown; document?: unknown };

describe("Cookie consent store", () => {
  let browser: ReturnType<typeof installBrowser>;

  beforeEach(() => { browser = installBrowser(); });
  afterEach(() => { delete g.window; delete g.document; });

  it("keeps an analytics decision and reads it back", () => {
    expect(readConsent()).toBe(null);
    const saved = saveConsent(true);
    expect(saved.analytics).toBe(true);
    expect(readConsent()).toEqual({ analytics: true, decidedAt: saved.decidedAt });
    expect(readConsent()!.analytics).toBe(true);
  });

  it("records a refusal as an explicit decision", () => {
    const saved = saveConsent(false);
    expect(saved.analytics).toBe(false);
    expect(readConsent()!.analytics).toBe(false);
  });

  it("ignores unreadable stored consent", () => {
    browser.store.set("bv-cookie-consent-v1", "{not json");
    expect(readConsent()).toBe(null);
  });

  it("loads nothing at all without a measurement ID", () => {
    expect(loadGoogleAnalytics("")).toBe(false);
    expect(browser.appended).toEqual([]);
    expect((g.window as { dataLayer?: unknown }).dataLayer).toBeUndefined();
  });

  it("injects gtag.js with the measurement ID exactly once", () => {
    expect(loadGoogleAnalytics("G-TEST123")).toBe(true);
    expect(browser.appended).toHaveLength(1);
    expect(browser.appended[0]?.src).toBe("https://www.googletagmanager.com/gtag/js?id=G-TEST123");
    expect(browser.appended[0]?.dataset["gaId"]).toBe("G-TEST123");
    expect(loadGoogleAnalytics("G-TEST123")).toBe(true);
    expect(browser.appended).toHaveLength(1);
  });

  it("sends the config and page views through the gtag queue", () => {
    loadGoogleAnalytics("G-TEST123");
    const queue = browser.win.dataLayer!;
    const config = queue.map((entry) => Array.from(entry as Args));
    expect(config.some((args) => args[0] === "config" && args[1] === "G-TEST123")).toBe(true);

    trackPageView("/en/blog/test");
    const last = Array.from(queue[queue.length - 1] as Args);
    expect(last).toEqual(["event", "page_view", { page_path: "/en/blog/test" }]);
  });
});
