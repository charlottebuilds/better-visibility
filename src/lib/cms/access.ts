export const CMS_AREAS = ["posts", "texts", "categories", "ai"] as const;
export type CmsArea = (typeof CMS_AREAS)[number];
export type CmsRole = "admin" | "editor";

export const AREA_LABELS: Record<CmsArea, string> = {
  posts: "Beiträge",
  texts: "Seitentexte",
  categories: "Kategorien",
  ai: "KI-Optimierung",
};

/** Admins implicitly hold every area; editors keep only valid, de-duplicated areas. */
export function normalizePermissions(role: CmsRole, permissions: readonly string[]): CmsArea[] {
  if (role === "admin") return [];
  return CMS_AREAS.filter((a) => permissions.includes(a));
}

export function canAccess(
  access: { role: CmsRole; permissions: readonly string[] } | null | undefined,
  area: CmsArea,
): boolean {
  if (!access) return false;
  return access.role === "admin" || access.permissions.includes(area);
}

/** Which dashboard area a CMS path belongs to; null = open to every team member. */
export function areaForPath(pathname: string): CmsArea | null {
  if (pathname.startsWith("/admin/texte")) return "texts";
  if (pathname.startsWith("/admin/categories")) return "categories";
  if (pathname.startsWith("/admin/ki-optimierung")) return "ai";
  if (pathname.startsWith("/admin/profile")) return null;
  return "posts";
}
