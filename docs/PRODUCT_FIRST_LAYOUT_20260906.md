# Product-first layout — 6 September 2026

Status: implemented and locally tested; **Draft PR only, not released**.
Latest follow-up: Niulai Home now uses a **labelled dialogue crop** and a full
screenshot link; see the follow-up evidence below. Earlier full-page captures
show the initial PR iteration, not this latest card.
Evidence level: **Level 2 public UI/content batch**.
Rollback/review baseline: `dc53c7f140dc2a6cdd677e6d2a6b1edce6205d5a` (main).
Branch: `hksub-agent/product-first-layout-20260906`.

## Objective, authorization and non-goals

Owner approved the public-only layout review through hk coordination. The
6 September handoff explicitly supersedes the earlier preference to keep all
project cards off Home: show two representative products, not the nine-item
archive. Preserve the visual identity, separate pages and existing entry paths.
Authorization covers implementation, verification and an independent Draft PR;
merge, production deployment and final visual acceptance remain with Owner.

No changes to career facts, hk-job/CV, Ask functionality or public knowledge
base, private Presentation, services terms, routing, attribution or telemetry.
No new dependency, cookie, identifier, fingerprint or statistical field.

## Changes and acceptance mapping

| Surface | Before → after | Preserved evidence |
| --- | --- | --- |
| Home | Intro → delivery method; now intro → two screenshot cards → three steps → background/contact | Work eligibility, location, languages, explanation dialogs, services footer |
| Project previews | Architecture collages → single complete product captures | Real assets, two case links, accurate playable/read-only status; all nine projects remain on Projects |
| Delivery | Five prominent steps → Define / Build & Integrate / Test & Deliver | Permissions, review and failure recovery remain in dialogs and cases |
| Workflows | Repeated contribution paragraphs → native expandable contribution details | All five purposes, outputs, true states, limitations and verified links |
| FightGame | Technical opening → purpose, large screenshot, summary, avatar flow, decisions and deeper evidence | Real cross-device correction loop, complete 79-card board, contribution and uncommissioned-extension boundary |
| Niulai | Controls first → read-only Web3 experience, scene, summary and viewer flow before authority details | Both Owner-selected captures, three decisions, recovery, dated 779/779 baseline, feedback sources and limits |
| About | Abstract oversized opening → concrete background, education/timeline/skills and consolidated working boundary | Original dates, qualifications, language proficiency and substantial Agent implementation disclosure |

The FightGame correction paragraph is supported by the unchanged approved
public evidence file `portfolio-rag/project-sources/FIGHTGAME_PUBLIC_EVIDENCE.md`,
FG-03. It does not invent a defect count or a technical root cause.
Niulai's introductory feedback excerpt cites the same observer as feedback
item 01; it is not a fourth observer or a customer testimonial. Its original
source and informal-observation caveat remain visible.

## Design decisions

- Reuse the existing HTML/CSS/JS and bilingual dictionary. Preserve the profile
  card's tilt, light/dark surfaces and existing theme-transition implementation.
- Keep complete screenshots with `object-fit: contain`, not destructive crops.
  The Niulai scene is naturally wide (710 × 168); letterboxing is intentional.
  The dialogue capture remains separately available at full size in the case.
- Product names remain small labels; type/value is the quick-reading title.
- Native disclosure retains workflow contribution facts without repeating all
  five long role paragraphs in the default reading path.
- Existing source-navigation code processes the new DOM anchors automatically.
  No expansion of GitHub/CV attribution and no persistent source tracking.

## Verification — 6 September 2026 UTC

- `npm test`: **84/84 pass**, including analytics, source navigation, Owner QA,
  Presentation, Ask policy, profile tilt and theme fallback tests.
- `npm run eval:rag`: **54/54 pass**.
- `npm run build`: pass, 10 public files plus assets; 40 RAG chunks with unchanged
  aggregate corpus hash
  `76b426a8e86ad57aedefdbde72205f87895a034077e9fd5a03db0b9594513cba`.
  Removed only generated index timestamp churn; both checked-in indexes remain
  byte-identical to the baseline.
- `node --check site.js`, profile script syntax and `git diff --check`: pass.
- Playwright local Chromium: **60 combinations** (five pages × 1440/390/320 px ×
  EN/Traditional Chinese × light/dark), no horizontal overflow, correct language
  and theme, all visible screenshot assets loaded. Actual screenshots inspected.
- All nine special entries return local HTTP 200 and retain pathname: GitHub,
  both CV batches and six Stripe routes. Ten actual homepage screenshot clicks
  from ordinary/GitHub/CV/Stripe Home lead to the correct two cases. Six-family
  Stripe mapping is also covered by automated tests for every new card href.
- Ask launcher opens and closes without submitting a question. Image original
  opens in a new tab; image anchors retain `target="_blank" rel="noreferrer"`.
- Opt-out remains `1`, with zero insights script elements during local browsing.
  Existing tests cover query/hash cleaning and rejection of unsupported paths,
  Presentation and Ask events. No routing/allowlist changes.
- Read-only existing-production boundary checks only: unauthenticated
  `/presentation/api/manifest` HTTP **401**; Ask VPS `/healthz` HTTP **200**.
  No protected content, credentials, sessions, raw logs or production Ask
  questions were read/submitted. These checks are not a deployment of this PR.
- Byte comparison against baseline: `analytics.js`, `vercel.json`, services,
  Ask widget, profile behavior, dev routes and both RAG indexes unchanged.
  `site.js` changes are dictionary-only; navigation and all runtime logic match.
  Added-line scan found no credential material or new tracking writes.

### Validation adjustments (not hidden product failures)

The first browser sweep attempted to scroll to an image in a closed explanation
dialog, then checked the lazy-loaded 79-card image before smooth scrolling had
reached it. The harness was corrected to visible images, instant review scrolling
and explicit load checks. The rerun passed; no image was replaced or lazy-loading
behavior changed. Locale expectation was corrected to the existing `zh-Hant-HK`
document language, not plain `zh`. External network requests were blocked, so
the widget's background status connection produces an expected blocked-network
console entry; production Ask content was not used to make that disappear.

## Visual evidence

These are public-only local screenshots, not traffic or user records. Captures
use owner opt-out, blocked external requests and reduced motion/instant review
scrolling for stable frames. Review images live under docs, outside the public
build; no private screenshots or generated artwork were introduced.

| View | Before | After |
| --- | --- | --- |
| Home desktop, EN/dark | [Before](review-assets/layout-20260906/home-before-desktop.png) | [After](review-assets/layout-20260906/home-after-desktop.png) |
| Home mobile, EN/dark | [Before](review-assets/layout-20260906/home-before-mobile.png) | [After](review-assets/layout-20260906/home-after-mobile.png) |

Additional: [Home mobile ZH](review-assets/layout-20260906/home-after-mobile-zh.png),
[Projects desktop](review-assets/layout-20260906/projects-after-desktop.png),
[About mobile ZH](review-assets/layout-20260906/about-after-mobile-zh.png).

## PR #44 follow-up — clearer Niulai mobile preview

Owner/hk approved a non-blocking visual refinement on the same Draft PR.
Reviewed the two already approved public captures: the 710×168 scene and
388×664 dialogue window. The latter better exposes avatars and actual dialogue
at card width. Only Home changes; Projects/case originals remain available.

The source PNG is unchanged. CSS uses an undistorted centre crop, labelled
“Agent dialogue · cropped preview” in EN/ZH, with a separate “View full
screenshot” link. The mobile viewport is 4:3; desktop keeps the existing card
ratio. This is intentionally a partial view, not all four roles at once, and
does not suggest that the screenshot is live. No generated/reconstructed image,
private asset, dependency or tracking change was introduced.

- Full tests **85/85**, RAG **54/54**, full build and syntax/diff checks pass.
- Additional **12 Home combinations**: 1440/390/320 × EN/ZH × light/dark;
  no overflow, original image loaded. Actual desktop/390/320 captures reviewed.
- Stripe image/case link remains `/from-stripe/niulai`; original PNG link stays
  `/assets/niulai/agent-dialogue-window.png`, with `_blank`/`noreferrer`.
  Actual case click and original-image popup pass. Unit tests verify all six
  Stripe family paths plus ordinary/GitHub/CV behavior.
- Opt-out `1`, zero insights scripts, nonlocal requests blocked; no production
  Ask request, analytics event, session read or QA-mode modification.
- Original PNG, routing, analytics, Ask, services and checked-in RAG indexes
  remain unchanged. Generated timestamp-only index differences removed.

| Card comparison | Before | After |
| --- | --- | --- |
| Desktop 1440 | [Before](review-assets/layout-20260906/niulai-card-before-1440.png) | [After](review-assets/layout-20260906/niulai-card-after-1440.png) |
| Mobile 390 | [Before](review-assets/layout-20260906/niulai-card-before-390.png) | [After](review-assets/layout-20260906/niulai-card-after-390.png) |
| Mobile 320 | [Before](review-assets/layout-20260906/niulai-card-before-320.png) | [After](review-assets/layout-20260906/niulai-card-after-320.png) |

These focused comparisons render the initial PR's exact card markup versus
the updated markup with the same common styles. Fixed navigation/Ask overlays
are hidden only during screenshot capture to avoid covering the card region;
they remain present in the website and interaction checks. Playwright was used
for browser verification; the existing native HTML/CSS stack was retained per
the design-resource rules. Still Draft-only; no merge/deployment authorization.

## Owner/Agent boundaries, limits and release gate

hksub-agent owns this isolated website branch, implementation and evidence.
Owner owns factual/visual acceptance and any later release instruction. hk-job,
CV/profile repositories and unrelated PRs #21/#24/#28 are untouched.

This is a readability improvement, not measured recruiting conversion or
evidence of customer adoption. Historical traffic cannot be re-attributed.
GitHub/CV paths keep current entry-only behavior; only the already approved
Stripe family retains its prefix during internal navigation. Source paths do
not identify a specific employer or visitor.

Long technical cases intentionally remain available; summaries and ordered
sections support selective reading. Review used Chromium, not a new Safari or
physical-device acceptance run. Native theme animation retains its existing
browser-support fallback. Screenshot legibility is limited by original capture
resolution; native full-size opening is retained instead of fabricated detail.

**Stop at Draft PR.** Owner reviews the screenshots before any merge/deploy.
If later authorized, rerun release gates and record the precise production
deployment time/ID for before-and-after traffic interpretation. Production is
currently unchanged; rollback is not needed for this unmerged branch. A later
release can be reverted to the baseline through the normal PR/deployment gate.
