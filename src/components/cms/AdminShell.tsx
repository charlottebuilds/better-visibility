import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { FileText, Tag, UserRound, LogOut, ArrowUpRight, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
export function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await router.invalidate();
    await navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link to="/admin" className="font-display text-lg font-bold">
            better<span className="text-gradient">visibility</span>
            <span className="ml-3 text-xs font-normal text-muted-foreground">CMS</span>
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="ghost">
              <Link to="/{-$locale}" params={{ locale: undefined }}>
                <ArrowUpRight />
                Website
              </Link>
            </Button>
            <Button variant="ghost" onClick={signOut}>
              <LogOut />
              Abmelden
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl md:grid-cols-[180px_minmax(0,1fr)]">
        <nav
          aria-label="Blogverwaltung"
          className="flex gap-1 overflow-auto border-b border-border p-4 md:flex-col md:border-r md:border-b-0"
        >
          <Button asChild variant="ghost" className="justify-start">
            <Link to="/admin">
              <FileText />
              Beiträge
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start">
            <Link to="/admin/categories">
              <Tag />
              Kategorien
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start">
            <Link to="/admin/ki-optimierung">
              <Sparkles />
              KI-Optimierung
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start">
            <Link to="/admin/profile">
              <UserRound />
              Profil & Team
            </Link>
          </Button>
        </nav>
        <main className="min-w-0 px-5 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
