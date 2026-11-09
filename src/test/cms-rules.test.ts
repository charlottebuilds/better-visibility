import { describe, it, expect } from "vitest";
import { effectiveStatus, publicationDates } from "@/lib/cms/types";
import { cleanContent } from "@/lib/cms/admin.functions";
describe("CMS publication rules", () => {
  it("publishes a scheduled post exactly when its timestamp is reached", () => {
    expect(
      effectiveStatus(
        { status: "scheduled", scheduled_at: "2026-11-09T12:00:00Z" },
        Date.parse("2026-11-09T12:00:00Z"),
      ),
    ).toBe("published");
    expect(
      effectiveStatus(
        { status: "scheduled", scheduled_at: "2026-11-09T12:00:00Z" },
        Date.parse("2026-11-09T11:59:59Z"),
      ),
    ).toBe("scheduled");
  });
  it("never overwrites the original publication date", () => {
    expect(
      publicationDates(
        {
          published_at: "2026-11-08T12:00:00Z",
          original_published_at: "2026-11-01T12:00:00Z",
          updated_at: null,
          published_snapshot: {},
        },
        "2026-11-09T12:00:00Z",
      ).original_published_at,
    ).toBe("2026-11-01T12:00:00Z");
  });
  it("updates the modification date when republishing content", () => {
    expect(
      publicationDates(
        {
          published_at: "2026-11-01T12:00:00Z",
          original_published_at: "2026-11-01T12:00:00Z",
          updated_at: null,
          published_snapshot: {},
        },
        "2026-11-09T12:00:00Z",
      ).updated_at,
    ).toBe("2026-11-09T12:00:00Z");
  });
  it("keeps article title as the only H1", () => {
    expect(cleanContent("<h1>Body heading</h1>")).toBe("<h2>Body heading</h2>");
  });
  it("removes executable content and unsafe link schemes", () => {
    const html = cleanContent(
      '<script>alert(1)</script><a href="javascript:alert(1)">x</a><img src="x" onerror="alert(1)" />',
    );
    expect(html).not.toContain("<script");
    expect(html).not.toContain("javascript:");
    expect(html).not.toContain("onerror");
  });
});
