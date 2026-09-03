# Privacy-friendly Web Analytics

Status: implementation in review; production validation pending

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
cookie, server-side identity or exclusion list. Run this once in the browser
profile John uses for owner review, before browsing the public pages:

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

- all repository tests and the static build pass;
- each of the five public page types loads the analytics script and produces a
  successful Vercel Analytics `view` request in a normal browser;
- the owner opt-out prevents both script loading and the `view` request;
- `/presentation/` and an unauthenticated protected route load no analytics
  script and produce no Analytics `view` request;
- Ask John, Presentation access behavior and existing public interactions remain
  unchanged;
- the Vercel project reports Web Analytics enabled without enabling or buying
  Plus;
- the exact production commit and deployment are recorded after release.

## Operations and rollback

The code rollback is to remove `analytics.js` from the five public pages and
the static build. The platform rollback is to disable Web Analytics in the
project dashboard after the removal is deployed. No Ask John or Presentation
service restart is part of either path.

Production status, deployment identity, browser results and scoped owner
acceptance remain `PENDING` until the release is merged, deployed and checked.

## Contribution boundary

John authorized the privacy boundary, local owner opt-out, Vercel basic Web
Analytics enablement and the merge/deployment workflow for this change. The
`hksub-agent` website session implements the static integration, tests,
documentation, Vercel setting, release and bounded production checks. Vercel
provides the third-party anonymous aggregation service. Neither code presence
nor Agent verification implies recruiter identity, user adoption or a business
result.
