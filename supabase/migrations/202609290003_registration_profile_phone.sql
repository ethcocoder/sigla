-- Store the phone number submitted during registration in the public profile.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, phone, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', ''),
    coalesce(new.raw_user_meta_data->>'phone', new.phone, ''),
    'REGISTERED'
  )
  on conflict (id) do update set
    name = excluded.name,
    phone = excluded.phone,
    updated_at = now();
  return new;
end;
$$;
