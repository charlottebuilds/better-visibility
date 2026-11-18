import { describe, expect, it } from "vitest";
import { areaForPath, canAccess, normalizePermissions } from "@/lib/cms/access";

describe("CMS-Berechtigungen", () => {
  it("Administratoren dürfen jeden Bereich", () => {
    expect(canAccess({ role: "admin", permissions: [] }, "texts")).toBe(true);
  });
  it("Redakteure dürfen nur freigegebene Bereiche", () => {
    const editor = { role: "editor" as const, permissions: ["posts"] };
    expect(canAccess(editor, "posts")).toBe(true);
    expect(canAccess(editor, "texts")).toBe(false);
  });
  it("Ohne Teamzugang gibt es keinen Zugriff", () => {
    expect(canAccess(null, "posts")).toBe(false);
  });
  it("Unbekannte Bereiche werden verworfen", () => {
    expect(normalizePermissions("editor", ["posts", "team", "posts"])).toEqual(["posts"]);
  });
  it("Profil ist für alle Teammitglieder offen, Seitentexte nur mit Freigabe", () => {
    expect(areaForPath("/admin/profile/")).toBeNull();
    expect(areaForPath("/admin/texte/")).toBe("texts");
    expect(areaForPath("/admin/edit/abc/")).toBe("posts");
  });
});
