# AI Core Next Pass — Workers AI

The consolidation branch is the controlled staging area for the A1-A5 refactor.

Workers AI is enabled as the preferred inference engine for useful workloads. The next implementation pass must inspect existing production contracts before adding any new inference call.

## Candidate paths to inspect

- `src/ai-chat.js`
- vehicle intelligence implementation
- Telegram vehicle/image ingestion
- PT Xtra plate/media validation
- production regression gates

## Acceptance criteria

- no duplicate historical A1-A5 implementation;
- no speculative model or binding;
- bounded prompts and history;
- primary/fallback behavior remains explicit;
- tests cover every newly AI-assisted path;
- Cloudflare dry-run remains green;
- production deployment is unchanged until PR review/merge.
