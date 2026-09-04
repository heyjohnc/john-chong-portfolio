# Privacy-friendly Web Analytics

Status: production-validated base; CV entry attribution increment tested in a Draft PR and not deployed

Evidence level: Level 3 base; Level 2 privacy/analytics increment

Last updated: 2026-09-04

## Objective and scope

Enable the basic Vercel Web Analytics page-view service for the five public
Portfolio pages while keeping Ask John and the protected Presentation outside
the analytics data path.

Production-baseline public paths:

- `/` and `/index.html`;
- `/about` and `/about.html`;
- `/projects` and `/projects.html`;
- `/fightgame` and `/fightgame.html`;
- `/niulai` and `/niulai.html`.

`/presentation/`, every protected presentation API or asset and `/api/ask`
remain excluded in both the production baseline and the Draft increment below.
Apart from the two proposed CV entry paths, all other paths are excluded.
Presentation source files do not load the analytics bootstrap. The public-page
bootstrap also uses an exact path allowlist and a `beforeSend` guard, so copying
or navigating it outside the approved pages does not report a view.

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

## CV source-category and batch attribution — 2026-09-07 increment

Claim state: `TESTED`; scoped Owner result review: `PENDING`; production
deployment: not authorized by this Draft PR.

### Objective, operator and scope

John needs two public CV links for the 2026-09-07 application batch so the
existing anonymous Web Analytics dashboard can separate the intended CV
variant without naming a company, role, recipient or person. The target
operator is John when preparing the two CV PDFs. The approved entry paths are:

- `/cv-application-20260907` for the application-oriented CV;
- `/cv-product-20260907` for the product-oriented CV.

Each exact path is internally rewritten to `/index.html`. A rewrite preserves
the entry path in the browser address bar, while the served document retains
the homepage content, root canonical URL, relative static assets, language
controls, internal navigation and Ask John integration. Both paths are added
to the same Analytics exact-path allowlist, so an accepted page view is reduced
to origin plus that path before reporting.

### Non-goals and privacy boundary

This increment does not add click events, custom events, cookies, session
tracking, browser fingerprinting, server-side visitor identity, raw IP storage
or Ask John question/answer collection. Company names, role names, email
addresses, contact data, personal identifiers and query strings are not part
of either URL or event. Presentation and API paths remain outside the Analytics
allowlist. The existing owner-local opt-out applies unchanged to both CV entry
paths.

The paths mean only “intended CV category and batch date.” They do not identify
a recruiter, employer, recipient or applicant-review outcome. A URL can be
forwarded or opened by the owner, and Vercel or browser filtering can suppress
some views. Therefore counts are anonymous directional attribution, not a
recipient ledger or proof that a specific application was reviewed.

### Material decisions and failure/recovery behavior

- Two explicit root-level rewrites are used instead of a wildcard, parameter
  or query-based campaign scheme. Unapproved dates, trailing-slash variants and
  company-shaped paths do not enter the Analytics allowlist.
- The source path is allowed through the existing `beforeSend` privacy guard;
  query and fragment content is still removed before a page view can be sent.
- The local development server mirrors only the same two exact rewrites so
  browser verification exercises the production path shape without creating
  duplicate HTML files or divergent canonical metadata.
- If a rewrite is absent or mistyped, the entry returns 404 rather than falling
  through to an identity-bearing route. Recovery is to correct the explicit
  allowlist/rewrite pair and re-run route, privacy and browser checks.
- The first integration test run exposed a pre-existing assertion that treated
  the entire rewrite list as Presentation-only. The implementation did not
  change a protected route; the test was corrected to verify the Presentation
  namespace and destination count strictly, while the CV tests separately
  verify the only two homepage rewrites. The complete regression suite must
  pass after this correction.
- Rollback is removal of the two rewrites and the two allowlist entries. The
  homepage, existing public pages, Ask John and Presentation remain independent.

### Acceptance and known limitations

Acceptance requires both exact entry paths to serve homepage content while the
address bar remains unchanged; static resources, language switching, internal
navigation, homepage canonical metadata and Ask John launcher must remain
functional on desktop and mobile. Analytics tests must show distinct cleaned
paths, owner opt-out suppression and rejection of unapproved variants. The
full repository tests, RAG evaluation, static build and privacy scan must pass.

Verification completed in the local pre-PR environment on 2026-09-04 UTC:

- `npm test`: 67/67 passed after the rewrite-test integration correction;
- deterministic retrieval and policy evaluation: 54/54 passed;
- static build, JavaScript syntax, Vercel JSON and diff checks: passed;
- both exact entry paths: HTTP 200 with a byte-identical homepage body;
- unapproved date, trailing-slash and company-shaped variants: HTTP 404;
- Playwright desktop application-entry and mobile product-entry checks:
  homepage content, retained source path, relative assets, language switch,
  internal navigation, root canonical and Ask launcher passed with no browser
  console error;
- owner opt-out and query/fragment stripping: passed without an Analytics
  request or Ask submission during browser verification.

Historical visits cannot be reconstructed or assigned to either entry. Data
begins only after an approved production deployment. Vercel records a page view
time automatically, but this feature does not measure reading duration, clicks,
attention, intent or identity. Shared links, VPNs, blockers and repeat visits
limit any inference about unique people or depth of review.

Incremental cost and production rewrite latency are `NOT_MEASURED` before
deployment. The design adds no paid plan, provider, storage, custom event or
runtime service; it reuses two static rewrites and the existing basic Analytics
page-view path. Any later production release should verify route status and
page-view separation without converting that check into an identity claim.

### Human, Agent and third-party boundary

John chose the two CV categories, batch date, privacy semantics and final
review/deployment gate. The `hksub-agent` website coordinator implements the
rewrites, allowlist, tests, documentation and bounded browser verification.
Vercel supplies anonymous aggregated page-view reporting. A passing Agent check
does not imply Owner acceptance, production release, recruiter identity, user
adoption or a business result.

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
