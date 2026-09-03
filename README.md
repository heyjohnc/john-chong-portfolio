# John Chong — AI Product & Solutions Portfolio

Source for [johnchong.info](https://johnchong.info), the public portfolio of John Chong (Shing Yip Chong).

Production: [https://johnchong.info](https://johnchong.info)

The site presents John’s product responsibility and selected AI work through five pages:

- `index.html` — introduction and responsibility model
- `projects.html` — nine-project evidence index
- `fightgame.html` — multiplayer product case study
- `niulai.html` — controlled multi-Agent product case study
- `about.html` — experience, education and capabilities

It is a dependency-light bilingual static site with dark/light themes, responsive layouts and an optional server-side “Ask John” assistant. The assistant retrieves only from approved, versioned material in `portfolio-rag/`: the public career profile, a sanitized FightGame evidence pack and an allowlisted snapshot of selected Markdown from the public Niulai repository. It keeps an auditable evidence trail visible—including source type and the short pinned Niulai commit—without exposing private reasoning, handles bounded greetings locally and redirects off-topic chat to its public-career scope. Its starter-question pool contains 12 aligned English/Chinese topics and randomly presents three per page load. Known intents use a fast deterministic retrieval path; unfamiliar colloquial wording falls back to an LLM semantic router that can select only approved public section headings or one of four bounded redirect categories.

## Run locally

Requires Node.js 20 or later.

```bash
npm install
npm run build
npm test
node scripts/dev-server.mjs
```

Open `http://127.0.0.1:4174/`. Local development uses a deterministic fixture provider unless server-side provider variables are supplied.

## Verification

```bash
npm run verify:rag
```

The checked-in suite covers 29 profile sections and 11 project-evidence sections, natural recruiter phrasing, context-dependent follow-ups, retrieval expectations, sensitive-question refusal, citation validation, bounded browser memory, provider adapters and fail-closed operating controls.

## Refresh approved project sources

The Niulai connector is a build-time, read-only public-source sync—not a general GitHub browser and not a runtime tool available to the model:

```bash
npm run sync:project-sources
npm run verify:rag
```

`portfolio-rag/project-source-allowlist.json` fixes the one permitted repository, public Markdown paths and extracted ranges. The sync refuses private repositories, resolves `main` to a full commit SHA, fetches only those paths without credentials and writes a reviewable snapshot under `portfolio-rag/project-sources/`. A normal build uses the checked-in snapshot and therefore remains reproducible and offline. Refreshing the snapshot is a deliberate review-and-release action.

FightGame has no public repository. Its assistant evidence comes only from `portfolio-rag/project-sources/FIGHTGAME_PUBLIC_EVIDENCE.md`, which is a sanitized public pack linked to the portfolio case page. The model never receives private FightGame source code or repository access.

## Deployment

`vercel.json` builds the public static directory. The public assistant runs on an owner-operated VPS so its provider credential and global controls remain outside the browser and Vercel. A production assistant requires server-only configuration:

- `ASK_JOHN_ENABLED`
- `ASK_JOHN_PROVIDER`
- `ASK_JOHN_MODEL`
- `ASK_JOHN_SITE_URL`
- `OPENROUTER_API_KEY` or `OPENAI_API_KEY`
- `ASK_JOHN_IP_HASH_SALT`
- `ASK_JOHN_CONTROL_MODE=redis`
- `ASK_JOHN_REDIS_HOST`
- `ASK_JOHN_REDIS_PORT`
- `ASK_JOHN_ALLOWED_ORIGINS`

The VPS entry point is `scripts/serve-bot14-ask-john.mjs`. Rate and budget ceilings are configurable through the `ASK_JOHN_*` control variables in `api/_lib/controls.mjs`. A serverless deployment can still use the existing Upstash REST mode. Never commit real environment values or provider credentials.

Before enabling the public assistant:

1. load the provider key only through the protected VPS service environment;
2. use the VPS-local persistent Redis instance for atomic per-IP and daily limits;
3. expose only the bounded Ask John endpoint through HTTPS with an exact origin allowlist;
4. verify one supported question, one sensitive-question refusal and the configured rate limit; and
5. keep the service fail-closed whenever its provider or global control store is unavailable.

The website is deployed independently of the assistant service. When the global control store or provider configuration is incomplete, the endpoint fails closed while every portfolio page remains available.

A future backend-authenticated presentation area is assessed in
[`docs/PRIVATE_PRESENTATION_ACCESS_PROPOSAL.md`](docs/PRIVATE_PRESENTATION_ACCESS_PROPOSAL.md).
It remains a design proposal: no protected presentation content, TOTP secret or
private-content route is present in the public site.

## Public-content boundary

This repository intentionally contains only the public website, the approved public career knowledge base and deterministic test material. Private job-search notes, credentials, raw client material, internal infrastructure and sensitive transaction data are not part of this repository.
