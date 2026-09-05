# Website services and Stripe entry — review draft

2026-09-05 · Level 2 public business-content / attribution increment.
Owner approved JohnChong as the public name, existing aryipc@gmail.com contact,
personal/portfolio sites, small-business sites, landing pages and improvements,
with scope-based quotes. No verified Stripe-account name match is claimed.

## Scope and acceptance

- Independent bilingual /services.html page; homepage footer link only, no
  recruitment hero/nav change. Existing career facts and public RAG corpus stay
  unchanged; unapproved commercial terms must not become Ask John evidence.
- Exact /from-stripe rewrite to services.html with pathname retained and
  canonical pointing to services.html. Relative asset risks avoided through
  root-relative URLs. Only /from-stripe joins the analytics allowlist.
- Existing query/hash filter and local owner opt-out apply. No identifiers,
  custom events, payment integration, form, or Ask widget. No service enquiry
  content is collected through analytics.
- Attribution means use of a designated link, not proven Stripe origin, staff
  identity, a verified employer, or unique human count. Old visits not backfilled.

## Owner gate before publication

The visible banner and noindex mark this as a draft, not an operational merchant
page suitable for submission as completed Stripe verification material.
Owner must confirm contracting legal name/entity and account jurisdiction,
whether further business disclosures are required, proposed cancellation/refund
terms, and actual email/project retention periods and processors. Neither account
credentials nor identity documents should be sent to this Agent/chat.
The public brand is not a substitute for verified legal/account information.
Agent drafted content and implemented/tested UI. Owner decides commercial terms,
capacity, factual disclosure and release. No Stripe account changes authorized.

Proposed refunds: unused prepayments returned, minus documented scoped work and
only pre-approved unrecoverable third-party costs; undelivered work gets a remedy
or appropriate refund; mandatory rights preserved. This is a draft, not legal
advice or Stripe acceptance. Reference checklist:
https://docs.stripe.com/get-started/checklist/website

## Verification and limitations

77/77 tests; 54/54 RAG eval; static build; JS syntax and diff checks pass.
Browser 1440/390/320px, EN/ZH: no horizontal overflow, one visible main heading,
valid section anchors. /from-stripe pathname retained, opted-out analytics loads
zero insights resources; trailing-slash variant returns 404 locally. Unit checks
cover exact route, nonallowed variants, sanitization, opt-out and direct service
page exclusion. No production Ask/pageview tests, secrets or content logs used.
Preview artifacts: ignored output/playwright/services-*-mobile.png.
No payment provider onboarding review or legal adequacy verification performed.

## Hiding / pausing / rollback

To hide discovery later, remove only the homepage data-services-entry link via
reviewed PR. That is not access control: direct routes remain accessible. To
pause sales, replace the enquiry invitation with a clear not-accepting-new-work
notice in both languages, retaining customer support and applicable policies.
Do not remove existing customer terms just to hide the service. Disabling route
attribution later requires matching rewrite, allowlist and test changes.
Rollback target is pre-feature main 8344342 through an Owner-approved release.
Current state: implemented/tested draft; NOT merged/deployed; Owner acceptance
pending. Final intended Stripe URL: https://johnchong.info/from-stripe .
