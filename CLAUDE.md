@AGENTS.md

# Agro Transparente — project notes

## Stack
- Next.js 16 (App Router), React 19, TypeScript.
- Prisma 7 with `@prisma/adapter-pg` (driver adapter, not the default Prisma engine). `DATABASE_URL` points at Neon Postgres.
- Auth: NextAuth v5 (Credentials provider, JWT sessions). Admin flag (`isAdmin`) gates cross-empresa access; non-admins are scoped to companies via `UsuarioEmpresa`.
- UI: Tailwind v4 + shadcn/radix-ui components in `src/components/ui`. Theme tokens (colors, font) live in `src/app/globals.css` — primary palette is green (oklch), font is Plus Jakarta Sans.
- Forms: react-hook-form + zod, schemas in `src/schemas`.
- Server actions in `src/actions/*.actions.ts` are the only way the UI mutates data — no client-side fetch to hand-rolled API routes for CRUD.

## Multi-tenant / empresa scoping
Almost every query must be scoped to the active empresa (`getEmpresaAtiva()` from `src/lib/session.ts`, backed by a cookie) or explicitly checked with `requireEmpresaAccess(empresaId)` / `requireAdmin()` from `src/lib/authorization.ts`. When adding a new entity or action, follow the existing pattern in `producao.actions.ts` / `produto.actions.ts`: resolve the owning empresa, call `requireEmpresaAccess`, then perform the query.

## Audit log
Every create/update/delete server action, plus login/logout/failed-login, is recorded in the `AuditLog` model (`audit_log` table). Wiring pattern:
- `src/lib/audit.ts` exports `registrarLog({ acao, entidade, entidadeId, detalhes })` — pulls the current session automatically, so call it *after* the mutation succeeds, inside the action.
- Login/logout events are recorded directly in `src/lib/auth.ts` (via the `events.signIn` callback and inside `authorize()` for failures) and in `src/actions/auth-logout.action.ts`, since a normal session isn't reliably available at those points.
- `acao` is one of: `criar`, `atualizar`, `excluir`, `login`, `logout`, `login_falhou`. `entidade` is a lowercase noun (`empresa`, `produto`, `producao`, `aplicacao`, `usuario`, `auth`).
- Viewable at `/logs` (admin-only), with search by email and filters by ação/entidade, backend-paginated.
- When adding a new mutating action, add a `registrarLog` call following the existing examples — don't let an action silently skip the audit trail.

## List pages: search, filters, pagination
Produtos, produções, usuários and logs all follow the same pattern (see `src/app/(app)/produtos/page.tsx` as the reference): the page is a Server Component reading `searchParams`, building a Prisma `where`, and doing real `skip`/`take` pagination — no client-side/in-memory filtering. Reusable pieces:
- `src/components/search-input.tsx` — debounced text search bound to the `q` query param.
- `src/components/select-filter.tsx` — dropdown filter bound to an arbitrary query param.
- `src/components/ui/pagination-bar.tsx` — prev/next + page count, built from a `buildHref(page)` callback the page provides.
- `src/components/clickable-table-row.tsx` — makes a whole table row navigate to a detail/edit page; wrap any interactive cell content (delete buttons, etc.) in `src/components/stop-propagation.tsx` so it doesn't also trigger row navigation.

## Loading states
Every route has a `loading.tsx` using `src/components/table-skeleton.tsx` or `src/components/form-skeleton.tsx` (or a bespoke skeleton, e.g. the dashboard) — this project intentionally always shows a skeleton instead of a blank screen during navigation/data fetching, since queries can be slow.

## Known gotcha
`?schema=` in `DATABASE_URL` is ignored at runtime by `@prisma/adapter-pg` — pass `{ schema }` explicitly in the adapter config if you ever need a non-default Postgres schema, otherwise writes silently land in the wrong schema.

