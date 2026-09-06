# Home text cards — 6 September 2026

Status: locally tested, **Draft PR only**. No merge/deployment authorization.
Baseline: `740902e65d70ace12139667106ec38aa76931310` (PR44 production).
Branch: `hksub-agent/home-text-cards-20260906`.
Evidence: Level 1 bounded visual follow-up to the Level 2 layout batch.

Owner/hk requested image-free Home cards, leaving destination pages as deployed.
Each card retains project name, type heading, purpose, accurate status and case
arrow. Removed only Home card images, cropped-preview label and original-image
entry. Projects, FightGame and Niulai pages and all assets are byte-unchanged.
The existing Home explanation dialog's screenshot is outside the two cards and
remains unchanged; no unrelated Home content was removed.

One native anchor fills each card: no nested links, custom click handlers or
extra tab stops. Existing bilingual accessible labels are reused. A visible
inset focus ring is scoped to the Home link; desktop two-column/mobile stacked
layout and current themes remain. Native HTML/CSS was chosen under the design
resource rules; Playwright was used for real-browser validation.

## Verification

- Full tests **85/85**, RAG **54/54**, full build and diff checks pass. Generated
  index timestamp-only differences reverted; corpus/index content unchanged.
- Home 1440/390/320 × EN/ZH × light/dark: **12 combinations**, no images within
  the cards, exactly two links, correct desktop/mobile placement, no overflow.
- Actual **10 keyboard Enter navigations**: each card from ordinary Home,
  GitHub, both CV entry paths and Stripe Home. Correct original case routes for
  ordinary/GitHub/CV; `/from-stripe/fightgame` and `/from-stripe/niulai` for Stripe.
- Tab goes directly from the first card to the second, with a solid visible
  focus outline. Clicking card padding navigates too. First harness read the
  URL before navigation settled; explicit URL waiting corrected that assertion.
- Existing source unit test verifies all six Stripe family paths and unchanged
  ordinary/GitHub/CV behavior. No routing or attribution runtime was edited.
- Browser review local only, opt-out `1`, zero insights scripts and external
  requests blocked. No production questions, QA revoke or private data access.
- Byte guard against main: Projects/cases/About/services, `site.js`, analytics,
  rewrites, Ask/API, all original assets and RAG data unchanged. CSS changes are
  Home-only selectors; obsolete Home-preview selectors removed.

## Screenshots

| Width | Before (deployed PR44 card) | After EN/dark | After ZH/light |
| --- | --- | --- | --- |
| 1440 | [Before](review-assets/layout-20260906/niulai-card-after-1440.png) | [After](review-assets/home-text-20260906/home-text-1440-en-dark.png) | [ZH](review-assets/home-text-20260906/home-text-1440-zh-light.png) |
| 390 | [Before](review-assets/layout-20260906/niulai-card-after-390.png) | [After](review-assets/home-text-20260906/home-text-390-en-dark.png) | [ZH](review-assets/home-text-20260906/home-text-390-zh-light.png) |
| 320 | [Before](review-assets/layout-20260906/niulai-card-after-320.png) | [After](review-assets/home-text-20260906/home-text-320-en-dark.png) | [ZH](review-assets/home-text-20260906/home-text-320-zh-light.png) |

Focused screenshots hide fixed header/Ask overlays only for capture, matching
the previous comparison method. The website retains those controls. Chromium
viewport checks do not claim physical-device or Safari acceptance.

Owner decides visual approval and any later release. hksub implements this
isolated Home change and records checks; no hk-job/CV, new personal facts,
tracking, source-family expansion or unrelated PR changes. Production remains
on the baseline. Later release/rollback requires explicit Owner instruction.
