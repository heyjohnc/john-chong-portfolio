# John Chong — AI Product & Solutions Portfolio

Source for [johnchong.info](https://johnchong.info), the public portfolio of John Chong (Shing Yip Chong).

Production: [https://johnchong.info](https://johnchong.info)

The site presents John’s product responsibility and selected AI work through five pages:

- `index.html` — introduction and responsibility model
- `projects.html` — nine-project evidence index
- `fightgame.html` — multiplayer product case study
- `niulai.html` — controlled multi-Agent product case study
- `about.html` — experience, education and capabilities

It is a dependency-light bilingual static site with dark/light themes, responsive layouts and an optional server-side “Ask John” assistant. The assistant retrieves only from the versioned public knowledge base in `portfolio-rag/` and keeps citations visible.

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

The checked-in suite covers the 29-section public corpus, retrieval expectations, sensitive-question refusal, citation validation, bounded browser memory, provider adapters and fail-closed operating controls.

## Deployment

`vercel.json` builds the public static directory and keeps `api/ask.mjs` as a server-side function. A production assistant additionally requires server-only configuration:

- `ASK_JOHN_ENABLED`
- `ASK_JOHN_PROVIDER`
- `ASK_JOHN_MODEL`
- `ASK_JOHN_SITE_URL`
- `OPENROUTER_API_KEY` or `OPENAI_API_KEY`
- `ASK_JOHN_IP_HASH_SALT`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

Rate and budget ceilings are configurable through the `ASK_JOHN_*` control variables in `api/_lib/controls.mjs`. Never commit real environment values or provider credentials.

The website is deployed independently of the assistant switch. When the global control store or provider configuration is incomplete, `/api/ask` fails closed while every portfolio page remains available.

## Public-content boundary

This repository intentionally contains only the public website, the approved public career knowledge base and deterministic test material. Private job-search notes, credentials, raw client material, internal infrastructure and sensitive transaction data are not part of this repository.
