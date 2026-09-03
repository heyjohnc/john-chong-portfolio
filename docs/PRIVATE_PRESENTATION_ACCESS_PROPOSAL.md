# Private presentation access proposal

Status: access scaffold implemented; production enrollment and content pending

Evidence level: Level 2 design proposal

Last updated: 2026-09-03

## Objective

Let John use the portfolio as the primary presentation surface for interviews
without placing controlled presentation material in the public static bundle.
The public site may show a small `Presentation` entry point, but authentication
must complete before the backend returns any protected index, slide, PDF,
video, screenshot or project detail.

## Feasibility and terminology

This is feasible with the current split architecture: the public static site
can remain on Vercel while a separate owner-operated service authenticates the
viewer and serves protected material.

Google Authenticator is a client for the standard TOTP protocol. A server
creates and retains a protected shared secret; the Authenticator app generates
a short-lived six-digit code from that secret and time, and the server verifies
the submitted code. The TOTP standard is defined by RFC 6238.

A six-digit TOTP code by itself is an access gate, not two-factor
authentication. It becomes 2FA only when combined with an independent factor,
such as a password. For John's owner-operated interview use, the approved first
direction prioritises a faster TOTP-only gate:

- `owner presenter mode`: one current TOTP from John's Authenticator app, with
  no username or presentation password;
- `guest review mode`: a recipient-specific, expiring invitation or an email
  one-time PIN, without sharing John's TOTP seed or current code.

The UI should call the field `Authenticator code`, not `2FA password`. If the
threat model later changes, a password or passkey can be added as a second
factor without moving any protected content into the public front end.

## Recommended product shape

Add one restrained `Presentation` link in the footer rather than another
floating control beside Ask John. It opens a branded protected surface such as
`present.johnchong.info` in a new page.

```text
public johnchong.info on Vercel
  -> public Presentation link only
  -> protected presentation service
       -> six-digit TOTP for John
       -> short-lived server session
       -> authenticated manifest and asset routes
       -> private presentation storage
```

The public repository and Vercel output may contain the entry-point label and a
generic login shell only. They must not contain the protected presentation
manifest, filenames, text, thumbnails, PDFs, videos, TOTP secret or a reversible
copy of any credential.

## Server-side boundary

The presentation service should:

1. verify the submitted TOTP against a server-side secret that never enters the
   public repository, Vercel bundle or browser;
2. apply strict attempt limits and temporary lockout before issuing a session;
3. prevent reuse of an accepted TOTP time step;
4. issue an opaque, short-lived session using an `HttpOnly`, `Secure` and
   restrictive `SameSite` cookie;
5. check that session on every manifest, slide, PDF, image, download and video
   request—not only on the first HTML page;
6. return `Cache-Control: no-store` for private pages and metadata;
7. keep private assets outside the Vercel public build and public Git history;
8. log only bounded authentication and operational metadata, never passwords,
   TOTP codes, TOTP seeds or protected document contents;
9. provide protected, single-use recovery codes and an explicit session revoke
   action; and
10. fail closed if the session store or authentication configuration is
    unavailable.

The minimum request flow is:

```text
GET  /                  -> generic login shell, no private manifest
POST /api/auth/totp     -> validate six digits and rate limits
                         -> create random opaque session in Redis
                         -> set HttpOnly + Secure session cookie
GET  /api/manifest      -> return presentation sections after session check
GET  /asset/:id         -> stream one authorised asset after session check
POST /api/logout        -> revoke the server session and clear the cookie
```

Use a 30-minute session for the first release, with an explicit `Lock` control.
Reject malformed codes before verification, allow only the minimum clock drift
needed for normal phone/server timing, cap attempts per IP and globally, and
store the last accepted TOTP time step so the same code cannot be replayed.

For video, the authenticated server route must also enforce authorization on
byte-range requests. For object storage, keep the bucket private and issue only
short-lived, narrowly scoped read URLs after session validation. A signed URL
is a bearer credential until it expires and must not be treated as uncopyable.

## What browser isolation can and cannot guarantee

Before authentication, View Source and browser network tools should reveal no
protected content because that content has not been sent to the browser. A
front-end-only password, encrypted JSON with a bundled decryption key, hidden
route, CSS concealment or JavaScript feature flag does not meet this goal.

After authentication, the browser must receive material in order to display
it. An authorized viewer can therefore inspect network responses, save files or
take screenshots. The protected area should contain sanitized, presentation-
safe material, not raw client secrets, private keys, unrestricted internal
logs, private contracts or evidence that John is not authorized to disclose.

## Access modes

### A. Interview presenter mode — recommended first milestone

- John opens the protected page on his own laptop.
- John enters the current six-digit Google Authenticator code only.
- The session lasts approximately 30 minutes and can be ended immediately.
- The page provides a rehearsed sequence, project deep dives, demo recordings
  and offline-safe fallback files.
- The interviewer never receives the TOTP seed or a reusable credential.

### B. Recruiter guest review — optional later milestone

- Create a random, recipient-specific invitation with a short expiry and a
  server-side revocation record; or
- use an access provider that sends a one-time PIN only to an allowlisted email
  address.

Cloudflare Access supports email one-time PIN login for explicitly allowed
addresses and also supports temporary approval. It is a stronger fit for guest
access than giving recruiters John's Authenticator code. Adopting it would be a
separate infrastructure decision because `johnchong.info` is not currently
using Cloudflare nameservers.

## Presentation content model

The private area should not repeat the public portfolio as a longer page. It
should provide one guided interview route plus optional evidence drawers.

### 1. Guided presentation — default 6–8 minute route

1. **Opening / 20 seconds** — name, target role and one sentence: turning
   unclear needs into testable AI products.
2. **How I work / 45 seconds** — define, bound, direct Agents, review failures,
   run UAT and accept the result; show the owner/Agent contribution boundary.
3. **Niulai Squad / 2–3 minutes** — the four-Agent product problem, one shared
   timeline, 3-of-4 decision gate, execution and publishing permissions, one
   real failure/recovery example, deployment evidence and selected public
   reactions.
4. **FightGame / 2–3 minutes** — the player flow, authoritative multiplayer
   result, personalised-avatar flow, Quinn bounded RAG, contextual battle
   coaching, one cross-device defect and the owner-led correction loop.
5. **Breadth / 45 seconds** — one visual row grouping the video-production,
   NFT-production, automation and developer-tool workflows. Do not explain all
   smaller projects unless the interviewer chooses one.
6. **Role fit / 30 seconds** — the enterprise work John can take on now, the
   gaps he is ready to learn inside a team, and the type of role sought.

Each guided step should have `Next`, `Back`, `Jump to evidence` and `Exit &
lock`. Keyboard arrow navigation and a visible elapsed-time cue are useful for
an interview but should not turn the page into a decorative slide deck.

### 2. Project demonstrations

- **FightGame recorded fallback:** a 60–90 second sequence covering reference
  image upload, generated avatar, map identity, challenge, 1v1 battle and both
  players receiving the same authoritative result.
- **FightGame live option:** open only when its current provider and server
  checks pass; never let a broken live dependency block the interview.
- **Niulai recorded fallback:** candidate discovery, four role views, frozen
  vote, paper/controlled lifecycle, public projection and evidence trail.
- **Niulai live option:** a read-only product route by default. Do not expose
  signer controls, credentials, internal provider responses or unrestricted
  social publishing.

### 3. Evidence room — opened only for follow-up questions

- simplified architecture diagrams rather than raw repository trees;
- selected, redacted UAT screenshots and acceptance records;
- one defect card per flagship: symptom, reproduction, correction and
  regression result;
- test/release identities, bounded cost records and deployment receipts;
- public feedback with source links and an explicit evidence-strength label;
- one owner-versus-Agent contribution table; and
- a controlled business-history timeline with client identities removed unless
  disclosure is authorised.

### 4. Documents

- current two-page English CV;
- optional Chinese CV for recruiter communication;
- one-page FightGame and Niulai summaries;
- an interview contact card with the public portfolio and GitHub links; and
- no raw identity document, private contract, private key, wallet seed, API key
  or unrestricted client file.

The website can replace most paper presentation material, but a local offline
copy of the deck and demo videos should remain on the interview laptop in case
venue Wi-Fi, DNS, Vercel or the VPS is unavailable.

## Acceptance criteria for a future implementation

- unauthenticated source, HTML and network requests contain no protected
  manifest or asset;
- direct access to every protected asset fails without a valid session;
- a valid current TOTP creates only a short-lived session;
- invalid and replayed codes are rate-limited and rejected;
- logout, expiry and server-side revocation remove access;
- protected responses are not cached by the browser or shared proxy;
- desktop and mobile keyboard flows remain usable;
- public Ask John remains independent if the presentation service is stopped;
- secrets and protected assets are absent from the public repository and
  Vercel output; and
- one live path and one offline fallback are rehearsed before an interview.

## Current decision state

- Feasibility: confirmed.
- Preferred owner authentication: TOTP-only gate for the first presenter
  milestone; the UI must not mislabel it as full 2FA.
- Preferred guest authentication: expiring per-recipient access, not John's
  TOTP.
- Storage and service implementation: separate Node service with Redis-backed
  rate, replay and session controls is implemented and locally testable.
- Presentation entry point: implemented in the portfolio footer with an
  external Vercel rewrite; production activation remains gated on owner TOTP
  enrollment and deployment verification.
- Content inventory: structure approved; reviewed content remains pending.
- Protected material: not yet uploaded.

## Primary references

- Google Authenticator help:
  `https://support.google.com/accounts/answer/1066447`
- RFC 6238 TOTP:
  `https://datatracker.ietf.org/doc/html/rfc6238`
- OWASP Multifactor Authentication Cheat Sheet:
  `https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html`
- Cloudflare Access one-time PIN:
  `https://developers.cloudflare.com/cloudflare-one/integrations/identity-providers/one-time-pin/`
- Cloudflare Access temporary authentication:
  `https://developers.cloudflare.com/cloudflare-one/access-controls/policies/temporary-auth/`
- Cloudflare R2 presigned URLs:
  `https://developers.cloudflare.com/r2/api/s3/presigned-urls/`

## Contribution boundary

John proposed using a backend-authenticated portfolio presentation area,
specified Google Authenticator-style access and chose a TOTP-only owner flow
without a presentation password as the preferred first milestone.
`bot14-agent` assessed the current architecture, separated owner and guest
access needs, documented the server-side and disclosure boundaries, designed
the guided presentation and evidence-room content structure, and implemented
the first access scaffold. Protected interview content has not been uploaded.
