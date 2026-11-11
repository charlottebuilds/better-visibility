import { describe, expect, it, vi } from "vitest";
import { PUBLIC_CMS_ENABLED } from "@/lib/public-site";

const cms = vi.hoisted(() => ({ blog: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/cms/public.functions", () => ({
  getPublicBlog: cms.blog,
  getPublicRedirect: cms.redirect,
}));
import { getWebsiteBlog, getWebsiteRedirect } from "@/lib/cms/website-data";

describe("Temporary static public website", () => {
  it("disables the public CMS during temporary static deployment", () => {
    expect(PUBLIC_CMS_ENABLED).toBe(false);
  });

  it("returns empty public blog data without calling the CMS in any locale", async () => {
    for (const locale of [undefined, "de", "en", "es"]) {
      expect(await getWebsiteBlog({ data: locale ? { locale } : {} })).toEqual({ posts: [], categories: [] });
    }
    expect(cms.blog).not.toHaveBeenCalled();
  });

  it("never requests CMS slug redirects", async () => {
    expect(await getWebsiteRedirect({ data: { locale: "de", slug: "was-ist-geo" } })).toBeNull();
    expect(cms.redirect).not.toHaveBeenCalled();
  });
});