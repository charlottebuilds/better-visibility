import { supabase } from "@/integrations/supabase/client";
import { uploadMedia } from "./admin.functions";
export async function uploadImage(file: File) {
  if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type))
    throw new Error("Bitte JPG, PNG, WebP oder GIF wählen.");
  if (file.size > 10 * 1024 * 1024) throw new Error("Maximal 10 MB pro Bild.");
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return uploadMedia({ data: { name: file.name, type: file.type, base64 } });
}
export async function adminData() {
  const [posts, categories] = await Promise.all([
    supabase.from("blog_posts").select("*").order("modified_at", { ascending: false }),
    supabase.from("blog_categories").select("*").order("name"),
  ]);
  if (posts.error || categories.error)
    throw new Error(posts.error?.message ?? categories.error?.message);
  return { posts: posts.data ?? [], categories: categories.data ?? [] };
}
