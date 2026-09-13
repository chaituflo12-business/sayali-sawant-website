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

Insert staff rows after the doctor and receptionist have Auth users:

```sql
insert into staff (user_id, role, display_name)
values ('<auth uuid>', 'doctor', 'Dr. Sayali Sawant');
```

Schedule `deliver-webhooks` every minute. Details: `docs/automation.md`.

## Scripts

```bash
npm run build
npm run check:copy
npm run test:double-booking
```

`test:double-booking` runs two `book_appointment` RPCs with `Promise.all` against the same slot. It expects exactly one success and `SLOT_TAKEN` on the other. Requires a live Supabase project with materialised slots.

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
