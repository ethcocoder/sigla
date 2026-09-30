# Changelog

## Firebase migration

- Replaced the data layer with Firebase Firestore collections for profiles, listings, payments, notifications, and platform settings.
- Kept Firebase Authentication for email/password and Google sign-in.
- Added Firestore security rules and indexes.
- Added a Firebase Admin SDK seed command for administrator custom claims and profiles.
- Removed the previous hosted database client and storage integration.
