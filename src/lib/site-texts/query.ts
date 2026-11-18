import { queryOptions } from "@tanstack/react-query";
import { getSiteTexts } from "./site-texts.functions";
export const siteTextsQuery = queryOptions({ queryKey: ["site-texts"], queryFn: () => getSiteTexts(), staleTime: 60_000 });
