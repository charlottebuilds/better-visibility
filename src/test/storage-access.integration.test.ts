// Run explicitly with STORAGE_AUDIT_URL and STORAGE_AUDIT_PUBLISHABLE_KEY.
// Public credentials only; no managed user session or privileged key is used.
import { describe, expect, it } from "vitest";

const url = process.env["STORAGE_AUDIT_URL"];
const key = process.env["STORAGE_AUDIT_PUBLISHABLE_KEY"];
const enabled = Boolean(url && key);
const call = async (path: string, body?: unknown, extraHeaders?: Record<string, string>) => {
  if (!url || !key) throw new Error("Public storage audit configuration missing");
  return fetch(`${url}/storage/v1/${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { apikey: key, "Content-Type": "application/json", ...extraHeaders },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
};

describe.skipIf(!enabled)("Live anonymous storage access", () => {
  it("does not enumerate private buckets", async () => {
    const response = await call("bucket");
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });
  it("does not enumerate blog objects, even by a published prefix", async () => {
    for (const prefix of ["", "legacy"]) {
      const response = await call("object/list/blog-media", { prefix, limit: 100 });
      expect(response.status).toBe(200);
      expect(await response.json()).toEqual([]);
    }
  });
  it("does not accept forged request-context headers for listing", async () => {
    const response = await call("object/list/blog-media", { prefix: "", limit: 100 }, {
      "x-http-method-override": "GET",
      "request.method": "GET",
      "request.path": "/object/info/blog-media/legacy-geo.jpg",
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([]);
  });
  it("still downloads both published reference images", async () => {
    for (const name of ["legacy-geo.jpg", "legacy-seo.jpg"]) {
      const response = await call(`object/blog-media/${name}`);
      expect(response.status).toBe(200);
      expect((await response.arrayBuffer()).byteLength).toBeGreaterThan(0);
    }
  });
});