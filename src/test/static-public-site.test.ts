import { describe, expect, it, vi } from "vitest";
import { PUBLIC_CMS_ENABLED } from "@/lib/public-site";

const cms = vi.hoisted(() => ({ blog: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/cms/public.functions", () => ({
  getPublicBlog: cms.blog,
  getPublicRedirect: cms.redirect,
}));
import { getWebsiteBlog, getWebsiteRedirect } from "@/lib/cms/website-data";

describe("Public blog enabled", () => {
  it("enables the public CMS", () => {
    expect(PUBLIC_CMS_ENABLED).toBe(true);
  });
});
