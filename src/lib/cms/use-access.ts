import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CmsRole } from "./access";

export function useCmsAccess() {
  return useQuery({
    queryKey: ["cms-access"],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("user_roles")
        .select("role, permissions")
        .eq("user_id", user.id)
        .maybeSingle();
      return data ? { role: data.role as CmsRole, permissions: data.permissions } : null;
    },
  });
}
