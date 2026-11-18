import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { uploadImage } from "@/lib/cms/browser";
import {
  manageUser,
  listTeam,
  removeTeamMember,
  updateTeamMember,
} from "@/lib/cms/admin.functions";
import { AREA_LABELS, CMS_AREAS, type CmsArea, type CmsRole } from "@/lib/cms/access";
import { useCmsAccess } from "@/lib/cms/use-access";
import { Button } from "@/components/ui/button";
import { AuthorBioEditor } from "@/components/cms/AuthorBioEditor";
import { canAccess } from "@/lib/cms/access";
export const Route = createFileRoute("/_authenticated/admin/profile")({
  head: () => ({
    meta: [
      { title: "Profil und Team – Better Visibility CMS" },
      { name: "description", content: "Nutzerprofil und Administrator-Einladungen verwalten." },
      { property: "og:title", content: "Profil und Team – Better Visibility CMS" },
      {
        property: "og:description",
        content: "Nutzerprofil und Administrator-Einladungen verwalten.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Profile,
});
function Profile() {
  const [message, setMessage] = useState("");
  const [avatar, setAvatar] = useState("");
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState("");
  const access = useCmsAccess();
  const team = useQuery({
    queryKey: ["cms-team"],
    queryFn: () => listTeam(),
    enabled: access.data?.role === "admin",
  });
  const { data } = useQuery({
    queryKey: ["cms-profile"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Bitte anmelden.");
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      if (error) throw error;
      if (profile.avatar_path) {
        const { data: signed } = await supabase.storage
          .from("blog-media")
          .createSignedUrl(profile.avatar_path, 3600);
        setAvatar(signed?.signedUrl ?? "");
      }
      return profile;
    },
  });
  return (
    <>
      <h1 className="text-3xl font-bold">Profil & Team</h1>
      <form
        className="mt-8 max-w-lg space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!data) return;
          const f = new FormData(e.currentTarget);
          const { error } = await supabase
            .from("profiles")
            .update({
              display_name: String(f.get("name")),
              preferences: { language: String(f.get("language")) },
            })
            .eq("id", data.id);
          setMessage(error?.message ?? "Profil gespeichert.");
        }}
      >
        {avatar && (
          <img src={avatar} alt="Dein Profilbild" className="h-24 w-24 rounded-lg object-cover" />
        )}
        <label className="cms-label">
          Profilbild
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file || !data) return;
              try {
                const image = await uploadImage(file);
                const { error } = await supabase
                  .from("profiles")
                  .update({ avatar_path: image.path })
                  .eq("id", data.id);
                if (error) throw error;
                setAvatar(image.preview);
              } catch (e) {
                setMessage(e instanceof Error ? e.message : "Upload fehlgeschlagen.");
              }
            }}
          />
        </label>
        <label className="cms-label">
          Anzeigename
          <input
            name="name"
            key={data?.id}
            defaultValue={data?.display_name}
            className="cms-input w-full"
          />
        </label>
        <label className="cms-label">
          Bevorzugte Beitragssprache
          <select name="language" className="cms-input w-full">
            <option value="de">Deutsch</option>
            <option value="en">Englisch</option>
            <option value="es">Spanisch</option>
          </select>
        </label>
        <Button>Profil speichern</Button>
      </form>
      {access.data && canAccess(access.data, "texts") && <AuthorBioEditor />}
      {access.data?.role === "admin" ? (
        <>
          <section className="mt-12 max-w-2xl border-t border-border pt-8">
            <h2 className="text-xl font-bold">Team & Berechtigungen</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Administratoren haben vollen Zugriff inklusive Teamverwaltung. Redakteure sehen nur
              die Bereiche, die du für sie freigibst.
            </p>
            <ul className="mt-5 divide-y divide-border rounded-lg border border-border">
              {team.data?.map((m) => (
                <li key={m.id} className="space-y-4 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {m.name || m.email}
                        {m.self && <span className="ml-2 text-xs text-muted-foreground">(du)</span>}
                      </p>
                      <p className="truncate text-sm text-muted-foreground">
                        {m.email}
                        {m.pending ? " · Einladung offen" : ""}
                      </p>
                    </div>
                    {!m.self && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          if (!confirm(`${m.email} aus dem Team entfernen?`)) return;
                          try {
                            await removeTeamMember({ data: { id: m.id } });
                            setMessage("Teammitglied entfernt.");
                            await queryClient.invalidateQueries({ queryKey: ["cms-team"] });
                          } catch (e) {
                            setMessage(e instanceof Error ? e.message : "Entfernen fehlgeschlagen.");
                          }
                        }}
                      >
                        Entfernen
                      </Button>
                    )}
                  </div>
                  {m.self ? (
                    <p className="text-sm text-muted-foreground">Rolle: Administrator</p>
                  ) : (
                    <AccessEditor
                      initialRole={m.role}
                      initialPermissions={m.permissions}
                      submitLabel="Rechte speichern"
                      onSubmit={async (role, permissions) => {
                        try {
                          await updateTeamMember({ data: { id: m.id, role, permissions } });
                          setMessage(`Rechte für ${m.email} gespeichert.`);
                          await queryClient.invalidateQueries({ queryKey: ["cms-team"] });
                        } catch (e) {
                          setMessage(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
                        }
                      }}
                    />
                  )}
                </li>
              ))}
              {team.isLoading && <li className="p-4 text-sm text-muted-foreground">Lädt …</li>}
              {team.error && <li className="p-4 text-sm text-accent">{team.error.message}</li>}
            </ul>
          </section>
          <section className="mt-12 max-w-2xl border-t border-border pt-8">
            <h2 className="text-xl font-bold">Teammitglied einladen</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Die Person erhält eine E-Mail mit einem Link und sieht danach nur die freigegebenen
              Bereiche.
            </p>
            <label className="cms-label mt-5">
              E-Mail-Adresse
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="cms-input w-full"
              />
            </label>
            <div className="mt-4">
              <AccessEditor
                initialRole="editor"
                initialPermissions={["posts"]}
                submitLabel="Einladung senden"
                onSubmit={async (role, permissions) => {
                  try {
                    await manageUser({ data: { email: inviteEmail, role, permissions } });
                    setMessage("Einladung versendet.");
                    setInviteEmail("");
                    await queryClient.invalidateQueries({ queryKey: ["cms-team"] });
                  } catch (e) {
                    setMessage(e instanceof Error ? e.message : "Einladung fehlgeschlagen.");
                  }
                }}
              />
            </div>
          </section>
        </>
      ) : (
        access.data && (
          <section className="mt-12 max-w-lg border-t border-border pt-8">
            <h2 className="text-xl font-bold">Deine Berechtigungen</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Redakteur ·{" "}
              {access.data.permissions.map((a) => AREA_LABELS[a as CmsArea]).join(", ") ||
                "noch keine Bereiche freigegeben"}
            </p>
          </section>
        )
      )}
      {message && (
        <p role="status" className="mt-6 text-accent">
          {message}
        </p>
      )}
    </>
  );
}

function AccessEditor({
  initialRole,
  initialPermissions,
  submitLabel,
  onSubmit,
}: {
  initialRole: CmsRole;
  initialPermissions: CmsArea[];
  submitLabel: string;
  onSubmit: (role: CmsRole, permissions: CmsArea[]) => Promise<void>;
}) {
  const [role, setRole] = useState<CmsRole>(initialRole);
  const [permissions, setPermissions] = useState<CmsArea[]>(initialPermissions);
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-3">
      <label className="cms-label">
        Rolle
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as CmsRole)}
          className="cms-input w-full"
        >
          <option value="editor">Redakteur – nur freigegebene Bereiche</option>
          <option value="admin">Administrator – voller Zugriff inkl. Team</option>
        </select>
      </label>
      {role === "editor" && (
        <fieldset className="flex flex-wrap gap-x-5 gap-y-2">
          <legend className="mb-2 text-sm font-medium">Zugriff auf</legend>
          {CMS_AREAS.map((a) => (
            <label key={a} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={permissions.includes(a)}
                onChange={(e) =>
                  setPermissions((p) => (e.target.checked ? [...p, a] : p.filter((x) => x !== a)))
                }
              />
              {AREA_LABELS[a]}
            </label>
          ))}
        </fieldset>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          await onSubmit(role, permissions);
          setBusy(false);
        }}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
