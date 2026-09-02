# Ask John — owner-operated VPS deployment

Status: Level 2 feature batch, pending owner acceptance  
Date: 2026-09-02

## Objective and scope

Ask John gives recruiters bounded answers from the approved public career corpus. The static portfolio remains on Vercel; model calls and global request controls run on the owner's VPS.

Included:

- exact-origin browser access from the portfolio;
- retrieval from the versioned public corpus only;
- server-side OpenRouter calls;
- persistent Redis counters for per-IP and daily ceilings;
- sensitive-question refusal, citation validation and fail-closed behavior;
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

## Acceptance criteria

- the HTTPS health endpoint responds without exposing configuration;
- a supported English and Chinese question returns a grounded answer with approved citations;
- a sensitive question returns the bounded refusal;
- a disallowed browser origin is rejected;
- Redis enforces the configured per-IP and daily ceilings across service restarts;
- stopping the service or control store does not affect the static portfolio;
- no credential, raw IP address, prompt or answer is committed or logged.

## Contribution boundary

The owner chose the product behavior, public evidence boundary, hosting direction and final acceptance. `bot14-agent` inspected the existing infrastructure and implemented the bounded service, local Redis adapter, tests, deployment configuration and verification under that direction.

## Release and evidence state

- Code and automated checks: `TESTED` once the repository suite passes.
- VPS endpoint: `NOT_VALIDATED` until HTTPS deployment and live checks complete.
- Production website integration: `NOT_VALIDATED` until the portfolio release containing the endpoint selection is deployed.
- Owner acceptance: `PENDING` until the owner reviews the live behavior.

Rollback is independent: the website can return to its same-origin disabled endpoint while the VPS service and HTTPS route are stopped separately.
