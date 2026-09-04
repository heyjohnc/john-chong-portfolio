# Ask John Owner QA Mode

Status: `TESTED` on an independent Draft PR; not merged or deployed

Evidence level: Level 2 security-sensitive feature

Last updated: 2026-09-03

## Objective

Let John exclude his own Ask John acceptance traffic from the anonymous
external-request aggregate after completing the existing Presentation
Authenticator gate once in each browser profile. The marker lasts no longer
than 30 days, is independently revocable, and grants no Presentation access.

This change does not identify external visitors. It separates only two bounded
request classes:

- `external_requests`: no currently valid Owner QA capability was verified;
- `owner_qa_requests`: the Ask VPS verified an unexpired, unrevoked capability
  signed by the Presentation service.

Historical requests are not reclassified or backfilled. Missing scope fields
before rollout must remain “scope unknown,” not be relabelled as external.

## Acceptance and design

| Requirement | Implemented design | Evidence state |
| --- | --- | --- |
| Activate after Presentation verification | An authenticated Presentation session can call `POST /api/owner-qa/token`; the browser does this immediately after a successful TOTP submission | `TESTED` |
| Approximately 30-day lifetime | Default and hard maximum are 2,592,000 seconds; Ask independently rejects expiry and tokens with a longer signed lifetime | `TESTED` |
| Do not trust a browser boolean | The widget sends a signed capability; the Ask VPS verifies Ed25519 signature, audience, schema, issue time, expiry and revocation state | `TESTED` |
| Presentation isolation | The QA capability is not a cookie and is never accepted by Presentation manifest or asset authorization | `TESTED` |
| Cross-origin operation | The public origin sends the capability explicitly in a JSON body to the separate Ask VPS over HTTPS; exact-origin CORS remains in force and credentials mode is not enabled | `TESTED` locally |
| Exit and revocation | The Ask widget shows a quiet verified status row and `Turn off` action; revocation stores only a token digest for its remaining lifetime | `TESTED` |
| Aggregate split | Each accepted request increments the existing total plus exactly one daily and hourly scope counter | `TESTED` |
| Preserve controls | Scope classification occurs only after the existing IP/daily control allows the request; Owner QA calls still consume the same rate and cost ceilings | `TESTED` |
| Preserve Analytics separation | No analytics bootstrap or custom event was added to Presentation or Ask; the existing browser-local Web Analytics opt-out is unchanged | `TESTED` |

## Architecture and capability scope

```text
johnchong.info/presentation/                 Ask VPS
  Presentation HttpOnly session               public verify key only
  separate Ed25519 private signing key         Redis rate/cost controls
             |                                 Redis aggregate counters
             | signed capability                       ^
             v                                           |
  johnchong.info localStorage ---- explicit JSON --------+
       QA marker only                HTTPS + exact CORS
```

The signer and verifier are deliberately separated in both code and
configuration:

- Presentation alone loads
  `PRESENTATION_OWNER_QA_SIGNING_PRIVATE_KEY_B64` and contains token-issuance
  code.
- Ask alone loads `ASK_JOHN_OWNER_QA_VERIFY_PUBLIC_KEY_B64` and contains only
  public-key verification code.
- Ask receives no Presentation TOTP secret, Presentation cookie, session hash,
  manifest permission or protected content.
- Presentation never receives an Ask question, answer, country or telemetry
  record.

The token payload contains exactly five bounded claims: schema version,
`ask-john-owner-qa` audience, issued-at time, expiry time and a random nonce.
It contains no name, account, email, phone, device identifier, hardware
identifier, browser fingerprint, IP address, Presentation session value,
question or answer. The nonce makes capabilities unique for targeted
revocation; it is not derived from a person, browser or device.

The marker is stored as `john-chong-owner-qa-v1` in local storage for the
canonical portfolio origin. This is the minimum browser persistence required
for a browser-specific 30-day choice. It does not use cookies or server-side
identity tracking. The direct `present-john...sslip.io` host has a different
browser storage origin, so activation must be completed through the canonical
`https://johnchong.info/presentation/` route.

## Revocation and expiry

The widget first calls `POST /api/owner-qa/status`; the “QA mode active” row is
shown only after server verification. `Turn off` calls
`POST /api/owner-qa/revoke`. A successful revoke writes only:

```text
<ask-prefix>:owner-qa-revoked:<sha256-of-canonical-signed-payload> = 1
```

Its Redis TTL is the capability's remaining lifetime and can never exceed 30
days. Active capabilities have no server-side registry. The local marker is
removed only after the revoke succeeds, or when Ask reports that it is invalid,
expired or already revoked. The digest is derived from the canonical signed
payload rather than signature text, so alternate signature representations
cannot select another revocation record. Rotating the Ed25519 key pair
invalidates every outstanding marker and is the emergency global-revoke path.

Presentation `Exit & lock` continues to revoke only the 30-minute Presentation
session. It intentionally does not revoke the independently scoped Owner QA
marker; otherwise the requested 30-day browser setting would disappear after
every presentation lock. Owner QA has its own visible `Turn off` control.

## Aggregate data model and retention

The existing daily hash remains `<prefix>:metrics:YYYY-MM-DD` with a fixed
30-day TTL. Existing totals remain intact. Each accepted Ask request increments:

```text
requests
external_requests | owner_qa_requests
hour:HH:requests
hour:HH:external_requests | hour:HH:owner_qa_requests
```

The existing bounded mode, language, country and corpus-version fields continue
unchanged. Neither scope contains a token, token digest, question, answer, raw
IP, identity or session. Revocation digests are not read for reporting and must
not be joined to access logs or aggregate telemetry.

Ask necessarily processes the current question and bounded recent context to
answer it, as before, but neither the QA feature nor server telemetry persists
that content. The existing optional three-day conversation memory remains only
in the user's browser and is not joined to the QA marker. The existing hashed,
short-lived IP key remains solely for rate control; raw IP is not stored by the
application.

## Threat boundary

- Editing local storage, sending `qa_token: true`, changing a payload or signing
  with another key does not produce `owner_qa`; it is classified as external.
- The verifier accepts only canonical unpadded base64url. An Ed25519 signature
  must be exactly 86 encoded characters, decode to exactly 64 bytes and encode
  back to the identical text. The payload must also round-trip canonically and
  match the issuer's fixed JSON serialization. This prevents equivalent text
  encodings from being accepted. Revocation additionally hashes the canonical
  signed payload rather than the complete token text, so equivalent signature
  representations cannot select a second revocation record.
- A stolen valid capability can misclassify requests until it expires or is
  revoked. It still cannot open Presentation, bypass rate/cost controls, reveal
  identity or access private material. TLS, local browser storage and the
  bounded lifetime reduce but do not eliminate bearer-token theft risk.
- If the verification key or revocation store is unavailable, Ask fails closed
  for classification and treats the request as external while preserving the
  normal answer path and its controls.
- Compromise of the Ask service exposes only a public verification key; it does
  not provide signing or Presentation privileges.
- Compromise of the Presentation QA signing key could mint QA classifications
  but still would not create a Presentation session or bypass Ask usage limits.

## Verification

Local verification on 2026-09-03 used generated test-only Ed25519 keys and no
production endpoint or production Redis namespace:

- repository tests: 60/60 passed, including canonical encoding and protected
  credential-file writing;
- deterministic retrieval and policy evaluation: 54/54 passed;
- static production build and Node syntax checks: passed;
- valid signature and ordinary-visitor scope routing: passed;
- payload/signature tampering, expiry, alternate-key forgery, non-canonical
  equivalent signatures and non-canonical signed JSON: rejected;
- unauthenticated issuance and disallowed Presentation origin: rejected;
- QA capability used as a Presentation session: rejected with HTTP 401;
- exact-origin Ask CORS, preflight and disallowed origin: passed;
- status, revocation and post-revocation rejection: passed;
- disposable Redis on an isolated port: stored one SHA-256 capability digest,
  applied a 599-second remaining-lifetime TTL to a 600-second test token, and
  changed subsequent classification from `owner_qa` to `external`; the
  disposable server was then stopped;
- browser marker, verified quiet status and explicit revoke wiring: passed;
- local Chromium at desktop and 320px widths: active status, owner-scoped
  fixture answer, revoke, local-marker removal and zero post-opt-out console
  errors passed;
- existing Web Analytics exclusion, Presentation access, Ask retrieval,
  provider adapters, rate controls and public-page tests: passed.

Secret-pattern, fingerprint/device-collection, built-output and diff checks
passed. No production Ask request was part of branch verification, so
production `external_requests` was not changed.

### Independent-review correction

An independent PR review reproduced a nondeterministic failure in the original
forged-signature assertion and identified a material encoding edge case. An
Ed25519 signature is 64 bytes, so its unpadded base64url representation has 86
characters and unused bits in the last character. Node can decode multiple
non-canonical final characters to the same signature bytes. The original
verifier accepted that alias while revocation hashed the original token text,
allowing equivalent encodings to select different revocation keys.

The corrected verifier requires exact signature length, exact decoded length
and canonical round-trip encoding before signature verification. It also
canonicalizes the payload base64url and enforces the issuer's exact JSON field
order and serialization while continuing to verify the signature over the
original payload text. The revocation key now hashes that canonical signed
payload, not signature text. The flaky mutation was replaced with a guaranteed
different, byte-changing signature mutation. Dedicated tests now construct an
equivalent non-canonical signature, reject it, prove it cannot bypass a
canonical revocation, and reject a correctly signed but non-canonical payload
serialization. The focused Owner QA suite passed once with full output and 50
additional consecutive randomized-key runs before the then-complete 59-test
suite passed.

A release-day preflight on 2026-09-04 exposed a test-clock boundary: two
integration assertions issued a capability at the fixed 2026-09-03 unit-test
time but exercised handlers that correctly validate against the real clock.
The capability had therefore expired overnight. Those integration assertions
now issue against a captured runtime clock, while deterministic expiry and
canonical-encoding tests retain the fixed clock. This changes test setup only,
not production token validation. The complete suite was rerun before the
credential gate. A further protected-writer regression brought the suite to
60/60 and verified a matched key pair, `0700` directory, `0600` files and
refusal to overwrite a single-file residue.

## Owner and Agent boundary

John defined the desired owner exclusion, privacy boundary, 30-day preference
and Draft-only delivery gate. `hksub-agent` reviewed the split architecture,
implemented separate signing and verification capabilities, aggregate routing,
revocation, interface state, tests and evidence. The Agent did not access the
Presentation credential file, request an Authenticator code, modify production,
merge the branch or assert owner acceptance.

Current evidence state is `TESTED`, not `APPROVED`, `DEPLOYED` or
`PRODUCTION_VALIDATED`.

## Release gate and owner actions

After a future explicit merge/deploy approval, John must perform the credential
step in a private interactive VPS terminal. The reviewed writer never prints a
key value and refuses to overwrite either target if a prior attempt left one
behind:

```bash
node /home/ubuntu/john-chong-portfolio-hksub/scripts/generate-owner-qa-keys.mjs --write-env-files
```

It writes the private value only to
`/home/ubuntu/.config/john-owner-qa/presentation.env` and the public value only
to `/home/ubuntu/.config/john-owner-qa/ask.env`, with file mode `0600` and
directory mode `0700`. Do not read, paste, copy or record either value in chat,
Git, terminal output or deployment logs.

Release order must be Ask verifier and endpoints, then Presentation signer,
then the public widget. After both services pass health checks, John should:

1. keep the existing Web Analytics opt-out enabled in each owner browser;
2. open `https://johnchong.info/presentation/` in that browser profile;
3. complete the existing Authenticator flow locally;
4. return to a public page, open Ask and confirm `QA mode active`;
5. make one approved QA request and verify only `owner_qa_requests` increases;
6. test `Turn off`, then re-authenticate if that browser should remain in QA
   mode.

Production verification must snapshot aggregate counters before and after the
controlled QA request. Ordinary-visitor regression is already automated and
should not submit an unmarked production question merely for testing, because
that would intentionally increment `external_requests`.

## Limitations

- The marker is per browser profile and per origin. Clearing site data,
  changing profiles or using a different browser requires Presentation
  verification again.
- Private/incognito profiles normally discard the marker when closed.
- The scope split estimates owner QA versus all other accepted calls; it does
  not count people, identify recruiters or prove visit depth.
- Requests made before rollout remain unclassified and cannot be reconstructed.
- Global revocation requires key rotation and reactivation in each owner
  browser.
