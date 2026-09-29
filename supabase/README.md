# Supabase backend

The migration in `migrations/202609290001_sigla_foundation.sql` is the local source of truth for the SIGLA relational backend. It has not been applied automatically because the session only discovered two inactive Supabase projects and neither is clearly SIGLA-specific.

Before applying it:

1. Select the intended project and verify it is authorized and active.
2. Use the Supabase migration tool for DDL; do not paste service-role keys into source files or chat.
3. Inspect the resulting tables/RLS policies and run allow/deny tests.
4. Configure Auth providers, Storage policies, and server-only secrets through protected configuration.
5. Seed only an explicitly development-scoped project.

The migration intentionally creates pending-only client payment inserts, approved/unexpired public post reads, private payment/notification access, and admin-only settings/moderation/audit writes.
