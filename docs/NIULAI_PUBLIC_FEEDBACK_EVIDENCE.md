# Niulai Squad — selected public feedback evidence

Status: public-safe presentation approved for implementation
Last updated: 2026-09-03

## Objective

Add a small, verifiable external-signal section to the Niulai case study without
turning early social reactions into customer, adoption or audit claims.

## Selected evidence

The public case page uses paraphrases rather than unattributed testimonial
quotes. Three product observations come from separate public X accounts:

1. working real-time interface observation — status `2094721262237131064`;
2. independent restatement of four roles, 3-of-4 voting and the `PAPER_ONLY`
   boundary — status `2094719033992220858`;
3. visible separation of work across four Agents — status
   `2094723001459851689`.

One additional public-repository observation, status `2094719626714497353`,
comes from the same observer as item 1. It is labelled separately because the
observer explicitly used AI to review the repository. It is not counted as a
fourth independent person and is not described as a formal code or security
audit.

## Presentation decision

- Show compact text cards with direct canonical status links.
- Do not embed the tall social screenshots in the portfolio layout.
- Do not publish third-party account names or avatars merely for visual proof.
- Keep the dated, redacted screenshots as private deletion/edit evidence.
- State the evidence boundary immediately below the observations.

## Claim boundary

The selected posts support only that a small number of public observers noticed
the working interface, understood parts of the four-Agent product model and
commented on the public repository. They do not prove customer acceptance,
formal user research, adoption, retention, revenue, long-term reliability,
business impact or an independent technical/security audit.

## Contribution boundary

John approved using real public feedback as portfolio evidence. `bot14-agent`
deduplicated the retained evidence, selected the public-safe presentation,
implemented the bilingual section and verified the resulting page. The
underlying posts remain third-party opinions and are not rewritten as John's
own claims.

## Release evidence

- Implementation PR: `https://github.com/heyjohnc/john-chong-portfolio/pull/11`
- Merged commit: `84e53a63a3744ef581c82258eb961a2865598561`
- Production deployment: `dpl_H8PYqLL1wcNiPfEew38fdQi1V8tX`
- Public route: `https://johnchong.info/niulai.html`
- Validation on 2026-09-03: 28/28 repository tests and 54/54 retrieval/policy
  evaluations passed; the production route returned HTTP 200; Playwright found
  three product-feedback cards, three canonical post links, no horizontal
  overflow at 390 px, complete Traditional Chinese translation and zero browser
  console errors.
