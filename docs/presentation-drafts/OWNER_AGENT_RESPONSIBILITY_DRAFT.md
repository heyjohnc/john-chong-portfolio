# Owner and Agent responsibility — private presentation draft

Status: public-evidence draft; `PENDING` John wording approval

Intended use: 45-second `How I work` section and evidence-room follow-up

Sources: the contribution boundaries in the public FightGame and Niulai cases,
their approved evidence packs, and the repository's Enterprise Project Evidence
Standard adoption. No private work record was inspected for this draft.

## Proposed 45-second speaking draft

> I do not present Agent output as automatic product completion. I define the
> problem, scope, system boundaries, permissions and acceptance criteria. I
> divide implementation into bounded responsibilities, review the integrated
> result and turn failures into reproducible correction tasks. Agents accelerate
> implementation, tests, documentation, analysis and authorized operational
> work. I retain the decisions that change product direction, disclosure,
> external authority and go-live status, and I accept a complete user flow only
> after the relevant evidence passes.

Exact wording and whether to use first-person singular throughout:
`[JOHN TO APPROVE]`.

## Responsibility table draft

| Work area | John / Owner responsibility | Agent-assisted responsibility | Evidence boundary |
| --- | --- | --- | --- |
| Product framing | Define the intended user outcome, product shape and priority. | Structure options, surface gaps and prepare bounded implementation proposals. | An Agent proposal is not an owner decision. |
| Scope and acceptance | Set scope, non-goals, acceptance criteria and final acceptance subject. | Implement against the criteria and preserve verification evidence. | Passing tests do not imply owner acceptance. |
| Architecture and permissions | Decide material system, data, authority and disclosure boundaries. | Implement components, adapters, controls and documentation inside those boundaries. | Installed capability does not mean external authority is enabled. |
| Agent orchestration | Assign persistent ownership, resolve priorities and review integrated results. | Execute bounded workstreams and hand off failures or dependencies. | Persistent roles are not necessarily concurrent autonomous workers. |
| Testing and UAT | Exercise complete product flows and decide whether the result is usable. | Build automated tests, contract checks, fixtures and diagnostic evidence. | Code presence and automated tests are separate from full-flow UAT. |
| Failure handling | Choose containment, correction priority and scoped re-acceptance. | Reproduce, diagnose, implement the bounded correction and add regression coverage. | Do not rewrite an unsupported historical result after a failure. |
| External action | Make go/no-go decisions for deployment, publishing, signer use or other consequential actions. | Perform only explicitly authorized operational steps through constrained controls. | Reachable credentials or tools are not blanket permission. |
| Claims and disclosure | Approve career wording, client-safe material, metrics and public release. | Draft sanitized evidence and flag unsupported or sensitive claims. | Private storage is an access control, not disclosure permission. |

## Two project examples

### FightGame

- John owned staged product priorities, system and Agent boundaries, integrated
  flow review and final playable-flow acceptance.
- Agents accelerated substantial client, server and tooling implementation,
  tests, contract checks and corrections.
- Cross-device inconsistency became a reproduce → assign → correct → regress →
  accept loop.

### Niulai Squad

- John owned product purpose, four-role structure, single-timeline architecture,
  voting and permission boundaries, strategy revision, failure review and
  go/no-go decisions.
- Agents accelerated substantial implementation, tests, provider adapters,
  isolated workers, incident diagnosis and bounded operations.
- An asset-unit projection error became stricter evidence interpretation,
  regression coverage, controlled rerun and scoped re-acceptance.

Example selection: `[JOHN TO APPROVE]`.

## Interview answer boundary

Safe claim:

> I designed the product and control boundaries, directed bounded Agent work,
> reviewed failures and made the final acceptance decisions. Agents accelerated
> substantial implementation and verification.

Avoid both misleading extremes:

- “I manually wrote every line.”
- “I only prompted AI and accepted whatever it produced.”

Final authorship wording: `[JOHN TO APPROVE]`.

