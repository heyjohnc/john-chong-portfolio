# John Chong — AI Product & Solutions Portfolio

Source for [johnchong.info](https://johnchong.info), the public portfolio of John Chong (Shing Yip Chong).

Production: [https://johnchong.info](https://johnchong.info)

The site presents John’s product responsibility and selected AI work through five pages:

- `index.html` — introduction and responsibility model
- `projects.html` — nine-project evidence index
- `fightgame.html` — multiplayer product case study
- `niulai.html` — controlled multi-Agent product case study
- `about.html` — experience, education and capabilities

It is a dependency-light bilingual static site with dark/light themes, responsive layouts and an optional server-side “Ask John” assistant. The assistant retrieves only from the versioned public knowledge base in `portfolio-rag/`, keeps citations visible, handles bounded greetings locally and redirects off-topic chat to its public-career scope.

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

The checked-in suite covers the 29-section public corpus, natural recruiter phrasing, context-dependent follow-ups, retrieval expectations, sensitive-question refusal, citation validation, bounded browser memory, provider adapters and fail-closed operating controls.

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

## Public-content boundary

This repository intentionally contains only the public website, the approved public career knowledge base and deterministic test material. Private job-search notes, credentials, raw client material, internal infrastructure and sensitive transaction data are not part of this repository.
