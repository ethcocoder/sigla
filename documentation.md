# SIGLA implementation documentation

## Backend mapping

| Product brief concept | SIGLA implementation |
| --- | --- |
| Firebase Authentication | Supabase Auth; phone authentication is the target provider path |
| Firestore `users` | Supabase `profiles` table linked to `auth.users` |
| Firestore `posts` | Supabase `posts` table with enum/check constraints |
| Firebase Storage | Supabase Storage with per-user upload paths and server/client validation |
| Cloud Functions | Supabase Edge Functions, trusted RPC, and the managed API where appropriate |
| FCM + persisted notifications | Persisted `notifications` rows first; device delivery is added only when native credentials/device verification exist |
| Firebase Security Rules | Postgres Row Level Security and trusted transition functions |
| `categories`, `locations`, `settings`, `announcements`, `reports`, `auditLogs` | Same domain concepts as relational tables |

## Security principles

The client must never be trusted for role, admin status, user/post/payment status, fee values, quotas, or verification. Normal users can read approved/unexpired public posts and their own private records. Only trusted server-side paths can verify payments, activate accounts, approve posts, update fees/settings, suspend users, or write audit events.

Telebirr payment references are submitted for manual review. A reference number is not evidence of automatic verification. Every decision records the admin identity, timestamp, and relevant target.

## Phase status

- Phase 0 — COMPLETE: clean managed Expo starter inspected; no reusable source repository found.
- Phase 1 — COMPLETE: SIGLA foundation, theme, localization, reusable UI, branded assets, and demo marketplace surfaces are implemented.
- Phase 2 — IN PROGRESS: Supabase client/repository boundary and local schema/RLS migration are prepared. No project has been restored or modified because both discovered projects are inactive and their schema connections time out.
- Phases 3–21 — PENDING.

## Development data

The current feed uses clearly local `demo` records in `data/demo.ts` to make the product surface usable before a Supabase project is selected. The repository boundary automatically uses these records only when public Supabase configuration is absent. These records are not production data and must not be seeded into production. When a selected project is configured, the same feed calls bounded Supabase queries for approved and unexpired posts.

## Runtime limitations

Expo Web is the primary available validation surface in this sandbox. Native push notification delivery, camera/photo permissions, device storage, and release Android builds require a native device or the managed Dashboard build action and are not inferred from Web preview behavior.
