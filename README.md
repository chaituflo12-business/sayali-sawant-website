# Dr. Sayali Sawant — OPD website

Public website and appointment booking for Dr. Sayali Sawant, Consultant Obstetrician & Gynaecologist and IVF/Infertility Specialist, Goregaon West, Mumbai.

## Stack

Next.js 15 App Router, TypeScript strict, Tailwind CSS v4, shadcn/ui (Dialog / Sheet / Toast / Calendar), Supabase (Postgres + RLS + Edge Functions), Zod, Vercel.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

Replace placeholders in `src/config/site.ts` (and matching `clinic_settings` in Supabase) with values confirmed by the clinic. Do not invent a brand name: the person is the brand.

## Supabase

```bash
supabase db push
supabase functions deploy deliver-webhooks
supabase secrets set WEBHOOK_SECRET=... AUTOMATION_WEBHOOK_URL=https://hook.make.com/...
supabase gen types typescript --project-id <id> > src/lib/supabase/database.types.ts
```

The `deliver-webhooks` cron job in `supabase/migrations/0004_cron_webhooks.sql`
reads its target from Vault, so create those two secrets once per project (SQL
editor, service role):

```sql
select vault.create_secret('https://<project-ref>.functions.supabase.co', 'functions_url');
select vault.create_secret('<service role key>', 'service_role_key');
```

`book_appointment`, `reschedule_appointment`, `cancel_appointment`,
`get_appointment_by_token` and `assert_booking_rate_limit` are granted to
`service_role` only, so `SUPABASE_SERVICE_ROLE_KEY` must be set in the Vercel
project or booking returns `NOT_CONFIGURED` and the rate limiter fails closed.

## Migrations

`supabase/migrations` is append-only. Supabase records every applied file and
never re-runs it, so editing a file that has already been pushed to any project
changes nothing in that project and leaves fresh projects with a different
schema.

- Never edit a migration that has been pushed anywhere. Treat it as frozen.
- To change something, add the next numbered file and `create or replace`,
  `alter`, `revoke` or `grant` from there.
- Say in a comment at the top of the new file which earlier file it supersedes,
  as `0002_lock_rpcs.sql` does for the anon grants in `0001_init.sql`.

Current chain: `0001_init.sql` (schema) → `0002_lock_rpcs.sql` (write RPCs to
`service_role`) → `0003_automation.sql` (automation tables, RPCs, outbox
trigger) → `0004_cron_webhooks.sql` (Vault-backed `deliver-webhooks` schedule)
→ `0005_hold_retry_cleanup.sql` (`create_hold_appointment` error handling).

## Staff onboarding

1. Supabase Dashboard → Authentication → Users → **Invite user**, once for the
   doctor and once for the receptionist. They sign in with an email OTP at
   `/admin/login`; there is no password.
2. Copy each new user's UUID from the same Users table.
3. Run this in the SQL editor, one row per person:

```sql
insert into staff (user_id, role, display_name)
values
  ('<doctor auth uuid>', 'doctor', 'Dr. Sayali Sawant'),
  ('<reception auth uuid>', 'reception', 'Reception')
on conflict (user_id) do nothing;
```

Nobody can see `/admin` until their UUID is in `staff`: every admin policy goes
through `is_staff()`. To remove access, delete the `staff` row.

## Make + AiSensy

WhatsApp, Google Calendar and Google Sheets live in Make.com, with AiSensy as
the WhatsApp BSP. This app only emits signed webhook events and exposes a few
bearer-token read APIs. The event list, the 11 Make scenarios, the AiSensy
Campaign API shape and every EN/HI/MR template body are in
[`docs/automation.md`](docs/automation.md); exported scenario blueprints belong
in [`docs/make-blueprints/`](docs/make-blueprints/README.md).

## Scripts

```bash
npm run build
npm run check:copy
npm run check:contrast
npm run test:denylist
npm run test:double-booking
```

`check:contrast` reports WCAG ratios for every colour pair the site ships.
`test:denylist` proves reminder notes cannot contain drug names or doses.
`test:double-booking` runs two `book_appointment` RPCs with `Promise.all` against the same slot. It expects exactly one success and `SLOT_TAKEN` on the other. Requires a live Supabase project with materialised slots and `SUPABASE_SERVICE_ROLE_KEY`.

## Lighthouse (run locally; this repo does not record scores)

Start the production server, then:

```bash
npm run build && npm run start
```

In a second terminal:

```bash
npx --yes lighthouse http://127.0.0.1:3000 --form-factor=mobile --screenEmulation.mobile --only-categories=performance,accessibility,best-practices,seo --throttling-method=simulate --chrome-flags="--headless --no-sandbox" --output=html --output-path=./lighthouse-mobile.html --view
```

## Placeholders still to confirm in writing

- Clinic street address, Google Place ID, maps URL, geo
- WhatsApp number, phone, email
- OPD hours and consult fee
- Profile photograph
- Social profile URLs
- Emergency hospital name and phone
- Maharashtra Medical Council number and degrees (already listed from the brief; confirm in writing before go-live)
