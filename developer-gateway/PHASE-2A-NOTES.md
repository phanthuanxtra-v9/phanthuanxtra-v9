# Phase 2A — GitHub Actions Codex executor

This phase replaces the placeholder `pending-devbox-connection` path with a controlled GitHub Actions dispatch.

## Required secret

Set `GITHUB_ACTIONS_DISPATCH_TOKEN` as a Cloudflare Worker secret. It must be scoped only to this repository and have permission to dispatch the `codex-agent.yml` workflow. Never commit the token.

The workflow separately requires the GitHub Actions repository secret `OPENAI_API_KEY` for `openai/codex-action`.

## Execution modes

- `audit`: Codex runs read-only and reports findings.
- `test`: Codex runs read-only and reports test-oriented findings.
- `propose-fix`: Codex may edit the isolated task branch, validation runs, and a PR is created if changes exist.

Production deploy and rollback remain disabled.
