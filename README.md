# SIGLA — ሲግላ

SIGLA is an agricultural supply and demand marketplace for Android and web. It connects people who have agricultural products with people who need them through a moderated feed and manually verified Telebirr payments.

## Stack

- Expo Router + React Native + TypeScript + NativeWind
- Firebase Authentication (email/password and Google sign-in)
- Firebase Firestore (users, posts, payments, notifications, and platform settings)
- English and Amharic localization

## Development

```bash
pnpm install
pnpm check
pnpm lint
CI=1 pnpm test
pnpm dev
```

`pnpm dev` starts the API and Expo Web/Metro together. The app uses the SIGLA Firebase project configuration in `lib/firebase.ts`.

## Firebase setup

1. Enable **Email/Password** and **Google** under Firebase Console → Authentication → Sign-in method.
2. Add deployed web hostnames under Authentication → Settings → Authorized domains.
3. Create a Firestore database and deploy `firestore.rules` and `firestore.indexes.json` with the Firebase CLI.
4. The app creates user profiles in the `users` collection on signup or first Google sign-in. Platform settings live at `settings/platform`.

The client uses Firebase Auth and Firestore. Listing images are encoded as small data URLs and saved in each post's `imageUrls` field so the app works on Firebase's free Spark tier without requiring Firebase Storage billing. Images larger than the Firestore-safe limit are rejected with a smaller-image message.

## Seed an administrator

Keep the supplied Firebase Admin service-account JSON outside the repository. The seed script uses `FIREBASE_SERVICE_ACCOUNT` or the attached local path by default:

```bash
ADMIN_PASSWORD='use-a-temporary-password' pnpm seed:admin -- admin@example.com
```

If the Auth account already exists, the script promotes it. If it does not exist, `ADMIN_PASSWORD` is required to create it. The script sets the `admin` custom claim and writes `role: "ADMIN"`, `status: "ACTIVE"` to Firestore. Never commit the JSON key or an admin password.

## Security

Firestore rules require Firebase Auth for private data and the `admin: true` custom claim for moderation, payment review, and settings writes. After seeding an admin, sign out and back in so Firebase refreshes the ID token claims.

## Validation

```bash
pnpm check
pnpm lint
CI=1 pnpm test
```
