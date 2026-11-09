import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { localeParam, useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  CONSENT_EVENT,
  loadGoogleAnalytics,
  readConsent,
  saveConsent,
  setAnalyticsConsent,
  trackPageView,
  type ConsentState,
} from "@/lib/consent";

/**
 * GDPR consent banner: nothing tracking-related loads before an explicit
 * choice, and the choice can be changed later from the footer.
 */
export function CookieConsent() {
  const { t, lang } = useI18n();
  const lp = localeParam(lang);
  const c = t.cookie;

  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [panel, setPanel] = useState<"none" | "banner" | "settings">("none");
  const [analytics, setAnalytics] = useState(false);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const lastPath = useRef(pathname);

  useEffect(() => {
    const stored = readConsent();
    if (stored) {
      setConsent(stored);
      setAnalytics(stored.analytics);
      if (stored.analytics) loadGoogleAnalytics();
    } else {
      setPanel("banner");
    }
    const reopen = () => setPanel("settings");
    window.addEventListener(CONSENT_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_EVENT, reopen);
  }, []);

  // gtag only tracks the first load automatically; send the rest of the SPA.
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    if (consent?.analytics) trackPageView(pathname);
  }, [pathname, consent?.analytics]);

  function apply(withAnalytics: boolean) {
    const next = saveConsent(withAnalytics);
    setConsent(next);
    setAnalytics(withAnalytics);
    setPanel("none");
    if (withAnalytics) loadGoogleAnalytics();
    setAnalyticsConsent(withAnalytics);
  }

  if (panel === "none") return null;

  return (
    <div
      role="dialog"
      aria-labelledby="cookie-title"
      aria-describedby="cookie-text"
      className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-2xl sm:inset-x-6 sm:bottom-6"
    >
      <div className="rounded-3xl border border-border bg-card/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-6">
        {panel === "banner" ? (
          <>
            <h2 id="cookie-title" className="font-display text-lg font-bold">{c.title}</h2>
            <p id="cookie-text" className="mt-2 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                onClick={() => apply(true)}
                className="rounded-full bg-gradient-brand px-5 font-semibold text-primary-foreground"
              >
                {c.accept}
              </Button>
              <Button variant="outline" onClick={() => apply(false)} className="rounded-full px-5">
                {c.decline}
              </Button>
              <button
                type="button"
                onClick={() => setPanel("settings")}
                className="ml-auto text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                {c.settings}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="cookie-title" className="font-display text-lg font-bold">{c.settingsTitle}</h2>
            <div className="mt-3 space-y-2.5">
              <div className="rounded-2xl border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium">{c.necessaryName}</span>
                  <span className="text-xs text-muted-foreground">{c.alwaysOn}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.necessaryNote}</p>
              </div>
              <div className="rounded-2xl border border-border p-3">
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="ga-consent" className="cursor-pointer text-sm font-medium">
                    {c.analyticsName}
                  </Label>
                  <Switch
                    id="ga-consent"
                    checked={analytics}
                    onCheckedChange={(v) => setAnalytics(Boolean(v))}
                  />
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{c.analyticsNote}</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                onClick={() => apply(analytics)}
                className="rounded-full bg-gradient-brand px-5 font-semibold text-primary-foreground"
              >
                {c.save}
              </Button>
              <Button variant="outline" onClick={() => setPanel("banner")} className="rounded-full px-5">
                {c.back}
              </Button>
              <Link
                to="/{-$locale}/datenschutz"
                params={{ locale: lp }}
                className="ml-auto text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-accent hover:underline"
              >
                {c.privacyLink}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
