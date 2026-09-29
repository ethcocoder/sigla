# SIGLA design direction

## Direction: Field-to-market clarity

SIGLA uses a fresh agricultural technology feel: clean white surfaces, soft green and blue accents, warm human copy, and product imagery that makes the marketplace feel active without becoming a social feed clone. The core design job is to help a user understand an offer or need in seconds and take one clear next action.

### Design movement

Lightweight marketplace utility with an agricultural signal: large readable product names, generous touch targets, calm rounded surfaces, and green/blue status distinction. Avoid heavy gradients, dark/brown palettes, glassmorphism, dense admin tables, and decorative motion.

### Color philosophy

- Primary green `#16A34A` communicates supply, growth, and approved states.
- Secondary blue `#2563EB` communicates discovery, requests, and I NEED states.
- Soft green `#DCFCE7` and soft blue `#DBEAFE` create gentle context behind badges and action areas.
- Background `#F8FAFC` keeps the feed airy; surface white holds one decision at a time.
- Text `#0F172A`, secondary text `#64748B`, and border `#E2E8F0` keep contrast readable.

### Typography and layout

Use system sans typography for broad Amharic/English coverage, with 32px display text, 24px page titles, 18px section headings, and 15px body text. Screens are portrait-first and one-handed: primary actions sit near the lower content flow, bottom navigation is persistent, controls are at least 44–48px tall, and cards have a single obvious reading order.

### Signature elements

The SIGLA mark is a simple sprouting-leaf symbol made from two filled leaves and a stem. The header repeats `SIGLA` with `ሲግላ` where space allows. I HAVE uses green; I NEED uses blue. Cards always label statuses with words as well as color.

## Screen inventory and primary flows

- **Home/feed:** brand header → marketplace promise → latest approved listings → open detail → contact.
- **Search:** search field → I HAVE/I NEED filters → result cards → listing detail.
- **Create:** choose I HAVE or I NEED → enter draft listing details → review → posting payment → moderation (phases 6–8).
- **Notifications:** persisted payment, moderation, expiration, and announcement updates.
- **Profile:** account status → my posts → payment history → settings/support → language toggle.
- **Auth:** phone sign-up/login → profile setup → registration payment → pending review → active account (phase 3–4).
- **Listing detail:** back → image → post type → product facts → poster → permitted contact methods → report.
- **Admin:** review users/payments/posts → take trusted action → send notification → write audit log (phase 8 onward).

## Interaction philosophy

Make ordinary browsing immediate and forgiving: bounded pagination, cached images, explicit empty/error/retry states, and no raw backend errors. Sensitive actions such as payment submission and admin verification wait for server confirmation. Keep animation subtle: pressed opacity/scale, short image fades, and no scroll-blocking transitions.

## Asset workflow

The launcher icon, splash icon, favicon, and Android adaptive assets will share the flat leaf mark with full-bleed background and no baked-in rounded outer mask. Marketplace photos in development are clearly marked demo data and will be replaced by user uploads through the constrained storage path in the backend phase.
