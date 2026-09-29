# SIGLA — ሲግላ

SIGLA is an agricultural supply and demand marketplace for Android. It connects people who **have** agricultural products with people who **need** them, using a moderated feed and direct contact options. The first release does not take commission from the underlying transaction. It uses manually verified Telebirr references for registration and posting fees.

## Stack

- Expo Router + React Native + TypeScript + NativeWind
- Managed Mobile runtime: Expo Web/Metro on `8081`, API on `3000`
- Supabase target backend: Auth, Postgres/RLS, Storage, Edge Functions/server logic
- English and Amharic localization

Supabase is used instead of the Firebase architecture in the original product brief because Supabase is the configured backend available in this session. The domain states and collection concepts are preserved in relational form; see [`documentation.md`](./documentation.md).

## Development

```bash
pnpm install
pnpm check
pnpm lint
CI=1 pnpm test
pnpm dev
```

`pnpm dev` starts the API and Expo Web/Metro together. The managed starter requires both port `3000` and port `8081` to be available before Preview is ready.

## Environment

Copy `.env.example` to a local environment file. Only the Supabase project URL and publishable/anon key belong in the mobile bundle. Service-role keys, signing secrets, and privileged credentials must remain server-side and must never be committed.

A Supabase project must be selected before migrations or live Auth/Storage work. The session currently sees two inactive projects that are not clearly SIGLA-specific; no project is restored or modified implicitly.

## Testing

The foundation phase uses TypeScript, Expo lint, and Vitest. Backend/RLS, payment-state, moderation, and end-to-end tests will be added as the Supabase phases are implemented. Expo Web checks do not prove native-only notifications, camera, or Android build behavior.

## Build handoff

Android APK/AAB artifacts are prepared through the managed Dashboard build action after the source is checkpointed. Release artifacts are not claimed until the managed build returns an actual result.
