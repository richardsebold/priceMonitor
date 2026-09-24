# LESSONS - auto-maintained by scripts/lessons.py

> Machine-owned. Do NOT hand-edit. Changes are overwritten on the next `lessons.py` write.
> Canonical state lives in `.specs/lessons.json`. Edit lessons only via the script.
> promote_threshold=2 distinct features · window_days=45 · quarantine_threshold=2

## Confirmed (load these at Plan/Checks)

Corroborated across multiple features. Safe to apply as guidance.

_none_

## Candidates (under observation - do NOT load as guidance yet)

Seen once or not yet corroborated. Tracked, not trusted.

### L-001 - When a mocked repository query decides which rows count as existing, assert the query's where clause or make the mock honour it
- signal: `surviving_mutant` · recurrence: 1 feature(s) · scope: `repo-layer` · harmful: 0
- features: deals-carousel
- evidence: verification.md F5 - src/modules/price-tracking/application/seed-catalog.ts:25 (repo-layer)
- last seen: 2026-09-24T03:41:46Z

### L-002 - Give every UI arrangement the plan decides, such as a carousel with navigation controls, its own selector-level check, not only copy and DOM order
- signal: `ac_gap` · recurrence: 1 feature(s) · scope: `ui` · harmful: 0
- features: deals-carousel
- evidence: verification.md Binding sources - src/components/deals-carousel.tsx:147 (ui)
- last seen: 2026-09-24T03:41:46Z

### L-003 - Match the exact expected error text in a UI error proof, not a pattern that also accepts a generic fallback message
- signal: `spec_precision_gap` · recurrence: 1 feature(s) · scope: `ui` · harmful: 0
- features: deals-carousel
- evidence: verification.md C31 - uiproof/ui.mjs:125 (ui)
- last seen: 2026-09-24T03:41:46Z

### L-004 - Assert the absence of extra inputs when the plan says a dialog has only certain fields
- signal: `gate_fail` · recurrence: 1 feature(s) · scope: `ui` · harmful: 0
- features: deals-carousel
- evidence: validate_verification.py deals-carousel exit 1 (ui)
- last seen: 2026-09-24T03:41:46Z

## Quarantined (failed when applied - ignore)

A confirmed lesson that recurred alongside failure. Kept for the maintainer to review.

_none_
