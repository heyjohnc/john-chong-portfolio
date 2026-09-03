# Privacy-friendly Web Analytics

Status: production-validated; owner-authorized release

Evidence level: Level 3 privacy and production change

Last updated: 2026-09-03

## Objective and scope

Enable the basic Vercel Web Analytics page-view service for the five public
Portfolio pages while keeping Ask John and the protected Presentation outside
the analytics data path.

Included public paths:

- `/` and `/index.html`;
- `/about` and `/about.html`;
- `/projects` and `/projects.html`;
- `/fightgame` and `/fightgame.html`;
- `/niulai` and `/niulai.html`.

`/presentation/`, every protected presentation API or asset, `/api/ask` and all
other paths are excluded. Presentation source files do not load the analytics
bootstrap. The public-page bootstrap also uses an exact path allowlist and a
`beforeSend` guard, so copying or navigating it outside the approved pages
does not report a view.

## Privacy contract

The integration sends only automatic page views. It defines no custom events
and does not read or send Ask John questions or answers, contact fields, email,
phone, raw IP addresses, identity, session values, TOTP data, protected
presentation data or a custom personal identifier.

Before a view is sent, its URL is reduced to origin plus allowlisted path;
query parameters and fragments are removed. A strict-origin-when-cross-origin
referrer policy avoids disclosing an external referring page's path or query.
Vercel describes its Web Analytics page views as anonymous, aggregated and
cookie-free. The intended interpretation is limited to anonymous visitors and
views, public page paths, referrers, country, device class, operating system and
browser. The data must not be used to infer a visitor's name, employer,
recruiter identity or hiring intent.

There was no Web Analytics collection before this release. Historical visits
cannot be reconstructed, and Ask John's existing aggregate request count cannot
separate John, QA and external visitors. Any observation begins only after the
feature is enabled and this code is deployed.

The project remains on the Vercel Hobby plan. Web Analytics Plus, paid
Observability metrics and any plan upgrade are outside scope and must not be
purchased for this change.

## John-only browser opt-out

The opt-out is an origin-local browser setting. It does not create an account,
cookie, server-side identity or exclusion list. Open this private setup URL once
in the browser profile John uses for owner review:

```text
https://johnchong.info/#analytics-opt-out
```

The fragment is not sent to the server. The bootstrap saves the local setting,
removes the fragment from the address bar and suppresses Analytics on that
first setup visit. The equivalent browser-console command is:

```js
localStorage.setItem("johnchong-web-analytics-opt-out", "1"); location.reload();
```

Confirm it in that browser profile:

```js
localStorage.getItem("johnchong-web-analytics-opt-out")
```

The result must be `"1"`. That profile will not load the Vercel analytics
script and its page views will not be reported. The setting is local to the
current browser profile and `johnchong.info` origin; it does not follow John to
another device, browser or cleared site storage.

To restore normal anonymous reporting in that browser:

```js
localStorage.removeItem("johnchong-web-analytics-opt-out"); location.reload();
```

## Acceptance and production verification

Release completed on 2026-09-03 UTC:

- Git commit: `2507590d962281cd0e40d8f66e0b40a63bfb30e2`;
- merged review: PR #22;
- Vercel production deployment: `dpl_Gn32Qj6CVgDFJg8LeJLY9Af7JuMS`;
- production alias: `https://johnchong.info`;
- Vercel basic Web Analytics: enabled for
  `chong-shing-yip-portfolio`; Web Analytics Plus remains disabled and no plan
  purchase or upgrade was made.

Verification results:

- `npm test`: 45/45 passed;
- deterministic retrieval and policy evaluation: 54/54 passed;
- static build, diff, local-link and privacy scans: passed;
- production Home, About, Projects, FightGame and Niulai: analytics script
  returned HTTP 200 and exactly one controlled page-view request per page
  returned HTTP 202;
- owner setup URL: stored the opt-out, removed the fragment and sent neither an
  Analytics script request nor a page-view request on the first or subsequent
  public-page visit;
- Presentation login shell: HTTP 200 with no analytics request; its session
  check remained available and an unauthenticated manifest request remained
  HTTP 401, also with no analytics request;
- Ask John: launcher opened normally and the independent service health check
  returned HTTP 200; no question was submitted during this acceptance check;
- production browser console: no Analytics integration error was observed.

The five production page views above are controlled release-validation traffic.
Vercel Web Analytics deliberately suppresses automated-browser views, so the
isolated acceptance browser simulated an ordinary Chrome user agent only for
these five requests. No identity or custom data was added to them. Subsequent
owner and QA browsing should use the local opt-out.

## Operations and rollback

The code rollback is to remove `analytics.js` from the five public pages and
the static build. The platform rollback is to disable Web Analytics in the
project dashboard after the removal is deployed. No Ask John or Presentation
service restart is part of either path.

Rollback remains available through the previous Vercel deployment plus removal
of the bootstrap and project-feature disablement. No rollback was required.

The Owner explicitly approved the feature scope and authorized merge and
production deployment after verification. Claim state is
`PRODUCTION_VALIDATED` for this scoped analytics integration. This does not
claim owner review of future dashboard data, identifiable visitors, user
adoption or a business result.

## Contribution boundary

John authorized the privacy boundary, local owner opt-out, Vercel basic Web
Analytics enablement and the merge/deployment workflow for this change. The
`hksub-agent` website session implements the static integration, tests,
documentation, Vercel setting, release and bounded production checks. Vercel
provides the third-party anonymous aggregation service. Neither code presence
nor Agent verification implies recruiter identity, user adoption or a business
result.
