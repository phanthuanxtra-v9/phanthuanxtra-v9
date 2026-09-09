# AI Handoff — A1 → A5

The canonical implementation remains `main`. This branch documents the consolidation and Workers AI acceleration policy without replaying historical A1-A5 commits.

Primary Workers AI model: `@cf/zai-org/glm-4.7-flash`.
Fallback: `@cf/meta/llama-3.2-3b-instruct`.

Next: validate, PR, independently review, merge, verify deployment, then clean obsolete historical branches.