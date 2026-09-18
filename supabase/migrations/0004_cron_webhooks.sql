-- Deliver the webhook outbox every minute.
--
-- URL and key come from Vault, so they are not stored in this file or in
-- postgresql.conf. Create them once per project (see README):
--   select vault.create_secret('https://<ref>.functions.supabase.co', 'functions_url');
--   select vault.create_secret('<service role key>', 'service_role_key');

create extension if not exists pg_net;
create extension if not exists pg_cron;

create or replace function invoke_deliver_webhooks()
returns bigint
language plpgsql
security definer
set search_path = public, vault, extensions
as $$
declare
  v_url text;
  v_key text;
  v_request_id bigint;
begin
  select decrypted_secret into v_url
  from vault.decrypted_secrets where name = 'functions_url';

  select decrypted_secret into v_key
  from vault.decrypted_secrets where name = 'service_role_key';

  if v_url is null or v_key is null then
    raise notice 'deliver-webhooks skipped: vault secrets functions_url / service_role_key are not set';
    return null;
  end if;

  select net.http_post(
    url := rtrim(v_url, '/') || '/deliver-webhooks',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_key,
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 20000
  ) into v_request_id;

  return v_request_id;
end;
$$;

revoke all on function invoke_deliver_webhooks() from anon, authenticated, public;
grant execute on function invoke_deliver_webhooks() to service_role;

select cron.schedule(
  'deliver-webhooks',
  '* * * * *',
  $$select invoke_deliver_webhooks()$$
);
