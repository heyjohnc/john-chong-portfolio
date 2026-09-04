# Ask John — owner-operated VPS deployment

Status: Production website and VPS endpoint validated
Last updated: 2026-09-03

## Objective and scope

Ask John gives recruiters bounded answers from the approved public career corpus. The static portfolio remains on Vercel; model calls and global request controls run on the owner's VPS.

Included:

- exact-origin browser access from the portfolio;
- retrieval from the versioned public corpus only;
- server-side OpenRouter calls;
- persistent Redis counters for per-IP and daily ceilings;
- sensitive-question refusal, citation validation and fail-closed behavior;
- recruiter-style intent aliases and bounded context resolution for follow-up questions;
- an LLM semantic-routing fallback for slang, typos, incomplete wording and previously unseen recruiter phrasing;
- read-only retrieval from a checked-in, commit-pinned snapshot of selected Niulai public-repository documentation;
- retrieval from a sanitized FightGame evidence pack without private-repository access;
- local, model-free responses for greetings, thanks, capability questions and farewells;
- aggregate telemetry without question text.

Not included:

- runtime browsing, arbitrary GitHub access, private-file access or external actions;
- storage of prompts, answers or raw IP addresses;
- an SLA, adoption claim or business-impact claim;
- unrestricted use of the owner's model account.

## Material decisions

1. Keep the provider key on the VPS rather than in the website or browser.
2. Use the existing persistent local Redis service instead of adding a hosted Upstash dependency.
3. Hash the client address before it becomes a Redis key.
4. Allow only the published portfolio origins in browser CORS responses.
5. Keep the existing provider, control-store and citation checks fail-closed.
6. Improve answerability at the retrieval layer first: map common recruiter phrasing to approved evidence, carry context only for reference-dependent follow-ups, and never broaden unsupported questions into a previous topic.
7. When the fast retrieval path cannot understand a question, let the configured LLM classify its meaning against section headings only. The router may select approved career sections or one fixed boundary category: missing public fact, off-topic, private/sensitive, or external action. It never receives private files and its free-form wording is never shown to the visitor.
8. Treat public GitHub content as a controlled ingestion source rather than a model tool. The source sync has no credential support, accepts one exact allowlisted public repository and selected Markdown ranges, resolves a full commit SHA, and produces a checked-in snapshot for review before release.
9. Keep FightGame private. Supply only a sanitized evidence pack linked to its public case page; do not give the service or model a private-repository token.

## Acceptance criteria

- the HTTPS health endpoint responds without exposing configuration;
- a supported English and Chinese question returns a grounded answer with approved citations;
- previously unseen colloquial questions about John's capabilities or employer fit are semantically routed to approved evidence;
- off-topic, unavailable, private and external-action intents receive bounded server-authored guidance rather than an invented answer;
- a sensitive question returns the bounded refusal;
- a disallowed browser origin is rejected;
- Redis enforces the configured per-IP and daily ceilings across service restarts;
- stopping the service or control store does not affect the static portfolio;
- no credential, raw IP address, prompt or answer is committed or logged.
- only approved project-source IDs are retrievable, and their citations retain a public source URL and revision.

## Anonymous hourly usage telemetry

Ask John records best-effort aggregate counters in the existing daily Redis
hash for 30 days. The accepted response awaits completion of the bounded
aggregate-write attempt, while a telemetry failure still never breaks the Ask
answer path. Each successful, accepted request increments daily totals and
UTC-hour buckets for request count, answer mode, detected response language and
a two-letter country code. It does not store a request timestamp more precise
than the hour, a raw IP address, a question, an answer, an identity or a
session. Existing IP-derived hashes remain limited to short-lived operational
rate control and are not read for usage reporting.

The public widget obtains the country code from the same-origin
`/api/country` Vercel Function. That function reads Vercel's
`x-vercel-ip-country` request header and returns only a validated ISO-style
two-letter code or `unknown`; it does not return the underlying address. The
widget passes that coarse code to the separately hosted Ask John service for
analytics only. A missing or malformed code becomes `unknown` and never blocks
an answer. The value is approximate, can reflect a VPN or proxy exit country,
and must not be interpreted as residence, nationality or identity.

The aggregate hash uses the existing exact key pattern
`<prefix>:metrics:YYYY-MM-DD`. New bounded fields include `requests`,
`country:<CC>` and `hour:HH:{requests|mode:<mode>|language:<language>|country:<CC>}`.
Operators may read only these exact daily aggregate keys for a requested date
range. They must not scan Redis, inspect per-client rate-limit hashes or join
the hourly/country totals with access logs or other identity data. Counts can
support statements such as “three English requests were answered during the
08:00 UTC bucket”; they cannot establish who asked them or what was asked.

## Owner QA scope split — Draft only

The independent Owner QA change adds daily and hourly
`external_requests`/`owner_qa_requests` fields while retaining `requests` as the
total. Ask accepts only a time-bounded Ed25519 capability signed after the
existing Presentation Authenticator flow; a frontend boolean is never trusted.
The Ask service holds the verification public key only and receives no TOTP
secret or Presentation session permission. Historical metrics are not
backfilled. Full data, expiry, revocation, threat and release boundaries are in
[`ASK_JOHN_OWNER_QA_MODE.md`](ASK_JOHN_OWNER_QA_MODE.md).

Status: `TESTED` on a Draft PR, not merged or deployed. This section does not
change the production-validation claims below for the currently released
service.

## Cost baseline

As of 2026-09-03, Ask John uses
`deepseek/deepseek-v4-flash-0731` through OpenRouter. The current OpenRouter
models API lists USD 0.065 per million prompt tokens, USD 0.18 per million
completion tokens and USD 0.016 per million cached-input tokens. The local
fallback estimator uses the same prompt and completion rates; when OpenRouter
returns a request cost, that provider-reported value takes precedence.

A controlled production sample on the current 40-section corpus reported:

- focused lexical retrieval plus one answer call: approximately USD 0.000148;
- colloquial semantic routing plus the answer call: approximately USD 0.000191;
- a locally handled greeting: no provider call and therefore no model charge.

Assuming 10 USDT is treated as USD 10 of usable OpenRouter credit, those two
paid paths correspond to approximately 67,500 focused answers or 52,300
semantic-routed answers. A mixed workload is reasonably budgeted at roughly
50,000–65,000 paid answers. For operational planning, reserve 20% for longer
questions, conversation history, provider/rate changes and rounding; a
conservative commitment is therefore about 40,000–50,000 answers per USD 10.

This is a planning estimate, not a billing guarantee. Response length, selected
evidence, conversation history, routing path and OpenRouter provider price can
change the cost. The OpenRouter activity/credits ledger remains the source of
truth for actual spend. Pricing source:
`https://openrouter.ai/api/v1/models` and the model page
`https://openrouter.ai/deepseek/deepseek-v4-flash-0731`.

## On-demand usage checks

Owner decision on 2026-09-03: an always-on analytics dashboard is not needed.
When John occasionally wants to know whether Ask John has been used, the
website coordinator may run a read-only check against the existing exact
aggregate Redis keys and report:

- today's accepted request count;
- recent daily totals, normally for the last 7 or 30 days while retained; and
- aggregate answer modes and languages when those best-effort metrics exist.

The check must not read per-client hashed rate-limit keys, scan unrelated Redis
data, expose a public or Presentation admin route, or retrieve question text,
answers, raw IP addresses, identities, sessions or credentials. No scheduled
report, local dashboard or production change is justified for occasional use.

These values represent requests, not unique people. They may include John and
QA traffic, and the best-effort mode/language totals can be lower than the
rate-control request count if telemetry recording fails. The result therefore
supports only a bounded statement such as “Ask John received requests during
this period,” not a visitor, recruiter, adoption or business-impact claim.

## Portfolio interpretation

The portfolio website and Ask John assistant are themselves a defensible
portfolio-candidate system. Together they demonstrate bilingual product and
interface design, a versioned public knowledge base, bounded retrieval,
allowlisted project-source ingestion, visible citations, deterministic and LLM
semantic routing, privacy and refusal rules, request/cost controls, regression
evaluation, a split Vercel/VPS deployment and production browser validation.

The safe public claim is a working, deployed personal portfolio evidence
assistant designed and accepted by John with substantial Agent-accelerated
implementation. It is not a client commission, enterprise-scale RAG platform,
large-user deployment, formal security audit or proof of business impact. It
does not need to become a tenth card in the selected-project archive merely to
remain valid portfolio evidence; its live presence across the site already
demonstrates the capability without making the project page self-referential.

## Contribution boundary

The owner chose the product behavior, public evidence boundary, hosting direction and final acceptance. `bot14-agent` inspected the existing infrastructure and implemented the bounded service, local Redis adapter, tests, deployment configuration and verification under that direction.

## Release and evidence state

- Anonymous hourly usage telemetry: `PRODUCTION_VALIDATED` — PR #25 merged as
  `6898b11255c097b6ebf3525d2df8985d9eac6d0d`. Vercel production deployment
  `dpl_D28LC7EaPzmqatbUBA4nQ8Vt3TRg` served the validated `/api/country`
  endpoint and released the widget country field; the VPS Ask John service was
  fast-forwarded to the same commit and restarted successfully. All 48
  repository tests and all 54 deterministic retrieval/policy evaluations
  passed before release. A production
  browser with the owner page-view opt-out received the coarse `FR` edge
  country code and attached it to an intercepted Ask request. The final Ask
  POST was deliberately mocked in the browser, so the five pre-existing daily
  requests were unchanged and no production question, answer or QA telemetry
  was created. The public page had no console error, the Ask health endpoint
  returned HTTP 200, the Presentation shell/session remained available, and
  its unauthenticated manifest remained HTTP 401.
- Code and automated checks: `TESTED` — 27/27 repository tests and 54/54 deterministic retrieval/policy evaluations passed after the approved project-source feature on 2026-09-03.
- Natural-question handling: `TESTED` — added coverage for broad project, experience, employer-value, client-delivery, Agent-dependence and flagship-project questions in English and Chinese. Reference-dependent follow-ups such as “它用了什么技术？” now inherit the preceding topic, while unrelated unsupported questions do not.
- Enterprise-readiness answers: `TESTED` — the public corpus can explain both the applied-AI work John can reasonably contribute to and the enterprise onboarding or evidence gaps that remain, without converting that assessment into a claim of prior formal enterprise-AI employment.
- Starter-question rotation: `TESTED` — the widget selects three unique topics from a 12-topic bilingual pool on each page load and preserves those topics when the visitor changes language.
- Bounded small talk: `TESTED` — greetings, thanks, assistant-identity questions and farewells receive concise local responses without a provider call; unrelated topics are redirected to the approved public-career scope.
- Local persistent-control path: `TESTED` — a disposable Redis namespace allowed the first request and atomically rejected the next request at the configured per-IP ceiling; test keys were removed afterwards.
- VPS endpoint: `PRODUCTION_VALIDATED` — HTTPS health, English and Chinese grounded answers, sensitive-question refusal, exact-origin CORS and disallowed-origin rejection were checked on 2026-09-02.
- Corpus `1.2.0-draft` rollout: `PRODUCTION_VALIDATED` — after the VPS service restart, live English and Chinese enterprise-readiness questions returned the new corpus version and cited `KB-20`/`KB-21` evidence on 2026-09-02.
- LLM semantic-routing canary: `PRODUCTION_VALIDATED` — the Owner-reported phrases `John 能干嘛？` and `他适合什么企业？`, plus two unseen colloquial hiring questions, were routed to relevant approved sections and returned cited answers. Separate live checks classified weather as off-topic, an unavailable food preference as missing public information, and an interview-booking request as an external action; each received the intended server-authored guidance or refusal.
- Approved flagship sources: `PRODUCTION_VALIDATED` — service revision `e1215bacb98702dca33219facd35bd283f245d47` indexed 29 profile sections, four sanitized FightGame sections and seven selected Niulai public-repository sections. Live Niulai answers cited the immutable public commit `9489e1ff4710351ce5eba11f33790e4241b293ff`; live FightGame architecture and repository-visibility answers cited only the sanitized case evidence. The model has no GitHub tool or private-repository credential.
- Measured sample: three live grounded answers completed in 11.2–17.2 seconds and reported approximately USD 0.000093–0.000113 each. This is a three-request acceptance sample, not a latency or cost SLA.
- Retrieval-improvement spot check: the revised code returned grounded answers for a broad project question, an Agent-dependence question and a contextual FightGame technology follow-up. After zero-score evidence was removed, the broad project question was rechecked directly against DeepSeek V4 Flash and cited only `KB-27`.
- Production website integration: `PRODUCTION_VALIDATED` — the release was deployed directly to `https://johnchong.info` on 2026-09-02 with the owner's approval. Post-deployment desktop and mobile browser checks passed for the compact launcher, three unique randomly selected starter questions, stable English/Chinese topic mapping, grounded answers, citations, keyboard behavior and 320px layouts.
- Owner deployment decision: `APPROVED` — the owner explicitly requested direct production deployment without an intermediate Preview. Further visual or wording refinements can still be handled as normal follow-up changes.

Rollback is independent: the website can return to its same-origin disabled endpoint while the VPS service and HTTPS route are stopped separately.

## Representative deployment failure

The first acceptance request sent in the same second as a service restart received HTTP 502 because Nginx reached the upstream during its short restart window. The service was already configured to restart automatically; a health check confirmed readiness and the retry succeeded. Future restarts should be followed by an explicit local health check before external acceptance probes. No production website traffic was routed to the service at the time.
