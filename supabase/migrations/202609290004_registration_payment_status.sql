-- Keep registration account status synchronized with admin payment decisions.
create or replace function public.sync_registration_payment_status() returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if new.type = 'REGISTRATION' then
    update public.profiles
    set status = case new.status
      when 'VERIFIED' then 'ACTIVE'::public.user_status
      when 'REJECTED' then 'REJECTED'::public.user_status
      else 'PAYMENT_PENDING'::public.user_status
    end,
    updated_at = now()
    where id = new.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists registration_payment_status_sync on public.payments;
create trigger registration_payment_status_sync
after insert or update of status on public.payments
for each row execute function public.sync_registration_payment_status();
