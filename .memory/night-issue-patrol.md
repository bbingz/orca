# Night issue patrol (Grok)

## Contract (user 2026-08-04)

- Every **30 minutes**: scan `stablyai/orca` open unassigned issues for scoped fixes we can own.
- **Claim** only if no assignee and no informal claim / open PR.
- **Fix** on a branch from `origin/main`.
- **Windows** issues: verify over SSH `bing@10.0.8.6` (no local Docker).
- **Review**: Codex via Herdr; commit only if APPROVED; do not push unless asked.

## In-flight (update each tick)

| Item | Branch | Status |
|------|--------|--------|
| #12414 Mermaid htmlLabels | `fix/12414-mermaid-html-labels` @ `ade522b57` | committed; rebased onto origin/main; not pushed |
| #12188 orchestration --deps + WSL quotes | `fix/12188-orchestration-deps` @ `4db668614` | committed; rebased onto origin/main; not pushed |
| #11975 terminal link hover latency | `fix/11975-terminal-link-hover-latency` @ `aafd14595` | committed; rebased onto origin/main; not pushed |
| #12536 orchestration idle mail delivery | `fix/12536-orchestration-idle-mail-delivery` @ `85214d6c2` | committed; rebased onto origin/main; not pushed |
| #12517 clear selection on remount dispose | `fix/12517-clear-selection-on-pane-dispose` @ `2d54ed8ee` | committed; rebased onto origin/main; not pushed |
| #12437 Windows pty.test expectations | `fix/12437-windows-pty-test-expectations` @ `f06879a24` | committed; rebased onto origin/main; not pushed |
| Known skip | — | assigned, open PRs, product dumps, large SSH/relay, pure features, maintainer "looking into" |

## Last tick

- **2026-08-04 ~22:36 UTC**: No new claim/fix.
- Unassigned still features (#12571–#12577) or skip bugs: #12568 SSH/relay, #12563 product dump, #10569 (PR #10586), #10520 unrepro.
- In-flight: rebased all 6 local fix branches onto latest `origin/main` (clean, behind=0). Still unpushed.
- Next: small unclaimed bugs with root cause, or push/open PRs if asked.

## Rules

- One primary issue per tick.
- `HERDR_ENV=1` for Codex via Herdr.
- Rate-limit `gh`; re-check claim before coding.

## Closed — 2026-08-05

Scheduler `019fcd4f5904` **deleted** (user asked to stop the loop).
Retrospective written in chat. Six unpushed branches remain for optional PR.
