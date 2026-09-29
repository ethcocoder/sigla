# SIGLA — ሲግላ

SIGLA is an agricultural supply and demand marketplace for Android. It connects people who **have** agricultural products with people who **need** them, using a moderated feed and direct contact options. The first release does not take commission from the underlying transaction. It uses manually verified Telebirr references for registration and posting fees.

## Stack

- Expo Router + React Native + TypeScript + NativeWind
- Managed Mobile runtime: Expo Web/Metro on `8081`, API on `3000`
- Firebase Authentication: email/password and Google sign-in
- Supabase target backend: Postgres/RLS, Storage, Edge Functions/server logic
- English and Amharic localization

Firebase is used for client authentication while Supabase remains the data backend. The domain states and collection concepts are preserved in relational form; see [`documentation.md`](./documentation.md). Private Supabase writes still require the server-side Firebase-token bridge described below.

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

Copy `.env.example` to a local environment file. The Firebase web configuration and Supabase URL/publishable key are client-safe values. Firebase service-account credentials, Supabase service-role keys, signing secrets, and privileged credentials must remain server-side and must never be committed.

The connected SIGLA Supabase project is configured through the local environment and is the source of truth for Auth, Postgres/RLS, and Storage. Keep the publishable key in local or deployment environment settings only.

## Testing

The foundation phase uses TypeScript, Expo lint, and Vitest. Backend/RLS, payment-state, moderation, and end-to-end tests will be added as the Supabase phases are implemented. Expo Web checks do not prove native-only notifications, camera, or Android build behavior.

## Build handoff

Android APK/AAB artifacts are prepared through the managed Dashboard build action after the source is checkpointed. Release artifacts are not claimed until the managed build returns an actual result.

## Firebase authentication

Email/password and Google authentication are wired through Firebase Auth. Enable **Email/Password** and **Google** under Firebase Console → Authentication → Sign-in method, and add the deployed web hostname under Authorized domains.

Supabase RLS still protects private profiles, listings, payments, and notifications with `auth.uid()`. To enable those protected operations for Firebase users in production, configure a server-side Firebase Admin credential and Supabase service-role key, then route private operations through the server bridge. The client must not receive either secret.
