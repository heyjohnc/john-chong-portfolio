# Portfolio reading polish — 5 September 2026

Status: TESTED locally; Owner authorized merge/deployment on 5 September 2026;
visual acceptance of the deployed result remains PENDING. Release identity and
production verification are recorded in PR #36.
Evidence level: Level 2 public UI batch. This is separate from the subsequently
authorized GitHub-entry attribution release.

## Objective and scope

Help a first-time reader understand John and navigate the evidence without
moving project cards onto the homepage. Owner approved the suggested changes
and explicitly kept projects on Projects. No career fact, project status,
auth boundary, model behavior or analytics collection is changed.

- Homepage: concrete application-delivery introduction, Contact me action,
  shorter delivery-method section; existing interactive explanations retained.
- Projects: remove duplicate introduction; link the three existing categories.
- Cases: replace terse facts with a four-part summary and section links. Keep
  the original detailed evidence and qualification of project outcomes.
- Niulai: retain Owner-selected captures; add full-size links and bilingual
  explanations of what the game and dialogue views mean. Votes remain random
  and frozen before model expression; no model decision authority is implied.
- FightGame: link walkthrough captures to original images, keeping the verified
  79-card board and all source captures intact.
- Simplify visible internal maturity jargon without upgrading any claim.
- Show Ask John / 問問 John on both desktop and mobile.
- Print previously unrevealed content; hide interactive controls on paper.
- Add one 1200×630 social preview PNG, rendered from the checked-in SVG using
  Chromium. No generated illustration or third-party visual asset is used.

## Verification

- Existing tests: 67/67 pass; after synchronizing GitHub entry PR #37,
  the combined release suite passes 69/69. RAG retrieval/policy eval: 54/54 pass.
- Static build and syntax checks pass; corpus hash unchanged. Timestamp-only
  index rebuild differences were removed, leaving Ask evidence unchanged.
- Playwright: all five public pages at 1440, 390 and 320px in English and
  Traditional Chinese: no horizontal overflow, missing fragment targets or
  JavaScript page errors. Ask open/close works without submitting a question.
- Local browser inspection: category anchors and homepage Contact action work;
  Niulai image opens its original asset in a new tab with noreferrer.
- Print regression: fresh homepage before scrolling has zero hidden reveal
  elements under print media; PDF saved for visual review.
- At 390px English, Projects first card moves from about 1,057px to 648px below
  the page top. Homepage height changes from about 3,320px to 3,055px. These
  are local rendering measurements, not recruiter conversion claims.
- Detailed cases remain long; summaries and anchors support selective reading.
  Niulai is not claimed to be materially shorter after adding its explanation.
- Existing analytics/QA/auth regression suite passes. No production Ask
  requests, credentials, content logs or private Presentation data were used.

Review artifacts are in ignored `output/playwright/`: `polish-home-desktop.png`,
`polish-*-mobile-zh.png`, and `polish-home-print.pdf`. During social-card
rendering, the temporary local HTML replacement caused an unneeded favicon
request to return 404; regular pages retain their existing inline favicon.

## Boundaries and release

John chooses positioning, disclosure and visual acceptance. hksub-agent edits
public UI/copy and validates the result. The existing public corpus supports
the summaries; no business impact, visitor count or authorship was invented.
Presentation, Ask backend, analytics allowlist and deployment routes are out
of this PR. Before release this branch was synchronized with main to preserve
the separately released GitHub entry in PR #37. Owner subsequently requested
deployment to review the live UI; this authorizes release, not a claim that
the visual result has already been accepted.

Share-preview metadata and the PNG are verified locally; social platforms may
cache old previews after a future release. The full-size image action uses a
normal browser tab and native zoom rather than adding a new modal/dependency.

### Print contrast release correction (2026-09-05)

Release screenshot review caught a dark profile-card background with dark print
text. The follow-up overrides only the print card background and border. Browser
verification shows white background, #111 text, zero hidden reveal elements, and
the original screen gradient unchanged. Screenshot: ignored
`output/playwright/polish-print-contrast-fixed.png`. Regression suite: 69/69.
No routes, analytics, corpus, credentials or backend behavior changed.

### Compact recruitment card and overview labels (2026-09-05)

Owner requested implementation and deployment for visual review. This Level 1
UI delta removes the decorative JC/orbit tags and repeated slogans, prioritizes
existing Hong Kong work eligibility, and retains location, languages and About.
No career fact was added; visa sponsorship wording already appears in Contact.
Product definition / System design replace abstract button labels in EN/ZH.
Projects overview labels are simplified and enlarged; original screenshots and
full case-study explanations remain. No generated image or dependency added.

Acceptance: compact card, working About and explanation links, bilingual copy,
desktop/mobile layouts, existing print contrast, and unchanged privacy/backend.
Agent implements and verifies; John's visual acceptance remains pending.
Local checks: 70/70 tests, 54/54 RAG eval, build and syntax/diff checks pass.
Home/Projects inspected at 1440/390/320px; no horizontal overflow. Card is
315px high at 390px in English. Chinese card and overview labels verified;
light/dark themes and white/#111 print card checked. Both explanation panels
open and dismiss using Escape. Screenshots: ignored output/playwright/compact-*.
Initial regression expected detailed Niulai captions on the overview; updated
it to require those captions on the unchanged detail page and concise overview
labels separately. Source index build-only timestamp change removed.
Limits: screenshot text is still evidence to inspect on detail pages, not all
readable at card scale. No production Ask questions or private data accessed.
Release identifiers and live checks are recorded in the PR. Rollback is the
preceding production commit efc166d through an Owner-approved release.

### Comet-style card trial (2026-09-05, not deployed)

Owner selected the Comet visual direction. Reference:
https://ui.aceternity.com/components/comet-card . This is an original local
HTML/CSS/JS implementation of that interaction pattern, not copied component
code or a React dependency. Card identity/role leads, eligibility is secondary;
all career facts unchanged. Surface tilt is bounded to +/-6 degrees, with a
stationary hit area, soft pointer light, static etched arcs and edge depth.
Mouse coordinates exist only in transient memory/CSS; no storage, telemetry,
network or device sensors. Touch/coarse pointer and reduced-motion settings
disable tilt; leave/cancel, focus, blur, resize and printing reset it. No idle loop.

Verification: 73/73 tests, 54/54 RAG eval, static build, JS syntax and diff checks.
Browser verified actual mouse tilt, leave reset, reduced-motion none, 390/320px
no overflow, Chinese card, theme switch, About href and print white/#111/no tilt.
Artifacts: ignored output/playwright/comet-desktop.png and comet-mobile.png.
No production requests or release in this trial. Owner visual acceptance pending.
Only homepage markup, shared scoped CSS, local card script, tests and this record
change. Existing detail pages, routes, analytics and protected services unchanged.
