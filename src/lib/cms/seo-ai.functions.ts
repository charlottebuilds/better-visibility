import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateSeoGeoTips } from "./seo-ai.server";

export const analyzeSeoGeo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { text: string; keyword: string }) =>
    z
      .object({ text: z.string().trim().min(100).max(60000), keyword: z.string().max(120) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc("cms_is_admin");
    if (!admin) throw new Error("Keine Administratorrechte.");
    return { result: await generateSeoGeoTips(data) };
  });
