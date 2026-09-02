---
document_id: fightgame-public-project-evidence
version: 1.0.0
status: approved-public-evidence
last_updated: 2026-09-03
source_url: /fightgame.html
source_revision: portfolio-case-2026-09-03
---

# FightGame — Public Project Evidence

This is a sanitized portfolio evidence layer. It does not expose the private
repository, client identity, credentials, private infrastructure, raw logs or
unpublished material.

## FG-01 — FightGame product and architecture

FightGame is a client-delivered personalized-avatar multiplayer pixel RPG. Its
core product challenge was to keep one player identity coherent across profile,
shared-world, remote-player and battle contexts while two players submitted
different actions into one authoritative turn result.

The public architecture evidence shows a Phaser client, Colyseus multiplayer
rooms and Express APIs. A player action is treated as an intention: the server
waits for the required inputs, validates and stores them, resolves the rules,
persists the round and sends the same authoritative outcome to both clients. A
code-verified 79-card catalogue supports deck limits, elements, counters,
statuses and combo setup/payoff.

## FG-02 — FightGame AI and guidance mechanisms

The project has three different mechanisms that should not be conflated:

1. a reference-image workflow connects image generation with active avatar
   selection and consistent display across map and battle contexts;
2. Quinn, the non-combat Game Guide, uses bounded grounded retrieval over
   versioned public guide content and can explain the player's selected cards;
3. seven NPC battle coaches use deterministic triggers, priorities, cooldowns
   and authoritative action outcomes rather than RAG.

The current Quinn implementation is evidence of grounded retrieval design, but
it is not claimed as an embedding pipeline, vector database or mature
permission-aware enterprise RAG system.

## FG-03 — FightGame delivery, UAT and recovery

John translated the broad client direction into staged systems, priorities,
module boundaries and acceptance criteria. He organised a persistent five-role
development structure covering coordination and integration, the Web
portal/interface, NPC/content, skill cards and maps/editor. Persistent roles
retained context and ownership; they were not necessarily running at the same
time.

John personally tested complete flows in a browser, on a phone and on another
computer. When multiplayer results differed across devices, he documented the
reproduction steps, expected and actual results and screenshots, routed the
defect to the responsible development Agent, and repeated cross-device
regression after the correction. Acceptance applied to the complete playable
flow, not to an isolated screen or an Agent completion message.

## FG-04 — FightGame contribution and claim boundary

John owned product direction, staged priorities, system and Agent boundaries,
review of multiplayer, battle, card, identity, map and interface results, and
the final playable-flow acceptance and correction decisions. Development
Agents accelerated substantial client, server and tooling implementation,
tests, contract checks, documentation, debugging and authorized operational
tasks.

The commissioned core-playability milestone was completed and accepted.
Tournament, live-streaming and operations extensions were outside the
commissioned scope or remained planned/partially scaffolded. This public case
does not claim a public launch, production readiness, revenue, user count,
long-term reliability or verified business impact.

The FightGame source repository remains private. The portfolio assistant named
**Ask John** has no access to that private repository; the assistant uses only
this sanitized evidence pack and the public portfolio case page. This is an
assistant data-access boundary, not a statement about the person John's own
access to his project.
