# Automation handoff — Dr. Sayali Sawant OPD

This codebase emits events. Every message, calendar entry and sheet row is built in **Make.com**, and WhatsApp delivery goes through **AiSensy** (an official Meta BSP) using approved Utility templates. Next.js never calls AiSensy.

Division of work:

| Layer | Owner |
| --- | --- |
| Slots, bookings, holds, waitlist, reminders data | this repo (Supabase) |
| Outbound event queue + HMAC signing | this repo (`webhook_outbox`, `deliver-webhooks`) |
| Routing, filtering, retries, logging | Make.com |
| WhatsApp template delivery | AiSensy Campaign API |
| Google Calendar / Google Sheets | Make.com modules |

## Event source

Supabase trigger `appointments_outbox` writes one `webhook_outbox` row per real change. The event is chosen by what changed, so editing a row later never re-sends an earlier message:

| Change | Event |
| --- | --- |
| insert | `appointment.created` (or `appointment.hold_created` when `source = 'antenatal_nudge'`) |
| status → `cancelled` | `appointment.cancelled` (also offers the freed slot to the waitlist) |
| `slot_id` changed | `appointment.rescheduled` |
| status → `completed` | `appointment.completed` |
| status → `no_show` | `appointment.no_show` |
| `report_ready_at` set | `appointment.report_ready` |
| anything else | no row |

Scheduled RPCs add three more events: `reminder.cycle_due` (every 15 minutes), `digest.daily` (06:45 IST), and `slot.freed` (from `expire_holds` every 5 minutes and from any cancellation).

Edge Function `deliver-webhooks` (one-minute `pg_cron` job, see `supabase/migrations/0004_cron_webhooks.sql`) claims undelivered rows with `claim_webhook_outbox`, POSTs the payload JSON, and records `delivered_at` or `last_error`.

- Max 8 attempts
- Exponential back-off: retry after `2 ^ attempts` minutes from `created_at`
- Header: `X-Signature: sha256=<hex HMAC-SHA256 of the raw JSON body>`
- Secret: `WEBHOOK_SECRET`
- URL: `AUTOMATION_WEBHOOK_URL` (the Make custom webhook)

Set both as Edge Function secrets:

```bash
supabase secrets set WEBHOOK_SECRET=... AUTOMATION_WEBHOOK_URL=https://hook.eu1.make.com/...
```

## Verify HMAC in Make

Use the **raw request body** bytes, not a re-serialised JSON object.

```javascript
const crypto = require('crypto');
const secret = process.env.WEBHOOK_SECRET; // store as a Make variable
const header = headers['x-signature'] || headers['X-Signature'];
const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(body).digest('hex');
if (header !== expected) throw new Error('Invalid signature');
```

Reject the request if the header is missing or does not match. Do not parse JSON before hashing.

## Read APIs (Make → this app)

All routes run on the Node runtime and need `Authorization: Bearer ${MAKE_READ_TOKEN}`. A missing env var returns 503; a wrong token returns 401.

| Route | Purpose |
| --- | --- |
| `GET /api/upcoming?hours=24` | active appointments starting within N hours, each with `opted_out` |
| `GET /api/upcoming?status=no_show&date=today` | today's IST no-shows with no follow-up stamp yet |
| `POST /api/upcoming/mark-followed-up` `{ref}` | stamps `no_show_followup_at` so the next run skips the row |
| `GET /api/waitlist?date=YYYY-MM-DD` | pending waitlist rows for that IST date |
| `POST /api/message-status` `{whatsapp, template, status, make_execution_id?, appointment_ref?, opt_out?}` | writes `message_log`, handles STOP, stamps `review_requested_at` |

Always check `opted_out` before sending. `POST /api/message-status` with `opt_out: true` is what makes that flag true everywhere.

## Payload shape

```json
{
  "event": "appointment.created",
  "ref": "A1B2C3D4",
  "opted_out": false,
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
  "hold": {
    "expires_at_ist": null
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

`reminder.cycle_due`, `slot.freed` and `digest.daily` carry their own shapes; all three include `event` and `opted_out` at the root of the payload.

## The 11 scenarios

Build these as separate Make scenarios so one failure cannot block the others. Every WhatsApp branch first checks `opted_out = false`, then calls the AiSensy Campaign API, then posts the result to `/api/message-status`.

| # | Scenario | Trigger | Modules |
| --- | --- | --- | --- |
| 1 | Appointment lifecycle | Custom webhook, events `appointment.created`, `appointment.rescheduled`, `appointment.cancelled` | Verify HMAC → Parse JSON → Router (3 routes) → AiSensy `opd_created_*` / `opd_rescheduled_*` / `opd_cancelled_*` → Google Calendar insert/patch/delete (`opdRef` = `ref`) → Google Sheets append/update → `POST /api/message-status` |
| 2 | 24-hour reminder | Scheduler every 15 min (IST) | `GET /api/upcoming?hours=25` → Filter `starts_at` between 23 h and 25 h and `opted_out = false` → Google Sheets lookup on `ref` in the "reminded" tab → AiSensy `appt_reminder_24h` → append `ref` → `POST /api/message-status` |
| 3 | No-show follow-up | Scheduler hourly, 11:00–21:00 IST | `GET /api/upcoming?status=no_show&date=today` → Filter `opted_out = false` → AiSensy `rebook_after_missed` → `POST /api/upcoming/mark-followed-up {ref}` → `POST /api/message-status` |
| 4 | Review request | Custom webhook, event `appointment.completed` | Verify HMAC → Sleep 3 h → Filter `opted_out = false` and visit type not `procedure_review` → AiSensy `review_request` → `POST /api/message-status` with `template: "review_request"` (this stamps `review_requested_at`) |
| 5 | Antenatal next visit | Custom webhook, event `appointment.hold_created` | Verify HMAC → Filter `source = antenatal_nudge` → AiSensy `antenatal_next_visit` with `hold.expires_at_ist` → `POST /api/message-status`. The hold self-cancels after 48 h via `expire_holds()` |
| 6 | Report ready | Custom webhook, event `appointment.report_ready` | Verify HMAC → Filter `opted_out = false` → AiSensy `report_ready` (collection details only, never results) → `POST /api/message-status` |
| 7 | Cycle reminders | Custom webhook, event `reminder.cycle_due` | Verify HMAC → AiSensy `cycle_reminder` with `kind`, `remind_on`, `note` → `POST /api/message-status`. Notes are denylisted server-side, so they never contain drug names |
| 8 | Waitlist offer | Custom webhook, event `slot.freed` | Verify HMAC → AiSensy `slot_available` with the 2-hour hold window → `POST /api/message-status`. `GET /api/waitlist?date=` is the manual fallback for reception |
| 9 | Daily digest | Custom webhook, event `digest.daily` | Verify HMAC → Text aggregator over `appointments[]` → AiSensy `doctor_daily_digest` to `DOCTOR_WHATSAPP` → `POST /api/message-status` |
| 10 | STOP handling | AiSensy inbound webhook | Filter body matches `^(stop|unsubscribe|बंद|थांबा)$` (case-insensitive) → `POST /api/message-status` with `opt_out: true` → AiSensy confirmation reply. Every later scenario is blocked by the `opted_out` filter |
| 11 | Error route | Make error handler on every scenario | Break directive → `POST /api/message-status` with `status: "failed"` → AiSensy `ops_alert` to `OPS_WHATSAPP` → Google Sheets "errors" tab. Retry 3 times with 15-minute gaps before alerting |

Idempotency key for scenarios 1, 4, 5, 6: `ref`. For 7: the reminder id. For 8: `waitlist_id`.

## AiSensy Campaign API

One HTTP module per template. Campaign names are `${AISENSY_CAMPAIGN_PREFIX}<template>_<lang>`, e.g. `ss_appt_reminder_24h_en`.

```http
POST https://backend.aisensy.com/campaign/t1/api/v2
Content-Type: application/json
```

```json
{
  "apiKey": "{{AISENSY_API_KEY}}",
  "campaignName": "ss_opd_created_en",
  "destination": "{{patient.whatsapp}}",
  "userName": "{{patient.name}}",
  "templateParams": [
    "{{patient.name}}",
    "{{ref}}",
    "{{slot.display}}",
    "{{clinic.address}}",
    "{{clinic.maps_url}}",
    "{{links.reschedule}}",
    "{{links.cancel}}",
    "{{doctor}}"
  ]
}
```

`templateParams` is positional: it must match `{{1}}…{{n}}` in the approved body exactly. Store `AISENSY_API_KEY` as a Make variable, never in a scenario note.

---

## WhatsApp Utility templates

Submit every template in AiSensy under category **UTILITY**, in English, Hindi and Marathi. Body ≤1024 characters. No promotional wording, no discounts, no clinical advice, no test results.

### Variable map — lifecycle templates

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

If dynamic URL buttons are unavailable, keep the links in the body as {{6}} and {{7}}.

Add the line `Reply STOP to opt out.` to the end of every body when you submit it. The bodies in the "automation templates" section below already include it.

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

---

## Automation templates

Every body below ends with the opt-out line. All are category **UTILITY**.

### 24-hour reminder (`appt_reminder_24h_en` / `_hi` / `_mr`)

Variables: {{1}} name, {{2}} ref, {{3}} slot display, {{4}} address, {{5}} maps url, {{6}} reschedule link, {{7}} cancel link, {{8}} doctor.

```
Hello {{1}}, a reminder of your OPD appointment with {{8}} tomorrow.

Reference: {{2}}
When: {{3}} IST
Where: {{4}}
Directions: {{5}}

Please bring previous reports, prescriptions and photo ID.

To change the time: {{6}}
To cancel: {{7}}

Reply STOP to opt out.
```

```
नमस्ते {{1}}, कल {{8}} के साथ आपके OPD अपॉइंटमेंट की याद दिलाने के लिए यह संदेश है।

संदर्भ: {{2}}
समय: {{3}} IST
पता: {{4}}
दिशा: {{5}}

पिछली रिपोर्ट, दवाइयों की पर्ची और फोटो पहचान पत्र साथ लाएँ।

समय बदलने के लिए: {{6}}
रद्द करने के लिए: {{7}}

बंद करने के लिए STOP लिखें।
Reply STOP to opt out.
```

```
नमस्कार {{1}}, उद्या {{8}} यांच्याकडील तुमच्या OPD भेटीची ही आठवण आहे.

संदर्भ: {{2}}
वेळ: {{3}} IST
पत्ता: {{4}}
दिशा: {{5}}

मागील रिपोर्ट, औषधांची पर्ची आणि फोटो ओळखपत्र सोबत आणा.

वेळ बदलण्यासाठी: {{6}}
रद्द करण्यासाठी: {{7}}

थांबवण्यासाठी STOP लिहा.
Reply STOP to opt out.
```

### Missed appointment (`rebook_after_missed_en` / `_hi` / `_mr`)

Variables: {{1}} name, {{2}} ref, {{3}} missed slot display, {{4}} booking url, {{5}} doctor.

```
Hello {{1}}, we missed you at your OPD appointment with {{5}} on {{3}} IST (reference {{2}}).

If you would still like to be seen, you can book another slot here: {{4}}

Reply STOP to opt out.
```

```
नमस्ते {{1}}, {{3}} IST को {{5}} के साथ आपका OPD अपॉइंटमेंट (संदर्भ {{2}}) छूट गया।

अब भी दिखाना चाहें तो यहाँ नया स्लॉट बुक करें: {{4}}

Reply STOP to opt out.
```

```
नमस्कार {{1}}, {{3}} IST रोजी {{5}} यांच्याकडील तुमची OPD भेट (संदर्भ {{2}}) चुकली.

तपासणी करून घ्यायची असल्यास येथे नवीन वेळ बुक करा: {{4}}

Reply STOP to opt out.
```

### Review request (`review_request_en` / `_hi` / `_mr`)

Variables: {{1}} name, {{2}} doctor, {{3}} review url.

```
Hello {{1}}, thank you for visiting {{2}}.

If you would like to share feedback about your experience at the clinic, you can write it here: {{3}}

Reply STOP to opt out.
```

```
नमस्ते {{1}}, {{2}} के पास आने के लिए धन्यवाद।

क्लिनिक में अपने अनुभव के बारे में प्रतिक्रिया देना चाहें तो यहाँ लिखें: {{3}}

Reply STOP to opt out.
```

```
नमस्कार {{1}}, {{2}} यांच्याकडे भेट दिल्याबद्दल धन्यवाद.

क्लिनिकमधील तुमच्या अनुभवाबद्दल अभिप्राय द्यायचा असल्यास येथे लिहा: {{3}}

Reply STOP to opt out.
```

### Antenatal next visit (`antenatal_next_visit_en` / `_hi` / `_mr`)

Variables: {{1}} name, {{2}} held slot display, {{3}} hold expiry IST, {{4}} confirm url, {{5}} doctor.

```
Hello {{1}}, {{5}} has kept a follow-up OPD slot for you: {{2}} IST.

This slot is held until {{3}} IST. Please confirm or pick another time here: {{4}}

Reply STOP to opt out.
```

```
नमस्ते {{1}}, {{5}} ने आपके लिए अगली OPD भेंट रखी है: {{2}} IST।

यह समय {{3}} IST तक सुरक्षित है। कृपया पुष्टि करें या दूसरा समय चुनें: {{4}}

Reply STOP to opt out.
```

```
नमस्कार {{1}}, {{5}} यांनी तुमच्यासाठी पुढील OPD वेळ राखून ठेवली आहे: {{2}} IST.

ही वेळ {{3}} IST पर्यंत राखीव आहे. कृपया निश्चित करा किंवा दुसरी वेळ निवडा: {{4}}

Reply STOP to opt out.
```

### Report ready (`report_ready_en` / `_hi` / `_mr`)

Variables: {{1}} name, {{2}} ref, {{3}} clinic address, {{4}} OPD hours, {{5}} doctor. Collection details only — never results.

```
Hello {{1}}, your report is available for collection at the clinic (reference {{2}}).

Where: {{3}}
OPD hours: {{4}}

{{5}} will go through it with you at your next visit.

Reply STOP to opt out.
```

```
नमस्ते {{1}}, आपकी रिपोर्ट क्लिनिक से ले सकते हैं (संदर्भ {{2}})।

पता: {{3}}
OPD समय: {{4}}

अगली भेंट में {{5}} इसे आपके साथ देखेंगी।

Reply STOP to opt out.
```

```
नमस्कार {{1}}, तुमचा रिपोर्ट क्लिनिकमध्ये घेण्यासाठी तयार आहे (संदर्भ {{2}}).

पत्ता: {{3}}
OPD वेळ: {{4}}

पुढील भेटीत {{5}} तो तुमच्यासोबत पाहतील.

Reply STOP to opt out.
```

### Cycle reminder (`cycle_reminder_en` / `_hi` / `_mr`)

Variables: {{1}} name, {{2}} kind label, {{3}} date, {{4}} note, {{5}} doctor. Date prompts only: the note is denylisted server-side so it cannot contain drug names or doses.

```
Hello {{1}}, this is your reminder from {{5}}'s clinic.

What: {{2}}
Date: {{3}}
Note: {{4}}

Please call the clinic if you need to change the date.

Reply STOP to opt out.
```

```
नमस्ते {{1}}, यह {{5}} के क्लिनिक से आपका रिमाइंडर है।

क्या: {{2}}
तारीख: {{3}}
टिप्पणी: {{4}}

तारीख बदलनी हो तो क्लिनिक पर कॉल करें।

Reply STOP to opt out.
```

```
नमस्कार {{1}}, ही {{5}} यांच्या क्लिनिककडून आठवण आहे.

काय: {{2}}
तारीख: {{3}}
टिप्पणी: {{4}}

तारीख बदलायची असल्यास क्लिनिकला कॉल करा.

Reply STOP to opt out.
```

### Slot available (`slot_available_en` / `_hi` / `_mr`)

Variables: {{1}} name, {{2}} slot display, {{3}} hold expiry IST, {{4}} booking url, {{5}} doctor.

```
Hello {{1}}, an OPD slot with {{5}} has opened up: {{2}} IST.

It is held for you until {{3}} IST. To take it, confirm here: {{4}}

Reply STOP to opt out.
```

```
नमस्ते {{1}}, {{5}} के साथ एक OPD स्लॉट खाली हुआ है: {{2}} IST।

यह {{3}} IST तक आपके लिए रखा है। लेने के लिए यहाँ पुष्टि करें: {{4}}

Reply STOP to opt out.
```

```
नमस्कार {{1}}, {{5}} यांच्याकडे एक OPD वेळ रिकामी झाली आहे: {{2}} IST.

ती {{3}} IST पर्यंत तुमच्यासाठी राखीव आहे. घेण्यासाठी येथे निश्चित करा: {{4}}

Reply STOP to opt out.
```

### Doctor daily digest (`doctor_daily_digest_en` / `_hi` / `_mr`)

Sent to `DOCTOR_WHATSAPP`. Variables: {{1}} date, {{2}} count, {{3}} list of `time · name · visit type`.

```
Good morning. OPD list for {{1}}: {{2}} appointments.

{{3}}

Reply STOP to opt out.
```

```
सुप्रभात। {{1}} की OPD सूची: {{2}} अपॉइंटमेंट।

{{3}}

Reply STOP to opt out.
```

```
सुप्रभात. {{1}} ची OPD यादी: {{2}} भेटी.

{{3}}

Reply STOP to opt out.
```

### Ops alert (`ops_alert_en` / `_hi` / `_mr`)

Sent to `OPS_WHATSAPP`. Variables: {{1}} scenario name, {{2}} reference or record id, {{3}} error text, {{4}} time IST.

```
Automation alert: {{1}} failed at {{4}} IST.

Record: {{2}}
Error: {{3}}

Please check the Make scenario history.

Reply STOP to opt out.
```

```
ऑटोमेशन अलर्ट: {{1}} {{4}} IST पर विफल हुआ।

रिकॉर्ड: {{2}}
त्रुटि: {{3}}

कृपया Make सिनेरियो हिस्ट्री देखें।

Reply STOP to opt out.
```

```
ऑटोमेशन सूचना: {{1}} {{4}} IST वाजता अयशस्वी झाले.

रेकॉर्ड: {{2}}
त्रुटी: {{3}}

कृपया Make सिनेरिओ हिस्ट्री तपासा.

Reply STOP to opt out.
```

### Utility-template approval rules

- Category **UTILITY** only. Never MARKETING.
- No offers, coupons, "limited time", or clinic promotion.
- Factual appointment time, place, and manage links only.
- Samples must use realistic but fictional patient names and times.
- URL buttons must point at the verified production domain.
- A 24-hour reminder stays utility as long as it only restates an existing booking.
- No clinical advice, no test results, no photographs.
- Keep placeholders in order and do not start a body with a variable.

Language selection: send the template that matches a `language` field if you add one later; until then send English, or Hindi when `patient.name` is written in Devanagari. Never send the same event in three languages.

---

## Google Calendar

Use a clinic calendar, not the doctor's personal primary calendar.

Private extended property (event uniqueness): `private.opdRef` = `ref`.

### created

- summary: `OPD {{patient.name}} ({{ref}})`
- description: visit type, WhatsApp, manage links
- start / end: parse `slot.starts_at_ist` / `slot.ends_at_ist` with timeZone `Asia/Kolkata`
- extendedProperties.private.opdRef = ref

### rescheduled

Search events by `privateExtendedProperty=opdRef={{ref}}`. If found, PATCH start/end and description. If missing, insert.

### cancelled

Search by `opdRef`. DELETE the event, or PATCH status to `cancelled`.

---

## Google Sheets

Spreadsheet columns:

`ref | event | patient_name | whatsapp | age | gender | visit_type | reason | starts_at_ist | ends_at_ist | display | status | maps_url | manage_url | opted_out | updated_at`

- created: append a row, status `booked`
- rescheduled: find row by `ref`, update slot columns, status `rescheduled`
- cancelled: find row by `ref`, set status `cancelled`

Make: Google Sheets "Search rows" then "Update row", lookup key `ref`.

---

## Clinic settings

Update `clinic_settings` (address, maps_url, site_url) so webhook payloads match the live footer. Keep them in sync with `src/config/site.ts`.
