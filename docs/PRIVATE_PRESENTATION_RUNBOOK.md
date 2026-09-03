# Private presentation service runbook

Status: scaffold production-validated; protected content pending

Last updated: 2026-09-03

## Boundary

The portfolio exposes only a `Presentation` entry point. The six-digit login
shell is public, but the presentation manifest and every asset route require a
short-lived server-side session. Private presentation files belong in
`/home/ubuntu/.local/share/john-presentation`, outside the public repository,
Vercel output and browser bundle.

This first milestone intentionally returns an authenticated placeholder. It
proves the access path before any reviewed interview material is added.

## Owner enrollment and rotation boundary

Production enrollment was completed by John and validated on 2026-09-03. Do
not rerun enrollment, inspect the protected environment, or request an
Authenticator code during normal content and website work.

The original bootstrap command is retained below for disaster recovery and a
deliberate owner-operated rotation only:

Run this yourself in an interactive SSH terminal after deploying the service
source:

```bash
cd /home/ubuntu/john-chong-presentation-service
node scripts/setup-presentation-totp.mjs
```

The command creates a protected environment file and shows the one-time manual
setup key. During a deliberate new enrollment, add it to Google Authenticator
as a time-based entry. Never paste that key into chat, Git, a screenshot, a
report or the public website. The script refuses to overwrite the current
enrollment; replacement requires an explicit owner rotation procedure.

## Runtime contract

- Node listens on `127.0.0.1:8790` behind TLS reverse proxy.
- Production requires Redis and fails closed if Redis is unavailable.
- TOTP permits at most one 30-second clock step of drift.
- An accepted TOTP step cannot be replayed.
- Attempts are limited per IP and globally.
- The opaque session cookie is `HttpOnly`, `Secure`, `SameSite=Strict`, fixed
  to 30 minutes, and can be revoked with `Exit & lock`.
- POST requests require an approved `Origin`.
- Protected responses use `no-store`, a restrictive CSP and framing denial.

Deployment templates are kept in `deploy/`. The bootstrap Nginx virtual host
exists only to obtain the first TLS certificate; replace it with the final
virtual host after enrollment and certificate issuance. The presentation uses
its own checkout and systemd process so stopping it cannot stop Ask John.

## Content contract

When content is approved, place a `manifest.json` plus sanitized files in the
private content directory. Assets are requested by allowlisted IDs; arbitrary
paths are never accepted. Do not place client secrets, identity documents,
contracts, credentials, private keys, unrestricted internal logs or material
without disclosure permission in this area.

## Verification

```bash
npm test
npm run build
```

Before enabling the public route, also verify unauthenticated manifest and
direct asset requests return `401`, a valid current TOTP opens the placeholder,
the same code cannot be reused, logout immediately revokes access, and Ask John
still operates if this independent service is stopped.
