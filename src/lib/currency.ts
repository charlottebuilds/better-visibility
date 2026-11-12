import { useEffect, useState, useSyncExternalStore } from "react";

export type Currency = "EUR" | "USD" | "GBP";
export const CURRENCIES: Currency[] = ["EUR", "USD", "GBP"];
/** Official contractual EUR base prices (net) for Check, Strategie, Organic Growth. */
export const BASE_PRICES_EUR = [999, 1900, 3500] as const;

export type Rates = { USD: number; GBP: number; date: string };
const RATE_KEY = "bv-fx-rates";
const CUR_KEY = "bv-currency";
const TTL = 12 * 60 * 60 * 1000;

export const isValidRates = (r: unknown): r is Rates =>
  !!r && typeof r === "object" && [(r as Rates).USD, (r as Rates).GBP].every((n) => typeof n === "number" && isFinite(n) && n > 0);

/** Round to commercially readable amounts: nearest 10 below 1000, nearest 50 above. */
export function roundCommercial(n: number) {
  const step = n < 1000 ? 10 : 50;
  return Math.round(n / step) * step;
}

/** Price in the chosen currency; falls back to EUR when no valid rate exists. */
export function convertPrice(eur: number, cur: Currency, rates: Rates | null): { amount: number; currency: Currency } {
  if (cur === "EUR" || !isValidRates(rates)) return { amount: eur, currency: "EUR" };
  return { amount: roundCommercial(eur * rates[cur]), currency: cur };
}

export function formatPrice(amount: number, currency: Currency, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(amount);
}

// Shared currency state across all cards (and tabs), persisted in localStorage.
const listeners = new Set<() => void>();
let current: Currency = "EUR";
function read(): Currency {
  try { const v = localStorage.getItem(CUR_KEY); return CURRENCIES.includes(v as Currency) ? (v as Currency) : "EUR"; } catch { return "EUR"; }
}
export function setCurrency(c: Currency) {
  current = c;
  try { localStorage.setItem(CUR_KEY, c); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}
export function useCurrency(): Currency {
  return useSyncExternalStore(
    (l) => { listeners.add(l); current = read(); return () => listeners.delete(l); },
    () => current,
    () => "EUR",
  );
}

function readCache(): { rates: Rates; at: number } | null {
  try { const c = JSON.parse(localStorage.getItem(RATE_KEY) || "null"); return c && isValidRates(c.rates) ? c : null; } catch { return null; }
}

/** EUR→USD/GBP rates from the ECB via Frankfurter (no key), cached 12h; stale cache on failure. */
export function useRates(): Rates | null {
  const [rates, setRates] = useState<Rates | null>(null);
  useEffect(() => {
    const cached = readCache();
    if (cached) setRates(cached.rates);
    if (cached && Date.now() - cached.at < TTL) return;
    let alive = true;
    fetch("https://api.frankfurter.dev/v1/latest?base=EUR&symbols=USD,GBP")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((j) => {
        const next = { USD: j?.rates?.USD, GBP: j?.rates?.GBP, date: String(j?.date ?? "") };
        if (!isValidRates(next)) return;
        try { localStorage.setItem(RATE_KEY, JSON.stringify({ rates: next, at: Date.now() })); } catch { /* ignore */ }
        if (alive) setRates(next);
      })
      .catch(() => { /* keep cached rates or EUR fallback */ });
    return () => { alive = false; };
  }, []);
  return rates;
}
