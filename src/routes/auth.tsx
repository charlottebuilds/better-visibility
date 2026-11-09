import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import "@lovable.dev/cloud-auth-js/styles.css";
import { Button } from "@/components/ui/button";
export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "CMS-Anmeldung – Better Visibility" },
      {
        name: "description",
        content: "Geschützte Anmeldung zur Blogverwaltung von Better Visibility.",
      },
      { property: "og:title", content: "CMS-Anmeldung – Better Visibility" },
      { property: "og:description", content: "Geschützte Blogverwaltung." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Auth,
});
function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let live = true;
    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !live) return;
      const { data: admin } = await supabase.rpc("cms_is_admin");
      if (admin) await navigate({ to: "/admin" });
      else setMessage("Angemeldet, aber noch nicht für die Blogverwaltung freigeschaltet.");
    }
    void check();
    return () => {
      live = false;
    };
  }, [navigate]);
  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: admin } = await supabase.rpc("cms_is_admin");
      if (!admin) {
        setMessage("Dein Konto hat noch keine Administratorrechte.");
        return;
      }
      await navigate({ to: "/admin" });
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Anmeldung fehlgeschlagen.");
    } finally {
      setBusy(false);
    }
  }
  async function reset() {
    if (!email) {
      setMessage("Bitte zuerst deine E-Mail-Adresse eingeben.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/reset-password",
    });
    setMessage(
      error ? error.message : "Falls das Konto existiert, erhältst du einen Link zum Zurücksetzen.",
    );
    setBusy(false);
  }
  async function social(provider: "google" | "lovable") {
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin + "/auth",
    });
    if (result.error) setMessage(result.error.message);
    if (!result.error && !result.redirected) {
      const { data: admin } = await supabase.rpc("cms_is_admin");
      if (admin) await navigate({ to: "/admin" });
      else setMessage("Dein Konto muss für die Blogverwaltung freigeschaltet werden.");
    }
  }
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link
        to="/{-$locale}"
        params={{ locale: undefined }}
        className="mb-10 font-display text-xl font-bold"
      >
        better<span className="text-gradient">visibility</span>
      </Link>
      <h1 className="text-3xl font-bold">Blogverwaltung</h1>
      <form onSubmit={login} className="mt-7 space-y-5">
        <label className="cms-label">
          E-Mail
          <input
            className="cms-input w-full"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="cms-label">
          Passwort
          <input
            className="cms-input w-full"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? "Wird geprüft …" : "Anmelden"}
        </Button>
        <Button type="button" variant="link" onClick={reset} disabled={busy} className="w-full">
          Passwort vergessen?
        </Button>
      </form>
      <div className="my-5 border-t border-border" />
      <Button className="google-auth-button" variant="outline" onClick={() => social("google")}>
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
          />
        </svg>
        Mit Google anmelden
      </Button>
      <Button className="lovable-auth-button mt-3" onClick={() => social("lovable")}>
        Sign in with Lovable
      </Button>
      {message && (
        <p role="status" className="mt-6 text-sm text-accent">
          {message}
        </p>
      )}
    </main>
  );
}
