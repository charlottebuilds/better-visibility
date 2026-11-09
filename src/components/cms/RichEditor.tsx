import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Table, TableRow, TableHeader, TableCell } from "@tiptap/extension-table";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Node, mergeAttributes } from "@tiptap/core";
import { useEffect, useState, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link2,
  ImagePlus,
  Table2,
  Quote,
  Info,
  Undo2,
  Redo2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { uploadImage } from "@/lib/cms/browser";
import { mediaUrl } from "@/lib/cms/types";
import { supabase } from "@/integrations/supabase/client";
const InfoBox = Node.create({
  name: "infoBox",
  group: "block",
  content: "block+",
  parseHTML: () => [{ tag: 'div[data-type="info-box"]' }],
  renderHTML: ({ HTMLAttributes }) => [
    "div",
    mergeAttributes(HTMLAttributes, { "data-type": "info-box" }),
    0,
  ],
});
const Figure = Node.create({
  name: "figure",
  group: "block",
  content: "image figcaption?",
  parseHTML: () => [{ tag: "figure" }],
  renderHTML: ({ HTMLAttributes }) => ["figure", HTMLAttributes, 0],
});
const Caption = Node.create({
  name: "figcaption",
  content: "inline*",
  parseHTML: () => [{ tag: "figcaption" }],
  renderHTML: () => ["figcaption", 0],
});
const SizedImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: "100%",
        parseHTML: (e) => e.getAttribute("width"),
        renderHTML: (a) => ({ width: a["width"], style: `width:${a["width"]};max-width:100%` }),
      },
      alignment: {
        default: "left",
        parseHTML: (e) => e.style.marginLeft === "auto" ? (e.style.marginRight === "auto" ? "center" : "right") : "left",
        renderHTML: (a) => ({ style: `display:block;margin-left:${a["alignment"] === "left" ? "0" : "auto"};margin-right:${a["alignment"] === "right" ? "0" : "auto"}` }),
      },
    };
  },
});
export function RichEditor({
  content,
  onChange,
  posts,
}: {
  content: string;
  onChange: (value: string) => void;
  posts: { title: string; slug: string; locale: string }[];
}) {
  const [dialog, setDialog] = useState<"link" | "image" | null>(null);
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");
  const [newTab, setNewTab] = useState(false);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [width, setWidth] = useState("100%");
  const [alignment, setAlignment] = useState("left");
  const [path, setPath] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const [, redraw] = useState(0);
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      SizedImage.configure({ inline: false }),
      Figure,
      Caption,
      InfoBox,
      Placeholder.configure({ placeholder: "Hier beginnt dein Beitrag …" }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onSelectionUpdate: () => redraw((n) => n + 1),
  });
  useEffect(() => {
    if (!editor) return;
    let live = true;
    const resolveImages = () => {
      editor.view.dom.querySelectorAll<HTMLImageElement>('img').forEach(async (img) => {
        const url = new URL(img.src, window.location.origin);
        const file = url.pathname === '/api/public/blog-media' ? url.searchParams.get('path') : null;
        if (!file) return;
        const { data } = await supabase.storage.from('blog-media').createSignedUrl(file, 3600);
        if (live && data) img.src = data.signedUrl;
      });
    };
    resolveImages();
    editor.on('update', resolveImages);
    return () => { live = false; editor.off('update', resolveImages); };
  }, [editor]);
  useEffect(() => {
    if (editor && editor.getHTML() !== content && !editor.isFocused)
      editor.commands.setContent(content, { emitUpdate: false });
  }, [content, editor]);
  if (!editor) return <p className="py-8 text-muted-foreground">Editor wird geladen …</p>;
  const tools = [
    {
      label: "Fett",
      icon: Bold,
      active: editor.isActive("bold"),
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      label: "Kursiv",
      icon: Italic,
      active: editor.isActive("italic"),
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      label: "Unterstrichen",
      icon: Underline,
      active: editor.isActive("underline"),
      run: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      label: "Aufzählung",
      icon: List,
      active: editor.isActive("bulletList"),
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Nummerierte Liste",
      icon: ListOrdered,
      active: editor.isActive("orderedList"),
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      label: "Linksbündig",
      icon: AlignLeft,
      run: () => editor.chain().focus().setTextAlign("left").run(),
    },
    {
      label: "Zentriert",
      icon: AlignCenter,
      run: () => editor.chain().focus().setTextAlign("center").run(),
    },
    {
      label: "Rechtsbündig",
      icon: AlignRight,
      run: () => editor.chain().focus().setTextAlign("right").run(),
    },
    {
      label: "Link einfügen",
      icon: Link2,
      run: () => {
        setUrl(editor.getAttributes("link")["href"] ?? "");
        setLabel("");
        setDialog("link");
      },
    },
    {
      label: "Bild einfügen oder bearbeiten",
      icon: ImagePlus,
      run: () => {
        const a = editor.getAttributes("image");
        setAlt(a["alt"] ?? "");
        setWidth(a["width"] ?? "100%");
        setAlignment(a["alignment"] ?? "left");
        setPath(a["src"] ?? "");
        setCaption("");
        setDialog("image");
      },
    },
    {
      label: "Tabelle einfügen",
      icon: Table2,
      run: () =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    { label: "Zitat", icon: Quote, run: () => editor.chain().focus().toggleBlockquote().run() },
    {
      label: "Infobox",
      icon: Info,
      run: () =>
        editor
          .chain()
          .focus()
          .insertContent({
            type: "infoBox",
            content: [
              {
                type: "heading",
                attrs: { level: 3 },
                content: [{ type: "text", text: "Hinweis" }],
              },
              { type: "paragraph", content: [{ type: "text", text: "Dein Hinweistext" }] },
            ],
          })
          .run(),
    },
    { label: "Rückgängig", icon: Undo2, run: () => editor.chain().focus().undo().run() },
    { label: "Wiederholen", icon: Redo2, run: () => editor.chain().focus().redo().run() },
  ];
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-border bg-card p-2">
        <select
          aria-label="Textformat"
          className="cms-input max-w-44 text-xs"
          value={
            editor.isActive("heading") ? String(editor.getAttributes("heading")["level"]) : "p"
          }
          onChange={(e) => {
            const value = e.target.value;
            if (value === "p") editor.chain().focus().setParagraph().run();
            else
              editor
                .chain()
                .focus()
                .toggleHeading({ level: Number(value) as 2 | 3 | 4 })
                .run();
            redraw((n) => n + 1);
          }}
        >
          <option value="p">Absatz</option>
          <option value="2">H2 – Überschrift</option>
          <option value="3">H3 – Überschrift</option>
          <option value="4">H4 – Überschrift</option>
        </select>
        <span
          title="Der Beitragstitel ist die einzige H1"
          className="px-2 text-xs text-muted-foreground"
        >
          H1: Titel
        </span>
        {tools.map(({ label, icon: Icon, active, run }) => (
          <Button
            key={label}
            size="icon"
            variant={active ? "secondary" : "ghost"}
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={run}
            type="button"
          >
            <Icon />
          </Button>
        ))}
      </div>
      {editor.isActive("table") && (
        <div className="flex flex-wrap gap-1 border-b border-border p-2">
          {[
            ["Zeile +", () => editor.chain().focus().addRowAfter().run()],
            ["Zeile −", () => editor.chain().focus().deleteRow().run()],
            ["Spalte +", () => editor.chain().focus().addColumnAfter().run()],
            ["Spalte −", () => editor.chain().focus().deleteColumn().run()],
            ["Kopfzeile", () => editor.chain().focus().toggleHeaderRow().run()],
            ["Tabelle löschen", () => editor.chain().focus().deleteTable().run()],
          ].map(([label, run]) => (
            <Button
              key={String(label)}
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                if (typeof run === "function") run();
              }}
            >
              {String(label)}
            </Button>
          ))}
        </div>
      )}
      {editor.isActive("image") && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => editor.chain().focus().deleteSelection().run()}
        >
          <Trash2 />
          Bild entfernen
        </Button>
      )}
      <EditorContent editor={editor} className="cms-content cms-editor" />
      {dialog && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={dialog === "link" ? "Link bearbeiten" : "Bild bearbeiten"}
          className="cms-dialog-backdrop"
        >
          <div className="cms-dialog">
            <h2 className="text-xl font-bold">
              {dialog === "link" ? "Link bearbeiten" : "Bild bearbeiten"}
            </h2>
            {dialog === "link" ? (
              <div className="mt-5 space-y-4">
                <label className="cms-label">
                  URL
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="cms-input w-full"
                  />
                </label>
                <label className="cms-label">
                  Interne Seite oder Beitrag
                  <input
                    aria-label="Interne Beiträge suchen"
                    placeholder="Beitrag suchen"
                    className="cms-input w-full"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                  />
                </label>
                <select
                  aria-label="Internes Linkziel"
                  className="cms-input w-full"
                  onChange={(e) => setUrl(e.target.value)}
                  defaultValue=""
                >
                  <option value="">Linkziel auswählen</option>
                  <option value="/">Startseite</option>
                  <option value="/de/blog">Blog</option>
                  <option value="/de/impressum">Impressum</option>
                  <option value="/de/datenschutz">Datenschutz</option>
                  {posts
                    .filter((p) => p.title.toLowerCase().includes(label.toLowerCase()))
                    .map((p) => (
                      <option key={p.locale + p.slug} value={`/${p.locale}/blog/${p.slug}`}>
                        {p.title} ({p.locale})
                      </option>
                    ))}
                </select>
                <label className="cms-label">
                  Linktext (optional)
                  <input
                    aria-label="Linktext"
                    className="cms-input w-full"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newTab}
                    onChange={(e) => setNewTab(e.target.checked)}
                  />
                  In neuem Tab öffnen
                </label>
              </div>
            ) : (
              <div className="mt-5 space-y-4">
                <input
                  ref={input}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  aria-label="Bilddatei"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setBusy(true);
                    try {
                      const uploaded = await uploadImage(file);
                      setPath(mediaUrl(uploaded.path));
                    } catch (e) {
                      setError(e instanceof Error ? e.message : "Upload fehlgeschlagen.");
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
                <label className="cms-label">
                  ALT-Text
                  <input
                    className="cms-input w-full"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                  />
                </label>
                <label className="cms-label">
                  Bildunterschrift
                  <input
                    className="cms-input w-full"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </label>
                <label className="cms-label">
                  Breite
                  <select
                    className="cms-input w-full"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  >
                    <option value="100%">100 %</option>
                    <option value="75%">75 %</option>
                    <option value="50%">50 %</option>
                    <option value="25%">25 %</option>
                  </select>
                </label>
                <label className="cms-label">Bildausrichtung
                  <select className="cms-input w-full" value={alignment} onChange={(e) => setAlignment(e.target.value)}>
                    <option value="left">Links</option><option value="center">Mittig</option><option value="right">Rechts</option>
                  </select>
                </label>
              </div>
            )}
            {error && (
              <p role="alert" className="mt-4 text-accent">
                {error}
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDialog(null);
                  setCaption("");
                  setError("");
                }}
              >
                Abbrechen
              </Button>
              {dialog === "link" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    editor.chain().focus().unsetLink().run();
                    setDialog(null);
                  }}
                >
                  Link entfernen
                </Button>
              )}
              <Button
                type="button"
                disabled={busy}
                onClick={() => {
                  if (dialog === "link") {
                    if (!/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(url)) {
                      setError("Bitte eine gültige URL eingeben.");
                      return;
                    }
                    if (caption) {
                      editor
                        .chain()
                        .focus()
                        .insertContent({
                          type: "text",
                          text: caption,
                          marks: [
                            {
                              type: "link",
                              attrs: { href: url, target: newTab ? "_blank" : null },
                            },
                          ],
                        })
                        .run();
                    } else
                      editor
                        .chain()
                        .focus()
                        .extendMarkRange("link")
                        .setLink({ href: url, target: newTab ? "_blank" : null })
                        .run();
                  } else {
                    if (!path || !alt.trim()) {
                      setError("Bitte ein Bild und ALT-Text hinzufügen.");
                      return;
                    }
                    if (editor.isActive("image"))
                      editor
                        .chain()
                        .focus()
                        .updateAttributes("image", { src: path, alt, width, alignment })
                        .run();
                    else
                      editor
                        .chain()
                        .focus()
                        .insertContent({
                          type: "figure",
                          content: [
                            { type: "image", attrs: { src: path, alt, width, alignment } },
                            ...(caption
                              ? [{ type: "figcaption", content: [{ type: "text", text: caption }] }]
                              : []),
                          ],
                        })
                        .run();
                  }
                  setDialog(null);
                  setCaption("");
                  setError("");
                }}
              >
                Übernehmen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
