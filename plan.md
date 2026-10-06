# SIGLA full-layout redesign

## Product understanding

SIGLA is an agricultural-supplies marketplace for herbicides, pesticides, fertilizers, seeds, and equipment. The supplied references represent the signed-in product experience, not the login page.

## Reference-aligned decisions

- **Design movement:** utility-first Android marketplace UI, adapted from the supplied reference screens.
- **Core principles:** dense information, fast scanning, bright blue navigation, compact rows, direct contact actions.
- **Color philosophy:** blue communicates navigation and trust; lime/yellow/teal category colors make supply types scannable; neutral white content areas keep listings readable.
- **Layout paradigm:** fixed blue app bars and bottom tabs, horizontal category shortcuts, border-separated feed rows, and focused detail screens.
- **Signature elements:** location-led blue header, circular category icons, compact listing rows, and paired call/message actions.
- **Interaction philosophy:** fewer decorative surfaces, more immediate search, filtering, posting, saving, and contacting.
- **Brand essence:** a practical local marketplace helping farmers find reliable agricultural inputs nearby. Personality: useful, local, direct.
- **Brand voice:** “Find what your farm needs.” and “Trade supplies safely with people near you.”

## Screen structure

- `app/(tabs)/index.tsx`: home feed with location header, search/filter controls, agricultural categories, and compact supply listings.
- `app/(tabs)/search.tsx`: watchlist-style saved supply area.
- `app/(tabs)/create.tsx`: city-first posting flow based on the reference post screen.
- `app/post/[id].tsx`: product detail layout with image, price, supply metadata, and call/message actions.
- `app/(tabs)/notifications.tsx`: message-thread style account/contact updates.
- `app/(tabs)/profile.tsx`: account screen with status, history, help, and admin entry.
- `app/(tabs)/_layout.tsx`: five-item bottom navigation: Home, Watchlist, Post, Messages, Account.
- `components/auth-gate.tsx`: post-Google verification form for name, sender phone, and Telebirr transaction number.
