# Private presentation manifest and content plan

Status: proposal only; no protected material uploaded

Evidence level: Level 2 content-planning baseline

Last updated: 2026-09-03

## Objective

Turn the authenticated placeholder into a rehearsable 6–8 minute interview
route while keeping every career claim, private asset and disclosure decision
under John's control.

This document is safe for the public repository because it contains only the
proposed structure and approval inventory. It contains no presentation
credential, protected filename, client identity, private screenshot, raw log,
contract, internal URL or unpublished metric.

## Current implementation boundary

The production-validated scaffold authenticates John, returns a protected
manifest and streams allowlisted assets by opaque ID. The current authenticated
manifest intentionally returns `ready-for-content` with no sections or assets.

The current browser workspace renders only a section title and summary. The
guided navigation, evidence drawers, elapsed-time cue and media presentation
described below are requirements for a later implementation task, not current
capabilities.

## Approval labels

- `[JOHN TO APPROVE]` — John confirms the wording, emphasis or external claim.
- `[JOHN TO SUPPLY]` — John provides the source file or identifies an approved
  source from which it may be prepared.
- `[JOHN TO REDACT]` — John confirms that names, account details, client data,
  infrastructure details and unrelated screen content have been removed.
- `[AGENT MAY PREPARE]` — an Agent may create a sanitized draft from already
  approved public evidence; John still approves the final presentation use.
- `[OPTIONAL]` — not required for the first interview-ready release.

No item moves into protected storage merely because it appears in this plan.

## Guided route

Target running time: 7 minutes 20 seconds before optional evidence questions.

| Order | Logical section ID | Time | Purpose | Required owner gate |
| --- | --- | ---: | --- | --- |
| 1 | `opening` | 20 sec | Name, target role and one sentence about turning unclear needs into testable AI products. | Target role and exact positioning `[JOHN TO APPROVE]` |
| 2 | `working-method` | 45 sec | Define, bound, direct Agents, inspect failures, run UAT and make the final acceptance decision. | Owner/Agent contribution wording `[JOHN TO APPROVE]` |
| 3 | `niulai` | 2 min 30 sec | Explain the product problem, four role views, shared lifecycle, decision gate, permission boundary and one verified failure/recovery example. | Selected example and disclosure scope `[JOHN TO APPROVE]`; non-public captures `[JOHN TO SUPPLY]` `[JOHN TO REDACT]` |
| 4 | `fightgame` | 2 min 30 sec | Explain player flow, authoritative multiplayer result, personalized-avatar flow, bounded RAG, contextual coaching and one cross-device correction loop. | Selected example and disclosure scope `[JOHN TO APPROVE]`; demo material `[JOHN TO SUPPLY]` `[JOHN TO REDACT]` |
| 5 | `breadth` | 45 sec | Group video-production, NFT-production, automation and developer-tool work without narrating every project. | Included project groups and wording `[JOHN TO APPROVE]` |
| 6 | `role-fit` | 30 sec | State the work John can take on now, the gaps he is ready to learn inside a team and the role sought. | Career positioning `[JOHN TO APPROVE]` or `[待本人确认]` if supplied through the HK career workflow |

Each section should eventually support `Next`, `Back`, keyboard arrow
navigation, `Jump to evidence` and `Exit & lock`. `Exit & lock` must revoke the
server session rather than only hide the page.

## Proposed manifest shape

The protected `manifest.json` should use the existing `sections` and `assets`
arrays. The following is a logical content contract, not a deployment-ready
manifest and not an instruction to create any private filename:

```json
{
  "version": "[APPROVED_RELEASE_VERSION]",
  "title": "John Chong — Private interview presentation",
  "status": "[draft|reviewed|interview-ready]",
  "message": "[JOHN-APPROVED INTRODUCTION]",
  "sections": [
    {
      "id": "opening",
      "title": "Opening",
      "summary": "[JOHN TO APPROVE]",
      "duration_seconds": 20,
      "evidence_asset_ids": []
    }
  ],
  "assets": [
    {
      "id": "[ALLOWLISTED_LOGICAL_ID]",
      "label": "[JOHN-APPROVED LABEL]",
      "type": "[REVIEWED MIME TYPE]",
      "file": "[PRIVATE FILENAME ADDED ONLY AFTER APPROVAL]"
    }
  ]
}
```

Before implementation, the server and UI contract must be extended and tested
for any new fields that drive navigation or asset linking. Unknown manifest
fields being present does not prove that the current UI supports them.

## Sanitized asset inventory

| Logical asset | First-release role | Preparation state | Required gate |
| --- | --- | --- | --- |
| Niulai simplified architecture diagram | Guided section and evidence follow-up | `[AGENT MAY PREPARE]` from the pinned public repository evidence | Final diagram and wording `[JOHN TO APPROVE]` |
| Niulai failure/recovery card | One bounded, credible correction example | Source example not selected | Example `[JOHN TO APPROVE]`; private evidence `[JOHN TO SUPPLY]` `[JOHN TO REDACT]` |
| Niulai 60–90 second recorded fallback | Demonstrate the controlled lifecycle if a live route is unavailable | Not supplied | Capture authority `[JOHN TO SUPPLY]`; final recording `[JOHN TO REDACT]` `[JOHN TO APPROVE]` |
| FightGame simplified architecture diagram | Explain authoritative multiplayer and bounded AI responsibilities | `[AGENT MAY PREPARE]` from approved public evidence | Final diagram and wording `[JOHN TO APPROVE]` |
| FightGame cross-device defect card | Show symptom, reproduction, correction and regression result | Public case evidence exists; presentation selection pending | Selected evidence `[JOHN TO APPROVE]`; any non-public capture `[JOHN TO SUPPLY]` `[JOHN TO REDACT]` |
| FightGame 60–90 second recorded fallback | Cover avatar, map identity, challenge, battle and consistent result | Not supplied | Recording `[JOHN TO SUPPLY]` `[JOHN TO REDACT]` `[JOHN TO APPROVE]` |
| Breadth project strip | Show adjacent workflows without expanding the talk | `[AGENT MAY PREPARE]` from approved public portfolio content | Included items `[JOHN TO APPROVE]` |
| Owner/Agent contribution table | Answer authorship and responsibility questions truthfully | `[AGENT MAY PREPARE]` from existing evidence boundaries | Exact responsibility wording `[JOHN TO APPROVE]` |
| Selected UAT and release evidence | Evidence-room follow-up | No presentation-safe selection yet | `[JOHN TO SUPPLY]` `[JOHN TO REDACT]` `[JOHN TO APPROVE]` |
| Public feedback captures | Evidence-room follow-up with evidence-strength label | Redacted private captures reportedly exist; not inspected in this task | `[JOHN TO SUPPLY]` `[JOHN TO REDACT]` `[JOHN TO APPROVE]` |
| English two-page CV | Download or evidence-room document | Current approved file not supplied to this task | `[JOHN TO SUPPLY]` `[JOHN TO APPROVE]` |
| Chinese CV | Recruiter communication | `[OPTIONAL]` | `[JOHN TO SUPPLY]` `[JOHN TO APPROVE]` |
| One-page Niulai and FightGame summaries | Interview handout/follow-up | `[AGENT MAY PREPARE]` from approved evidence | Final claims `[JOHN TO APPROVE]` |
| Contact card | Close and follow-up | `[AGENT MAY PREPARE]` from public portfolio details | Contact details and wording `[JOHN TO APPROVE]` |
| Offline presentation and video package | Interview fallback when network services fail | Not assembled | Contents `[JOHN TO SUPPLY]` `[JOHN TO REDACT]` `[JOHN TO APPROVE]` |

## Evidence and disclosure rules

- Use public Niulai material only from the approved, commit-pinned source range
  unless John separately authorizes another source.
- Keep FightGame source private. Use the sanitized public evidence pack or a
  separately reviewed presentation-safe asset; never infer repository access.
- Do not convert code presence, tests, deployment, owner acceptance, public
  reactions, user adoption and business impact into interchangeable claims.
- Do not invent latency, cost, users, revenue, reliability, scale or outcome
  metrics. Use `NOT_MEASURED` where a useful metric lacks a preserved source.
- A public social reaction is not a customer testimonial, formal user research
  or proof of adoption.
- Protected presentation storage is a disclosure control, not permission to
  place raw confidential material there.

## First-release acceptance gates

1. John approves the six-section wording and the intended target role.
2. Every asset has a recorded source, disclosure decision and redaction result.
3. The manifest contains only reviewed logical IDs and private files; no
   arbitrary path is browser-selectable.
4. Unauthenticated manifest and direct asset requests remain `401`.
5. Logout, expiry and server-side revocation continue to remove access.
6. The guided route works with mouse and keyboard on desktop and mobile.
7. One flagship path and its offline fallback are rehearsed before interview
   use; the rehearsal result is recorded without exposing protected content.
8. Ask John remains independently available when the presentation service is
   stopped.
9. Local review and owner acceptance are complete before any production content
   upload or deployment instruction.

## Explicitly deferred

- recruiter guest access;
- analytics beyond a separately approved privacy-preserving aggregate design;
- password, passkey or other second-factor expansion;
- decorative motion and lower-priority visual polish;
- any production content upload or deployment.

## Contribution and acceptance state

The existing project record marks the general six-part content structure as
approved. John retains the final career, disclosure and go-live decisions.
`hksub-agent` prepared this content-plan baseline from the approved repository
evidence without inspecting or uploading private content.

- Acceptance subject: this manifest/content plan only.
- Current result: `PENDING` John review.
- Does not imply: approval of wording, assets, disclosure, authenticated
  content, the complete presentation UI or a production content release.
