# SIGLA backend documentation

## Backend contract

| Area | Firebase implementation |
| --- | --- |
| Identity | Firebase Authentication; Firebase UID is the document owner key |
| Profiles | `users/{uid}` |
| Marketplace | `posts/{postId}` |
| Payments | `payments/{paymentId}` |
| Notifications | `notifications/{notificationId}` |
| Settings | `settings/platform` |
| Authorization | Firestore Security Rules plus the Firebase Admin `admin` custom claim |

## Document conventions

Posts use camelCase fields such as `userId`, `productName`, `locationLabel`, `imageUrls`, `createdAt`, and `status`. Payments use `transactionReference`, `senderPhone`, `submittedAt`, and `status`. Server timestamps are used for mutable audit fields.

## Admin workflow

Run `pnpm seed:admin -- <email>` with the Firebase Admin service-account key supplied through `FIREBASE_SERVICE_ACCOUNT`. This sets the Auth custom claim and the matching Firestore profile. The client checks both `role === "ADMIN"` and `status === "ACTIVE"`; Firestore rules enforce the custom claim.

## Images

This migration intentionally uses Firebase Auth and Firestore only. Images selected in the listing form are previewed locally but are not uploaded or stored. A future storage provider can be added without changing the marketplace document contract.
