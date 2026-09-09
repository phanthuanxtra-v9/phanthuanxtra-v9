# A1 → A5 Consolidation Checklist

- [x] Create isolated consolidation branch from current `main`.
- [x] Record evidence-based architecture decision.
- [x] Confirm current production Workers AI primary path.
- [x] Confirm fallback remains available.
- [x] Avoid replaying historical A1-A5 commits.
- [ ] Compare any still-missing historical functionality against current `main`.
- [ ] Add only genuinely missing production functionality.
- [ ] Add/adjust regression tests for extracted functionality.
- [ ] Run CI.
- [ ] Run Cloudflare dry-run/deployment validation.
- [ ] Open consolidation PR.
- [ ] Obtain independent review if GitHub requires it.
- [ ] Merge after review.
- [ ] Verify production deployment.
- [ ] Re-audit A1-A5 branch uniqueness.
- [ ] Delete only branches proven to have no remaining unique value.

## Rule

A historical branch is not evidence that its code is missing from `main`. Every candidate change must be proven against the current production tree before it is copied or merged.
