import { describe, it, expect } from "vitest";
import { BASE_PRICES_EUR, convertPrice, roundCommercial } from "@/lib/currency";

describe("package prices", () => {
  it("EUR base prices are 999 / 1900 / 3500", () => expect([...BASE_PRICES_EUR]).toEqual([999, 1900, 3500]));
  it("EUR stays unchanged regardless of rates", () => expect(convertPrice(1900, "EUR", { USD: 1.1, GBP: 0.85, date: "" })).toEqual({ amount: 1900, currency: "EUR" }));
  it("converts and rounds USD", () => expect(convertPrice(3500, "USD", { USD: 1.083, GBP: 0.85, date: "" })).toEqual({ amount: 3800, currency: "USD" }));
  it("falls back to EUR without rates", () => expect(convertPrice(999, "GBP", null)).toEqual({ amount: 999, currency: "EUR" }));
  it("rounds amounts above 1000 to 50", () => expect(roundCommercial(1082)).toBe(1100));
});
