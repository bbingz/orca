Re-review #12188 after CHANGES_REQUESTED fixes.

Diff: /tmp/orca-night-patrol/12188.diff

Fixed:
1. JSON path now requires every entry match task_[hex] (rejects ["not_a_task"], [""])
2. Recovery rejects empty CSV segments and only strips balanced quotes (rejects task_aa,,task_bb, [task_aa,], "task_aa)
3. Added regression tests for both

Vitest targeted still green. Windows probe previously confirmed PS escape.

Do not edit. Overwrite /tmp/orca-night-patrol/12188-review.md. First line APPROVED or CHANGES_REQUESTED. Final VERDICT line.
