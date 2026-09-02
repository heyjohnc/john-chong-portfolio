# Ask John — Approved Project Sources

Status: Level 2 feature batch; local verification passed, production pending  
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

Current claim state: `TESTED`. Production validation and scoped owner
acceptance remain `PENDING` until the service revision is deployed and the two
project question paths are checked live.

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
