# Automation handoff — Dr. Sayali Sawant OPD

This codebase emits booking events. WhatsApp, Google Calendar and Google Sheets live in Make.com or n8n, not in Next.js.

## Event source

Supabase trigger `appointments_outbox` writes a row to `webhook_outbox` on insert/update.

Edge Function `deliver-webhooks` (one-minute cron) claims undelivered rows (`claim_webhook_outbox`), POSTs the payload JSON, and records `delivered_at` or `last_error`.

- Max 8 attempts
- Exponential back-off: retry after `2 ^ attempts` minutes from `created_at`
- Header: `X-Signature: sha256=<hex HMAC-SHA256 of the raw JSON body>`
- Secret: `WEBHOOK_SECRET`
- URL: `AUTOMATION_WEBHOOK_URL`

Set both as Edge Function secrets:

```bash
supabase secrets set WEBHOOK_SECRET=... AUTOMATION_WEBHOOK_URL=https://hook.eu1.make.com/...
```

Schedule the function every minute (Supabase Dashboard → Edge Functions → Schedules, or `pg_cron` + `pg_net` as commented in `supabase/migrations/0001_init.sql`).

## Verify HMAC (Make / n8n)

Use the **raw request body** bytes, not a re-serialised JSON object.

Make.com (inline JS):

```javascript
const crypto = require('crypto');
const secret = process.env.WEBHOOK_SECRET; // store as a Make variable
const header = headers['x-signature'] || headers['X-Signature'];
const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
if (header !== expected) throw new Error('Invalid signature');
```

n8n: Crypto node, HMAC-SHA256, binary body, compare to `sha256=` + hex digest.

Reject the request if the header is missing or does not match. Do not parse JSON before hashing.

## Payload shape

```json
{
  "event": "appointment.created",
  "ref": "A1B2C3D4",
  "patient": {
    "name": "",
    "whatsapp": "+91XXXXXXXXXX",
    "age": 0,
    "gender": "female",
    "visit_type": "new_consult",
    "reason": ""
  },
  "slot": {
    "starts_at_ist": "2026-09-20T18:30:00+05:30",
    "ends_at_ist": "2026-09-20T18:45:00+05:30",
    "display": "Sat 20 Sep, 6:30–6:45 PM"
  },
  "clinic": {
    "maps_url": "",
    "address": ""
  },
  "links": {
    "reschedule": "https://www.example.com/manage/{token}",
    "cancel": "https://www.example.com/manage/{token}?action=cancel"
  },
  "doctor": "Dr. Sayali Sawant"
}
```

`event` is one of `appointment.created` | `appointment.rescheduled` | `appointment.cancelled`.

## Scenario graph (Make or n8n)

1. Custom webhook (Make) / Webhook node (n8n)
2. Verify HMAC
3. Parse JSON
4. Router / Switch on `event`
5. Parallel (or sequential) branches:
   - (a) WhatsApp utility template
   - (b) Google Calendar insert / update / delete
   - (c) Google Sheets append or update

Idempotency key for all three: `ref`.

---

## (a) WhatsApp utility templates

Provider: AiSensy, WATI, or Meta Cloud API (`POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages`).

These are **utility** templates (account update / appointment), not marketing. Submit them in WhatsApp Manager in English, Hindi and Marathi. Body must be ≤1024 characters. No promotional wording, no discounts, no CTAs such as “shop now”.

### Variable map (same for every language)

| Placeholder | JSON path |
| --- | --- |
| {{1}} | `patient.name` |
| {{2}} | `ref` |
| {{3}} | `slot.display` |
| {{4}} | `clinic.address` |
| {{5}} | `clinic.maps_url` |
| {{6}} | `links.reschedule` |
| {{7}} | `links.cancel` |
| {{8}} | `doctor` |

Buttons (recommended, URL type):

- Reschedule → `{{6}}`
- Cancel → `{{7}}`

If the BSP does not allow dynamic URL buttons, put the links in the body as {{6}} and {{7}}.

### Created — English (`opd_created_en`)

```
Hello {{1}}, your OPD appointment with {{8}} is confirmed.

Reference: {{2}}
When: {{3}} IST
Where: {{4}}
Directions: {{5}}

To change the time: {{6}}
To cancel: {{7}}

This clinic is an outpatient clinic. For labour pain, heavy bleeding, severe abdominal pain, or any emergency, go to the nearest hospital emergency department or call 108 / 112.
```

### Created — Hindi (`opd_created_hi`)

```
नमस्ते {{1}}, {{8}} के साथ आपका OPD अपॉइंटमेंट कन्फर्म है।

संदर्भ: {{2}}
समय: {{3}} IST
पता: {{4}}
दिशा: {{5}}

समय बदलने के लिए: {{6}}
रद्द करने के लिए: {{7}}

यह एक आउटपेशेंट क्लिनिक है। प्रसव पीड़ा, तेज रक्तस्राव, पेट में तेज दर्द या किसी आपात स्थिति में निकटतम अस्पताल के इमरजेंसी विभाग जाएँ या 108 / 112 पर कॉल करें।
```

### Created — Marathi (`opd_created_mr`)

```
नमस्कार {{1}}, {{8}} यांच्याकडे तुमची OPD भेट निश्चित झाली आहे.

संदर्भ: {{2}}
वेळ: {{3}} IST
पत्ता: {{4}}
दिशा: {{5}}

वेळ बदलण्यासाठी: {{6}}
रद्द करण्यासाठी: {{7}}

ही बाह्यरुग्ण क्लिनिक आहे. प्रसूतीवेदना, जास्त रक्तस्त्राव, पोटात तीव्र वेदना किंवा आपत्कालीन स्थितीत जवळच्या रुग्णालयाच्या इमरजेंसी विभागात जा किंवा 108 / 112 वर कॉल करा.
```

### Rescheduled — English (`opd_rescheduled_en`)

```
Hello {{1}}, your OPD appointment with {{8}} has been moved.

Reference: {{2}}
New time: {{3}} IST
Where: {{4}}
Directions: {{5}}

To change again: {{6}}
To cancel: {{7}}
```

### Rescheduled — Hindi (`opd_rescheduled_hi`)

```
नमस्ते {{1}}, {{8}} के साथ आपका OPD अपॉइंटमेंट बदल दिया गया है।

संदर्भ: {{2}}
नया समय: {{3}} IST
पता: {{4}}
दिशा: {{5}}

फिर से बदलने के लिए: {{6}}
रद्द करने के लिए: {{7}}
```

### Rescheduled — Marathi (`opd_rescheduled_mr`)

```
नमस्कार {{1}}, {{8}} यांच्याकडील तुमची OPD भेट बदलली आहे.

संदर्भ: {{2}}
नवीन वेळ: {{3}} IST
पत्ता: {{4}}
दिशा: {{5}}

पुन्हा बदलण्यासाठी: {{6}}
रद्द करण्यासाठी: {{7}}
```

### Cancelled — English (`opd_cancelled_en`)

```
Hello {{1}}, your OPD appointment with {{8}} (reference {{2}}, {{3}} IST) has been cancelled.

If you still need a visit, book a new slot on the website or message this number.
```

### Cancelled — Hindi (`opd_cancelled_hi`)

```
नमस्ते {{1}}, {{8}} के साथ आपका OPD अपॉइंटमेंट (संदर्भ {{2}}, {{3}} IST) रद्द कर दिया गया है।

यदि आपको अभी भी भेंट चाहिए, तो वेबसाइट पर नया स्लॉट बुक करें या इसी नंबर पर लिखें।
```

### Cancelled — Marathi (`opd_cancelled_mr`)

```
नमस्कार {{1}}, {{8}} यांच्याकडील तुमची OPD भेट (संदर्भ {{2}}, {{3}} IST) रद्द करण्यात आली आहे.

भेट अजून हवी असल्यास वेबसाइटवर नवीन वेळ बुक करा किंवा याच नंबरवर लिहा.
```

### 24-hour reminder — English (`opd_reminder_en`)

```
Hello {{1}}, this is a reminder of your OPD appointment with {{8}} tomorrow.

Reference: {{2}}
When: {{3}} IST
Where: {{4}}
Directions: {{5}}

Please bring previous reports, prescriptions and photo ID.

To change the time: {{6}}
To cancel: {{7}}
```

### 24-hour reminder — Hindi (`opd_reminder_hi`)

```
नमस्ते {{1}}, कल {{8}} के साथ आपके OPD अपॉइंटमेंट की याद दिलाने के लिए यह संदेश है।

संदर्भ: {{2}}
समय: {{3}} IST
पता: {{4}}
दिशा: {{5}}

पिछली रिपोर्ट, दवाइयों की पर्ची और फोटो पहचान पत्र साथ लाएँ।

समय बदलने के लिए: {{6}}
रद्द करने के लिए: {{7}}
```

### 24-hour reminder — Marathi (`opd_reminder_mr`)

```
नमस्कार {{1}}, उद्या {{8}} यांच्याकडील तुमच्या OPD भेतीची ही आठवण आहे.

संदर्भ: {{2}}
वेळ: {{3}} IST
पत्ता: {{4}}
दिशा: {{5}}

मागील रिपोर्ट, औषधांची पर्ची आणि फोटो ओळखपत्र सोबत आणा.

वेळ बदलण्यासाठी: {{6}}
रद्द करण्यासाठी: {{7}}
```

Language selection: send the template that matches a `language` field if you add one later; until then send English plus Hindi, or pick Hindi when `patient.name` is written in Devanagari. Do not send three messages for the same event.

### Meta utility-template approval rules

- Category **UTILITY** only. Do not submit as MARKETING.
- No offers, coupons, “limited time”, “book now and save”, or clinic promotion.
- Factual appointment time, place, and manage links only.
- Samples must use realistic but fictional patient names and times.
- URLs in buttons must use a verified domain (the production site).
- 24-hour reminder is still utility if it only restates the existing booking.
- Do not include clinical advice, test results, or photographs.
- Keep placeholders in order; do not start a body with a variable in some Meta versions — the templates above start with a greeting word.

Cloud API example:

```json
{
  "messaging_product": "whatsapp",
  "to": "{{patient.whatsapp}}",
  "type": "template",
  "template": {
    "name": "opd_created_en",
    "language": { "code": "en" },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "{{patient.name}}" },
          { "type": "text", "text": "{{ref}}" },
          { "type": "text", "text": "{{slot.display}}" },
          { "type": "text", "text": "{{clinic.address}}" },
          { "type": "text", "text": "{{clinic.maps_url}}" },
          { "type": "text", "text": "{{links.reschedule}}" },
          { "type": "text", "text": "{{links.cancel}}" },
          { "type": "text", "text": "{{doctor}}" }
        ]
      }
    ]
  }
}
```

---

## (b) Google Calendar

Use a clinic calendar (not the doctor’s personal primary calendar).

Private extended property (event uniqueness):

- `private.opdRef` = `ref`

### created

Calendar insert:

- summary: `OPD {{patient.name}} ({{ref}})`
- description: visit type, WhatsApp, manage links
- start / end: parse `slot.starts_at_ist` / `slot.ends_at_ist` with timeZone `Asia/Kolkata`
- extendedProperties.private.opdRef = ref

### rescheduled

Search events by `privateExtendedProperty=opdRef={{ref}}`. If found, PATCH start/end and description. If missing, insert.

### cancelled

Search by `opdRef`. DELETE the event, or PATCH status to `cancelled`.

---

## (c) Google Sheets

Spreadsheet columns:

`ref | event | patient_name | whatsapp | age | gender | visit_type | reason | starts_at_ist | ends_at_ist | display | status | maps_url | manage_url | updated_at`

- created: append a row, status `booked`
- rescheduled: find row by `ref`, update slot columns, status `rescheduled`
- cancelled: find row by `ref`, set status `cancelled`

Make: Google Sheets “Search rows” then “Update row”. n8n: Google Sheets node with lookup key `ref`.

---

## 24-hour reminder scenario

Do **not** send reminders from this Next.js app.

1. Make/n8n scheduler every 15 minutes (IST).
2. HTTP GET `{SITE_URL}/api/upcoming?from={now+23h}&to={now+25h}`
3. Sign the request:
   - Canonical string: `GET\n/api/upcoming?from=...&to=...` (pathname + query, no host)
   - Header `X-Signature: sha256=<hmac hex>` using `WEBHOOK_SECRET`
4. Filter appointments whose `starts_at` is between 23 and 25 hours from now and whose `ref` is not yet in a “reminded” sheet tab.
5. Send `opd_reminder_*` WhatsApp template.
6. Append `ref` to the reminded tab so the next tick does not send twice.

The `/api/upcoming` route uses the service role and returns only booked/rescheduled rows. It is not public: unsigned requests receive 401.

---

## Clinic settings

Update `clinic_settings` (address, maps_url, site_url) so webhook payloads match the live footer. Keep them in sync with `src/config/site.ts`.
