# Anonymous traffic observation — 2026-09-03

Status: read-only operational snapshot; no deployment or production mutation

Observed at: 2026-09-03 14:36–14:39 UTC (22:36–22:39 HKT)

## Purpose and evidence boundary

This snapshot records privacy-bounded Portfolio page-view and Ask John usage
aggregates. It does not identify a visitor. Country, browser and device values
are approximate and may reflect a VPN, proxy or user-agent classification.
Nothing here establishes a visitor's name, employer, role or intent.

The inspection read only Vercel Web Analytics aggregates and the exact Redis
daily aggregate key `ask-john-portfolio:metrics:2026-09-03`. It did not scan
Redis, inspect rate-limit keys, read raw IP addresses, access logs, questions,
answers, Presentation credentials or Presentation session data.

## Production version at observation time

- Portfolio deployment: `dpl_D28LC7EaPzmqatbUBA4nQ8Vt3TRg`, Ready and
  serving `johnchong.info`.
- Ask John service revision:
  `6898b11255c097b6ebf3525d2df8985d9eac6d0d`.
- Owner QA Mode PR #27 revision
  `beeb8105246e9ad052ce87ca62a039c469056ac4` remained Draft and was not
  merged or deployed.
- Therefore production Ask metrics still used the earlier unsplit format and
  could not distinguish owner QA calls from external calls.

## Portfolio page-view snapshot

Vercel Web Analytics reported 9 anonymous visitors and 15 page views:

| Approximate country | Anonymous visitors | Page views | Paths represented |
| --- | ---: | ---: | --- |
| United States | 5 | 6 | Home, Projects |
| Singapore | 2 | 2 | Home only |
| United Kingdom | 1 | 1 | Home only |
| Japan | 1 | 6 | Home, Projects, FightGame |

All recorded referrer hostnames were empty. Aggregate page totals were Home
11, Projects 3 and FightGame 1. No About or Niulai page view appeared in this
snapshot. Per-path visitor counts must not be added because the same anonymous
visitor can appear under more than one path.

### Owner-supplied classification

John stated that the Japan desktop traffic and Singapore mobile traffic were
his own browsing. John also stated that his mobile connection had subsequently
switched to a Japan VPN exit. This is an Owner-supplied classification, not an
identity inferred by Vercel.

After excluding those Owner-declared country/device groups for this snapshot,
the remaining upper bound for candidate external traffic was 6 anonymous
visitors and 7 page views: United States 5/6 and United Kingdom 1/1. This is
only an upper bound because controlled release or acceptance traffic may still
be present. The aggregates cannot prove that any remaining visit was a
recruiter or other specific person.

The only traffic after the 10:00 UTC production release boundary was:

- 11:00 UTC: Singapore mobile, Home, one page view — Owner-classified;
- 12:00 UTC: United States desktop, Home, one page view — candidate external;
- 13:00 UTC: Singapore mobile, Home, one page view — Owner-classified.

The candidate external post-release visit was shallow: one Home page view and
no observed Ask John call. This describes aggregate depth only and does not
establish duration, intent or identity.

## Ask John snapshot

The exact daily aggregate contained five previously recorded calls:

- `mode:answer`: 3;
- `mode:system`: 2;
- `language:en`: 3;
- `language:zh`: 1;
- `language:zh-Hant-yue`: 1;
- corpus version: `1.2.0-draft`.

The language field is derived from the submitted question and selected answer
language; it is not the browser, phone or operating-system language. Question
and answer text are not retained.

No new Ask call had been recorded after the 10:00 UTC service restart. A call
on the released telemetry code would have initialized `requests`, country and
hour fields in the daily hash; those fields were absent. John had separately
stated that at least one of the five historical calls was his test. Because
Owner QA Mode was not deployed, the other historical calls cannot be reliably
classified as owner or external and must not be presented as confirmed visitor
usage.

## Operational interpretation

Future John-owned Portfolio page views should be excluded separately in each
browser using the existing local Web Analytics opt-out. After an explicitly
approved future deployment, Owner QA Mode will separate new Ask calls into
`owner_qa_requests` and `external_requests`; it will not retroactively classify
these five calls or identify page visitors.
