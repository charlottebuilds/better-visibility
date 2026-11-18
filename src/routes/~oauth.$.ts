import { createFileRoute } from "@tanstack/react-router";

// Self-hosted (Cloudflare Worker) has no Lovable proxy in front of it, so the
// managed OAuth broker paths (/~oauth/*) are forwarded to Lovable's broker here.
const BROKER = "https://oauth.lovable.app";

export const Route = createFileRoute("/~oauth/$")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const url = new URL(request.url);
        return Response.redirect(`${BROKER}${url.pathname}${url.search}`, 302);
      },
    },
  },
});
