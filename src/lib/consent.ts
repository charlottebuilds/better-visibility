/**
 * Cookie / analytics consent store.
 *
 * Browser-only helpers: every function guards `typeof window` so the module is
 * safe to import during SSR. Nothing here runs at module scope.
 */

const CONSENT_KEY = "bv-cookie-consent-v1";

export type ConsentState = { analytics: boolean; decidedAt: string };

/** Fired by the footer link so the banner can reopen itself. */
export const CONSENT_EVENT = "bv:cookie-settings";

export function openCookieSettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
}

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (typeof parsed?.analytics !== "boolean" || typeof parsed?.decidedAt !== "string") return null;
    return { analytics: parsed.analytics, decidedAt: parsed.decidedAt };
  } catch {
    return null;
  }
}

export function saveConsent(analytics: boolean): ConsentState {
  const next: ConsentState = { analytics, decidedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
    } catch {
      /* private mode / storage disabled: consent stays for this page view only */
    }
  }
  return next;
}

/** Build-time value (Cloudflare env or the Google Analytics connector). */
export function gaMeasurementId(): string {
  const env = import.meta.env as unknown as Record<string, string | undefined>;
  return env["VITE_GA_MEASUREMENT_ID"] ?? env["VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY"] ?? "";
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Injects gtag.js. Without a measurement ID nothing is loaded at all, so a
 * visitor's browser never talks to Google before consent *and* configuration.
 */
export function loadGoogleAnalytics(measurementId = gaMeasurementId()): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") return false;
  if (!measurementId) return false;
  if (document.querySelector("script[data-ga-id]")) return true;

  window.dataLayer = window.dataLayer || [];
  const gtag = function () {
    // eslint-disable-next-line prefer-rest-params -- gtag.js needs the Arguments object
    window.dataLayer!.push(arguments);
  } as unknown as (...args: unknown[]) => void;
  window.gtag = gtag;
  gtag("set", "developer_id.dZjgwMW", true);
  gtag("js", new Date());
  gtag("config", measurementId);

  const script = document.createElement("script");
  script.async = true;
  script.dataset["gaId"] = measurementId;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
  return true;
}

/** GA consent mode: revoke or restore storage without reloading the page. */
export function setAnalyticsConsent(granted: boolean) {
  if (typeof window === "undefined") return;
  window.gtag?.("consent", "update", { analytics_storage: granted ? "granted" : "denied" });
}

export function trackPageView(path: string) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", "page_view", { page_path: path });
}
