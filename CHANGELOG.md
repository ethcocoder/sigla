# Changelog

## Unreleased

### Added

- SIGLA brand foundation with green/blue/white agricultural technology visual system.
- English and Amharic localization resources with persistent language selection.
- Reusable marketplace cards, type/status badges, action buttons, empty states, filter chips, and post-type choices.
- Home, search, create, notifications, profile, listing detail, and local draft-review routes.
- Typed demo marketplace records clearly isolated from production data.
- Supabase client abstraction, bounded marketplace/settings repositories, and an unapplied foundation migration with RLS, storage policy definitions, indexes, status enums, and trusted-role boundaries.
- Supabase architecture and security boundary documentation.

### Changed

- Replaced the Expo template welcome screen and single tab with SIGLA’s marketplace navigation.
- Selected Supabase as the backend alternative because it is the configured backend available in this session.
- Feed and search now resolve through the Supabase-aware repository boundary and fall back to demo data only when Supabase public configuration is absent.
