# Make.com blueprints

These files are **starting points, not finished scenarios**. Make blueprints
carry connection ids, hook ids and module ids that only exist inside one Make
account, so they cannot be authored usefully by hand.

The intended flow is:

1. Build the scenario once in the Make UI, following the 11-scenario table in
   [`../automation.md`](../automation.md).
2. Open the scenario, click the three dots, then **Export Blueprint**.
3. Save the downloaded JSON here, named `NN-scenario-name.blueprint.json`.
4. Commit it, so the scenario can be rebuilt after an account change.

To restore one: **Create a new scenario → three dots → Import Blueprint**, then
reconnect the AiSensy, Google Calendar and Google Sheets connections and paste
the webhook URL into `AUTOMATION_WEBHOOK_URL`.

## What is here now

| File | Scenario |
| --- | --- |
| `01-appointment-lifecycle.blueprint.json` | Custom webhook → HMAC check → Router with created / rescheduled / cancelled routes |

`01` is a skeleton: it has the right module chain and route filters, but the
connection ids are placeholders and the AiSensy campaign names use the
`ss_` prefix from `AISENSY_CAMPAIGN_PREFIX`. Import it, then replace the
connections and add the Google Calendar and Google Sheets modules per route.

## Secrets

Store `WEBHOOK_SECRET`, `MAKE_READ_TOKEN` and `AISENSY_API_KEY` as Make
variables. Never paste them into a module note or commit them here.
