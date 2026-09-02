# Ask John — Approved Project Sources

Status: Level 2 feature batch; production validated, scoped owner review pending
Date: 2026-09-03

## Objective and scope

Give Ask John deeper, auditable evidence for the two flagship projects without
turning the assistant into a general GitHub browser or exposing a private
repository.

Included:

- one exact public GitHub repository: `heyjohnc/niulai-shengmi-squad`;
- selected public Markdown ranges from its README, case study, verification and
  limitations documents;
- a sanitized local FightGame evidence pack linked to the public case page;
- source document, revision, hash and section identity in the generated index;
- citations that link to the pinned public Niulai commit or FightGame case.
- a compact visible evidence trail that identifies the source type and shows the
  short pinned Niulai commit without exposing private reasoning or raw private
  material.

Not included:

- arbitrary repository discovery;
- GitHub credentials or private-repository access;
- runtime web browsing by the model;
- private FightGame code, client identity, infrastructure, logs or raw evidence;
- automatic publication when a source repository changes.

## Acceptance criteria

1. The sync refuses a non-public or differently named repository.
2. Only allowlisted Markdown paths and heading ranges are fetched.
3. The Niulai snapshot records a full Git commit SHA and can be reviewed before
   release.
4. A normal build is reproducible from checked-in files and needs no network.
5. FightGame answers use only the sanitized evidence pack and existing public
   case page.
6. Retrieval can distinguish project-specific evidence, verification,
   limitations and failure-recovery questions.
7. Existing privacy, refusal, rate, cost and citation controls continue to pass.
8. The rendered answer distinguishes approved profile evidence, reviewed
   FightGame case evidence and the pinned public Niulai GitHub snapshot.

## Material decisions

- Use deliberate build-time ingestion instead of request-time GitHub browsing.
  This trades immediate freshness for stable, reviewable answers.
- Use anonymous public GitHub requests only. There is no token fallback, so the
  connector cannot silently widen into private access.
- Resolve the allowlisted branch to an immutable commit before downloading raw
  Markdown.
- Keep the primary career profile separate from project evidence while placing
  all approved chunks in one retrieval index.
- Prefer selected source ranges over indexing an entire repository. Code,
  Issues, pull requests, commit authorship and unrelated files remain outside
  the assistant's scope.

## Contribution boundary

The owner approved adding the two flagship evidence sources and chose not to
open the FightGame repository. `bot14-agent` designed and implemented the
allowlist, public-source sync, sanitized FightGame pack, multi-document index,
retrieval rules, tests and operational documentation. The Niulai repository is
an owner-authorized public third-party input to this portfolio service; its
contents do not become new claims merely because they are publicly readable.

## Verification and release state

The checked-in Niulai snapshot is pinned to commit
`9489e1ff4710351ce5eba11f33790e4241b293ff`. Anonymous GitHub API and Raw
requests resolved and downloaded the allowlisted source successfully.

Local verification on 2026-09-03:

- `npm run verify:rag`: 27/27 repository tests and 53/53 deterministic
  retrieval/policy cases passed;
- `npm run build`: 40 traceable chunks were built from three approved source
  documents and the static site build completed;
- `git diff --check`: passed;
- focused retrieval checks kept FightGame and Niulai evidence separated and
  preserved the previous broad-profile retrieval behavior.

The first live boundary probe correctly answered that FightGame code was not
public, but its selected citations did not contain that fact explicitly. The
evidence pack and retrieval concept were tightened so the answer must retrieve
`FG-04`, which now states the private-repository boundary directly. This is a
representative evidence-grounding correction rather than a change to repository
access.

The next live probe cited `FG-04` but blurred the subject by describing the
assistant's access limit as if it were John's personal access limit. The model
instruction and evidence wording were tightened to keep **John** (the person)
separate from **Ask John** (the bounded portfolio assistant). No data or
permission boundary changed.

Production validation on 2026-09-03:

- service revision: `e1215bacb98702dca33219facd35bd283f245d47`;
- the Niulai evidence question returned a grounded answer citing only `NL-*`
  sections linked to commit
  `9489e1ff4710351ce5eba11f33790e4241b293ff`;
- the FightGame consistency question cited `FG-01` and the existing public
  overview without exposing a repository or private path;
- after the two grounding corrections described above, the question
  `FightGame 的代码有没有公开？` answered that the source repository remains
  private and cited only `FG-04`; it did not confuse John with the assistant;
- the HTTPS health endpoint and systemd service were active after restart;
- recent service journal output contained lifecycle messages only and no
  visitor question text.

Current claim state: `PRODUCTION_VALIDATED`. The owner approved adding these two
source types and previously authorized direct Ask John production deployment.
Acceptance of the feature's final rendered wording remains `PENDING` until the
owner reviews the live answers; this does not block the verified permission
boundary.

## Known limitations and refresh path

- The assistant sees only the selected documentation, not every public code
  path in Niulai.
- The snapshot does not update automatically. Run
  `npm run sync:project-sources`, review the diff, run `npm run verify:rag`, and
  deploy an accepted revision.
- The source sync depends on GitHub public API and Raw availability only when a
  maintainer deliberately refreshes it; normal build and answering do not.
- A public repository can contain incorrect or stale statements. The explicit
  allowlist, immutable revision and review step reduce but do not eliminate that
  editorial risk.
