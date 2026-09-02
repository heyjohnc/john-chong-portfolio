# Ask John — owner-operated VPS deployment

Status: Production website and VPS endpoint validated
Date: 2026-09-02

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
- local, model-free responses for greetings, thanks, capability questions and farewells;
- aggregate telemetry without question text.

Not included:

- browsing, private-file access or external actions;
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

## Contribution boundary

The owner chose the product behavior, public evidence boundary, hosting direction and final acceptance. `bot14-agent` inspected the existing infrastructure and implemented the bounded service, local Redis adapter, tests, deployment configuration and verification under that direction.

## Release and evidence state

- Code and automated checks: `TESTED` — 25/25 repository tests and 48/48 deterministic retrieval/policy evaluations passed on 2026-09-02.
- Natural-question handling: `TESTED` — added coverage for broad project, experience, employer-value, client-delivery, Agent-dependence and flagship-project questions in English and Chinese. Reference-dependent follow-ups such as “它用了什么技术？” now inherit the preceding topic, while unrelated unsupported questions do not.
- Enterprise-readiness answers: `TESTED` — the public corpus can explain both the applied-AI work John can reasonably contribute to and the enterprise onboarding or evidence gaps that remain, without converting that assessment into a claim of prior formal enterprise-AI employment.
- Starter-question rotation: `TESTED` — the widget selects three unique topics from a 12-topic bilingual pool on each page load and preserves those topics when the visitor changes language.
- Bounded small talk: `TESTED` — greetings, thanks, assistant-identity questions and farewells receive concise local responses without a provider call; unrelated topics are redirected to the approved public-career scope.
- Local persistent-control path: `TESTED` — a disposable Redis namespace allowed the first request and atomically rejected the next request at the configured per-IP ceiling; test keys were removed afterwards.
- VPS endpoint: `PRODUCTION_VALIDATED` — HTTPS health, English and Chinese grounded answers, sensitive-question refusal, exact-origin CORS and disallowed-origin rejection were checked on 2026-09-02.
- Corpus `1.2.0-draft` rollout: `PRODUCTION_VALIDATED` — after the VPS service restart, live English and Chinese enterprise-readiness questions returned the new corpus version and cited `KB-20`/`KB-21` evidence on 2026-09-02.
- LLM semantic-routing canary: `PRODUCTION_VALIDATED` — the Owner-reported phrases `John 能干嘛？` and `他适合什么企业？`, plus two unseen colloquial hiring questions, were routed to relevant approved sections and returned cited answers. Separate live checks classified weather as off-topic, an unavailable food preference as missing public information, and an interview-booking request as an external action; each received the intended server-authored guidance or refusal.
- Measured sample: three live grounded answers completed in 11.2–17.2 seconds and reported approximately USD 0.000093–0.000113 each. This is a three-request acceptance sample, not a latency or cost SLA.
- Retrieval-improvement spot check: the revised code returned grounded answers for a broad project question, an Agent-dependence question and a contextual FightGame technology follow-up. After zero-score evidence was removed, the broad project question was rechecked directly against DeepSeek V4 Flash and cited only `KB-27`.
- Production website integration: `PRODUCTION_VALIDATED` — the release was deployed directly to `https://johnchong.info` on 2026-09-02 with the owner's approval. Post-deployment desktop and mobile browser checks passed for the compact launcher, three unique randomly selected starter questions, stable English/Chinese topic mapping, grounded answers, citations, keyboard behavior and 320px layouts.
- Owner deployment decision: `APPROVED` — the owner explicitly requested direct production deployment without an intermediate Preview. Further visual or wording refinements can still be handled as normal follow-up changes.

Rollback is independent: the website can return to its same-origin disabled endpoint while the VPS service and HTTPS route are stopped separately.

## Representative deployment failure

The first acceptance request sent in the same second as a service restart received HTTP 502 because Nginx reached the upstream during its short restart window. The service was already configured to restart automatically; a health check confirmed readiness and the retry succeeded. Future restarts should be followed by an explicit local health check before external acceptance probes. No production website traffic was routed to the service at the time.
