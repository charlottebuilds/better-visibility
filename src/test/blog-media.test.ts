import { beforeEach, describe, expect, it, vi } from "vitest";
import { Blob } from "node:buffer";

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), download: vi.fn(), createClient: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (options: unknown) => options }));
vi.mock("@supabase/supabase-js", () => ({ createClient: mocks.createClient }));
import { Route } from "@/routes/api.public.blog-media";

const get = (Route as unknown as { server: { handlers: { GET: (input: { request: Request }) => Promise<Response> } } }).server.handlers.GET;
const request = (path: string, headers?: HeadersInit) => get({ request: new Request(`https://better-visibility.com/api/public/blog-media?path=${encodeURIComponent(path)}`, headers ? { headers } : {}) });

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("SUPABASE_URL", "https://storage.example.test");
  vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  vi.stubEnv("SUPABASE_SECRET_KEY", "");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
  mocks.createClient.mockReturnValue({ rpc: mocks.rpc, storage: { from: () => ({ download: mocks.download }) } });
  mocks.rpc.mockResolvedValue({ data: true, error: null });
  mocks.download.mockResolvedValue({ data: new Blob(["image"], { type: "image/jpeg" }), error: null });
});

describe("Public blog media", () => {
  it("downloads published images using only the publishable key", async () => {
    const response = await request("cover.jpg");
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("image");
    expect(mocks.createClient.mock.calls[0]?.slice(0, 2)).toEqual(["https://storage.example.test", "sb_publishable_test"]);
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=300, s-maxage=1800, stale-while-revalidate=30");
  });
  it("does not download unreferenced private files", async () => {
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    expect((await request("draft.jpg")).status).toBe(404);
    expect(mocks.download).not.toHaveBeenCalled();
  });
  it("rejects traversal paths before storage access", async () => {
    expect((await request("../draft.jpg")).status).toBe(404);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it("does not cache a deleted storage object", async () => {
    mocks.download.mockResolvedValue({ data: null, error: { message: "not found" } });
    const response = await request("deleted.jpg");
    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it("rechecks publication before responding to a cached ETag", async () => {
    const first = await request("cover.jpg");
    const etag = first.headers.get("ETag") ?? "";
    expect((await request("cover.jpg", { "If-None-Match": etag })).status).toBe(304);
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    expect((await request("cover.jpg", { "If-None-Match": etag })).status).toBe(404);
  });
});