# Private presentation access proposal

Status: proposed, not implemented

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
such as a password. This proposal therefore distinguishes:

- `owner presenter mode`: password plus TOTP from John's Authenticator app;
- `guest review mode`: a recipient-specific, expiring invitation or an email
  one-time PIN, without sharing John's TOTP seed or current code.

## Recommended product shape

Add one restrained `Presentation` link in the footer rather than another
floating control beside Ask John. It opens a branded protected surface such as
`present.johnchong.info` in a new page.

```text
public johnchong.info on Vercel
  -> public Presentation link only
  -> protected presentation service
       -> password + TOTP for John
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

1. verify the password and TOTP on the server;
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
- John enters a presentation password and a current Google Authenticator code.
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

Start with a small, curated manifest rather than copying the whole evidence
archive:

- a 5–8 minute interview presentation;
- FightGame and Niulai deep-dive sequences;
- short recorded fallbacks for live demos;
- selected architecture, UAT, failure-recovery and contribution-boundary
  evidence;
- controlled client-delivery examples only after sanitization and disclosure
  approval; and
- a downloadable current CV or project summary where useful.

The website can replace most paper presentation material, but a local offline
copy of the deck and demo videos should remain on the interview laptop in case
venue Wi-Fi, DNS, Vercel or the VPS is unavailable.

## Acceptance criteria for a future implementation

- unauthenticated source, HTML and network requests contain no protected
  manifest or asset;
- direct access to every protected asset fails without a valid session;
- valid password plus current TOTP creates only a short-lived session;
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
- Preferred owner authentication: password plus TOTP.
- Preferred guest authentication: expiring per-recipient access, not John's
  TOTP.
- Storage and service implementation: not yet selected or built.
- Presentation link and content inventory: pending owner approval.
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

John proposed using a backend-authenticated portfolio presentation area and
specified Google Authenticator-style access as the initial direction.
`bot14-agent` assessed the current architecture, separated owner and guest
access needs, documented the server-side and disclosure boundaries, and made
the small approved Ask launcher-label change. No protected presentation system
or private-content upload has been implemented by this proposal.
