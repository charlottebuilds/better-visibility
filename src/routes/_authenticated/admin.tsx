import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AdminShell } from "@/components/cms/AdminShell";
export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Blogverwaltung – Better Visibility" },
      { name: "description", content: "Beiträge, Übersetzungen und Veröffentlichungen verwalten." },
      { property: "og:title", content: "Blogverwaltung – Better Visibility" },
      { property: "og:description", content: "Geschütztes Content-Management-System." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AdminShell>
      <Outlet />
    </AdminShell>
  ),
});
