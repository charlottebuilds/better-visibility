<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the one-page section navigation visible at every screen size using TanStack hash links; Blog remains a separate route.
- Present extended biography and skills through the shared single-open accordion, keeping the initial About view compact.
- i18n is URL-based: pages live under src/routes/{-$locale}/ with explicit /de, /en, /es and unprefixed German fallback; texts live in src/locales/*.ts; native route head() adds self-canonical and bidirectional hreflang via seoLinks(), avoiding a competing Helmet manager.
