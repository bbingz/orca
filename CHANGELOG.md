# Local Changelog

> 本文件仅记录当前 checkout 的本地贡献维护与验证证据，不属于上游发布日志。

## 2026-08-04 — Rebased #8281, #7840, and #7817 onto current main

### Result

- Processed the three newly conflicting PRs sequentially against upstream
  `main` `637c7e94c`, using isolated worktrees and exact old-head leases. Fork
  heads are now #8281 `bffe3f85f`, #7840 `e377983b3`, and #7817 `5f6723357`.
  GitHub readback reports all three OPEN, non-draft, MERGEABLE/UNSTABLE, with
  zero unresolved review threads and no formal review decision.
- #8281 retained #12347's early startup-draft ownership before deferred setup
  while preserving the broader side-effect-aware retry/remount delivery model.
  Its merged delayed-setup test now emits the current Codex readiness contract
  (`›` plus the idle `Ask Codex` placeholder), so the test continues to prove
  setup-time ownership without weakening the hooks-review safety gate.
- #7840 preserved `timeoutMs: null` for abortable long-running SSH scans and
  combined it with main's structured `SSH_MUX_REQUEST_TIMEOUT` error. #7817
  kept main's newer pane-reservation/daemon routing and threads
  `disabledTuiAgents` through all three current `buildPtyHostEnv` entry points,
  preventing Pi/OMP managed-extension installation for disabled agents.

### Validation and hosted state

- #8281: the 12 affected suites passed 2,407 tests with one skip; the final PTY
  and scanner rerun passed 562/562. Node/Web TypeScript, changed-code quality,
  Oxfmt, max-lines, and diff checks passed.
- #7840: all 16 workspace-space/SSH/relay suites passed 140/140. Full
  Node/CLI/Web TypeScript, changed-code quality, Oxfmt, max-lines, and diff
  checks passed. #7817's PTY suite passed 431/431 with the same full TypeScript
  and static gates.
- Every push targeted only the named fork branch and used the frozen previous
  head in `--force-with-lease`. Exact-head hosted workflows are blocked for
  approval rather than executed: #8281 runs `30866397728`/`30866397874`, #7840
  run `30866548554`, and #7817 run `30866732413` are `action_required`.
- Full repository tests, packaging/build, Electron E2E, and platform-realistic
  SSH/Windows runs were not performed. No Docker command, upstream-main push,
  merge, deploy, or release was performed. #12238 remains unchanged at
  `b9a5e813b` with `OrcaWin` requested; the explicit read-only hold on #9416 was
  preserved at `da5cb1fea`.

## 2026-08-04 — #12238 review request and three new conflicts

### Result

- Rescanned all 104 `bbingz` PRs after the `2026-08-03T15:57:23Z` cutoff and
  cross-checked GitHub Search. #12238 is the only PR with newer activity; no PR
  was merged, closed, converted to/from draft, or given a new head. The queue
  remains 54 open, 20 merged, and 30 closed without merge, including 4 drafts.
- AmethystLiang requested an `OrcaWin` review on #12238 at
  `2026-08-03T18:27:24Z`. There is still no new code review, comment, formal
  decision, or unresolved thread. Exact-head workflows `30829700381` and
  `30829701308` remain `action_required`.
- Upstream `main` advanced 20 commits from `e08eba674` to `d7fe9d6bc`. After
  forcing all 54 initially `UNKNOWN` PRs to recompute, the open queue is now 30
  MERGEABLE and 24 CONFLICTING, with 1 `CLEAN` PR (#8391), 29 `UNSTABLE`, and
  no formal review decisions. Visible hosted checks have no failure or pending
  result; #12238's approval-blocked workflows are not present in its rollup.

### New conflict routing

- #8281 is newly conflicting in
  `src/renderer/src/components/terminal-pane/pty-connection.test.ts` after
  merged #12347. It is not fully superseded: #12347 changes only the PTY
  connection implementation and test, while #8281 spans 24 files and its core
  side-effect-aware delivery/retry modules remain absent from current `main`.
  Adjudicate and likely shrink the overlap before any rebase rather than closing
  or rewriting it blindly.
- #7840 is newly conflicting in `src/main/ssh/ssh-channel-multiplexer.ts` after
  the AI Vault SSH scanning work in #11004. #7817 is newly conflicting in
  `src/main/ipc/pty.ts` after recent daemon/runtime IPC work. Neither upstream
  change implements the PR's workspace-space streaming or Pi disabled-hook
  behavior, so both remain separate current-main rebase candidates if later
  authorized.
- #12238 remains MERGEABLE/UNSTABLE at `b9a5e813b`; its current-main merge tree
  is clean. Main touched `config/reliability-gates.jsonc` and
  `src/main/daemon/daemon-server.ts`, but the merged tree retains the reviewed
  kill attribution block. Wait for the requested review and workflow approval;
  do not push or rebase it now. Preserve the explicit read-only hold on #9416.

### Verification boundary

- Queried complete authored history, GitHub Search, current main, every open
  PR's exact mergeability, hosted rollups, #12238 timeline/review requests, and
  merge trees for #8281/#7840/#7817/#12238. No GitHub state or PR branch was
  modified, and no local code test, lint, typecheck, build, or Docker command
  was run.

## 2026-08-03 — #12238 CodeRabbit test follow-up

### Result

- Started from the exact `OrcaWin`-rewritten head `1c847773b` in the existing
  isolated worktree and committed `b9a5e813b test(daemon): cover kill
  attribution outcomes`. The commit changes only
  `src/main/daemon/daemon-server-kill-attribution.test.ts`.
- Replaced the immediately resolving success mock with a deferred kill promise,
  proving that `session-killed` is absent until kill completion. Added coverage
  for the tolerated pending-spawn `SessionNotFoundError`, including cancellation
  and the full `sessionId` / `immediate` / `clientId` attribution without a
  false failure event.
- Pushed only fork branch `fix/runtime-close-attribution-residual` with exact
  lease `1c847773b`; GitHub readback reports exact head `b9a5e813b`, OPEN,
  non-draft, MERGEABLE, and `UNSTABLE`. No upstream branch was modified.

### Validation and PR metadata

- Focused Vitest passed 3/3. Temporary production mutations independently
  proved both contracts: removing the kill await failed the ordering test, and
  disabling tolerated not-found reconciliation failed the tolerated-outcome
  test. Exact reverse patches restored production code before the final pass.
- Full Node/CLI/Web typecheck, changed-code quality, targeted oxfmt, max-lines
  ratchet, diff checks, and the commit hook passed. Full lint, full repository
  test, build/package, Electron E2E, real runtime smoke, and Docker were not run.
- Updated the PR body at `2026-08-03T15:56:30Z`: it now names exact head
  `b9a5e813b`, records local and mutation evidence, scopes the prior head's
  44-success/4-skipped hosted results to `1c847773b`, and removes the stale
  `18a310593` and only-`track-community-pr` claims.
- Exact-head workflows `PR Checks` run `30829700381` and `Computer-use e2e` run
  `30829701308` are both `action_required`; they need maintainer approval before
  hosted CI can execute. CodeRabbit refreshed its summary at
  `2026-08-03T15:57:23Z`: Description, Linked Issues, Out of Scope, and Title
  pass; only the previously rejected generic docstring warning remains. It has
  not submitted a new code review for `b9a5e813b`, and no formal human review
  decision exists.

## 2026-08-03 — 15:45Z authored-PR no-change refresh

### Result

- Refreshed all 104 `bbingz` PRs after the `2026-08-03T15:26:14Z` cutoff and
  cross-checked GitHub Search. No PR received a new comment, review, head,
  lifecycle, or draft-state update. The queue remains 54 open, 20 merged, and
  30 closed without merge, including 4 open drafts.
- Upstream `main` remains `e08eba674`. The 54 open PRs remain 33 MERGEABLE and
  21 CONFLICTING, with 2 `CLEAN` PRs (#12238 and #8391), 31 `UNSTABLE`, and no
  formal review decisions. Thirty PRs expose hosted checks; none has a visible
  failed or pending check.
- Alexander951006's `2026-08-03T14:54:00Z` comment is activity on issue #11669,
  not on PR #11674. It asks maintainers to land #11674 in the next release and
  offers RC verification; it does not request a rebase. #11674 remains OPEN,
  non-draft, MERGEABLE/UNSTABLE at `607a83b42`, with no unresolved review
  threads. Current-main changes since its base do not overlap its two files.

### Mutation boundary

- This was a read-only GitHub audit. No PR body, comment, review, branch,
  commit, issue, or upstream state was changed, and no local code gate was run.

## 2026-08-03 — #12238 OrcaWin branch rewrite and hosted-CI refresh

### Result

- Incrementally rescanned all 104 `bbingz` PRs after the
  `2026-08-03T09:51:48Z` cutoff. #12238 is the only PR with newer activity;
  the queue remains 54 open, 20 merged, and 30 closed without merge, including
  4 open drafts.
- GitHub records an `OrcaWin` force-push at `2026-08-03T12:36:54Z`, replacing
  `18a310593` with `1c847773b`. The rewritten first commit `66caeb55d` is based
  directly on current upstream `main` `e08eba674`; the second commit,
  `1c847773b fix(runtime): complete destructive close attribution`, is authored
  and committed by `OrcaWin`.
- The added commit records daemon kill failures separately, moves the success
  event after kill completion, adds runtime and target topology to close spans,
  records terminal outcomes, and adds topology tests plus reliability-gate
  coverage. The resulting PR diff contains 8 files.

### Review adjudication

- CodeRabbit edited its summary at `2026-08-03T12:41:51Z`; the description
  check now passes and the generic docstring warning remains non-actionable
  under the repository's concise-comment agreement.
- CodeRabbit then submitted one `COMMENTED` review at
  `2026-08-03T12:41:53Z`: strengthen the daemon success test with a deferred
  kill promise, and cover the tolerated `canceledPendingSpawn &&
  SessionNotFoundError` outcome with full attribution.
- The suggestion is technically valid. The current immediately resolving mock
  can still pass if a future implementation starts `host.kill()` without
  awaiting its completion, and no current test exercises the tolerated branch.
  The smallest follow-up is test-only: add those two contracts without changing
  production behavior. The review is embedded in the review body, so GitHub
  reports zero unresolved inline threads.

### Current hosted state and resume point

- At the `2026-08-03T15:26:14Z` scan, #12238 is OPEN, non-draft, `CLEAN`, and
  based on current `main`, with 48 completed hosted checks: 44 successful, 4
  skipped, 0 failed, and 0 pending. It still has no formal human review
  decision.
- The PR body remains stale: its testing evidence names old head `18a310593`
  and says only `track-community-pr` is visible. Do not overwrite the
  `OrcaWin` rewrite; refresh exact head before any authorized follow-up, add the
  two focused tests first, then update the body with new-head evidence.
- This scan made no GitHub mutation and ran no local code test, lint, typecheck,
  or build. Only these local audit records were updated.

## 2026-08-03 — Post-#12238 authored-PR refresh and bot-feedback adjudication

### Result

- Re-read all 104 authored PRs after the `2026-08-03T06:43:27Z` cutoff. The
  only updated PR is #12238, from one CodeRabbit summary comment at
  `2026-08-03T06:46:17Z`; no human maintainer comment, formal review, head
  update, close, or merge arrived on any authored PR.
- CodeRabbit explicitly reported no actionable code comments on #12238. Its
  description warning was valid against `.github/pull_request_template.md`.
  The PR body was updated at `2026-08-03T09:51:48Z` with explicit Screenshots,
  checkbox-based Testing, AI Review Report, Security Audit, and Notes sections;
  full lint/test/build remain truthfully unchecked.
- The generic 80% docstring warning is not a repository code gate and conflicts
  with the local agreement to add only concise, non-obvious comments. The
  implementation uses descriptive types/functions plus one concise identity
  boundary comment, so no docstring-only code churn is warranted.
- The current queue is 104 total: 54 open, 20 merged, and 30 closed without
  merge. The open set contains 4 drafts, 33 mergeable and 21 conflicting PRs;
  #8391 remains the only `CLEAN` PR. There are zero formal review decisions,
  zero unresolved review threads, and no visible failed or pending checks.

### Main drift and action routing

- Upstream `main` advanced 14 commits from `d48cac7d0` to `6f7a30ac2`. None of
  the changed paths intersects #12238's six-file diff; GitHub still reports
  #12238 OPEN, non-draft, MERGEABLE at exact head `18a310593`, with its visible
  `track-community-pr` check successful.
- #9752 is the sole newly conflicting PR. Merged #11987 changed
  `src/main/providers/local-pty-provider.ts` and its test for Windows PATH
  expansion, which are the exact two merge-tree conflicts. #11987 does not
  implement #9752's agent-only ConPTY Job Object ownership, so #9752 is not
  superseded; it needs a separate current-main rebase plus renewed focused and
  native Windows validation.
- #12238's body now matches the repository template while preserving the
  already-reported test boundaries. The original CodeRabbit comment remains a
  historical snapshot unless the bot reruns; do not add docstrings solely for
  that warning. Keep #9752 behind the existing bounded #11384/#11380 conflict
  work rather than batch-rebasing it, and preserve the explicit read-only hold
  on #9416.

### Verification

- Queried the complete authored history and every open PR's current
  mergeability/check rollup, then queried all 54 review-thread connections.
  An initial 24-PR `UNKNOWN` recomputation window settled to 33 MERGEABLE and
  21 CONFLICTING after upstream-main refresh.
- Read #12238's exact CodeRabbit body, PR template, timeline, reviews, comments,
  hosted checks, and exact head. Fetched current upstream `main`, compared its
  changed paths with #12238, and produced a merge-tree for #9752 to identify
  the two concrete conflict files; inspected #11987's provider diff before
  rejecting supersession.
- The only GitHub mutation was the authorized #12238 PR-body template update,
  which was read back with the exact head unchanged. No comment, review thread,
  branch, commit, deploy, release, or upstream state was modified. No code test
  or Docker command was run because this was a metadata-only follow-up.

## 2026-08-03 — #12238 focused runtime close attribution follow-up

### Result

- Created non-draft PR #12238,
  <https://github.com/stablyai/orca/pull/12238>, from new fork branch
  `fix/runtime-close-attribution-residual`. Its exact head is `18a310593`, one
  commit on current upstream `main` `d48cac7d0`; GitHub readback reports OPEN,
  MERGEABLE, zero unresolved review threads, and a successful
  `track-community-pr` check.
- The six-file PR preserves the close-policy behavior already shipped on
  `main`. It only adds the residual forensics requested in the #8888 closeout:
  daemon `session-killed` logs now include the requesting local control-client
  ID, `terminal.close` / `terminal.closeTab` emit attribution spans, and both
  new and existing session-tab close spans record the already-available
  non-sensitive `RpcContext.pairedDeviceId` as `deviceId`.
- No RPC schema, close decision, capability gate, client behavior, or old #8888
  branch code was restored. The bearer credential in `RpcContext.clientId` is
  never passed into the span helper; regression tests also scan serialized
  records to prove the bearer value is absent.

### Implementation and scope decisions

- Added the concrete `terminal-close-attribution.ts` wrapper rather than
  adding another identity field to `RpcContext`; current `pairedDeviceId`
  already carries the revocable, non-bearer device identity on RPC paths.
- Kept daemon-control `clientId` separate from paired-device identity and
  covered it in a focused daemon test. The first placement in the existing
  972-line daemon test file tripped the commit hook's `max-lines` rule, so the
  test moved to `daemon-server-kill-attribution.test.ts` without a disable or
  unrelated test refactor.
- Upstream advanced from `c9a37f58d` to `d48cac7d0` during implementation.
  The 49-file upstream range had no overlap with the six PR paths; the worktree
  was fast-forwarded before final validation and the resulting merge-tree is
  clean.

### Verification

- TDD evidence: the initial daemon/terminal tests failed four expected
  assertions before implementation (missing requester and zero close spans),
  and the session-tab device-identity matrix then failed two expected
  assertions before the existing spans were adapted. The final exact-head
  five-file run passed 83/83 tests.
- Full Node/CLI/Web TypeScript passed. Changed-code quality reported zero new
  native, type-aware, or React Doctor findings across six files; the full
  type-aware audit, direct oxlint and React Doctor oxlint, max-lines ratchet,
  targeted oxfmt check, `git diff` whitespace checks, commit hook, and
  `git merge-tree --write-tree origin/main HEAD` all passed.
- Local, fork, and GitHub PR heads all read back as
  `18a310593cecbffdb75df94e9660929950ad0573`. No Docker, build/package, Electron
  E2E, runtime smoke, deploy, release, upstream merge, or upstream branch push
  was performed. Hosted review/bot feedback beyond the community tracking
  check has not yet arrived.

## 2026-08-03 — #7937 maintainer reply and authored-PR rescan

### Result

- Posted the authorized technical follow-up on closed PR #7937 and read it
  back at <https://github.com/stablyai/orca/pull/7937#issuecomment-5162347318>.
  The comment separates the already-landed #9166 startup retry from the still
  reproducible bare-Cursor classification gap on current `main` `c9a37f58d`
  and asks whether the maintainer prefers reopening or a fresh PR.
- `nwparker` closed #11483 as superseded by #11599/#11814, matching the prior
  current-main adjudication. No author action remains unless a wrapped-copy
  call site can be reproduced on current `main`.
- `nwparker` closed #8888 because #9994/#9804/#10129 already fixed the linked
  destructive-close incident, but explicitly invited a new small PR for the
  residual attribution work: daemon `session-killed` requester attribution,
  non-sensitive device identity in traces, and attribution spans for
  `terminal.close` / `terminal.closeTab`. The old 31-file branch must not be
  rebased because it predates and conflicts with the negotiated-capability
  close policy now on `main`.
- The complete authored history is now 103 PRs: 53 open, 20 merged, and 30
  closed without merge. The open queue contains 4 drafts, 33 mergeable and 20
  conflicting PRs; #8391 is the only `CLEAN` PR. No open PR has a formal review
  decision, unresolved review thread, visible failed check, or pending check.

### Action routing

- Wait for the maintainer's #7937 reopen-versus-fresh-PR preference; do not
  update its closed branch meanwhile.
- If proceeding with the #8888 residual, start a fresh branch from current
  `main`. Reuse the existing non-sensitive `RpcContext.pairedDeviceId` for
  traces rather than adding a duplicate `deviceId`, and never serialize the
  bearer credential stored in `RpcContext.clientId`. Treat daemon-control
  requester `clientId` separately and cover it with the focused daemon test.
- #11384 and #11380 are newly conflicting after merged #12145 substantially
  rewrote their two shared commit-message generation files. They are
  independent branches, so each needs a separate current-main adaptation;
  prioritize the recently Windows-validated #11384 before #11380. Preserve
  the explicit read-only hold on #9416.

### Verification

- Re-read all 103 authored PRs after the previous `2026-08-03T01:58:04Z`
  cutoff. Only #11483, #8888, and #7937 changed; the #7937 timestamp is the
  authorized author comment. Read back the exact latest maintainer comments,
  close state, and timestamps for #11483/#8888.
- Refreshed all 53 open PRs to settled mergeability, queried every current
  review-thread connection, and summarized hosted check rollups: 29 have a
  visible rollup and 24 have none; none show failure or pending state. This
  does not prove complete required-CI coverage.
- Verified current upstream `main` remains `c9a37f58d85df999835abce73f4e09b9b27d6118`.
  Source inspection confirms `session-killed` still omits its requester,
  `RpcContext` already exposes `pairedDeviceId`, and the two terminal close
  methods still call runtime close operations without attribution context.
  Compared #12145's changed paths with #11384/#11380 to identify their exact
  two-file overlap.
- No PR other than the authorized #7937 comment was changed. No branch, source
  code, review thread, deploy, release, or Docker operation was performed; no
  code test was run because this was a live-state and source audit.

## 2026-08-03 — Adjudication of two superseded closures

### Result

- `nwparker` closed #8467 and #7937 without merge at 09:02 and 09:03 CST,
  respectively. Both comments called the PR superseded and requested a new
  issue or PR against current `main` if anything remains.
- #8467 was closed in favor of merged #10893. Current-main source confirms
  #10893 fixes the linked #8459 safety defect with agent-owner evidence,
  deferred-SSH binding protection, one shared unbound selector, and mandatory
  confirmation when owner evidence is absent. The older PR's provider-side
  two-pass idle-shell inspection and bulk review dialog are not present, but
  they are broader hardening beyond the linked issue rather than a required
  correction to the closure.
- #7937 needs a technical follow-up. Its current body explicitly says #9166
  already landed the generic #7935 TOCTOU retry and narrows the remaining diff
  to two files for bare Cursor identity. Current `main` still deliberately
  returns `null` from `detectAgentStatusFromTitle('Cursor Agent')`, while
  `classifyAgentTitle()` only accepts non-null status and does not call the
  already-imported `isCursorAgentTitle()`. The scoped regression therefore
  remains absent despite the supersession reason citing only #9166.
- The authored queue is now 55 open, 20 merged, and 28 closed without merge.
  Of the open PRs, 35 are mergeable and 20 conflicting; #8391 remains the only
  `CLEAN` PR, with no formal review decisions or visible failed/pending checks.

### Action routing

- Reply on #7937 with the exact current-main classification evidence and ask
  whether `nwparker` prefers reopening the scoped two-file PR or receiving a
  fresh PR against current `main`. Do not restore the already-landed retry
  logic from #9166.
- Do not ask to reopen #8467 as-is. If the stricter idle-shell proof remains a
  desired safety property, first reproduce on current `main` that an unbound,
  non-agent-owned session with a live child process is still selected by the
  bulk cleanup path, then file a narrow new issue/PR as the closer requested.
- No other authored PR received a comment, review, head update, close, or merge
  after the previous 07:42 CST scan. The explicit #9416 read-only hold remains
  unchanged.

### Verification

- Queried all 103 authored PRs by `updatedAt`, then read the exact new comments,
  state, heads, reviews, and check rollups for #8467/#7937. Inspected the exact
  file lists, descriptions, and merged implementations for #10893/#9166.
- Verified the #7937 residual against current `origin/main` source in
  `src/main/runtime/orca-runtime.ts`, `src/shared/agent-title-status.ts`, and
  `src/shared/agent-detection.ts`. Verified #8467's residual scope against the
  current Resource Manager selector, confirmation, and direct bulk-kill path.
- No GitHub comment, reopen, PR branch update, source change, deploy, release,
  or Docker command was performed. No local code test was run because this was
  a source-grounded review adjudication.

## 2026-08-03 — Authored-PR queue refresh after mobile route fix landed

### Result

- Re-read all 103 authored PRs from live GitHub state at 07:39 CST: 57 remain
  open, 20 merged, and 26 closed without merge. The open queue contains 4
  drafts, 37 mergeable PRs, and 20 conflicting PRs.
- All 57 open PRs still have an empty formal review decision and zero
  unresolved review threads. No authored PR was updated after the previous
  21:21 CST scan, so there was no new maintainer comment, review, head update,
  close, or merge.
- Hosted rollups remain unchanged: 32 PRs have only successful visible checks,
  25 have no rollup, and none have a visible failure or pending run. #8391 is
  still the only `CLEAN` PR, with 22 successful checks.
- Upstream `main` advanced nine commits from `0ae917440` to `7c7167028`.
  #10507 is the only newly conflicting PR, moving the queue from 19 to 20
  conflicts.

### Supersession and action routing

- Do not rebase #10507. Merged #11652 (`2efc6e547`) implements the same route
  boundary across the same 17-file area: it moves the same support modules out
  of `mobile/app`, updates their consumers, and adds a stronger 121-line AST
  guard that also handles allowed non-screen Expo modules and rejects
  platform-specific API routes. #10507 now needs an explicit superseded-close
  decision alongside #11483.
- The nine-commit main range touches 15 of #10507's 17 files. It also touches
  two already-conflicting #10148 files, reinforcing that PR's existing mobile
  compile and physical-keyboard validation gate. It does not add new overlap
  to #9415/#9434/#9435 or #8325.
- Keep #9415 and its #9434/#9435 draft descendants as the first active conflict
  unit, followed by #8325. Preserve the explicit read-only hold on #9416.
  Remaining active non-draft conflicts are #10490, #10419, #9436, #9274,
  #8888, #8300, #8293, #8292, #8063, and #8057.

### Verification

- Queried the complete authored history, then refreshed all 57 open PRs
  individually with `gh pr view`; an initial all-`UNKNOWN` recomputation window
  settled to 37 `MERGEABLE`, 20 `CONFLICTING`, 1 `CLEAN`, 20 `DIRTY`, and 36
  `UNSTABLE`.
- Queried GraphQL review threads for every open PR, compared `updatedAt` values
  against the prior scan cutoff, fetched current upstream `main`, and compared
  the nine-commit changed-path set against the active PRs. Inspected merged
  commit `2efc6e547` and the exact #10507 head metadata/diff before declaring
  supersession.
- No PR branch, comment, review thread, remote branch, source file, deploy, or
  release was modified. No Docker command or local code test was run.

## 2026-08-02 — Full authored-PR queue refresh

### Result

- Re-read all 103 authored PRs from live GitHub state at 21:21 CST: 57 are
  open, 20 merged, and 26 closed without merge. The open queue still contains
  4 drafts; 38 PRs are mergeable and 19 are conflicting.
- All 57 open PRs have an empty formal review decision and zero unresolved
  review threads. No authored PR was updated after 10:17 CST, so there was no
  new maintainer comment, review, close, merge, or head update in the interval.
- Hosted rollups show no failure or pending run: 32 PRs have only successful
  visible checks and 25 have no rollup. This is not equivalent to required-CI
  coverage; #8391 remains the only `CLEAN` PR and has 22 successful checks.
- Upstream `main` advanced 21 commits from `db69cd938` to `0ae917440`.
  Reconciliation against the 09:05 full queue found four conflict additions:
  #9415 and its #9434/#9435 draft descendants overlap the same four runtime
  and PTY connection files, while #8292 overlaps `agent-hooks/server.ts` and
  its test. Three earlier conflicts (#11489, #11384, and #8281) were repaired
  in the interim, so the net conflict count moved from 18 to 19. #8325 also
  intersects the new-main range in `worktrees.ts`, but was already conflicting.

### Action routing

- Treat #9415 as the first active rebase candidate and preserve the
  #9415/#9434/#9435 stack when resolving its runtime and PTY overlaps. Keep
  #8325 as the next bounded conflict candidate.
- Do not rewrite #11483: current `main` already supersedes its behavior, so it
  needs an explicit close/supersede decision. Keep #10148 device-gated after
  conflict repair because Android compilation and physical Android/iPad
  keyboard validation remain unavailable locally.
- Preserve the explicit read-only hold on #9416. Remaining non-draft conflicts
  are #10490, #10419, #9436, #9274, #8888, #8300, #8293, #8292, #8063, and
  #8057; triage them after the active candidates rather than bulk-rewriting
  reviewed branches.

### Verification

- Refreshed every open PR individually with `gh pr view` after the initial
  batch query so transient `UNKNOWN` mergeability was not counted as a final
  state. Cross-checked the 103-PR history with `gh pr list --state all` and the
  57-open count with GraphQL search.
- Queried GraphQL review threads for every open PR and compared all PR
  `updatedAt` values with the previous 10:17 CST cutoff. Fetched upstream
  `main` and compared changed paths in the 21-commit range against the active
  conflict candidates.
- No PR branch, review thread, comment, upstream branch, code path, deploy, or
  release was modified. No Docker command or local test suite was run.

## 2026-08-02 — Authored PR review follow-through and conflict maintenance

### Result

- #9415 is now `778105006`: fixed repeated foreground-evidence timer refreshes,
  backfilled PTY identity for unbound pane evidence, replied inline to all three
  review comments, and resolved every thread without rebasing the reviewed
  #9415/#9434/#9435 stack.
- #8281 was rebased onto upstream `de75003df9` and updated to `a22ea6345`.
  Retryable startup delivery no longer emits an early/duplicate failure toast;
  terminal ownership loss emits the final toast, the unreachable Codex draft
  branch is gone, and the rebased toast mock is hoist-safe. Both review threads
  were answered inline and resolved.
- #11489 was rebased to `aa2255cb8`, preserving main's bounded LRU cache while
  evicting retired runtime entries and preventing detached in-flight scans from
  restoring them. #11384 was rebased to `a720d0b99`, combining main's
  `detachedGui` batch-spawn option with the opt-in sibling PowerShell-shim
  fallback and current formatter output.
- #11483 was not rewritten: merged PRs #11599 and #11814 already implement its
  Git Bash clipboard behavior with a stronger copied-command/setup-terminal
  split. Current-main regression coverage passed, so the old PR remains an
  explicit close/supersede decision rather than receiving duplicate code.
- #11674 was fast-forwarded to `607a83b42` with Kimi argument-matrix coverage
  for thinking off/omitted and default/empty model selection. #11681 was
  fast-forwarded to `3b750631a` with a negative contract proving that a one-off
  external-path grant cannot transfer through a nested symlink; its remaining
  review thread was answered and resolved.
- Read-only reassessment confirmed that #8325 and #10148 remain substantive and
  are not patch-equivalent to main, but both are currently conflicting. #8325
  is the next bounded rebase candidate. #10148 still needs Android compilation
  and physical Android/iPad keyboard validation in addition to conflict work.
- The explicit #9416 hold was honored: its branch remains unchanged at
  `da5cb1fea` despite GitHub reporting it conflicting.

### Validation

- #9415: 569 focused tests, Node/Web TypeScript, default and type-aware Oxlint,
  Oxfmt, max-lines ratchet, and diff checks passed.
- #8281: all 12 changed test files passed (2,350 passed, 1 skipped); Node/Web
  TypeScript and all changed-code/format/max-lines/diff gates passed.
- #11489: six cache/runtime suites passed (75/75); full Node/CLI/Web TypeScript
  and changed-code/format/max-lines/diff gates passed.
- #11384: five local/relay/SSH suites passed (181/181); full TypeScript and relay
  builds for Linux, macOS, Windows, and WSL passed, together with the static
  gates. #11674 passed 54/54 focused tests and full TypeScript/static gates.
- #11681 passed 160 tests with one platform skip, Node TypeScript, changed-code
  quality, format, max-lines, and diff checks. Current main's replacement for
  #11483 passed 60/60 focused tests.
- Exact old-head leases guarded every rewritten/updated fork push. GitHub
  readback matched each final head and reported #9415, #8281, #11489, #11384,
  #11674, and #11681 MERGEABLE with zero unresolved review threads.
- No Docker command, upstream merge, upstream-main push, deploy, release, or
  local native Windows/mobile device run was performed.

### Remaining risk and resume point

- Hosted checks are independent from local verification. Some final heads have
  only Greptile or no completed rollup; refresh them before any merge claim.
- Rebase #8325 next with its navigation-intent/store-slice conflict set and rerun
  the sidebar/runtime race suites. Treat #10148 as device-gated rather than
  merge-ready after a source-only rebase.
- Decide whether to close #11483 as superseded. #8391 remains CLEAN with its
  existing full green check matrix and needs maintainer action, not author code.
- Work was isolated in `/private/tmp/orca-pr-maintenance.qaPdZh/pr-9415` with
  per-PR pre-rebase backup refs. Root `.memory/`, `CHANGELOG.md`, `MEMO.md`, and
  `tools/orca-demand-radar/` remain intentional untracked local artifacts.

## 2026-08-02 — Read-only authored-PR action audit

### Result

- Queried live GitHub state for every open `bbingz` PR in `stablyai/orca` at
  09:05 CST. There were 57 open PRs; excluding #11676 and #11681, this audit
  covered 55: 4 drafts, 18 conflicting, and 37 mergeable.
- None of the 55 had a formal `APPROVED` or `CHANGES_REQUESTED` decision. GitHub
  reported one `CLEAN` PR (#8391), 18 `DIRTY`, and 36 `UNSTABLE`; 49 had an
  assignee and a pending review request.
- #8391 is the only clean handoff: it is OPEN, non-draft, MERGEABLE, has 22
  completed checks with no failures or pending jobs, and has an Orca
  collaborator's detailed "LGTM to merge" comment. It needs maintainer action,
  not more author-side code work.

### Action routing

- Exact-head source inspection confirmed substantive follow-up work on #9415:
  repeated foreground evidence unconditionally refreshes the wake ledger and
  timer, while the renderer observation call does not pass/backfill the known
  PTY ID. The direct `Map` value mutation comment is non-blocking style feedback.
- #8281 has a real duplicate-toast path because it emits the "not sent" toast
  before returning a retryable outcome; it also retains a dead Codex-only draft
  flag branch. The PR is currently conflicting, so the fix and rebase should be
  handled together.
- #11674 is mergeable and P1, but its two unresolved Greptile threads identify
  narrow Kimi argument-matrix coverage gaps (`thinkingLevel` off/omitted and
  default/empty model). These are coverage hardening, not a demonstrated
  production defect.
- Fifteen non-draft conflicts remain after excluding draft conflicts and the
  explicit #9416 hold. First priority is #11483 (P0), #11489 (P1), #11384
  (assigned review plus native Windows validation), and #8281 (confirmed P1
  finding). #10148 and #8325 already have positive human review history but now
  conflict again. The remaining conflict backlog is #10490, #10419, #9436,
  #9274, #8888, #8300, #8293, #8063, and #8057.
- #9416 remains read-only and unchanged despite its conflict. Drafts #11136 and
  #9433 also require no conflict work until their draft scope is resumed.

### Validation

- Used GitHub GraphQL search and per-PR fields for comments, reviews, review
  threads, assignments, mergeability, merge-state status, and check rollups;
  refreshed #8391 individually and read the exact GitHub head contents for
  #9415, #8281, and #11674.
- No PR comment, review, branch update, rebase, push, merge, or code change was
  made. No local test, typecheck, lint, build, or Docker command was run because
  this was a read-only remote-state and source audit.

## 2026-08-01 — Main sync and stale worktree / fork-branch cleanup

### Result

- Refreshed `origin` and `fork`, then fast-forwarded local `main` from
  `8fef6db29266f57a450fafaa9d2d26554d099113` to current upstream
  `5738d61fe09e68f9c7b166288c581803983945c9`.
- Fast-forwarded `fork/main` from
  `0b65d725c98d6552f08fb512f4026b350b7fbf0b` to the same upstream commit.
- Removed three clean, inactive local checkouts after verifying each local
  head exactly matched its fork branch and open upstream PR head:
  - `.worktrees/issue-11641` — #11676 / `fix/skip-hooks-without-cli`.
  - `.worktrees/issue-11654` — #11681 / `fix/open-symlink-target`.
  - `.worktrees/issue-11669` — #11674 / `fix/kimi-branch-rename-prompt-flag`.
- Preserved all three open PRs and their local/fork branches. Only the local
  worktree checkouts were removed.
- Removed the ignored `out/` build output and five local branches whose only
  matching authored PR was already merged or closed:
  `bbingz/accounts-pane-remote-scope-affordance`,
  `bbingz/fix-remote-runtime-recovery`, `fix/7902-repo-icon-detection`,
  `fix/mobile-japanese-ime`, and `fix/opencode-tab-icon`.
- Deleted 46 fork branches whose matching authored upstream PRs were all
  merged or closed and which were not reused by any open PR. No upstream PR
  was closed: the fork had zero open PRs, and none of the 57 open upstream PR
  heads was fully patch-equivalent to current `origin/main`.

### Space and safety boundaries

- The three worktrees occupied 8.2 GiB and `out/` occupied 279 MiB before
  cleanup. The repository tree now reports 9.7 GiB versus 18 GiB before
  cleanup; `/System/Volumes/Data` currently reports 309 GiB available.
- Preserved the root `node_modules/` (2.4 GiB) so the synchronized main
  checkout remains development-ready. Also preserved `.memory/`,
  `CHANGELOG.md`, `MEMO.md`, and `tools/orca-demand-radar/` as intentional
  local artifacts.
- Orca 1.4.159 was briefly reachable for runtime inspection and reported no
  terminal under this repository. It then stopped, so final inactivity was
  also verified through clean worktree status and no process CWD under the
  removed paths.
- The removed worktree branches remain on the fork and can recreate their
  checkouts. Deleted closed/merged fork branch contents remain addressable
  through their GitHub PR history if recovery is needed.

### Validation

- `git status --short --branch` showed all three removed worktrees clean and
  tracking their fork branches before deletion.
- GitHub readback confirmed #11676, #11681, and #11674 were OPEN with head
  OIDs identical to local and fork refs before their worktrees were removed.
- GitHub Search / PR inventory reported 57 open authored upstream PRs and zero
  open PRs in `bbingz/orca`; `git cherry origin/main <head>` found no open PR
  fully absorbed by main.
- `git fetch`, `git merge --ff-only`, fork push output, and final remote
  readback are the synchronization evidence. No Docker command was run.
- No code tests, typecheck, lint, build, packaging, or Electron E2E were run;
  this was repository maintenance without production-code changes.

## 2026-07-31 — Rebased #11256, #10490, and #10419 onto current main

### Result

- Rebased the three requested OPEN, non-draft PRs onto `origin/main`
  `5fe3aaf2b75303709086a72c78a756f6b8c3caf8` and updated only their fork
  refs with exact old-head leases:
  - #11256: `ada7fe692d59ade60cd7d5a24de63806452a9a69` →
    `3554be2b2a5b1f4a3fecc8e11461e423538fb902`.
  - #10490: `f70c6b23a4afd97f2f5a1b09eccfc6d88bd62995` →
    `4a267c1ea731083a14480df375840f2226220b7b`.
  - #10419: `786d75c232b21ba798a3a9d9c87b110cf0cd1232` →
    `2e4fba5d1f1007c6a20af9e6e0391551e70ad2d8`.
- GitHub readback reports all three as OPEN, non-draft, MERGEABLE, based on
  the exact current main, with zero unresolved review threads. No upstream
  merge or main-branch push was attempted.
- #11256's sole conflict was
  `src/renderer/src/lib/language-detect.test.ts`; the resolution retains
  main's `.cts` / `.mts` / `.mjs` / `.cjs` coverage and the PR's Terraform /
  Justfile coverage.
- #10490 replayed all 39 existing commits. Its sole semantic conflict was the
  task-list review-status UI: the final result preserves main's generic
  GitHub/GitLab labels and tones while passing the themed style factory into
  all three tone lookups. The combined main/PR result exceeded the terminal
  WebView HTML line budget by three nonblank lines, so the two fallback CSS
  variables were kept in one equivalent `:root` declaration in follow-up
  commit `4a267c1ea`.
- #10419 retained its five-commit stack, including the two #10418 parent
  commits. Its only conflict was a shared runtime type-import list; both
  main's native-chat launch-draft type and the PR's mobile-terminal-theme type
  are present in the final tree.
- Local safety refs are
  `backup/pr-11256-pre-rebase-20260731`,
  `backup/pr-10490-pre-rebase-20260731`, and
  `backup/pr-10419-pre-rebase-20260731`. The implementation worktrees are
  `/private/tmp/orca-11215`,
  `/private/tmp/orca-pr-10507-restack-20260729`, and
  `/private/tmp/orca-pr-10419-restack-20260729`.

### Validation

- #11256 passed 24 focused language-detection tests (14 renderer, 10 mobile),
  Web and mobile TypeScript, changed/type-aware/React Doctor quality, the
  max-lines ratchet, targeted oxlint/oxfmt, diff checks, and a final clean
  merge-tree. Greptile completed successfully on the exact final head.
- #10490 passed the complete mobile Vitest suite: 376 files, 2,760 tests
  passed and 3 skipped. The terminal-theme subset passed 25/25, the shared
  desktop catalog/contrast subset passed 12/12, and the theme guards passed
  18/18. Mobile and Web TypeScript, mobile oxlint/oxfmt, changed/type-aware
  quality with zero new findings, the max-lines ratchet, diff checks, and the
  final merge-tree passed.
- #10490's standalone changed-lines React Doctor gate still reports the exact
  same pre-existing 12 errors as the old head: 10 oversized changed files and
  2 `ReadonlyArray` style findings. A before/after run confirmed no new issue;
  resolving those errors would require a separate multi-file component split
  rather than conflict maintenance.
- #10419 passed 88 focused runtime/theme tests, Node and Web TypeScript,
  changed/type-aware quality, React Doctor, the max-lines ratchet, targeted
  oxlint/oxfmt, diff checks, and the final merge-tree.
- Fork `ls-remote`, local heads, and GitHub `headRefOid` values agree for all
  three PRs. GraphQL quota remained healthy at 4,989/5,000 after the final
  readback. No Docker command or 429 response occurred.

### Remaining risk

- #11256 Greptile is SUCCESS. #10419 Greptile was still IN_PROGRESS at the
  last readback, and #10490 had no hosted check rollup; neither state was
  represented as green. All current review threads are resolved.
- #10490's pre-existing React Doctor debt can block the current changed-lines
  workflow even though the rebase introduced zero new quality findings. It
  needs either a separately scoped file-splitting pass or maintainer guidance,
  not a max-lines suppression.
- Native Android/iOS builds, packaging, Electron E2E, and live headless
  SSH/Linux theme behavior were not run. Resume by refreshing #10419's
  Greptile result, #10490's hosted checks, and all three review-thread sets
  before taking further action.

## 2026-07-31 — Replayed #10507 as an independent route-tree cleanup

### Result

- Replayed [#10507](https://github.com/stablyai/orca/pull/10507) from old head
  `904088eff961eebe23bf51f4c87257a25de880b9` onto current `origin/main`
  `967edeb49a19271a64ccd006598878000b63c79f`.
- The old PR head carried 41 commits and 237 changed files because it included
  the open #10490 parent stack. The final head
  `9a7ce0cd8e6fd0a10882eead2f48cc9139c1fd92` is two independent commits with
  17 changed files.
- Preserved current main behavior while moving the eight remaining non-route
  modules from `mobile/app` to the existing `mobile/src/host` and
  `mobile/src/session` feature directories. Consumers now import the moved
  modules from their new paths.
- Added `mobile/src/expo-router-route-tree.test.ts`, which reports any
  TypeScript file under `mobile/app` that does not export a route component.
- Greptile found two issues in the first standalone head. The follow-up uses
  the repository's ESM-native `import.meta.dirname` path pattern and replaces
  the default-export regex with TypeScript AST detection for direct defaults,
  aliased defaults, and default re-exports.
- Deliberately omitted the old parent-only themed-style factory follow-up:
  that test file does not exist on main and is unrelated to the route-tree
  cleanup.
- Updated the PR description to remove the stale #10490 dependency and record
  the actual standalone scope, validation, security boundary, and on-device
  omission.
- Pushed only `bbingz/mobile-route-tree-only-routes` with an exact old-head
  lease. GitHub readback reports OPEN, non-draft, MERGEABLE, zero unresolved
  review threads, and the exact new head. No upstream merge was attempted.

### Conflict resolution

- A pre-replay `git merge-tree --write-tree origin/main HEAD` was clean even
  while GitHub still reported `DIRTY`, showing that the hosted mergeability
  result had not been recomputed against the latest main.
- Replaying the unique route-tree commit directly onto main exposed 11
  content/modify-delete conflicts. The two route consumers and eight moved
  module/consumer paths retained current main's static style behavior; only
  relative imports and locations changed.
- `mobile/src/theme/themed-style-factories.test.ts` was resolved as absent
  because it belongs to #10490 and is not present on main.
- The old head is retained locally at
  `backup/pr-10507-pre-replay-20260731`; the first standalone review head is
  retained at `backup/pr-10507-pre-main-refresh-20260731`. The implementation
  worktree is `/private/tmp/orca-pr-10507-restack-20260729`.

### Validation

- The route-tree test passed 1/1 on the old head before replay. The new
  default-export matrix then failed 2/6 against the regex and passed 6/6 after
  the AST fix. On the final head, four focused files passed 21/21 tests under
  Node 24.18.0:
  route-tree coverage, terminal-tab agent behavior, quick-command stability,
  and the live-input style source contract.
- Mobile TypeScript passed. Changed-code quality, type-aware quality, React
  Doctor, and max-lines ratchet all passed with zero new findings.
- The commit hook's oxlint, React Doctor oxlint, and oxfmt tasks passed.
  Targeted final-head oxlint, oxfmt check, `git diff --check`, and a final
  `git merge-tree --write-tree origin/main HEAD` also passed.
- The fork ref, GitHub PR head, and local head all read back as
  `9a7ce0cd8e6fd0a10882eead2f48cc9139c1fd92`. The initial exact-lease rewrite
  verified that the fork still held `904088eff`; the final main-refresh rewrite
  verified the intermediate fork head `4158ab751`.
- Main advanced once during the review-follow-up push. A non-fail-fast shell
  guard allowed that feature-branch fast-forward before refusing the stale
  base; the branch was immediately rebased cleanly from `9f5aa41a7` to
  `967edeb49`, fully revalidated, and updated with an explicit fail-closed
  guard plus exact lease. Upstream main was never pushed.
- No 429 response and no Docker command occurred.

### Remaining risk

- Greptile's first standalone-head review succeeded and produced two P2
  threads; both were fixed, answered inline, and resolved. Its final-head
  re-review also succeeded, and all nine review threads are resolved.
- Full mobile tests, native Android/iOS builds, packaging, Electron E2E, and
  the on-device Metro warning-count check were not run. The static guard is the
  verified claim; zero runtime warnings remain unverified.
- Draft conflict #11136 was intentionally left untouched. Resume with a live
  queue scan before taking another item because GitHub state can drift.

## 2026-07-31 — Stable authored PR queue rescan

### Result

- Refreshed every OPEN PR authored by `bbingz` and targeting `main`: 54 total,
  comprising 50 non-draft and 4 draft PRs.
- All 50 non-draft PRs are MERGEABLE. None are CONFLICTING or UNKNOWN, none
  have an unresolved review thread or `CHANGES_REQUESTED`, and no hosted check
  is failed or pending.
- Hosted rollups are SUCCESS for 24 non-draft PRs; 26 have no rollup and were
  not treated as successful. GitHub reports 2 `CLEAN` and 48 `UNSTABLE`;
  `UNSTABLE` was not interpreted as a visible CI failure.
- #11489 remains MERGEABLE at `38d51a729`, and #11483 remains MERGEABLE at
  `942ed8230`. Neither was rebased or merged.
- The current top maintainer-ready queue, ranked by recent activity among
  MERGEABLE / zero-thread / successful-rollup PRs, is #9416 (`c359cdce7`),
  #8254 (`2806a2672`), #9436 (`a04340357`), #7910 (`9bbb5afee`), #11489
  (`38d51a729`), and #11483 (`942ed8230`).
- No review, conflict, or rebase work was actionable, so no PR branch was
  changed or pushed and no upstream merge was attempted.

### Validation

- A single GraphQL search enumerated the 54 OPEN authored PRs and inspected up
  to 50 review threads plus hosted check contexts per PR. A separate
  `gh pr list --base main` readback independently matched 54 total, 50
  non-draft, 4 draft, and zero non-draft conflicts or unknown mergeability.
- A focused activity query inspected the six PRs updated since
  `2026-07-30T16:45:00Z`; all six have zero unresolved threads. The visible
  #9436 CodeRabbit review summary points to the already handled thread rather
  than a new outstanding request.
- Remote `main` and local `origin/main` both resolve to
  `ab665a3ce70967857778dcc7d3ced7e596ee9f3f`. The primary checkout itself
  remains intentionally untouched at `89968a10614d0e5f5a6b7805c81dccc3a1b5110b`
  and is 159 commits behind.
- GraphQL quota remained healthy after the scan: 4,915 of 5,000 points
  available. No 429 response and no Docker command occurred.

### Remaining risk

- GitHub state can change after this snapshot. The 26 PRs without a hosted
  rollup have no visible CI evidence and must not be described as green.
- The reason for 48 `UNSTABLE` merge-state values is not exposed by the
  contributor-visible data; current evidence only proves MERGEABLE, zero
  unresolved threads, and no visible failed or pending check.
- Resume by repeating the same scoped queue scan. Act only on a new conflict,
  unresolved thread, or concrete review request; otherwise keep the queue
  stable and wait for maintainers.

## 2026-07-31 — Greptile remediation for #9416, #7910, #9436, and #8254

### Result

- Updated [#9416](https://github.com/stablyai/orca/pull/9416) from
  `68f98d823` to `c359cdce7`: discovered remote Claude config dirs now honor
  the same `options.agents` allowlist as static installers, and local/remote
  discovery share the deterministic 16-candidate probe cap. Both Greptile
  threads were answered and resolved.
- An independent Codex review of `68f98d823..c359cdce7` reported no Critical,
  Important, or Minor findings and returned `CODE QUALITY: APPROVED`.
- Updated [#7910](https://github.com/stablyai/orca/pull/7910) from
  `a290ccac3` to `9bbb5afee`: the server list omits its endpoint row when no
  endpoint exists, while the edit dialog retains its intentional
  `No endpoint` fallback. The Greptile thread was answered and resolved.
- Updated [#9436](https://github.com/stablyai/orca/pull/9436) from
  `06abfe0c4` to `a04340357`: the stale-content guard reads the already
  resolved write path directly, and identical-content writes return before
  the redundant `mkdirSync`. Both Greptile threads were answered and resolved.
- A later CodeRabbit request for an atomic stale-check CAS was answered and
  resolved without code changes: the bounded read-to-rename TOCTOU is an
  explicit PR limitation, a shared Orca lock cannot coordinate the external
  agent CLI writer, and this commit did not widen the existing race window.
- Updated [#8254](https://github.com/stablyai/orca/pull/8254) from
  `a481c9ee7` to `2806a2672` with test-only coverage. A real WebSocket test
  proves `RemoteRuntimeSubscription.close()` is a no-op after remote close;
  a preload test locks the close-before-pending-invoke-settle tombstone order.
  Both Greptile threads were answered and resolved.
- All four updates were ordinary fast-forward pushes. #11489
  (`38d51a729`) and #11483 (`942ed8230`) remained OPEN and MERGEABLE, so no
  rebase or upstream merge was performed.

### Validation

- #9416: the two regressions failed before the production fix and passed
  afterward; 49 related test files passed 794 tests with 5 platform skips.
  Node/CLI/Web typechecks, targeted oxfmt/oxlint, reliability gates,
  max-lines ratchet, and diff checks passed. Independent review additionally
  passed 62 focused tests.
- #7910: the endpoint-list regression failed before the helper existed.
  Settings coverage passed 126 files / 809 tests; the focused set passed
  14/14. Web typecheck, targeted oxfmt/oxlint, max-lines ratchet, and diff
  checks passed.
- #9436: 77 tests passed with 4 platform skips; Node typecheck, targeted
  oxfmt/oxlint, and diff checks passed.
- #8254: 77/77 main/preload/real-WebSocket tests passed; Node/CLI/Web
  typechecks, targeted oxfmt/oxlint, and diff checks passed. The worktree's
  pre-existing `package.json` symlink type change and local `node_modules`
  symlink were explicitly excluded from the commit.
- A repository-wide Vitest run passed 41,447 tests and skipped 73, but was not
  green: 59 failures remained in four unrelated xterm IME fixture files, and
  the Node 26 run also failed one SSH/npm integration. Re-running the five
  files on the required Node 24.18.0 made the SSH integration pass while the
  same 59 unrelated IME failures remained.
- #9416's changed-code-quality scan also reports a pre-existing 311-line
  `src/main/claude/hook-service.ts` max-lines finding outside the four-file
  remediation commit; the repository's max-lines ratchet itself passed.
- No Docker command was used.

### Remaining risk

- Greptile re-review completed successfully for #7910 and #9436. It remained
  in progress for #9416 and #8254 after repeated cooldown checks; all four
  were OPEN, non-draft, MERGEABLE, and had zero unresolved review threads.
- The unrelated xterm IME failures, #9416's pre-existing changed-code-quality
  finding, full build/packaging, Electron E2E, and real SSH/WSL validation were
  not expanded into this remediation scope.
- Resume by refreshing the four Greptile checks and review threads before
  taking further action. Exact heads are `c359cdce7`, `9bbb5afee`,
  `a04340357`, and `2806a2672`.

## 2026-07-30 — Claimed and fixed #11429

### Result

- Claimed #11429 with a public implementation note:
  https://github.com/stablyai/orca/issues/11429#issuecomment-5126015353.
- Created `fix/evict-removed-runtime-skill-cache` from `origin/main`
  `f8b553b7d5f028c4e85d80855d72f343348cb05f` and opened non-draft PR
  [#11489](https://github.com/stablyai/orca/pull/11489) at
  `38d51a72998fe8f942e9939a5fffaa4cc97b79d3`.
- The cache previously supported only a global clear. Removing or re-pairing a
  runtime therefore left its completed discovery result cached, while an
  already-running discovery could still resolve later and repopulate that
  stale entry.
- Added exact runtime-key eviction at the existing
  `setRuntimeEnvironments` retirement boundary. Removed environments and
  same-ID pairing-revision replacements are evicted; unchanged and surviving
  environments retain their cache entries.
- In-flight invalidation tracks Promise identities in a `WeakSet`, so an old
  discovery cannot repopulate the cache and ephemeral runtime IDs are not
  retained. The existing equality guard prevents an old Promise cleanup from
  deleting a newer scan.
- Kept lifecycle direction one-way: the runtime-status slice calls a plain
  discovery lifecycle function, without importing the store into cache or
  discovery modules and without adding a status-refresh subscription.

### Validation

- Three regressions failed before the production change and passed afterward:
  removing one runtime rescans only that runtime, changing a pairing revision
  evicts while an unchanged revision does not churn, and a removed in-flight
  discovery cannot repopulate the cache.
- Seven related Vitest files passed 64 tests under Node 24.18.0, covering the
  discovery cache, discovery deduplication, installed-skills hooks,
  runtime-status lifecycle, purge wiring, and the new eviction regressions.
- Node, CLI, and Web TypeScript checks passed. Changed-code quality,
  type-aware quality, React Doctor, max-lines ratchet, targeted oxfmt, and
  `git diff --check` all passed.
- The branch is clean apart from its intentionally untracked local
  `node_modules` symlink; local, fork, and PR heads were read back at the exact
  same commit.
- The final head merges cleanly with latest `origin/main`
  `f908ba38bc38c4b4e6cfebba911f2741d292a5ce`.
- Both visible hosted checks succeeded: community tracking and Greptile.
  Greptile reviewed the exact final head, scored it 5/5, marked it safe to
  merge, and found no files needing attention. CodeRabbit reported no
  actionable comments; its generic docstring-coverage warning conflicts with
  the repository's concise-comment policy and required no code change.
- GitHub reported zero review threads and no formal review decision. The PR is
  OPEN, non-draft, and MERGEABLE, while `mergeStateStatus` remains `UNSTABLE`;
  no visible check is failed or pending, and the contributor cannot inspect the
  unavailable required-context or branch-protection explanation.
- No Docker command was used.

### Remaining risk

- Full repository lint/test/build, packaging, Electron E2E, and a live remote
  runtime remove/re-pair lifecycle were not run.
- External GitHub state can change after this snapshot. #11429 remains open
  until the PR is merged, and the hidden reason for `UNSTABLE` remains
  unverified.
- The implementation worktree remains at `/private/tmp/orca-issue-11429` as
  the resume point for maintainer feedback.

## 2026-07-30 — Claimed and fixed #11431

### Result

- GitHub would not let external contributor `bbingz` assign #11431, so the
  issue was claimed with a public implementation comment:
  https://github.com/stablyai/orca/issues/11431#issuecomment-5125832484.
- Created `fix/windows-git-bash-skill-command` from current `origin/main`
  `74563b64985f796ca491340854e57c937ec2972f` and opened non-draft PR
  [#11483](https://github.com/stablyai/orca/pull/11483) at
  `942ed82302739f2f1daa8caf518e0bda4a2387fc`.
- Separated the copied/previewed skill command from the command Orca inserts
  into its controlled setup terminal. A POSIX-family Windows shell now receives
  the bare `npx skills ...` command at clipboard boundaries, while the in-app
  PowerShell terminal retains the existing `cmd.exe` npx preflight and missing
  runtime guidance.
- The conversion recognizes only the exact native-host wrapper generated by
  `CliSkillRuntimeSetup`; WSL PowerShell wrappers, remote runtimes, unrelated
  commands, and native PowerShell/cmd setups remain unchanged.
- Routed all four reported copy surfaces through the clipboard boundary:
  `AgentSkillSetupPanel`, the combined CLI feature-tip terminal,
  `OrchestrationSkillPromptDialog`, and the Linear skill settings CTA. A source
  contract test covers the complete four-surface inventory.

### Validation

- The new `AgentSkillSetupPanel` regression failed before the production fix
  because both preview and clipboard still contained the `cmd.exe` wrapper. It
  then passed while independently asserting that the in-app terminal still
  received the wrapped command.
- Seven related Vitest files passed 52 tests under Node 24.18.0, covering
  command construction, clipboard behavior, all clipboard call sites, project
  runtime resolution, Windows shell overrides, and Linear runtime routing.
- Node, CLI, and Web TypeScript checks passed. Changed-code quality,
  type-aware quality, React Doctor, max-lines ratchet, targeted oxfmt, and
  `git diff --check` all passed.
- The fork head, local head, and PR head were read back as the exact same SHA;
  GitHub reported the PR OPEN, non-draft, and MERGEABLE.
- Greptile reviewed the final `942ed8230` head, scored it 5/5, marked it safe
  to merge, and identified no files needing attention. CodeRabbit generated no
  actionable comments; its generic docstring-coverage warning does not match
  this repository's concise-comment policy and required no code change.
- The final PR has one successful Greptile check, zero unresolved review
  threads, no formal review decision, and no failed or pending reported check.
  GitHub still reports `mergeStateStatus: UNSTABLE`, consistent with a hosted
  required-check context unavailable on this external-contributor head rather
  than a reported failure; that explanation is an inference because branch
  protection details are not visible to this contributor.
- No Docker command was used.

### Remaining risk

- No live Windows build or Git Bash execution was rerun for this patch. The
  issue carries the reporter's real-Windows shell matrix; this change verifies
  the output boundary deterministically but does not replace platform-realistic
  execution evidence.
- Full repository lint/test/build, packaging, and Electron E2E were not run.
- External GitHub state can change after this snapshot, and the unreported
  required-check context behind `UNSTABLE` cannot be approved by this
  contributor.

## 2026-07-30 — Repaired all non-draft conflicts and closed review follow-ups

### Result

- Rebased and safely updated all four non-draft conflicting PRs against
  `origin/main` `64aa726301d87fd722fba493e458c55d168d4fba`:
  - #8293: `a0f3e223d` -> `5158405d2`
  - #9751: `bd0931d3f` -> `d63fe270d`
  - #7840: `60badd252` -> `06dff8282`
  - #8888: `87a1a84f5` -> `520af3344`
- Each update used the exact live fork head as a force-with-lease guard. GitHub
  read all four back as OPEN, non-draft, and MERGEABLE.
- Conflict resolutions preserved both sides of each integration boundary:
  #8293 retained the new five-hour/week classification; #9751 retained the
  cross-platform IME route before TUI copy forwarding; #7840 retained the SSH
  transport writer and `beforeResolve` while supporting bounded streamed scans;
  #8888 retained orchestration compatibility, streaming option extraction, and
  terminal source-range accounting while adding close attribution/policy.
- #8293's rebase exposed an existing non-executing status-bar test and renamed
  rate-limit snapshot types. The test now executes the nested verbose component
  and uses the real tooltip section derivation; the mapping imports the current
  shared snapshot types.
- A new Greptile P2 on #8293 correctly identified hard-link probe accumulation
  after persistent unlink failures. `5158405d2` retries transient cleanup and
  uses one stable probe name per target, bounding persistent failures to one
  retained entry. Both transient and persistent failure regressions were added.
  The thread was answered at
  https://github.com/stablyai/orca/pull/8293#discussion_r3679418028 and resolved.
- Three new Greptile threads on #7840 were adjudicated against the rebased
  source. `06dff8282` bounds streamed `du` rows with the shared 100k-entry /
  64 MiB retained-data budget, restores 120-second local/relay `du` deadlines
  and the 130-second SSH request deadline, and prevents a directory-admission
  failure from starting an orphan `du`. The staleness-polling claim was
  narrowed: production disconnect and `rpc.cancel` already abort the exact
  request signal observed by the child reader. All three threads were answered
  and resolved, and the stale no-timeout PR description was corrected.
- Three new Greptile threads on #8888 were reproduced and fixed in
  `520af3344`: tracking-capacity exhaustion now has a distinct
  `close_tracking_capacity_exceeded` reason, rate-limited request ids are
  released for a same-intent retry after the window, and `id:`/bare worktree
  selectors share one recent-attachment attribution key. All three threads
  were answered and resolved.
- The three older #10148 threads were also closed. `589a4e5e1` documents the
  iOS `UIKeyCommand` repeat-state limitation and exports
  `StyleProp<ViewStyle>` instead of `unknown`. The Android function-key prefix
  claim was rejected as unreachable in the current closed mapping: only the
  explicit F1-F12 branches return uppercase `F`, while fallback labels are
  lowercased.
- #11384 now says `Partially addresses #11374`; its body records the real
  Windows validation and remaining standard-IDE/oversized-argv scope. #11374
  remains open, with the scope reply at
  https://github.com/stablyai/orca/issues/11374#issuecomment-5125414607.
- While the final review checks were running, upstream main advanced from
  `64aa726301d8` to `80c42d38c73f` and maintainers merged #11382 as
  `bd9653c26d6d`. The post-update mergeability recomputation settled with no
  new conflict.
- Final authored-PR lifecycle inventory is 98 total: 52 open, 20 merged, and
  26 closed-unmerged. All 48 non-conflicting open PRs are MERGEABLE; the only
  four conflicts are drafts #11136/#9433/#9434/#9435. Eighteen open PRs have
  successful hosted check rollups, 34 have none, and there are zero pending or
  failed checks, formal review decisions, or unresolved review threads.

### Validation

- #8293: 10 affected Vitest files passed 347 tests after the review fix;
  Node/CLI/Web typechecks, oxfmt, changed-code quality, type-aware quality,
  React Doctor, max-lines ratchet, and diff checks passed.
- #9751: the keyboard handler suite passed 29 tests; all three typechecks and
  the same formatting/quality/max-lines/diff gates passed.
- #7840: 16 workspace-space/SSH/relay suites passed 140 tests; all three
  typechecks and the same formatting/quality/max-lines/diff gates passed.
- #8888: ten daemon/runtime/renderer suites passed 326 tests; all three
  typechecks and the same static gates passed.
- #10148: the package and full mobile TypeScript checks passed, as did three
  focused mobile Vitest files with 38 tests, targeted Oxlint/oxfmt, repository
  changed-code quality, max-lines, and diff checks.
- Final Greptile reruns for #8293, #7840, #8888, and #10148 completed
  successfully with no new unresolved threads.
- Range-diff matched every rebased commit except the documented conflict
  adaptations and follow-up fixes. No Docker commands were used.

### Remaining risk

- The four PR branches have not run the full repository test suite, packaging,
  Electron E2E, or platform-realistic Windows/SSH scenarios in this pass.
- #10148 did not run native iOS or Android builds; the Swift-only change is a
  comment, while the TypeScript contract change was validated by both package
  and full mobile typechecks.
- Hosted checks on fork PRs are sparse. The 34 missing rollups are not treated
  as success, and external state can change again after this snapshot.
- #8293 deliberately retains one stable probe entry if the filesystem
  persistently allows hard-link creation but denies every unlink; this prevents
  accumulation but still requires ACL repair or manual cleanup before later
  publishes can resume.

## 2026-07-30 — Authored PR rescan after main advanced to `64aa72630`

### Result

- Reconciled all 98 PRs authored by `bbingz`: 53 open, 19 merged, and 26
  closed-unmerged. Of the open PRs, 45 are MERGEABLE and eight are
  CONFLICTING; mergeability settled with zero UNKNOWN results after GitHub
  completed its post-main-update recomputation.
- The four non-draft conflicts are #9751, #8888, #8293, and #7840. Local
  `git merge-tree` checks identify the exact conflict surfaces:
  - #8293: only
    `src/main/rate-limits/codex-fetcher-backend.test.ts`, after #11415.
  - #9751: only
    `src/renderer/src/components/terminal-pane/keyboard-handlers.ts`, after
    #11293's IME lifecycle change.
  - #7840: only `src/main/ssh/ssh-channel-multiplexer.ts`, after #11005.
  - #8888: `src/main/runtime/rpc/core.ts`, `dispatcher.ts`, and
    `methods/terminal.ts`, after #11005/#11271.
- The four draft conflicts are #11136 and the existing #9433/#9434/#9435
  stack. They remain separate from the non-draft repair queue.
- #11380, #11382, and #11384 remain OPEN, non-draft, MERGEABLE, and
  Greptile-successful against the new main.
- #11384 received new real-Windows validation from `iFwu`: the exact head
  `86c359467` succeeded through Orca's renderer IPC with the actual standalone
  `cursor-agent.cmd`/`.ps1` pair for roughly 14.5K and 28.9K staged diffs.
  A 32,143-character prompt failed before Cursor startup with
  `spawn ENAMETOOLONG`. Their standard Cursor IDE install exposes only
  `cursor.cmd`, with no sibling `.ps1`, so the PR does not close the issue's
  full standard-IDE/large-prompt scope.
- Since the previous snapshot there were no new reviews or review-thread
  comments. The only new PR root comment was the Windows validation above;
  the only unresolved threads remain the same three older Greptile threads on
  #10148.

### Validation

- Cross-checked lifecycle counts with four GitHub Search/GraphQL queries, then
  read all 53 open PRs for draft state, mergeability, review decisions, and
  check rollups.
- Waited for the initial 52 transient UNKNOWN mergeability results to settle,
  then repeated the complete open-PR query: 45 MERGEABLE, eight CONFLICTING,
  zero UNKNOWN.
- Sixteen open PRs have non-empty hosted check rollups and 37 have none.
  There are zero failed checks, zero pending checks, and zero formal review
  decisions; an absent rollup was not counted as success.
- Read recent root comments, reviews, every review thread, #11374's full issue
  discussion, and the exact #11384 Windows validation comment. Refreshed
  `origin/main` and matched it to live upstream
  `64aa726301d87fd722fba493e458c55d168d4fba`.
- This scan made no GitHub comments, PR-description edits, pushes, or branch
  changes.

### Recommended order

1. Update #11384's description from `Fixes #11374` to a partial-reference
   form and answer `iFwu`; keep #11374 open for the standard Cursor IDE and
   oversized-prompt paths.
2. Repair #8293 first because its only conflict is a focused test file.
3. Repair #9751 next because it has one source conflict and a recent green
   review, while preserving #11293's cross-platform IME semantics.
4. Then handle #7840's SSH multiplexer conflict and #8888's broader three-file
   runtime-RPC conflict.

### Remaining risk

- Mergeability and comments are a point-in-time GitHub snapshot and can move
  again as main advances.
- The conflict-file inventory is source-level only; no rebases, runtime tests,
  or branch-specific verification were run during this read-only audit.
- #11384's observed 32K argv ceiling is now real Windows evidence, not just a
  theoretical note. It should remain a follow-up unless the PR scope is
  expanded with a non-argv delivery path.

## 2026-07-29 — Implemented #11375, #11329, and #11374 in order

### Result

- Claimed and opened three focused, non-draft PRs from isolated worktrees:
  [#11380](https://github.com/stablyai/orca/pull/11380) for #11375,
  [#11382](https://github.com/stablyai/orca/pull/11382) for #11329, and
  [#11384](https://github.com/stablyai/orca/pull/11384) for #11374. All three
  are OPEN and MERGEABLE against `origin/main`
  `4543bb68263a89ab520cea62ca69d7ac78330dd3`.
- #11380 (`8a55e3ba8`) makes source-control command tokenization aware of the
  execution host's path flavor, preserving native Windows backslashes while
  retaining POSIX escape behavior for macOS, Linux, WSL, and POSIX SSH hosts.
  CodeRabbit's only comment-style nit was fixed, and the re-reviewed head
  received Greptile 5/5 with no files needing attention.
- #11382 (`05393a002`) lets an exact native `OC | ...` title reclaim a pane
  from stale Claude launch metadata even when no hook/process signal was
  observed. Greptile rated the scoped identity fix 5/5. CodeRabbit's generic
  docstring-coverage warning is not actionable because the production diff
  adds no function and the repository asks for concise non-obvious comments.
- #11384 (`86c359467`) routes unsafe multiline argv around Windows batch
  re-parsing through an existing sibling `.ps1` shim, for both local source
  control generation and Windows SSH relay execution. Safe batch argv keeps
  its existing `cmd.exe` path, and missing sibling shims still fail closed.
  Greptile found that the relay initially read `SystemRoot` from
  `process.env`; a failing custom-root regression reproduced the error before
  the handler was corrected to honor its merged execution environment. The
  re-review then found the same missing environment forwarding in local
  source-control generation; a second distinguishing regression reproduced
  it before `spawnEnv` was passed into the helper. The final maintenance
  review was also applied: both callers now use one Node-only shared shim
  resolver instead of maintaining parallel implementations. Greptile's final
  head review is 5/5 with no files needing attention, and all four review
  threads are resolved.

### Validation

- Ran the current heads under the repository's Node 24 engine using
  `mise exec node@24.18.0`: #11380's seven focused Vitest files passed 302
  tests with one skip, #11382's tab-agent suite passed 44 tests, and #11384's
  five Windows/local/relay/SSH suites passed 145 tests.
- Ran `pnpm typecheck` on all three heads; Node, CLI, and Web TypeScript
  projects passed.
- For the #11384 review correction, the custom `D:\Windows` assertion first
  failed with the old `C:\Windows` path, then passed after the one-line source
  fix. The full focused suite, `oxfmt --check`, changed-code quality scans,
  max-lines ratchet, `git diff --check`, and `pnpm build:relay` for six native
  targets plus WSL all passed.
- Each feature worktree is clean after its commit. GitHub head SHAs were read
  back after push; issue assignees/comments and PR review comments were
  refreshed after implementation.

### Remaining risk

- No live Windows Cursor execution was completed. The available host
  `10.0.8.6` timed out on two SSH probes, failed ICMP reachability, and had no
  ARP entry. The `.ps1` route is covered with platform-mocked tests and real
  temporary sibling files, but very large positional prompts remain subject
  to the Windows process command-line limit.
- Full `pnpm lint`, full `pnpm test`, `pnpm build`, packaging, and Electron E2E
  were not run. Hosted rollups currently contain community tracking and/or AI
  review rather than the full upstream CI matrix; GitHub therefore reports
  `UNSTABLE` despite all three heads being MERGEABLE.
- Worktrees remain at `.worktrees/issue-11375`,
  `.worktrees/issue-11329`, and `.worktrees/issue-11374` for follow-up.

## 2026-07-29 — Open-issue opportunity scan

### Result

- Refreshed the repository's 1,195 open issues. Fifteen open `bug` issues are
  unassigned; the sole unassigned `has_repro` issue already has a fixing PR,
  and there are no unassigned `good first issue` or `help wanted` issues.
- #11375 is the best current claim candidate. It is open and unassigned, with
  no fixing PR or competing comment. `tokenizeCustomCommandTemplate` still
  applies POSIX backslash escaping unconditionally, and both command overrides
  and additional agent arguments call it without an execution-platform
  parameter, so native Windows paths are deterministically corrupted on
  current `origin/main`.
- #11329 is the next useful local-macOS repro target. The report contains a
  concrete `OC | ...` title and wrong icon, while current main already
  classifies that title as OpenCode and has a stale-Claude-identity regression.
  A fresh reproduction is needed to isolate the remaining activity-signal or
  rehydration path instead of duplicating #9102.
- #11374 is a confirmed Windows failure chain and its author explicitly left it
  available. Cursor uses argv prompt delivery, `.cmd`/`.bat` launches reject
  multiline arguments by design, and `runLocalPlan` has no safe alternate
  launcher. Its implementation should wait for a Windows probe of adjacent
  `.ps1` shim availability and realistic prompt length.
- #11334 and #11312 remain plausible but larger follow-ups: the former spans
  cross-runtime project-host ownership, while the latter deliberately touches
  graph-sync liveness and requires soak coverage.
- Excluded #11343 despite its open/unassigned issue state: current main already
  chunks agent-prompt paste writes, waits 50 ms, sends Enter separately, and
  tests the large-payload path. Also excluded previously tracked #11123,
  #10917, #11143, and #11160 because they remain assigned; #11123 additionally
  has open PR #11176.

### Validation

- Read live GitHub Search/GraphQL issue counts, assignees, comments,
  cross-references, and closing PRs, including a final competition refresh for
  #11375/#11374/#11329/#11334.
- Inspected source and tests from `origin/main`
  `4543bb68263a89ab520cea62ca69d7ac78330dd3`, not the local checkout that is 89
  commits behind.
- Visually inspected #11329's attached screenshot and traced its `OC | ...`
  title through the current agent-title ownership tests.
- No GitHub comments, assignments, branches, code changes, or remote writes
  were made.

### Remaining risk

- No live Windows/WSL, SSH, packaged-app, or multi-host runtime reproduction
  was run. #11375's current source defect is deterministic, but its eventual
  fix must preserve POSIX parsing for WSL and SSH execution targets.
- A one-off TypeScript invocation was not run because this checkout does not
  provide `tsx`; no implementation test was added during this read-only scan.
- Candidate ownership can change quickly. Re-read assignees, comments, and
  linked PRs immediately before claiming an issue.

## 2026-07-29 — Post-fix authored PR rescan after #9751 checks completed

### Result

- Reconciled all 95 PRs authored by `bbingz` against live GitHub state: 50
  open, 19 merged, and 26 closed-unmerged. Of the open PRs, 47 are mergeable
  and the only three conflicts remain the intentional draft stack
  #9433/#9434/#9435.
- There are no unknown mergeability results, failed checks, pending checks, or
  formal review decisions. Thirteen open PRs have successful check rollups and
  37 have no rollup; missing checks were not counted as success.
- #9751 `bd0931d3f` completed Greptile successfully at
  `2026-07-29T13:00:44Z`. #8274 `b209108a5` and #8325 `812ac95aa` also remain
  non-draft, MERGEABLE, successful, and at zero unresolved threads.
- The only unresolved review threads are the same three Greptile comments on
  #10148 from `2026-07-29T00:05:25Z`. Since the prior closeout, no new root PR
  comments, third-party reviews, or review-thread comments appeared; the only
  activity was the already-recorded #9751 author reply.
- `origin/main` remains
  `4543bb68263a89ab520cea62ca69d7ac78330dd3`; no fresh main movement invalidated
  the mergeability snapshot.

### Validation

- Used GitHub Search counts plus a batched GraphQL read of all 50 open PRs for
  mergeability, review decisions, full check rollups, and review threads.
- Used a separate recent-activity GraphQL pass for root comments, reviews, and
  both resolved and unresolved thread comments after
  `2026-07-29T12:55:00Z`, then read #9751/#8274/#8325 individually for exact
  heads and check completion.
- Matched `origin/main` against a fresh `git ls-remote`. This audit made no
  remote changes and changed no PR branch.

### Remaining risk

- The 37 PRs without hosted check rollups remain locally verified only to the
  extent recorded by their individual closeouts; absence of checks is not a
  green signal.
- #10148's three older review threads and the three draft-stack conflicts
  remain active backlog. None is a newly introduced regression in this scan.

## 2026-07-29 — #9751 conflict and #8274/#8325 review follow-ups closed

### Result

- Rebased #9751's two commits from `89ba8f26d` onto `origin/main`
  `4543bb682`, producing rebase tip `4832c0f19`, then added review follow-up
  `a26b44509` and cross-client coverage `bd0931d3f`. Every update used an exact
  old-head lease. The conflict resolution preserves main's verified
  `writeTerminalClipboardText` path while restoring empty-selection ETX
  forwarding for mouse-capturing TUIs and the kitty-protocol reset.
- The post-rebase CodeRabbit review found one real shortcut-precedence issue:
  bare macOS Cmd+C could hide another terminal action rebound to that chord.
  The native-copy fallback now runs only when no action resolved, with a
  failing-first rebound-action regression. A second repeat concern was
  refuted against the resolver's existing `!event.repeat` gate and documented
  by a regression that already passed before the production fix. Both threads
  were answered and resolved.
- A later Greptile coverage request was addressed in `bd0931d3f`: configured
  copy now has explicit Linux/`normal` and Windows/`drag` cases alongside the
  existing macOS/`any` and shell/`none` cases. The thread was answered and
  resolved.
- Added #8274 commit `b209108a5` on top of `db0321724`. Codex-written
  `trustedHash` and `enabled` state now survive a WSL hook reinstall only when
  both the hook signature and `computeTrustKey` are unchanged. The new
  cross-key regression reproduced the stale-state transfer before the guard.
- Replied to and resolved the #8274 CodeRabbit thread with the fix and test
  evidence. Replied to and resolved #8325's Greptile thread without changing
  code: the guarded refresh boolean intentionally reports runtime reachability,
  while `shouldApply` controls publication of the result.
- GitHub re-read #9751, #8274, and #8325 as non-draft and MERGEABLE with zero
  unresolved threads. A full authored-PR rescan now shows 95 total: 50 open,
  19 merged, and 26 closed. The only conflicts are the unchanged draft stack
  #9433/#9434/#9435; there are no unknown mergeability results or failed
  checks. The only unresolved review threads are the three older Greptile
  threads on #10148.

### Validation

- #9751: the new configured-copy regression failed on the main-only conflict
  resolution because ETX was never sent, then passed after the merged
  implementation. The later rebound-action regression also failed before its
  narrowing and passed afterward. Three related Vitest files passed 57 tests;
  Web typecheck,
  changed-file oxlint and oxfmt, max-lines ratchet, and `git diff --check`
  passed.
- #8274: the new cross-key regression failed by showing the old Codex hash and
  enabled state on the new key, then passed after the guard. Five hook/trust
  Vitest files passed 183 tests with five existing skips; Node typecheck,
  changed-file oxlint and oxfmt, max-lines ratchet, and `git diff --check`
  passed.
- All four branch updates used
  `--force-with-lease=<branch>:<exact-remote-old-head>` after a fresh
  `git ls-remote` match. GitHub GraphQL confirmed both review-thread
  resolutions and the final mergeability snapshot.

### Remaining risk

- The fresh Greptile review for #8274 completed successfully. #9751's review is
  still in progress and is the only pending authored-PR check rollup; none is
  currently failing.
- Full repository tests, packaging, Electron E2E, real mouse-TUI interaction,
  and real Windows/WSL/SSH validation were not run. Docker was not used.
- Recovery refs remain at `backup/pr-9751-pre-rebase-20260729` and
  `backup/pr-8274-pre-review-20260729`; inspection worktrees remain under
  `/private/tmp/orca-pr-{9751-rebase,8274-review}-20260729`.

## 2026-07-29 — Authored PR rescan after main advanced to `4543bb682`

### Result

- Refreshed all 95 PRs authored by `bbingz` and cross-checked the total through
  GitHub Search: 50 open, 19 merged, and 26 closed. These lifecycle counts are
  unchanged from the prior scan.
- Of the 50 open PRs, 46 are mergeable and four conflict. Three conflicts are
  the unchanged draft stack #9433/#9434/#9435. The only non-draft conflict is
  #9751.
- #9751 is 571 main commits behind with two PR commits. `git merge-tree`
  localized the conflict to
  `src/renderer/src/components/terminal-pane/keyboard-handlers.ts`; its test
  file merges automatically. Main's #10827 clipboard-verification refactor now
  owns the selection-copy path, while #9751 inserts empty-selection
  mouse-tracking TUI ETX forwarding and kitty-protocol reset at the same
  decision point.
- There are no failed or pending check rollups. Thirteen open PRs have
  successful hosted checks and 37 have no check rollup; absence was not counted
  as success. None has a formal review decision.
- Five unresolved review threads remain:
  - #8274: one new CodeRabbit security-hardening finding.
  - #8325: one new Greptile P2 about a guarded refresh return value.
  - #10148: the same three older Greptile P2 threads.
- Source adjudication:
  - #8274's current caller constructs `previous` and `next` with the same
    `sourcePath`, `groupIndex`, and `handlerIndex`, so cross-key trust transfer
    is not currently reachable. The exported helper nevertheless promises that
    the key is unchanged without enforcing it; adding key equality and a
    regression test is a small, defensible hardening.
  - #8325's boolean reports runtime reachability even when a superseded
    navigation suppresses the status write. The branch's regression test
    explicitly expects `true` for that guarded reachable response, and the only
    guarded production caller ignores the result. This is not a current
    behavior bug; a return-value documentation clarification or technical
    thread reply is sufficient.
  - #10507 received a CodeRabbit test-coverage nit in review-summary prose, not
    an unresolved thread. It concerns inherited #10490 session-stream logic,
    not #10507's route-tree-only delta.
- No new human maintainer comments or reviews appeared after the previous
  scan; the new conversation activity was from CodeRabbit and Greptile.

### Validation

- Live sources: `gh pr list --state all --author bbingz`, GitHub Search API,
  one batched GraphQL read of all 50 open PRs and their check/thread state, and
  a second batched read of recent comments/reviews.
- GitHub's initial 18 `UNKNOWN` mergeability results were polled through
  GraphQL; the settled snapshot has zero unknowns.
- Refreshed `origin/main` to
  `4543bb68263a89ab520cea62ca69d7ac78330dd3` and used `git merge-tree` plus
  branch/source reads to verify #9751, #8274, and #8325.
- This was a read-only remote audit. No PR branch, review thread, or public
  comment was changed.

### Resume point

- First repair #9751 against current main, preserving main's verified clipboard
  write path while porting the PR's empty-selection TUI forwarding and keyboard
  protocol reset.
- Then add the narrow #8274 key-equality guard and regression test.
- Reply to or resolve #8325 as intentional reachability semantics unless the
  API contract is deliberately changed. Leave the draft stack untouched.

## 2026-07-29 — Four conflicts repaired and two dependent stacks restacked

### Result

- Rebased the independent conflicting PRs onto current main and updated their
  fork branches with exact old-head leases:
  - #8277 `0cc96efb9` -> `65adf315b`
  - #9645 `e6d43f5b3` -> `7c8f8f40d` -> `27af53d3b`
- Restacked both dependent pairs onto `origin/main`
  `9cf31bdc00b71ad89b42684b3603db6938218c25`, updating each parent before
  replaying only the child's unique commits:
  - #10418 `fedc5bb1d` -> `233de0b80`
  - #10419 `79920644f` -> `786d75c23`
  - #10490 `bb7194858` -> `f70c6b23a`
  - #10507 `57790f89b` -> `904088eff`
- #8277 combined main's typed Electron import with the PR's persisted remote
  host sort order. #9645 retained project-group rendering and sync while
  preserving main's tolerant partial RPC update behavior.
- A post-push Greptile P2 on #9645 exposed a real desktop-parity gap behind an
  inaccurate repo-mode comparison: empty Project Groups and groups emptied by
  workspace filters disappeared on mobile. The final commit pre-seeds each
  catalog-backed top-level group before adding visible worktrees. The inline
  thread was answered with the distinction and resolved.
- #10419 keeps its three unique terminal-theme commits directly above the new
  #10418 head. #10507 keeps the route-tree-only move and the remaining
  WebView-source test fix directly above the new #10490 head; its function
  style-factory guard was skipped because the new parent already contains the
  stronger equivalent implementation.
- The #10490 rebase exposed the route file's existing max-lines ceiling.
  `useMobileSessionTheme()` was extracted into the session style module and
  fixup-squashed into the original themed-session commit, reducing the route
  by five effective lines without adding a suppression.
- GitHub re-read all six PRs as `OPEN / non-draft / MERGEABLE`. Greptile
  completed successfully on #8277, #9645, #10418, and #10419; #10490 and
  #10507 currently have no check rollup. During final monitoring, main advanced
  again to `d07931c4c`; GitHub recalculated all six without a new conflict.

### Validation

- Node `24.18.0` focused Vitest results:
  - #8277: 4 files, 12 tests passed.
  - #9645: root 6 files / 751 tests and mobile 4 files / 58 tests passed; the
    review follow-up's red/green mobile set passed 4 files / 59 tests.
  - #10418: 2 files / 12 tests passed.
  - #10490: root 2 files / 12 tests and mobile 18 files / 123 tests passed.
  - #10419: 4 files / 75 tests passed.
  - #10507: 5 files / 19 tests passed.
- Every affected head passed its relevant root and/or mobile typecheck,
  changed-file oxlint and oxfmt checks, max-lines checks where applicable, and
  `git diff --check`.
- Range-diff preserved the intended patches. The only material adaptations are
  the current main runtime-draft logic in #10419, the five-line theme-hook
  extraction in #10490, and the parent-subsumed style-factory guard in #10507.
- Every push used
  `--force-with-lease=<branch>:<exact-remote-old-head>` after matching a fresh
  `git ls-remote`. Local recovery branches remain under
  `backup/pr-{8277,9645,10418,10419,10490,10507}-*`.

### Remaining risk

- Full repository suites, packaging, Electron E2E, real SSH, and real
  macOS/Windows/mobile-device validation were not run. Docker was not used.
- The fork may not start the full upstream CI matrix without maintainer
  approval; #10490 and #10507 currently have no hosted check rollup.
- Temporary worktrees remain under
  `/private/tmp/orca-pr-{8277-conflict,9645-conflict,10419-restack,10507-restack}-20260729`
  for inspection and recovery.

## 2026-07-29 — #11215 claimed and fixed in PR #11256

### Result

- Claimed #11215 by contributor comment after direct assignment was denied by
  GitHub permissions.
- Created `bbingz/fix-justfile-tfvars-highlighting` from `origin/main`
  `5c59c84c7`; commit `ada7fe692` is pushed to the fork and submitted as
  non-draft, MERGEABLE PR #11256.
- Desktop detection now maps `.tfvars` to Monaco HCL and the canonical
  `justfile`, `Justfile`, `.justfile`, and `.just` names to shell.
- Mobile mirrors those detections. Because lowlight common has no HCL grammar,
  mobile resolves HCL to its existing INI grammar; tests prove comments and
  strings receive semantic tokens. Justfiles resolve through shell to Bash.

### Validation

- Red/green regression cycle: desktop 12/12 and mobile 10/10 targeted tests.
- Mobile full suite: 352 files passed, 2,597 tests passed, 2 skipped; mobile
  typecheck and oxlint passed.
- Root `pnpm lint`, `pnpm typecheck`, changed-code quality, and
  `build:electron-vite` passed. Full Node 24 test run passed 39,603 tests with
  64 skipped; one unrelated concurrent SSH install test failed from inherited
  npm `--allow-scripts` state and passed 3/3 when rerun alone.
- `pnpm build` completed desktop, web, relay, CLI, and both macOS Swift
  architecture compilations, then failed in the existing universal-binary
  step because `lipo` found no outputs at the expected architecture paths.
- No dependency, command execution, filesystem I/O, IPC, auth, or network
  surface was added. Unix and Windows path forms are covered.

### Resume point

- Current PR #11256 remote head is
  `ada7fe692d59ade60cd7d5a24de63806452a9a69`; GitHub reads it as MERGEABLE.
  Community tracking and Greptile both passed. Greptile scored it 5/5 and
  reported no files needing attention; CodeRabbit generated no actionable
  comments. There are zero review threads.
- Worktree: `/private/tmp/orca-11215`. Do not broaden this PR into the unrelated
  full-suite SSH environment leak or macOS native `lipo` path failure. Resume
  only for maintainer feedback or a later mergeability/CI change.

## 2026-07-28 — #8072/#8292/#9750 rebased and restored to MERGEABLE

### Result

- Refreshed `origin/main` to `0404f27b3` and rebased only the three requested
  non-draft conflicts. Exact old-head leases updated the fork branches:
  - #8072 `c5f414188` -> `579d49b16`
  - #8292 `46ba1c8e5` -> `d8133f142`
  - #9750 `7174dd05f` -> `ac67f1be4`
- #8072 retained the foreground-tracker disposal added by the PR and used
  main's newer `drainFakeTimerWork()` cleanup before restoring timers.
- #8292 preserved main's transcript-backed Codex subagent semantics and new
  polling calls while retaining the PR's metadata-only `SessionStart` status
  clearing. The last two commits remained patch-identical in `range-diff`.
- #9750 was ported onto main's newer multi-factory, full-ancestry ownership
  state machine: active descendants are keyed by factory/session, roll up to
  the root Busy owner, block premature root Idle, and are retired by exact
  child Idle or factory disposal. Synthetic child previews remain suppressed.
  The old `preserve child interactive hook requests` commit was skipped because
  current main already has stronger nested-attention, unknown-ancestry, exact
  reply/Idle, and child-preview coverage.
- GitHub re-read all three PRs as `OPEN / non-draft / MERGEABLE`. Their
  `mergeStateStatus` is `UNSTABLE` only because `statusCheckRollup` is empty;
  no hosted check has run.

### Validation

- #8072: 2 focused Vitest files, **1,404 passed**.
- #8292: 6 focused Vitest files, **556 passed / 5 skipped**.
- #9750: 5 focused generated-plugin/lifecycle files, **91 passed**.
  The new descendant lifecycle test failed on unmodified `origin/main`
  (`SessionIdle` was emitted early) and passed on the rebased head.
- All three heads passed full Node/CLI/Web `pnpm run typecheck`, changed-code
  quality with zero new findings, max-lines ratchet, changed-file oxfmt, and
  `git diff --check`.
- Each fork push used `--force-with-lease=<branch>:<exact-old-head>` after a
  fresh `git ls-remote` match. Local recovery refs remain under
  `refs/codex-backups/pr-{8072,8292,9750}/pre-rebase-20260728`.
- Evidence:
  `/tmp/orca-pr8072-rebased-tests-20260728.log`,
  `/tmp/orca-pr8292-rebased-tests-20260728.log`,
  `/tmp/orca-pr9750-rebased-tests-20260728.log`, and
  `/tmp/orca-pr9750-red-test-20260728.log`.

### Remaining risk

- Validation used Node `26.5.0` while the repository requests Node 24; pnpm
  emitted an engine warning, but every executed gate exited successfully.
- No live SSH relay, live OpenCode background-subagent session, or hosted CI
  matrix was run. The primary checkout's tracked files and branch were not
  changed; local `main` remains behind `origin/main`, and pre-existing untracked
  files were preserved.

## 2026-07-28 — Full authored-PR reconciliation completed

### Result

- Refreshed all 93 PRs authored by `bbingz`: **49 open / 18 merged / 26
  closed**. Every non-draft open PR is now mergeable; the only remaining
  conflicts are the intentionally preserved draft stack **#9434/#9435**
  (#9433 remains a mergeable draft).
- Repaired and exact-lease force-pushed the six non-draft conflicts:
  **#7840** `60badd252`, **#8057** `f5b7e879`,
  **#8281** `ebec2b62`, **#8292** `46ba1c8e`,
  **#8295** `d1d55efc`, and **#8467** `91c50589`.
- Rebased the last newly detected conflict, **#10419**, as its original
  five-commit stack onto `origin/main` `89968a106`; its new head is
  `79920644f` and GitHub re-read it as `OPEN / MERGEABLE`.
- Closed current review findings on **#9415** (`ab6c43b5`), **#9436**
  (`00671a75`), **#10490** (`bb719485`), and **#10507** (`57790f89`).
  Review comments on #10418/#10419/#10422/#10423 and #9416 that referenced
  files or behavior absent from the current heads were source-checked,
  answered as obsolete/out-of-scope, and resolved.
- **#10162 was closed by maintainer OrcaWin during the repair race and was
  not reopened.** The PR remains frozen at `8453378a1`; the fork branch has
  the later rebased/tested `03ec6eccc`. The maintainer requested a replacement
  based on native revisioned editor transactions and an acknowledged
  idempotent queue shared with #7094/#10447, rather than timing heuristics.

### Validation

- Final GitHub inventory:
  `gh pr list --repo stablyai/orca --author @me --state all --limit 200`
  returned 93 PRs, zero non-draft conflicts, zero failed checks, zero pending
  checks, and zero unknown mergeability states.
- A paginated GraphQL read covered all 1,315 open repository PRs and selected
  the 49 authored PRs; their unresolved review-thread count is **0**.
- #10419: range-diff preserved all five commits; the only patch adjustment was
  placing `RuntimeMobileTerminalTheme` and its resolver in main's current
  consolidated import structure. Six focused suites passed **83/83**,
  `typecheck:tsc:node`, `typecheck:tsc:web`, oxfmt (18 files), oxlint,
  max-lines ratchet, and `git diff --check` all passed.
- Other repaired heads received branch-scoped tests before push. Notable
  results: #9415 PTY suite **393 passed**; #9436 **17 passed / 2 skipped**;
  #10162 mobile regression set **50 passed** plus direct mobile tsc;
  #10490/#10507 theme guards **7 passed** plus direct mobile tsc; #8467
  passed its real Electron E2E path.
- Every rewritten fork branch used an exact old-head
  `--force-with-lease`, with a backup ref and a live remote-head check
  immediately before push.
- Evidence snapshots:
  `/private/tmp/orca-authored-pr-final-20260728.json` and
  `/private/tmp/orca-open-pr-threads-final-20260728.json`.

### Operational note and remaining risk

- While creating the isolated #10419 worktree, one rebase command was
  accidentally routed to the primary checkout. It fast-forwarded local
  `main` from `505967eba` to `89968a106` (exactly `origin/main`); tracked
  state is clean and the pre-existing untracked `.memory/`, `CHANGELOG.md`,
  `MEMO.md`, and `tools/orca-demand-radar/` were preserved. No destructive
  rollback was attempted.
- `UNSTABLE` on the repaired fork PRs does not represent a failed or pending
  check: their current `statusCheckRollup` arrays are empty because hosted CI
  has not run. Physical Windows/WSL/SSH matrices and the #10419 live headless
  Linux system-theme behavior remain unverified where already documented by
  the individual PRs.
- Resume point: leave #9434/#9435 untouched until their draft stack is ready
  for coordinated rebase; do not reopen #10162 without a new design.

## 2026-07-28 — #9265 rebased past #10885 conflict; Codex PASS; repushed MERGEABLE

### Done

- **#9265** (`bbingz/fix-grok-hooks-discovery-compat`, 2 commits) was
  CONFLICTING on `src/main/agent-hooks/installer-utils.test.ts`; main's #10885
  had reworked the same Windows Git Bash hook-command tests around the
  `command -p cat` stdin-drain constant. Resolution took the branch side:
  `wrapWindowsGitBashHookCommand` returns a bare forward-slash path for
  `WINDOWS_GIT_BASH_SAFE_PATH` (Grok's compat loader CreateProcess-spawns a
  single token; a bash `if [ -f … ]` compound exits 1), while the
  missing-script stdin drain stays on the encoded-PowerShell fallback only.
- Codex (non-self gate): **PASS**, 4 INFO findings — implementation/test
  match confirmed, #10885's POSIX drain coverage survives elsewhere (3 exact
  launcher assertions + lifecycle tests), range-diff shows no patch drift in
  the clean-applied second commit, negative `not.toMatch(/^if\b/)` assertion
  is redundant reinforcement not the sole discriminator.
- Local green: 63 passed / 10 skipped across the agent-hooks suites, tsc
  node, oxlint.
- Pushed `86542c1e1` with exact-SHA `--force-with-lease` on
  `c59c396df443193cb1bb798486f631b602cb6cb4`; GitHub re-read: head
  `86542c1e1474934e9be13fc9d6a4733444f52d10`, **MERGEABLE** (UNSTABLE =
  fork checks still pending, expected).

### Validated

- vitest (agent-hooks suites) 63/63 pass, tsc node, oxlint — all green
  pre-push; GitHub head OID + mergeable verified post-push.

## 2026-07-28 — #9415 rebased past #10684 conflict; Codex PASS; repushed MERGEABLE

### Done

- **#9415** (`bbingz/unknown-busy-and-wrapper-visibility`, 5 commits) was
  CONFLICTING; single conflicted file: `src/renderer/src/lib/worktree-status.ts`.
  Main's #10684 (fix #9040: spinner titles attribute to the tab's
  `launchAgent` via `containsBrailleSpinner && Boolean(launchAgent)`) collided
  with the branch's rewrite of `titleStatusIsAgentAttributable` to route
  identity through TTL-gated pane process evidence.
- Resolution = behavioral union: `titleStatusIsAgentAttributable(title,
  processAgent?, launchAgent?)` tries the branch's
  `resolveAgentTypeFromTerminalTitle(title, undefined, processAgent)` first,
  falls back to main's spinner+launchAgent check; both call sites (pane-title
  and tab-title) pass `processAgentForLeaf(...)` AND `tab.launchAgent`.
  First attempt passed launchAgent only at the tab-title site — #9040's
  pane-title regression tests failed ('active' vs 'working'); #10684 had in
  fact passed launchAgent at both sites. Fixed, all green.
- Rebased stack `2d6164ae6` → `0a4d8ee8b` onto `b31617452`; the other 4
  commits applied cleanly (range-diff: patch-identical).
- Codex (non-self gate): **PASS**, INFO-only findings — union preserves #9040
  semantics at both sites, process-evidence precedence over launchAgent is
  correct (TTL + live-PTY gated), nothing dropped from either side, adjacent
  consumers typecheck.
- Pushed with exact-SHA `--force-with-lease` on `2d6164ae6`; GitHub re-read:
  head `0a4d8ee8b7e900cf7c825997772882b156d8fea2`, **MERGEABLE** (UNSTABLE =
  checks pending on fork).

### Validation

- CHECKS_RUN: vitest worktree-status + worktree-status-spinner-launch-agent
  40/40; all 11 branch test files 1967/1967; tsc --noEmit tc.web + node clean;
  oxlint clean; `git ls-files -s | grep node_modules` empty before both
  commits.
- CHECKS_NOT_RUN: full suite; Codex could not run vitest in its read-only
  sandbox (EPERM) — local results are ours.
- WHY_NOT: scoped rebase validation; main is green.
- EVIDENCE_PATH: /tmp/orca-9415 (branch pr-9415), /tmp/codex-9415.out.

### Remaining risk

- Fork PR has no hosted CI; merge left to maintainers.

## 2026-07-28 — #8888 rebased onto post-#10818 main; Codex round 7 PASS; repushed

### Done

- Upstream merged #10818 (`1fd0f731f`, "bind agent terminal output before
  publishing") which restructured the agent-background launch flow and
  conflicted with #8888; PR went CONFLICTING after the `a6e4cd1ba` push.
- Rebased the 4-commit stack onto fresh origin/main (`b31617452`); new tip
  `87a1a84f5`. Conflict resolution re-expressed the branch's closeIntent logic
  on the new adoption architecture:
  - `retire-unowned-background-terminal.ts` rewritten for the upstream
    owner-union API (`{ tabId } | { worktreeId }`); added
    `TERMINAL_ROLLBACK_WORKTREE_PLACEHOLDER = 'terminal-rollback'` for
    tabId-owner retirements (schema requires non-empty worktreeId; policy
    matches terminal targets on `ptyOrHandle` only).
  - `adopt-agent-background-session-tab.ts` and
    `launch-agent-background-session.ts` call sites thread
    `owner: { worktreeId }` into both retirement paths.
  - Ported the two pre-rebase rollback-intent tests onto upstream's pristine
    test file (upstream had deleted the old-architecture versions); adapted to
    reserve-then-adopt flow, added missing
    `useRemoteAgentBackgroundRuntime` import. 20/20 pass.
- Codex round 7 (rebase-resolution review): **PASS**, findings none — verified
  placeholder soundness, no omitted closeIntents, round-6 behavior survived
  (`agent-session.ts`/`runtime-close-policy.ts` blob-identical to round-6 tip),
  ported tests exercise the new architecture, no test-state pollution.
- Pushed `87a1a84f5` with exact-SHA `--force-with-lease` on `a6e4cd1ba`;
  GitHub re-read confirms head updated, mergeable: **MERGEABLE** (state
  UNSTABLE = checks pending).

### Validation

- CHECKS_RUN: vitest launch-agent-background-session.test.ts 20/20;
  agent-session + runtime-terminal-close-policy 43/43; session-tabs,
  session-close-attribution, terminal-multiplex, daemon-server,
  web-runtime-session, remote-runtime-pty-transport 238/238;
  terminal-tab-retirement slices 27/27; tsc --noEmit tc.web + node clean;
  oxlint clean on changed files; `git ls-files -s | grep node_modules` empty
  before/after fixup; `git merge-tree --write-tree origin/main HEAD` clean.
- CHECKS_NOT_RUN: full suite, electron smoke.
- WHY_NOT: scoped to the rebase resolution; upstream main is green.
- EVIDENCE_PATH: /tmp/orca-8888 (branch pr-8888), /tmp/codex-r7.out,
  `gh pr view 8888`.

### Remaining risk

- CI checks still pending on the new head; Codex did not independently rerun
  the test suite (read-only sandbox), local results are ours.

## 2026-07-28 — #8888 session-close kill attribution: 6 Codex rounds to PASS, pushed (superseded by rebase above)

### Done

- **#8888** (`fix/session-close-kill-attribution`, fork branch
  `f55c0317b` → `a6e4cd1ba`, pushed with exact-SHA `--force-with-lease`;
  GitHub re-read confirms head `a6e4cd1ba6d9fe7fcf7bbf79c3543aed931ff569`,
  state OPEN). 4 commits vs origin/main, 29 files +1866/-108.
- Codex (non-self review gate) iterated 6 rounds; every blocking finding was
  fixed and re-validated locally before the next round. Final round-6 verdict:
  **PASS**, all prior items CONFIRM-FIXED, no new issues. Fixes landed across
  rounds:
  - Round 4: runtime retirement `allSettled` counts fulfilled soft-denials
    (`close?.ptyKilled !== true`) as teardown failures; close-path senders
    log `blockedReason`; new retirement-store test.
  - Round 5: session-close and pane-close soft-denial branches resync via
    `refreshWebRuntimeSessionTabsSnapshot(..., { acceptCurrentSnapshot: true })`
    — a policy denial does not republish, so the one-shot replay permit is
    required or the freshness gate drops the re-offered snapshot and the
    optimistically-pruned tab/pane never resurrects (tests assert
    `acceptReplayedWebSessionTabsSnapshot` + second `session.tabs.list`).
    All four intent senders switched from `crypto.randomUUID()` to
    `createBrowserUuid()` (LAN HTTP web clients run in non-secure contexts
    where `randomUUID` is hidden). `retireProvider` mints a
    `client-created-rollback` intent with `worktreeId` threaded explicitly
    from both `launch-agent-background-session.ts` call sites (tab is
    already gone from the store at retire time — lookup-by-scan failed);
    soft-denials now warn with `blockedReason`.
  - Round 6: host-side ownership gap — only legacy `terminal.create`
    (`methods/terminal.ts:1475`) called `recordTerminalCreated`, so
    structured `terminal.createAgentSession` / `terminal.ensureAgentSession`
    creations earned no rollback ownership and the round-5 intent was still
    soft-denied as `close_rollback_not_owned`. Both handlers in
    `methods/agent-session.ts` now record
    `ctx.runtimeClosePolicy?.recordTerminalCreated(ctx, result.terminal.handle)`
    **only when `disposition === 'created'`** (adopted/replayed sessions
    predate the connection and must not earn ownership). Two new tests:
    created → recorded (both methods, handle asserted); replayed/adopted →
    never recorded.

### Evidence

- Validation before push: vitest main-side 3 suites 49/49 (agent-session +
  both close-policy suites); renderer 3 suites 76/76 (web-runtime-session,
  launch-agent-background-session, terminal-tab-retirement-store); tsc
  `tc.web` + `node` 0 errors; oxlint clean on all changed files; fixup +
  `rebase --autosquash` clean; `git ls-files -s | grep node_modules` empty
  (no symlink commits).
- Codex transcripts: `/tmp/codex-r4.out` / `r5` / `r6` (removed after
  closeout; verdicts captured in MEMO.md and this entry). Round-5 output
  ended with a model-capacity error but the verdict section was complete.

### Notes

- Fork PR has no hosted CI; green signal is local-only. PR not merged
  (non-self review gates push; merging remains maintainer/human territory).
- Temp worktree `/tmp/orca-8888` removed after push.

## 2026-07-27 — #8467 and #9645 rebased onto origin/main and pushed (Codex-gated)

### Done

- **#8467** (`fix/resource-manager-orphan-safety` `a7c3652b9` → `07cffd93f`,
  pushed with lease; now MERGEABLE, was CONFLICTING 198 behind):
  - Full rebase onto origin/main; two conflict rounds resolved with
    verified-minimal diffs (gates JSONC entry re-appended after main's
    `terminal-input.plugin-explicit-worktree-routing`; five locale JSONs kept
    main's `resource` block alongside the branch's dialog keys; `pty.test.ts`
    textual mis-merge untangled). `range-diff` old→new confirmed all other
    commits identical.
  - Codex review (non-self gate) found 3 findings; one actionable and fixed:
    `config/reliability-gates.jsonc` referenced
    `resource-session-count-selector.test.ts`, which merged PR #9387 deleted —
    removed from `testFiles` and both `commands` strings (fixup folded into
    the gate commit `0b27c0409`). The other two findings (background-job
    false-inactive classification; PTY-ID-reuse without incarnation tracking)
    are architectural, inherited from the pre-rebase branch, and documented
    here rather than expanded in scope.
  - Gate's corrected 10-file evidence command: 435/435 passed;
    `check-reliability-gates.mjs` passes for 52 gates; tsc node + oxlint clean.
- **#9645** (`feature/mobile-project-group-sync` `2f3c7c971` → `e6d43f5b3`,
  pushed with lease; still MERGEABLE):
  - Clean rebase (zero conflicts; range-diff 4/4 identical).
  - Codex review found 3 findings; two fixed:
    - `rendered-sidebar-worktree-order.ts` now passes
      `effectiveGroupByForRender(state.groupBy)` to `buildRows` — a raw
      `'project-group'` value fell into buildRows' PR-grouping fall-through and
      misnumbered closed-sidebar Cmd+1–9 targets. New test covers the
      pre-fix wrong order.
    - `project-group-membership.ts` `parseProjectGroupsResponse` now guards
      `Array.isArray(groups)` so a malformed success payload degrades to
      ungrouped instead of throwing and discarding the repo metadata resolved
      alongside it. New malformed-success test.
    - The third finding (old v3 mobile can overwrite a new client's
      project-group choice) is a deliberate design trade-off of the
      capability-gate approach; left as-is.
  - Codex re-review of the fixes: "no actionable findings" (it independently
    re-ran both new tests, 18/18).
  - Focused suites: mobile 57 + desktop/shared 722 passed; sidebar order
    suites 121 passed; tsc node + mobile tsc + oxlint clean.
  - Housekeeping: an autosquash `git add -A` briefly committed the
    `mobile/node_modules` symlink; removed via a second fixup before push.

### Verified

- `gh pr view 8467`: head `07cffd93f…`, MERGEABLE, OPEN.
- `gh pr view 9645`: head `e6d43f5b3…`, MERGEABLE, OPEN.
- Both pushes used `--force-with-lease=<branch>:<exact-old-SHA>`.

### Not done

- No merge (coordinator rule: non-self review required before merge, and
  hosted CI does not run on fork PRs).
- #8467's two architectural review findings (see above) left for a follow-up.
- Remaining open backlog scanned (`gh pr list --author bbingz --state open`);
  the mobile theme stack (#10417–#10423) and terminal-IME stack are held
  pending human/cross-review, matching the prior sweep's disposition.

## 2026-07-27 — open-PR review sweep: #9436, #9416, and the mobile stack (#10507 / #10490 / #10422)

### Done

- **#9436** (`bbingz/hook-remove-noop-gate` → `aeea020ef`, pushed; all six
  coderabbit root comments now fixed):
  - `hook-service.ts` install() and remove() both pass an `onOutcome`
    callback to `updateHooksJsonWithRetry` and distinguish
    'retry-exhausted' from 'unparseable' in the thrown detail, instead of
    conflating both to "Could not parse".
  - Remote installer error fallback now reports the full
    `getRemoteConfigPath(remoteHome, …)` instead of the bare dir name.
  - `worktree-card-compact-agent-row.tsx` only derives the flavor label
    for `agentType === 'claude'` rows (task-named children must not inherit
    the pane flavor).
  - `agent-status.ts` done-retention change detection now compares
    `entry.configDir` so a rediscovered flavor dir re-renders the done row.
  - `installer-utils-remote.ts` one-shot backup write is tmp + atomic
    rename (OpenSSH extension preferred), with tmp cleanup covered by a new
    test; the overwrite-rename test expectation moved to 2 renames (the
    backup rename also uses the extension).
  - `hook-service.ts` exceeded the 300-line oxlint budget (311 at branch
    base): extracted `getManagedScript` verbatim into new
    `src/main/claude/managed-hook-script.ts` and added it to
    `config/tsconfig.cli.json`'s explicit include list (TS6307 otherwise).
- **#9416** (`bbingz/claude-config-dir-hooks` → `149fdead0`, pushed):
  - Major fixed: `discoverRemoteClaudeConfigDirNames` readdir's an unbounded
    candidate list and each candidate costs up to three sequential 10s SFTP
    stat probes — a huge/wedged remote home could delay startup arbitrarily.
    Candidates are now capped at 16 and a 15s overall discovery deadline
    keeps whatever was already confirmed. Two new tests lock the cap and the
    deadline.
  - Minor fixed: marker probes used follow-symlink `stat` locally and
    remotely, so a symlinked marker could vouch for a target outside the
    candidate dir. Local probe is `lstatSync`; the SFTP-shaped fs takes an
    optional `lstat` (preferred) with `stat` fallback. One new test asserts
    `stat` is never called when `lstat` exists.
  - `hooks-json-file.ts` final-attempt guard bypass reviewed at this head —
    it carries the documented "converge under a pathological writer" design
    comment; kept as-is (design decision, no code change).
  - Ledger-TOCTOU comment was a false positive (file deleted at head);
    four other comments were already "Addressed in commit f8dd301" with bot
    confirmation.
- **#10507** (`bbingz/mobile-route-tree-only-routes` → `8cd08ef52`,
  pushed): three of four bot-flagged items were already fixed at head
  (white-alpha surfaces → `surfaceFaint` token; editor `color-scheme`
  follows the app scheme; Mermaid `theme: 'base'`; `saveAppTheme` swallows
  persist failures). Fixed the remaining test-quality minors:
  - Dropped the tautological `expect(XTERM_WEBVIEW_SOURCE).toBe(XTERM_WEBVIEW_SOURCE)`;
    identity is now proven against a fresh `import()` of the module.
  - Factory-declaration regex widened to `[:=]` so annotated factories
    (`createXStyles: Type =`) cannot escape the accounts-for-every-factory
    guard (no `export function` factories exist in the codebase).
  - `sheetBodyAfter` bounded at the next factory declaration so a
    spread-returning factory cannot adopt the next factory's sheet.
- **#10490** (`fix/mobile-themed-styles-followups` → `00c94290b`, pushed):
  - Minor fixed: `--editor-surface` was `bgBase` in both the inject payload
    (`mobile-rich-markdown-editor-theme.ts`) and the generated HTML
    (`mobile-rich-markdown-editor-html.ts`) — now the distinct
    `editorSurface` token, with dark+light assertions in the editor HTML
    test (written failing-first).
  - Major (test guard) fixed: same `sheetBodyAfter` bound as #10507.
- **#10422** (`feat/mobile-light-palette`, no new commit): both flagged
  items were already resolved on the branch — the single-parameter inline
  factory regex landed in `da5ed231b`, and the "vacuous registry" concern is
  answered by the deliberate `starts empty` seed test (conversion batches
  register factories in later stack PRs; the registry is non-empty by
  #10490/#10507 heads). The ratchet-baseline "may only grow" concern is
  real but social-enforced like every other ratchet in the repo
  (`check-max-lines-ratchet.mjs` is the exception with a CI gate); left as
  documented scope.

### Verified

- #9436: 154 files / 2491 passed / 5 skipped across
  `src/main/agent-hooks`, `src/main/claude`, `src/renderer/src/store/slices`;
  tsc node/cli/web clean; oxlint clean; max-lines ratchet OK. Sidebar suite
  18 failures proven pre-existing by stash A/B on the branch base.
- #9416: `src/main/claude` + `src/main/agent-hooks` — 29 files / 526
  passed / 5 skipped; tsc node + tc.cli clean; oxlint clean on both changed
  files; discovery suite re-run after lint-staged formatting (10/10).
- #10507: full mobile suite 353 files / 2537 passed / 2 skipped.
- #10490: changed suites 12/12 pass; full mobile suite shows 5
  image-preview fixture failures (`mobile-diff-image-preview`,
  `mobile-file-tab-doc`) proven pre-existing via stash A/B at the branch
  base (identical failures with all changes stashed).
- Post-push read-back: all five PRs OPEN and `mergeable: true`, heads
  match pushed SHAs.

### Not done / residual

- Fork PRs have no hosted CI (external-contributor workflows need maintainer
  approval); green signals are local only.
- #10422 ratchet-growth guard and #9416 guard-bypass thread left with
  design-decision rationale rather than replies (no new information for the
  bot to act on).

## 2026-07-26 (night) — post-sweep: #9416 reconciliation comment, #8300 rebased (332 behind) with Codex gate

### Done

- **#9416 reconciliation comment posted** (comment 5083993263): tells
  brennanb2025 the PR body was rewritten to match their marker-based tip
  (ledger description removed), lists what the new body documents, asks them
  to re-check the "Known limitations" and trade-off wording. No code change.
- **Hidden-stack scan across all open PRs** (pairwise touched-file overlap):
  no undeclared stacks found. #9434/#9435 remain the known 39-file stack;
  #8300×#9645 share `persistence.ts`/`persistence.test.ts`/`types.ts` but in
  disjoint hunks (Store class ~line 2992+ vs normalizeGroupBy/PersistedUIState);
  #8300×#8467 share only locale JSONs; #8467×#9434 share `ipc/pty.ts` (separate
  concerns); #8325×#9645 share `WorktreeList.tsx`. All MERGEABLE — git
  confirms these merge textually.
- **#8300 rebased and pushed** (`86ae20d38` → `fe0dbf0ab`, lease on exact old
  sha, GitHub reads back MERGEABLE): single commit, 332 → 0 behind. Rebase
  itself applied cleanly; core patch (`persistence.ts`, `types.ts`,
  `constants.ts`) verified line-identical to the original. One rebase-caused
  breakage found by tests, not by git: upstream added `requestId` to the
  `window:close-requested` payload, so the two PR-added assertions missing
  that field failed; amended `requestId: expect.any(Number)` into them,
  matching the convention main already uses in adjacent assertions.
- **Codex review gate passed before push** (per the new standing rule: no
  self-merged code changes): codex exec read-only review of `git show HEAD`
  against the rebased tree, verdict "未发现可操作问题；rebase 语义健全"
  (115k tokens, full transcript in the session's tmp dir).

### Verified

- vitest `persistence.test.ts` + `createMainWindow.test.ts` +
  `AppearancePane.test.tsx`: 533/533 passed post-amend.
- `tsc --noEmit -p config/tsconfig.node.json`: clean.
- Fork refs re-verified after the whole sweep: all ten pushed branches match
  their PR heads.

### Note

Grok delegation for #8300 was attempted per the established herdr flow, but
the grok agent committed an unreviewed rebase without running any tests and
its result was discarded; the rebase was redone directly (clean apply, so no
conflict-resolution work was lost). herdr tab closed, worktree removed.

### Remaining risk

Same as the evening entry: no hosted CI on fork heads; #9752 untested on real
Windows; #9416 awaits brennanb2025's response to the reconciliation comment.

## 2026-07-26 (evening) — full open-PR triage, four grok-driven rebases, five optimizations

### Triaged — 51 open authored PRs, zero close candidates

A multi-agent workflow assessed all 51 still-open bbingz PRs against current
`origin/main` (`8f5a45401`) for remaining value, upstream supersession, and
maintainer signals. Verdicts: **keep=39** (including the entire 8-PR mobile
theme stack 10417–10490, mobile terminal input 10123/10148/10162, and the
9415→9434→9435 stack), **optimize=5** (7910, 8293, 8325, 9416, 9436),
**rebase=7** (8254, 8255, 9433, 9434, 9435, 9752, 10507), **close=0** — no PR
was recommended for abandonment, so nothing was closed. Assessments live in the
session's `journal.jsonl` (workflow `wf_9068028e-7c1`); 9434/9435/10507 were
already based on current main from yesterday's work and needed no rebase.

### Rebased — four branches by grok agents in herdr tabs, reviewed and pushed

Each branch was rebased by a dedicated grok agent in a detached worktree under
`.worktrees/`, then independently verified (commit shape vs old, file lists,
focused vitest with `--config config/vitest.config.ts`) and force-pushed with
an exact old-head lease. Fork branch names carry the `bbingz/` prefix —
`--force-with-lease=<branch>:<sha>` must use the prefixed ref or the lease
silently mismatches and the push is rejected with "stale info".

| PR | Old head → new head | Rebase outcome |
| --- | --- | --- |
| [#8254](https://github.com/stablyai/orca/pull/8254) | `d40935496` → `b6e8557fb` | Clean; duplicated `RuntimeEnvironmentSubscriptionStartResult` union extracted into `src/shared/runtime-environment-subscription-start-result.ts`, folded into commit 1 (still 2 commits, 5 files +413/−95). |
| [#8255](https://github.com/stablyai/orca/pull/8255) | `057681547` → `4c61d37d3` | Clean; main's surface kept, only `retryConnectionsNow` handler added. Confirmed f8b9b5c50's suspend/resume diagnostics do NOT double-fire (single `system:resumed` chain; `retryNow()` no-ops once the pending timer clears). Added the online/occluded-resume test cases grok left uncommitted as a second commit. |
| [#9433](https://github.com/stablyai/orca/pull/9433) | `a0335c147` → `887bc1740` | Clean 7/7, then re-scoped to the residual only: typed `exited` frames + `onMirrorRetired`/`onPtyExit` transport split + host-owned session-tab lifecycle snapshot (3 commits, 11 files +562/−16). Dropped hunks duplicating #9804/#9687 (close-intent adjudication), #9288/#9874/#9263 (host-coord resubscribe), and the out-of-scope resume-sleeping-agent live-PTY skip. |
| [#9752](https://github.com/stablyai/orca/pull/9752) | `24f55b381` → `e78365caa` | 8 commits; the PTY-identity-verification commit `60d425238` dropped entirely — upstream #10484/#10674 already fail-close in `killWithDescendantSweep`, and the Job Object commit had made it dead code. `isAgentPty` hoisted into the Job Object commit. `config/patches/node-pty@1.1.0.patch` regenerated: `pty_errno_name`/`pty_format_spawn_error`/`pty_set_spawn_error` wrapped in `__APPLE__ || __OpenBSD__`, `git apply --check` clean, pnpm-lock patch hash updated (`29b2cdcc…`). |

### Optimized — five PRs, all force-pushed with leases

- **#8325** (`fix/windows-stale-workspace-surface`, `044015544` → `a432a56e9`):
  appended `fix(windows): guard stale VM-resume runtime-env refresh` — main's
  39964149c added a runtime-env refresh after `resumeWorkspace`, so the
  stale-activation guard had to run before those side effects too, or a
  superseded sidebar click still mutated the runtime-env store.
- **#7910** (`feat/remote-orca-server-edit` — unprefixed branch name,
  `3b608ae11` → `f5aed4773`): appended `style(settings): use text-xs token for
  endpoint transport badges` — the PR itself had introduced four `text-[10px]`
  badge literals (1 in RuntimeServerEditDialog, 3 in RuntimeEnvironmentsPane);
  replaced with the documented `text-xs` token. Locale concern from triage did
  not apply: this PR uses `auto.*` runtime keys, not the hash-based catalog.
- **#8293** (`bbingz/split-7950-auth-rate-limits`, `e241c3c7e` → `a0f3e223d`):
  appended `refactor(codex): derive extra-meter buckets from shared window
  classification` — `codex-rpc-rate-limit-mapping.ts` now consumes upstream
  `classifyCodexRateLimitWindows` (#10136) instead of re-implementing primary/
  secondary→session/weekly inference; API narrowed to bucket extraction only
  (`mapCodexRpcRateLimitsPayload` → `mapCodexRpcRateLimitBuckets`), since the
  sole caller ignores its session/weekly output. Buckets keep the reported
  `windowDurationMins` (a 50-minute window stays 50; classification picks the
  slot, not the label) — one bucket test pinned this and caught the first pass.
- **#9416** (`bbingz/claude-config-dir-hooks`, `16689eb84` → `1237de310`):
  rebased 9 commits (255 behind, clean), preserving brennanb2025's tip which
  replaced the persistent install ledger with live marker-based discovery.
  PR body rewritten to document the marker design (the old body still
  described the deleted ledger module and its CLI tsc guard test).
- **#9436** (`bbingz/hook-remove-noop-gate`, `570d6192f` → `5d81dd747`):
  restacked onto the rebased #9416 tip via `git rebase --interactive` with a
  scripted sequence editor (drop the 9 duplicated 9416 commits) followed by
  `rebase --onto` — plain `rebase origin/main` had kept the duplicates and
  `rebase --onto fork/<9416-old> origin/main` produced the wrong ancestor.
  Marked ready for review (was draft).

### Verified — local checks

- #8254: vitest 2 files / 47 passed.
- #8255: vitest 3 files / 41 passed + wake-recovery suite 8 passed.
- #9433: vitest terminal-multiplex + remote-runtime-pty-transport 124 passed
  (grok additionally ran pty-connection 481 and orca-runtime lifecycle).
- #9752: vitest local-pty fallback/provider 100 passed (grok: 7 files / 278
  total); patch hash matches pnpm-lock.
- #7910: vitest runtime-environment store/endpoint-display/IPC 50 passed.
- #8293: vitest `src/main/rate-limits/` 28 files / 380 passed; node tsc clean.
- #9416: vitest `src/main/agent-hooks/` 472 passed / 3 skipped (win32-only).
- #9436: six hook-service suites (claude/cursor/gemini/grok/command-code/
  droid/hermes) 57 passed / 7 skipped.

### Remaining risk

No hosted CI runs on bbingz fork PR heads (external-contributor workflow
approval), so all green signals above are local. #9752 still has no real
Windows ConPTY run. #8325's open question (fork branch vs OrcaWin's
`pr-8325-rebase` as canonical) remains unreplied since 2026-07-22. #9433 stays
draft by its own description until the maintainer re-checks the re-scoped
residual. #9416 awaits brennanb2025 re-review after the body reconciliation.

## 2026-07-26 — rebased and repaired the five non-draft conflicted authored PRs

### Fixed — current upstream integration and review findings

Rebased the five non-draft conflicted fork branches onto `origin/main` `19d082a16405bfd3f69f5807450caf68f97f7cf1`, retained current upstream behavior at each conflict, and force-pushed only with an exact old-head lease. Live GitHub readback confirms every PR is now `OPEN / MERGEABLE` at the following heads:

| PR | Fork head | Maintenance outcome |
| --- | --- | --- |
| [#7910](https://github.com/stablyai/orca/pull/7910) | `3b608ae1177cdd17575d91d905f132da0ddbe960` | Preserved upstream runtime-environment store coverage while keeping the remote-server edit changes. |
| [#7942](https://github.com/stablyai/orca/pull/7942) | `bd470f7eb4959cbc57536d0ca7606a0ecbcf8975` | Kept bounded raster validation for PNG/WebP and excluded SVG from the security boundary; updated the fixture to a valid PNG. |
| [#9274](https://github.com/stablyai/orca/pull/9274) | `0ad81497a969b9fe6492db414a05cf2bd5653711` | Kept strict account-snapshot decoding, added display-provider identity coverage, and made the route test mock its runtime dependencies deterministically. |
| [#9415](https://github.com/stablyai/orca/pull/9415) | `2d6164ae6f7e63d3c83b60358fbf5107820792e6` | Prevented delayed foreground-process inspection from recording evidence against a newly reused PTY id. |
| [#9752](https://github.com/stablyai/orca/pull/9752) | `24f55b381d087c1521afad207763e362f1bb0bc9` | Kept Windows descendant cleanup identity-gated, records Job Object ownership only for native non-WSL agent PTYs, and closes `piClient.hThread` after successful resume. |

For #9752, both additions were regression-driven: the WSL test first proved that an agent without `useConptyJobObject` skipped `killWithDescendantSweep`; the static native-patch contract first proved the successful `ResumeThread` path leaked its thread handle. Native Windows agent PTYs still take the Job Object path, while `wsl`/`wsl.exe` agents fall back to the identity-guarded descendant sweep.

### Verified — local checks and remote state

- #7910: `vitest` 4 files / 54 passed; Node and web typechecks passed.
- #7942: `vitest` 5 files / 441 passed plus `pty-connection` 478 passed; Node and web typechecks passed.
- #9274: mobile `vitest` 8 files / 101 passed; `mobile` TypeScript passed with `--ignoreDeprecations 6.0`.
- #9415: `vitest` 11 files / 1,894 passed; Node and web typechecks passed.
- #9752: `vitest` 8 files / 340 passed, including `config/scripts/node-pty-windows-job-object-contract.test.mjs`; Node, CLI, and web typechecks plus `oxlint`, React Doctor, `oxfmt --check`, and `git diff --check` passed.
- The final GitHub GraphQL readback returned `MERGEABLE` for all five heads and `statusCheckRollup: null`; no hosted CI or formal review decision is claimed.

### Remaining risk — deliberately out of scope

No real Windows host ran the native ConPTY/Job Object path; #9752 has source-contract and mocked lifecycle coverage only. The full mobile test run for #9274 still has five unrelated baseline image-fixture failures because current shared raster validation rejects deliberately invalid raw base64 fixtures; none of those files is in #9274's diff. Bare mobile `tsc` also hits the existing TypeScript 6 deprecation gate unless invoked with `--ignoreDeprecations 6.0`. Draft stack PRs #9434 and #9435 were intentionally not rebased or pushed.

## 2026-07-25 (last) — the remaining eight route-tree files, pushed as PR #10507

### Added — the leftover half of the phantom-route cleanup

The previous session moved the eleven style modules the themed-styles migration had itself added under `mobile/app/`, taking the device-measured `Route "…" is missing the required default export` count from 19 to 8, and left the other eight briefed out as an independent PR. Those eight are pre-existing, owned by no batch, and not all stylesheets — `mobile-session-route-types.ts` is types-only and `QuickCommandsTabButton.tsx` is a component.

`accounts-screen-styles.ts` went to `src/host/`; the six session modules and the component went to `src/session/`. No new directory: both already existed, and `src/session/` already held the `QuickCommands*` and `MobileSession*` files — four of which were reaching *back up* into `app/` to import the moved modules. That direction is now gone.

**Every changed line in the commit is an import statement.** Not asserted from a spot check: `git diff --cached -M -U0` over the whole commit was enumerated and every `+`/`-` line is an `import`/`new URL(`/`import(` path — the modules' own relative depths, the two route consumers (`accounts.tsx`, `session/[worktreeId].tsx`), the four `src/session/` siblings, and the source-reading and dynamic imports in `terminal-live-input-affordance.test.ts` and `themed-style-factories.test.ts`. That is strictly stronger than the per-file `sheetcheck` the brief asked for, which only covers the moved sheets. `oxfmt` reflowed one import in `mobile-session-route-types.ts` (the shallower path let a 3-line named import fit on one line) — visible in the diff, no semantic change.

### Added — a guard, because 19 → 8 → 0 can regrow

`mobile/src/expo-router-route-tree.test.ts` walks `app/` and fails with the exact path of any file that does not export a route component. With these eight moved, **all 29 remaining files under `app/` are real routes**, so it starts green at zero. Mutation-tested: dropping a `mutation-probe-styles.ts` into `app/h/[hostId]/session/` fails with `+ "h/[hostId]/session/mutation-probe-styles.ts"`. There is no opt-out in expo-router itself — `_layout` is the only special filename, `EXPO_ROUTER_CTX_IGNORE` is package-internal, `_ctx.ios.js` hardcodes the `require.context` regex — so a test is the only place this invariant can live.

### Fixed — the branch was based on a pre-rewrite commit, and `refactor/*` cannot be pushed

The brief created the branch at `7f8116127`, which the chain rewrite replaced; the rescued work sat on `b41454437`, three commits below #10490's head. Rebased onto `566a3fe52` by capturing `git diff --cached -M --binary`, `reset --hard` to the new base and `git apply --index` — safe because none of the three follow-up commits (chip glyph, memo deps, ratchet guards) touch any of the eight files or their consumers, which was checked per commit before moving.

`refactor/mobile-route-tree-only-routes` could not be pushed: `bbingz/orca` has a branch named literally `refactor` (`e9b494ae3`), so `refs/heads/refactor/*` is a directory/file conflict. Same trap as `refactor/shared-terminal-theme-catalog` on 2026-07-24. Renamed to `bbingz/mobile-route-tree-only-routes` before pushing.

### Fixed — a fresh worktree cannot run the checks as-is

`/Users/bing/-Code-/orca-route-tree-cleanup` had no `node_modules` at all. Symlinked both levels at the primary checkout rather than installing. Then `tsc` failed with a single `TS2307: Cannot find module './terminal-webview-engine.generated'` — that file is git-ignored and generated, so a fresh worktree lacks it; `node mobile/scripts/build-terminal-webview-engine.mjs` produced it (624 KB) and `tsc` went to exit 0. Neither has anything to do with the change, and both would read as "the move broke something" if taken at face value.

### Verified — pushed

`vitest` 350 files / 2513 passed / 2 skipped / 0 failed (349 / 2512 at the base, +1 file / +1 test for the guard) · `tsc --noEmit` exit 0 · `oxlint` exit 0, no diagnostics · `oxfmt --check` clean on 1023 files · max-lines ratchet OK, 354 grandfathered, no new bypass. Exit codes captured from the commands directly, not through a pipe.

Commit `9022f6e1d`, **PR #10507** (`refactor(mobile): keep the expo-router tree to routes only`, base `main` like the rest of the stack, 34 commits / 234 files against main, 17 files / +63 −34 on its own), `OPEN / MERGEABLE`, head read back as `9022f6e1db15a43bb43ebd79c4ca8885346bb0dd`.

Not verified: that the on-device warning count actually reaches 0 — that needs Metro restarted against the paired emulator, and the PR says so rather than claiming it. Still open from the previous session: the Podfile `post_install` deployment-target fix.

## 2026-07-25 (later) — reviewed, rebased, fixed, pushed as PR #10490

### Added — independent adversarial review, then the fixes it earned

A fresh Grok (not the agent that wrote the batches) reviewed `ad6dcecba..7f8116127` read-only from git refs across eight dimensions: **0 blockers**, 4 should-fix, 3 nits. Its whole-range dark-identity proof — every `StyleSheet.create` entry at base and tip, comments and whitespace stripped, `colors.<token>` substituted with `darkColors`, multisets compared — returned **2022 = 2022, empty difference both directions, 0 unresolved tokens**. Re-run on every later tip, including after the rebase and the chain rewrite: still empty.

Three of its findings needed correcting before acting on them:

- **The memo-dependency list was wrong in both directions.** An independent identifier-level scan of the whole tree (covering `colors` *and* `styles`, since both became hook-derived) found **8 sites in 4 files**: it had missed `tasks.tsx:8002` (`createTask`), `MermaidDiagram.tsx:22` (`buildHtml(source, colors)` with `deps=[source]` — the diagram kept rendering in the old theme) and `MobileBrowserPane.tsx:1061` (`deps=[]` capturing `styles`), and had reported one site that does not hold.
- **SF-4 overstated the factory-registry gap.** Registered merge factories *spread* the split ones, so the real coverage is 110 declared / 65 registered / **72 reached**, not 45 missing. Of the 31 unregistered under `src/`, 7 were already covered transitively and 23 live inside `.tsx` component modules that vitest cannot import without a mock graph. Only `createHostScreenStyles` was worth registering.
- **SF-1 was real and is the second instance of the defect class.** `chipGlyphSelected` was the literal `rgba(10,10,10,0.5)` while the chip fill is `colors.textPrimary`: fine over dark's `#e0e0e0`, but in light the fill is `#0a0a0a` and the same ink at 50% composites onto itself — contrast **1.00**. Captured on device both ways: before the fix the chip reads "Alt" with the ⌥ glyph **absent**; after, "Alt ⌥" in legible grey. Fixed with an `onInvertedMuted` token pair, dark byte-identical.

Landed as `994ba4c1e`→`03dabe9d3` (glyph), `c7b60c9a2`→`858e5c8a7` (8 memo deps), `5aed83857`→`ae8e584f6` (guards), final SHAs after the chain rewrite below.

### Added — the two guards that would have caught both fix commits

Neither defect was visible to any existing check: they are not `colors.*` references, so the sheets stayed byte-identical under dark and the both-palettes suite still reported a difference.

- **Colour literals inside themed factories** are now enumerated (balanced-paren scan of the `StyleSheet.create` that follows each `create*Styles` declaration, so neighbouring component code is not blamed) and compared against a 15-entry allowlist keyed `path#factory#literal`, each with the reason it is mode-independent: scrims, `shadowColor`, on-`statusRed` text, the HTML-preview canvas.
- **Registry completeness**: every declared factory must be registered, spread into a registered merge factory, or listed as not loadable under vitest.

Both mutation-tested: reintroducing the literal fails with the exact key, deleting one allowlist entry fails naming it. Not green by vacuum.

### Fixed — a tree-wide ratchet cannot survive upstream adding a matching file

`unthemed-color-imports.test.ts` pins the full set of bare-`colors` importers and was introduced at the bottom of the stack. Upstream then merged #9394, adding `mobile/src/components/CodexResetCreditAction.tsx` with a bare `colors` import — so **every commit from the light palette upward fails that test, including the heads of #10418, #10420, #10422 and #10423**. Verified directly: 5 of 5 heads red before the fix, 0 of 9 after.

**Correction to an earlier claim in this entry:** it said those PRs "were already red in CI". They were not — no CI ran on them at all. The `verify` workflow has never executed on any `bbingz` fork PR (25 sampled; the only check any of them ever got is the bookkeeping `track-community-pr`), because workflows from outside contributors need a maintainer to approve them. `gh api repos/stablyai/orca/commits/<head>/check-runs` returns 0 for our heads. So the failure was latent, not reported: it would surface the first time a maintainer ran the suite or after merge. The defect is real and locally measured; the statement about CI state was not.

Fixed by rewriting the chain with `git filter-branch --tree-filter`, inserting the entry **only where that file in that tree still has a bare import** — so it appears exactly where the file is unconverted, vanishes in the commit that converts it, and no batch commit conflicts on the shared list. Two `filter-branch` notes: it needs a real ref in the rev-list (`<sha>^..HEAD`) or it refuses with "You must specify a ref to rewrite", and it leaves no `.git/filter-branch/map`, so the old→new mapping was rebuilt by matching commit subjects and 23 branch refs re-pointed from it.

`feat/mobile-terminal-theme-picker` needed the same treatment for its own new screen: at its point in the stack the theme runtime does not exist yet, so `TerminalThemeSettings.tsx` cannot be themed and is listed in the ratchet instead, with the commit message saying so.

### Fixed — the rebase, and two things it broke on the way

Grok rebased the 29-commit chain onto a freshly fetched `origin/main` (`c468e3f8b`) with `--update-refs`. One real conflict (`accounts.tsx` import block, from #9394), three auto-merges, `range-diff` 27 `=` / 1 `!`. The dropped merge commit was checked for unique content with `git show --cc` — empty combined diff, nothing lost.

- **A sibling worktree was left one commit away from disaster.** `git branch -f` refuses to move a branch checked out in another worktree; the rebase used `git update-ref`, which succeeds silently. `/Users/bing/-Code-/orca-route-tree-cleanup` ended up with HEAD on the new commit and its index still on the old one: **239 staged entries that were a wholesale revert of 27 upstream commits**, hiding 8 real uncommitted renames (the remaining-8 route-tree work, which earlier notes wrongly recorded as "not started"). Recovered by capturing `git diff -M <old-base>` as a patch, `reset --hard`, and `git apply -3 --index`; repeated when the chain was rewritten again.
- **Linearising the merge changed PR shape, and that was redone.** The stack held a merge of two independent sides, so replaying the light palette first made it an ancestor of the terminal-theme commits: four PRs each gained the same 5 files / ~487 lines. #10418 ("move the catalog to src/shared") went from **14 files / 94 insertions to 19 / 581** — a 94-line refactor carrying a light palette and a 200-line test. As outside contributors we do not get to hand that to a maintainer, so the chain was rebuilt from the original tip with `git rebase --rebase-merges`, which recreates the merge and keeps both sides forked from `main`. Every PR is now byte-for-byte its original shape (14/94, 25/931, 20/623, 30/1651), except #10422 which is +1 line for the ratchet entry it needs. Restoring the merge also removed the need for the picker's ratchet edit — that side of the stack has no ratchet test at all — so #10421 is back to its single original commit and the comment explaining the edit was corrected. Both sibling branches were rebased `--onto` the rebased equivalents of their bases, not onto `main`, so no commit is duplicated.

### Fixed — commit message and branch bookkeeping

- `7f8116127`'s message claimed `src/tasks/` was new; it already held 62 files. Only `src/host/` is new. Amended (now `5a66c42b4`), the four commits above it replayed.
- `fix/mobile-stat-tile-light-contrast` pointed at the route-tree commit because that commit was made while standing on it. Repointed to its own commit.
- Safety ref `backup/pre-rebase-themed-styles` = the pre-rebase tip `7f8116127`.

### Verified — pushed

`vitest` 349 files / 2512 passed / 2 skipped / 0 failed · `tsc --noEmit` exit 0 · `oxlint` exit 0 with 0 errors (27 warnings, all pre-existing desktop files, 0 in `mobile/`) · `oxfmt --check` clean on the changed files · max-lines ratchet OK, 354 grandfathered, no new bypass · dark-identity proof empty · both new guards mutation-tested · all 8 branch heads independently green (`vitest` + `tsc` each).

Force-pushed 7 rebased branches with `--force-with-lease` and opened **PR #10490** (`refactor(mobile): follow the app theme in every stylesheet`, 32 commits, 222 files, +14982/−11455) stacked on #10423. All 8 PRs (#10417–#10423, #10490) now point at the rewritten heads. #10421 got a comment explaining its one content change.

Two things deliberately not done: the remaining 8 route-tree files (still uncommitted in the sibling worktree, its own PR) and the Podfile `post_install` deployment-target fix.

## 2026-07-25

### Added — themed-styles migration complete: batches 6-17 plus two fixes (local commits, nothing pushed)

- Batches 6-11 by Grok in three chunks, 12-17 in a fourth, each reviewed independently before the next was released: `aa4adc8ba` home/host (6), `1934e9925` smart-workspace/browser/history (7), `018d2435d` session route + frame (8), `fd422c292` native chat + quick commands (9), `e68294ed1` markdown + diff review (10), `417074264` source-control hub (11), `7e2efe3e2` file explorer + preview (12), `c86c053f5` PR sidebar core (13), `26aa0cd33` PR comments + status colour (14), `6b8d949c1` PR compose + actions (15), `4bfc3ef5c` terminal frame + live app chrome (16), `6b34cf254` tasks screen (17).
- Unthemed-colour ratchet reached **0**. The ratchet test file was kept with an empty list, turning it from a migration ledger into a permanent guard against any new bare-`colors` import. Factory suite covers 52 registered factories.
- Then `79a15ac55` (light-mode contrast fix) and `7f8116127` (move the migration's style modules out of the route tree).
- Final state: 340 test files, 2449 passed, 2 skipped, 0 failed; `tsc --noEmit` exit 0; `oxlint` no diagnostics; `oxfmt --check` clean on 1005 files; max-lines ratchet OK (354 grandfathered).

### Fixed — B16 was not a mechanical conversion, and saying so prevented a regression

`batches.txt` grouped three terminal files together. `terminal-webview-frame-styles.ts` converts normally — `TerminalWebView.tsx:369-376` layers `frameOverride` from the resolved terminal palette on top, so `colors.terminalBg` is only the pre-palette fallback, and following the app theme avoids a light-mode app flashing a dark `#1a1b26` block.

`terminal-webview-html.ts` is different: `XTERM_HTML` is a module-level template literal and `XTERM_WEBVIEW_SOURCE = { html: XTERM_HTML }` is a module constant handed to the WebView's `source` prop. Making that object depend on `colors` changes `source` identity on every theme flip, so react-native-webview reloads the document and xterm re-initialises — destroying the no-remount property #10417-#10421 were built around. Specified the alternative instead: CSS custom properties (`--terminal-fallback-bg`, `--terminal-scrollbar`) with the current dark values as `:root` defaults, driven from the existing `set-theme` postMessage path via an `appChrome: { terminalBg, textSecondary }` field. Implemented that way and verified: `XTERM_WEBVIEW_SOURCE` is still a module constant, the file no longer references `colors`, defaults are exactly `#1a1b26` / `#888888`, and no host protocol changed (internal mobile bridge only).

### Fixed — a light-mode defect no static proof could catch

`app/index.tsx` `statCard.backgroundColor` was the hardcoded literal `rgba(26,26,26,0.6)`; `rgb(26,26,26)` is `darkColors.bgPanel`. Over the light `bgBase` it composites to roughly `#767676`, and the 11px `textMuted` labels on it land near 1.2:1 — the three home stat tiles ("Agents spawned" / "Agent time" / "PRs created") were unreadable on device while every sibling card rendered correctly. It is invisible in dark mode, predates the migration, and is not a `colors.*` reference, so the stylesheet byte-identity and palette-token checks passed by construction and the both-palettes factory test (matching key sets plus inequality) never fired.

Fixed with a new `statTileSurface` token pair rather than reusing `bgPanel`, so dark stays pixel-identical — the dark value *is* the original literal — while light uses `rgba(0,0,0,0.04)`, the same construction, compositing to exactly `bgPanel`. Swept every stylesheet for literals whose RGB equals a dark token: 18 hits, all others deliberate (`REPO_COLORS` is a fixed categorical ramp; two `rgba(255,255,255,0.04)` overlays only lose a surface in light, one keeping a `borderSubtle` outline; red washes and on-fill whites are mode-fixed).

### Fixed — expo-router phantom routes

Every file under `app/` is registered as a route, so each non-route file logs `Route "…" is missing the required default export` and becomes a navigable path that renders nothing. Device-measured: **19 warnings before, 8 after** moving the eleven modules this migration had added. There is no opt-out — expo-router has no `_`-prefix convention (only `_layout` is special, `+html`/`+native-intent`/`+api` are ignored), and `EXPO_ROUTER_CTX_IGNORE` is a package-internal constant, not an env var; `_ctx.ios.js` hardcodes the `require.context` regex.

Destinations follow `src/onboarding/mobile-onboarding-styles.ts`: `src/dictation/` for voice-settings, `src/host/` for the three host-screen modules, `src/tasks/` for the seven tasks-screen modules. **Correction to `7f8116127`'s own commit message: `src/tasks/` was not new — it already held 62 files. Only `src/host/` is new.** The message needs an amend.

The remaining 8 warnings are pre-existing files owned by no batch, and not all stylesheets — `mobile-session-route-types.ts` is types-only and `QuickCommandsTabButton.tsx` is a component. Left alone per the surgical-diff rule; briefed out as a separate PR (`shared-themed-styles/BRIEF-route-tree-cleanup.md`, branch `refactor/mobile-route-tree-only-routes` created at `7f8116127`, no work on it yet).

### Verified — device audit on Android, paired to a real desktop

- Everything needed was already installed locally; no remote VM. Android emulator `audiocam` (API 33 arm64 — the `Pixel_3a_API_34` AVD fails, no android-34 image), `adb`/`emulator` via Homebrew with `ANDROID_HOME` unexported. Screenshots are directly readable via `adb exec-out screencap -p`.
- Paired headlessly to the Windows host with `orca serve --mobile-pairing --json` (documented as "without opening a desktop window"). Port 6768 is firewalled from the LAN — the app's own troubleshooting entry — so no firewall rule was added; chained emulator → `adb reverse` → Mac → `ssh -L` → Windows instead. Later moved to port 6779 because a GLM task owned 6768 locally.
- 23 screenshots covering batches 3/4/5/6/8/11/16/17 with live data from the paired desktop: worktree groups, a live PowerShell session, the upstream PR list. **The app chrome renders light while the terminal stays Tokyonight dark** — the visual confirmation of the two-slot model that overturned #7820's premise at the start of this work.
- Live theme switch verified with `DEFAULT_APP_THEME` temporarily `'system'` plus `adb shell cmd uimode night yes`: the same screen flipped light→dark in-process, app pid unchanged, no Activity restart.
- iOS: `BUILD SUCCEEDED`, 0 errors, installed and launched — the migration does not break the iOS build. UI audit was **not possible**: this Xcode-beta is a stripped install with no `Simulator.app`, and `simctl` has no tap command.

### Known issues — unrelated to this work

- **Xcode 27 cannot build this checkout without a Podfile fix.** Pod resource-bundle targets carry `IPHONEOS_DEPLOYMENT_TARGET` 9.0/12.4/13.4, below Xcode 27's 15.0 floor (`SDWebImage`, `RNCAsyncStorage_resources`, `RNSVG-RNSVGFilters`). Worked around with `IPHONEOS_DEPLOYMENT_TARGET=16.0` at the xcodebuild level; a real fix is a `post_install` hook that raises every pod target, and belongs in its own PR. (16.0, not 15.1 — 15.1 breaks expo-router's iOS 16 API use in `LinkPreviewNativeActionView.swift:141`.)
- **Four agents share this checkout and at least two move git HEAD.** During this session another agent left a rebase of `bbingz/fix-9704-windows-pty-descendants` stopped mid-conflict (step 2/6) with HEAD detached, reverting the working tree to pre-migration content; it later moved on to `bbingz/split-7950-auth-rate-limits`. Nothing was lost — all 19 branches and both fix commits verified intact via `git ls-tree` — but the Grok agent working in that tree had to be interrupted, and the pending commit-message amend cannot be done until the tree is free.

### Process notes worth keeping

- `CI=1` makes Metro freeze its module graph at startup, so edits made afterwards never reach the app. This invalidated one live-switch attempt: the app was serving a stale `'light'` bundle while the OS was dark, which looked like a theming bug. Earlier light-mode screenshots were unaffected (Metro had started after that edit). Restarting Metro also hits a port-release race — `expo start` skips the dev server non-interactively if the old listener is still bound; using a fresh port each time is the reliable fix.
- Piping a check into `tail` and reading `$?` gives `tail`'s status. This printed `tsc_exit=0` for a block that ran nothing.
- `preferences.test.ts` asserting `DEFAULT_APP_THEME === 'dark'` caught the temporary audit flip — the one red test in an otherwise green run, and evidence the invariant is guarded.

### Added — themed-styles migration batches 4 and 5 (local commits, nothing pushed)

- `a4522d41d` batch 4/17 — terminal settings + shortcut editor: `app/terminal-settings.tsx`, `TerminalShortcutSettings.tsx`, `CustomKeyModal.tsx`, `DragReorderList.tsx`, `MobileTerminalInputActions.tsx`, `MobileTerminalLiveInputStatus.tsx`, plus two new style modules. Branch `refactor/mobile-themed-styles-4`.
- `3a2361b76` batch 5/17 — pairing + onboarding: `pair.tsx`, `pair-confirm.tsx`, `pair-scan.tsx`, `MobileOnboardingPage.tsx`, `mobile-onboarding-styles.ts`, `MobileHostCard.tsx`, plus `app/mobile-onboarding.tsx`. Branch `refactor/mobile-themed-styles-5`.
- Ratchet: 119 -> 113 -> 107 unthemed importers. Factory suite grew 22 -> 27 registered factories.

### Fixed — two files had no line-cap headroom

`TerminalShortcutSettings.tsx` sat at 399/400 effective lines and `CustomKeyModal.tsx` at exactly its 645 bump, so a +3-line conversion was impossible. Their sheets moved into `terminal-shortcut-settings-styles.ts` (100/300) and `custom-key-modal-styles.ts` (276/300). Unlike batch 3's voice-settings split, the extracted modules are **born themed**: a pure-extract commit creates a bare `colors` importer the ratchet does not list, which is why `2c5b588f1` leaves the ratchet test red at that commit. Batch 3's PR head is green so CI passes, but the intermediate commit is bisect-hostile.

### Fixed — the batch plan omits ~10 files

`batches.txt` was partitioned from `unthemed-color-imports.test.ts`, which lists only files importing `colors` **directly**. A file that merely imports an exported `StyleSheet` object is invisible to it, yet converting that sheet to a factory breaks it. `app/mobile-onboarding.tsx` hit this in batch 5 and came along. Nine more remain (session-styles, diff-review-screen-styles, three `mobilePrSidebarStyles` consumers, two file-preview consumers, `MobileSourceControlSegments.tsx`, `TerminalWebView.tsx`); the sheet is `scratchpad/hidden-sheet-consumers.md`. Batch 1 already did this for `mounted-bottom-drawer.tsx`, so only the plan document was wrong. `TERMINAL_WEBVIEW_FRAME_STYLES` needs a decision rather than a conversion — the terminal frame follows the terminal theme, not the app theme.

### Fixed — `pnpm exec` cannot run in this checkout

Every check reported for batches 2 and 3 had to be re-run a different way: after the 2026-07-24 `node_modules` relink, pnpm's dep-status check fires on each `pnpm exec` and dies with `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`. The advertised `CI=true` fix would purge the relinked 5.3 GB store. Worse, the first attempt piped each command into `tail`, so `$?` reported `tail`'s status and the block printed `tsc_exit=0` having executed nothing. Correct invocation is `./node_modules/.bin/<bin>` from `mobile/`; `check-max-lines-ratchet.mjs` must run from the repo root or it exits 0 after only printing `::error::Missing config/max-lines-baseline.txt`.

### Verified — independent review of batches 1-3 (committed by Grok without review)

- Full suite at batch 3's head: 339 files, 2445 passed, 2 skipped, 0 failed. `tsc --noEmit` exit 0, `oxlint` no diagnostics, `oxfmt --check` clean on 992 files, max-lines ratchet OK (354 grandfathered).
- Mechanical proof rather than reading: for all 37 files touched by batches 1-3, every `StyleSheet.create(...)` body is byte-identical after stripping whitespace — 35 in place, and the voice-settings extraction moved its 2025-character body verbatim. Same check passes for batches 4 and 5 (13 more files).
- Palette-token multisets compared per file. Three mismatches, all explained: the voice-settings pair sums exactly; `StatusDot.tsx` drops from 4 `statusAmber` to 2 because Grok folded the record + ternary into a `switch` with grouped cases (behaviourally identical, verified case by case).
- Non-stylesheet remainders diffed too: 25 of 35 identical, and each of the 10 differences traces to "module-load freezes `darkColors`" (default-param -> body `??` fallback in three icon components, module const -> function of `colors` in `troubleshoot-common-issues` and `ConnectionLog`) or is comment-only.
- Batch 4/5 assertions were mutation-checked, not assumed: `title.color` -> `textSecondary` fails with `expected '#888888' to be '#e0e0e0'`; hard-coding `borderSubtle` in `DragReorderList` fails the both-palettes test; `surfaceBright` -> `textPrimary` in the onboarding sheet fails with `expected '#e0e0e0' to be '#f5f5f5'`. One earlier mutation attempt silently failed to apply (wrong indentation in the regex) and was redone.

### Known issues

- `DragReorderList`'s animated row background is hoisted to two string locals before the `useAnimatedStyle` worklet, so the animated style stays shareable instead of cloning the whole palette to the UI runtime. Not device-verified.
- `app/terminal-settings.tsx`, the three pairing screens and `app/mobile-onboarding.tsx` are app screens vitest cannot load, so their factories are covered by the byte-identity proof rather than the factory suite.
- Batches 6-17 (12 batches, ~90 files) remain. Nothing from batch 1-5 is pushed; no PRs opened.

### Added — mobile terminal colour themes and the light-mode foundation (7 PRs opened)

- Opened seven PRs against `stablyai/orca`, all `MERGEABLE`, forming the first two tranches of a designed 25-PR sequence: [#10417](https://github.com/stablyai/orca/pull/10417) xterm theme value gate, [#10418](https://github.com/stablyai/orca/pull/10418) shared terminal-theme catalog, [#10419](https://github.com/stablyai/orca/pull/10419) headless hosts publish their terminal theme, [#10420](https://github.com/stablyai/orca/pull/10420) device-local two-slot selection, [#10421](https://github.com/stablyai/orca/pull/10421) the picker UI, [#10422](https://github.com/stablyai/orca/pull/10422) the light palette + alias, [#10423](https://github.com/stablyai/orca/pull/10423) the theme runtime + app shell.
- #10417–#10421 deliver a complete, usable feature: 30 built-in terminal themes selectable on the phone, live-applied with no WebView remount, working offline, headless, and against every host version. #10422/#10423 land the light-mode mechanism with nothing user-visible.
- The chain's governing invariant, stated in every PR body: nothing is user-visible until the final PR, so the work can stop after any PR without leaving the app half-lit. This is the direct answer to the only maintainer objection ever recorded against the prior community attempt #7820 ("this PR touches a lot of files").

### Fixed — corrections that changed the design

- **Desktop does not pin the mobile terminal dark.** #7820's claim that "the terminal stays dark, matching desktop convention" is false: desktop runs a two-slot model (`terminalThemeDark` / `terminalThemeLight` / `terminalUseSeparateLightTheme`, default `true`) and switches the terminal to the light slot when the app is light. Mobile now mirrors that, per an explicit user decision.
- **The catalog holds 30 themes, not 22.** Eight entries use unquoted object keys, so a grep for quoted keys undercounts by exactly those eight. Both the original investigation map and the first adversarial review asserted 22; the design agents caught it and the reviewer retracted its own confirmation.
- **The local checkout was on a reverted commit.** `8f40ddf32` (#10179) was 117 commits behind `origin/main` and had itself been reverted upstream by #10255, so `mobile/src/terminal/terminal-webview-default-theme.ts` — an anchor in the investigation map — does not exist upstream. All work was re-baselined onto `origin/main` = `1bd36ce04` and every anchor re-verified; the corrected sheet is `scratchpad/verified-anchors.md`.
- **The session screen has 21 lines of max-lines headroom, not ~315.** Measured with a real oxlint probe. The terminal-theme override was therefore wired into `mobile/src/session/TerminalPaneView.tsx` (301 lines of headroom, and untouched by #7820) instead of `mobile/app/h/[hostId]/session/[worktreeId].tsx`, which also removed a #7820 collision.
- **oxfmt re-indents every converted stylesheet.** Settled empirically against a scratch copy with the repo's own `.oxfmtrc.json`: it breaks the arrow and indents the body regardless of factory-name length. The "2-line diff" plan for the 103 stylesheet conversions is unreachable; `?w=1` in every batch PR body is mandatory, not a fallback.
- **A rejected preference read could erase untouched theme slots.** `saveMobileTerminalThemeSelection` wrote all three keys unconditionally while the merge base was still the in-memory default. Now only patched slots are written in that state; mutation-checked.

### Rejected — a change that would have broken the invariant

- Grok implemented spec ruling R11 (fall back to the mode-appropriate default when the host-pushed palette's mode differs from the app's) inside #10423. Sent back and reverted to a pure passthrough. R11's own rationale refutes its placement: PR7 mounts the provider but the Appearance picker is not revealed until the final PR, so `appMode` is always `dark` there and the branch fires exactly in the case R11 names as visible — a phone paired to a light-mode desktop would silently lose its light terminal palette. Deferred to the PR that reveals the setting.

### Verified

- Full mobile suite on the top of the stack: 336 files, 2444–2445 passed, 2 skipped, 0 failed. Mobile `tsc --noEmit` exit 0; `oxlint` no diagnostics; `oxfmt --check` clean across 991 files; `check-max-lines-ratchet.mjs` OK.
- Desktop side: `terminal-theme` + `terminal-contrast-correction` + `sync-runtime-graph` 62 passed, the two new suites 16 passed, `typecheck:tsc:node` and `typecheck:tsc:web` both exit 0.
- Two new tests were mutation-checked rather than assumed: moving the palette assignment inside the terminal gate fails 6 tests; defeating the storage guard fails its test.
- Process: an understanding workflow (12 agents), a design workflow (9 agents), and a build workflow (12 agents), each followed by an independent adversarial review pass. The reviewer found two load-bearing errors in the investigation map and one blocker in the design (PR7 converting two files off the ratchet without updating the ratchet list), all corrected before implementation.

### Fixed — local environment

- `mobile/node_modules` was broken: 60 of its top-level entries were symlinks into `.rebase-wt/mobile-device-identity/`, a worktree deleted during the 2026-07-24 cleanup. No mobile test, typecheck or lint could run, and the build agents worked around it rather than noticing it. Repaired by relinking into the checkout's own intact `.pnpm` store (1252 real package dirs, 5.3 GB) — zero download, no purge. A first pass with `-maxdepth 1` missed the 10 scoped packages (`@xterm/*`, `@react-native-async-storage/*`, `@types/*`, `@noble/hashes`, `@orca/*`); both passes are recorded in auto-memory as `orca-mobile-node-modules-worktree-links`.
- `.grok/` (created by the Grok CLI in the repo root, not gitignored) was excluded through `.git/info/exclude`, following the existing `mobile/.expo` precedent rather than editing the repo's `.gitignore`.

### Known issues

- PR2's branch could not be pushed as `refactor/shared-terminal-theme-catalog` — the fork already has a branch literally named `refactor`, which makes that a git directory/file conflict. Renamed to `bbingz/shared-terminal-theme-catalog`. Two other pushes failed with GitHub 500s and succeeded on retry; one `gh pr create` returned HTTP 504 but had in fact created #10417, so check before retrying.
- GitHub reports 20/25/30/37 changed files for the stacked PRs because each contains its ancestors' commits; every PR body states the stack and which commits are its own. The counts drop once the lower PRs merge.
- Deferred with reasons in the PR bodies: light WebView chrome (`XTERM_HTML` is a module-scope const whose identity change would reload the WebView and lose scrollback, in a file with 13 lines of headroom), the dark splash in `app.json`, Android navigation-bar polarity, and picker search for the 31-row list.
- No device or emulator validation was performed for any of the seven PRs. Nine light-palette pairs fall below 4.5:1 contrast; each has a dark counterpart at or below the same ratio, so none is a light-mode regression, and the contrast test pins them against getting worse.
- 18 PRs remain (PR8–PR25): 17 themed-styles batches over 156 files, then a 2-file reveal. Batch 1 is committed locally as `20ec6ec77`; batches 2–3 in progress.

## 2026-07-24

### Cleaned up (local disk and working tree)

- Reclaimed **8.4 GiB** on the internal volume and relocated a further **3.1 GiB** to external storage. The primary checkout went from 13 G to 8.5 G, the Orca worktree directory from 3.9 G to empty, and `.git` from 2.7 G to 264 M. Free space on `/` moved from 461 Gi to 469 Gi.
- Moved every git-ignored mobile build output to `/Volumes/Bing-SSD-5/orca-build/<same relative path>` and symlinked it back: `mobile/android/app/build` (2.9 G), `mobile/ios/Pods` (205 M), `mobile/android/.gradle`, `mobile/android/build`, `mobile/ios/build`, `mobile/.expo`. The move was gated on `git check-ignore`, so a tracked directory would have been refused rather than moved. Nothing in the repo's own build configuration was touched, so the change is reversible with a `mv` per path. Mobile builds now depend on that volume being mounted.
- Fixed the one side effect this introduced: `.gitignore` rules in directory form (`.expo/`) do not match a symlink, so `mobile/.expo` began showing as untracked. Excluded it through `.git/info/exclude` rather than editing the repo's `.gitignore`.
- Removed all 24 Orca-managed worktrees under `/Users/bing/orca/workspaces/orca`. Every one was verified clean apart from symlinked `node_modules`; the single real leftover, a 4 K `.pi/flow.json` in the `main` worktree, was copied to the session scratchpad first. Removing a worktree does not delete its branch, so no PR was affected.
- Deleted 134 of 225 local branches, leaving 91. The delete set was built as the union of branches whose tip is provably contained in a kept ref and the pure scaffolding prefixes (`probe/`, `codex/`, `backup/` other than today's, `maintenance/`, `resolve/`, `rebase/`, `pr-*-review`, `repair/`, `worktree-wf_*`), then subtracted from an explicit protect set: all 44 open-PR heads, today's 10 backup refs, `main`, `local/hotfix-1.4.141-groups-server-endpoint`, `fix/orchestration-skill-coverage`, and every feature-shaped name. A containment test had wrongly marked today's backup refs deletable — each is trivially its own ancestor — so they were protected by name; the pre-delete intersection check against the protect set returned empty.
- Ran `git reflog expire --expire-unreachable=now --all` followed by `git gc --prune=now`, which is what actually collapsed `.git` from 2.7 G to 264 M (`git gc` alone had only reclaimed 100 M, because reflogs still pinned the deleted branches' objects). `git fsck` afterwards is clean, all 10 backup refs resolve, and all 9 pushed PR tips are still present.

### Known issues (cleanup)

- Four open-PR head branches have no local copy: `bbingz/fix-grok-encode-cwd-dirname`, `bbingz/keep-serving-on-close`, `fix/8787-windows-setup-wrapper-quotes`, `fix/notes-send-agent-guard-toctou`. Verified they were never in the delete list and never present in the pre-cleanup local snapshot; all four exist on the fork, so the PRs are intact and a `git fetch fork <branch>` restores them.
- `node_modules` (root 2.4 G plus `mobile/` 5.3 G) is now most of the remaining 8.5 G and was deliberately left in place: the pnpm store at `/Users/bing/Library/pnpm/store/v11` is on the same volume (`/dev/disk3s1`), which is what allows hardlinking instead of copying. Relocating `node_modules` alone would break that and increase total usage; the only coherent alternative is moving the pnpm store and `node_modules` together, which is global to every project.
- Expiring unreachable reflogs makes the 134 deleted branches unrecoverable. Every one was verified redundant or scaffolding beforehand, and today's ten backup refs are real refs that survive.

### Changed (second wave — upstream moved mid-session)

- `origin/main` advanced three commits (`d50ea090cf`, `e651fe91c6`, `981653f27d`) roughly half an hour after the first batch landed, which knocked two previously clean PRs into `CONFLICTING`. The seven branches from the first wave were re-checked and were unaffected. Both new ones were verified to carry no maintainer statement (only `coderabbitai` comments) before any effort was spent, then rebased onto `981653f27d` and force-pushed; both are now `MERGEABLE`.
- [#9752](https://github.com/stablyai/orca/pull/9752) `bbingz/fix-9704-windows-pty-descendants` → `b9ee8d868d` (backup `7b6fd0b9b4`), 6 commits preserved. **Its scope changed materially.** Upstream #10100 (`fix(win): taskkill agent PTY descendant trees on stop`) landed after this branch's base and implements the same stop-time reaping the PR's early commits did, so those intermediate conflicts were resolved *in favor of upstream's structure*; what remains on top is the Job Object layer alone, cutting the PR to 14 files (+954/-299). Verified the substance survived: `CreateJobObjectW`, `AssignProcessToJobObject`, `KILL_ON_JOB_CLOSE` and `useConptyJobObject` are all present on the branch and absent from `main`, confirming upstream chose taskkill rather than Job Objects.
- [#8277](https://github.com/stablyai/orca/pull/8277) `fix/remote-host-smart-sort-loop` → `0cc96efb97` (backup `3a6c69bbe7`), 2 commits plus one adaptation commit. Upstream #9342's no-mint guard and this PR's skip-unchanged no-op were folded into a single `persistWorktreeSortOrder` helper instead of leaving two overlapping guards at both call sites; the early `{ updated: 0 }` return now also skips the cache invalidate and `reposChanged` notify. The helper is new on the main-process side; the renderer counterpart already exists on `main`.
- Neither PR is obsolete, and both verdicts are evidence-backed rather than asserted. Explanatory comments were posted on both, since the #9752 scope reduction and the #8277 guard composition are invisible in a plain diff.

### Changed

- Cleared every `CONFLICTING` pull request authored by `bbingz` in `stablyai/orca`. A full scan of the 84-PR history found 15 merged, 45 open, and 24 closed-unmerged; of the open set, 8 were conflicting and 4 were drafts. Seven branches were rebased onto `origin/main` = `cda97cec41` and force-pushed to the fork; all seven flipped from `CONFLICTING` to `MERGEABLE`, with draft status preserved on #9434 and #9435.
- Rebases ran in isolated `.rebase-wt/<slug>` worktrees so the primary checkout never left `main`. Every pre-rebase tip was saved as `backup/rebase-20260724/<branch>` before any rewrite. Branches already checked out in other worktrees were rewritten through `rebase-tmp/*` plus `git update-ref`.
- New tips: #9415 `9c8d7c8c6c`, #9434 `190f310cad`, #9435 `55ab9a6e91`, #8467 `a7c3652b9d`, #8293 `9a2ffd508e`, #8063 `0cb2a65a95`, #8295 `788bde29bd`. Commit counts were preserved exactly on every branch (5/9/11/13/5/1/2); the two increases are deliberate adaptation commits, not rebase noise.
- Treated #9415, #9434 and #9435 as a single stack (`main → #9415 → #9434 → #9435`) even though all three target `main`. #9415 was retargeted onto the rebased #9434 base rather than independently rebased, which would have duplicated its five commits. Its tip is brennanb2025's `fix(awake): reuse existing foreground inspections`, preserved with an identical stable patch-id (`56c37e95c3…`) and original authorship.
- Conceded one behavior in #8293: upstream #10136 normalizes rate-limit windows to fixed 300/10080 display durations, so the PR's "preserve reported 299/10079" path was dropped for the preferred session and weekly meters. The PR still contributes the multi-meter buckets mapping, auth credentials store, profile config-overlay mirror, and backend base-URL handling. Recorded in a PR comment rather than left implicit in the diff.
- Re-implemented #8295 on the post-#8536 relay transport instead of replaying it. The branch was 610 commits behind and its fork tip was a merge commit, so the two feature commits were replayed onto `main` and the merge dropped. Device name now rides the `MobileSocketWiring` path with `deviceName` optional on the v2 E2EE auth key allowlist.

### Removed

- Closed [PR #10013](https://github.com/stablyai/orca/pull/10013) as superseded. Upstream collaborator OrcaWin stated on 2026-07-23 that their deterministic mixed-generation harness reproduces the #9949 burst through sequential reasonless `session.tabs.close` requests from a stale paired desktop viewer, a path the PR's orphan-sweep confirmation guard never intercepts, and asked for #10129 to be reviewed instead. #10129 is still OPEN, so the closing comment offers to re-propose the kill-attribution diagnostics — which #10129 intentionally omits — as a separate PR. The local branch was reset to its pre-rebase tip `907a08ed86`.

### Investigated

- Established the maintainer-verification procedure before closing anything. OrcaWin's authority was confirmed two independent ways: GitHub-computed `authorAssociation = COLLABORATOR`, and PR #10129's head branch `pr-10013-mass-terminal-teardown` living inside `stablyai/orca` itself. The `collaborators/<user>/permission` API returns 403 without push access and is unusable here.
- Found no maintainer position on the other seven PRs. Across the whole author set there is **zero** human `APPROVED` or `CHANGES_REQUESTED` — every review is `coderabbitai` or a self-comment. `git ls-remote origin 'refs/heads/pr-*'` shows `pr-10013-mass-terminal-teardown` as the only takeover branch, and a cross-reference search surfaced no superseding PRs. Semantic overlap with upstream was therefore treated as a rebase-resolution input, never as grounds to close.
- Read the conflicts read-only up front with `git merge-tree --write-tree`, which sized them accurately (1–6 files) and traced each to its cause: `d4387b17d9` for #10013/#8467, `7ab601487c` (#9263) for the foreground stack, `49d0fdadfa` for #8063, `4a09ede8b1`/`ef985ed800` for #8293, `77b154d5dd`/`d6c9fcd537` for #8295. Also established that `aab112933e` reverts `8f40ddf328` (#10179) on `origin/main`, making any hunk resembling that change pure noise to be resolved against the post-revert state.
- Left the #9263 coexistence unresolved on purpose. Upstream's `result.unavailable` early return and the PR's TTL/PTY-bound observation both survive, and both `inspectProcess` and `confirmForegroundProcess` stay registered on the SSH and relay paths. No merged design was invented; this needs human review before merge.
- Confirmed #8063 and #8295 are not subsumed upstream: `reconcileWorkspaceSessionWorktreeIds`, `reportedDeviceName` and `resolveMobileDeviceDisplayName` are all absent from `main`.

### Verified

- Second wave, independently re-run in a throwaway worktree rather than trusted: #9752's suite returned `6 files, 235 tests passed`, matching the reported figure exactly. Structural checks confirmed zero conflict markers on both branches, commit counts preserved (#9752 6 ahead, #8277 2+1), backup refs created, and the agent's required worktree cleanup actually performed — `/Users/bing/orca/workspaces/orca/rebase-9752` came back clean at the new tip with only `node_modules` untracked, and no `.rebase-wt/` or `rebase-tmp/*` leftovers remained.
- Independently re-ran two of the agent's claimed checks rather than relying on its report: #9434's typecheck (`config/tsconfig.node.json` and `config/tsconfig.tc.web.json`, both exit 0, zero `error TS`) and #9415's focused suite (`5 files, 388 tests passed`, matching the reported figure exactly).
- Verified structurally: every final SHA matched the report, every `ahead` count matched, `merge-base --is-ancestor` confirmed the #9415 ⊂ #9434 ⊂ #9435 topology, `git patch-id --stable` confirmed brennanb2025's commit was replayed byte-equivalent, and a conflict-marker scan across all seven branches returned zero hits.
- Agent-side checks per branch: #8063 5 tests, #8467 19 tests, #8293 63 tests, #9434 229 tests, #9435 148 tests, #8295 28 desktop plus 13 mobile tests, each with the relevant typecheck passing.
- Post-push state read back from GitHub: all seven report `MERGEABLE`, with `headRefOid` matching the pushed SHAs.

### Known issues

- ~~Force-pushing branches checked out in pre-existing worktrees left spurious dirty entries.~~ **Resolved.** Rewriting branches that were checked out in `/Users/bing/orca/workspaces/orca/rebase-{8063,8467,9415,9434,9435}` left each showing ~622 spurious dirty entries — HEAD advanced ~106 commits while the files on disk did not. Before resetting, each worktree's index tree was compared against its pre-rebase backup commit tree and found **byte-identical**, with zero unstaged changes and `node_modules` as the only untracked entry, proving no unique content existed; `MERGE_HEAD` was absent everywhere, so no merge was actually in progress. All five were then `reset --hard HEAD` (624/622 → 1) and their stale `AUTO_MERGE` leftovers removed. Pre-rebase content remains recoverable from `backup/rebase-20260724/*` regardless.
- ~~Twelve other Orca worktrees still carry an inert `AUTO_MERGE` leftover file from earlier sessions.~~ **Superseded later the same day** — those twelve, along with all 24 Orca-managed worktrees, were removed entirely in the cleanup below, taking the `AUTO_MERGE` leftovers with them. Both this note and the five-worktree reset above describe intermediate states that no longer exist.
- `herdr agent prompt` only **queues** when the target agent is mid-turn; it returns `agent_prompted` either way. Two corrections sat undelivered while the agent decided to skip #9415 and spent a verification cycle on the cancelled #10013. Flushed with `herdr agent send-keys <name> enter`, one press per queued item.
- In zsh, `"refs/heads/$br:refs/heads/$br"` silently mangles because `:r` parses as a parameter modifier; the first push attempt failed safely with `src refspec … does not match any`. Brace the variable.
- Three semantic judgments remain unratified by upstream: #8293's window-normalization concession, the #9434 dual-classifier coexistence, and #8295's re-integration onto the new relay transport. Green CI does not imply maintainer acceptance.

## 2026-07-23

### Added

- Implemented composition-aware Japanese terminal input in commit `f94b83b34a` on `fix/mobile-japanese-ime` and opened [PR #10162](https://github.com/stablyai/orca/pull/10162). A local Expo native view now suppresses marked/composing text on iOS and Android, emits committed snapshots only, keeps IME confirmation separate from terminal Enter, deduplicates Android key/editor-action Enter, and preserves empty-field Backspace.
- Generalized the live composition mirror without regressing Hangul: trailing Japanese kana are held for 300 ms so small-kana, dakuten, and handakuten modifiers can replace the base before it reaches the PTY. A later modifier converges with DEL plus the corrected grapheme, and both pre-timeout and late paths are covered.
- Implemented physical mobile terminal keyboard capture in commit `1cf9247a17` on `feat/mobile-hardware-keyboard` and opened [PR #10148](https://github.com/stablyai/orca/pull/10148). The local Expo native view maps navigation, control, function, and local-edit keys through the ordered terminal send path while leaving IME, AltGr, and Command/Meta input to the platform.
- Implemented native mobile terminal selection-to-PTY cursor synchronization in commit `bebc550b5e` on `feat/mobile-ios-trackpad-cursor` and opened [PR #10123](https://github.com/stablyai/orca/pull/10123). The hidden React Native `TextInput` now forwards collapsed selection changes as ordered terminal arrow bytes, so the iOS keyboard trackpad can reposition the terminal caret without a duplicate hardware-keypress step.
- Added UTF-16-safe selection mapping, middle insertion/deletion convergence, Hangul held-syllable handling, and one serialized send chain for mirror, selection, control, submit, and external-flush payloads. Control sends snapshot the old field session and clear it synchronously, preventing later IME input from being erased when an earlier RPC settles.
- Kept the change mobile-only and dependency-free. The final branch was fast-forwarded from `09756dfaff` to upstream `main` `a29c487200` before submission; the seven intervening upstream commits did not touch `mobile/`.

### Mobile parity decisions

- Reframed the mobile backlog around observed daily-use pain instead of a broad desktop/mobile feature inventory: creating browser tabs, changing mobile appearance and colors, moving the terminal caret with the native iOS gesture, and closing terminal interaction gaps versus Termius and Moshi.
- Applied the contributor collision rule that an existing open or draft PR is treated as occupied work. Mobile appearance mode is therefore deferred behind #7820, and the desktop-window/remote-serving path behind #8300 must be diagnosed rather than duplicated. Live verification corrected the earlier #9180 classification: it shares the mobile session/accessory-bar files but implements browser keyboard unification, not native terminal cursor movement, so it is a rebase/conflict risk rather than a feature owner.
- Selected #8313 as the first contribution-sized fix. The mobile terminal delegates input to an invisible native `TextInput`, so xterm remains unfocused while its inactive cursor style is explicitly `none`; this directly explains why typing works but no caret is visible on iPhone or iPad.
- Scoped #8313 to restoring a visible terminal caret only. Native iOS press-and-drag cursor movement changes selection/input ownership and live input reconciliation, so combining it with the visibility fix would enlarge the regression surface; it remains an unoccupied, separate contribution.
- Luna's scan and the Claude/Grok adversarial review converged on the same ordering: implement the small, source-backed #8313 fix first; investigate the browser-creation failure against the exact capability/runtime path before proposing a PR; wait on occupied theme work; and collect concrete terminal workflows before ranking broader Termius/Moshi parity changes.
- Current evidence: [#8313](https://github.com/stablyai/orca/issues/8313), [#7820](https://github.com/stablyai/orca/pull/7820), [#8300](https://github.com/stablyai/orca/pull/8300), [#9180](https://github.com/stablyai/orca/pull/9180), `mobile/src/terminal/terminal-webview-html.ts`, `mobile/src/terminal/terminal-webview-query-reply-injected.ts`, and `mobile/app/h/[hostId]/session/mobile-session-command-input-styles.ts`.

### Fixed

- Implemented #8313 in rebased commit `2c28633662` on `fix/mobile-visible-caret-8313` and opened [PR #10101](https://github.com/stablyai/orca/pull/10101): the mobile xterm now renders the same bar cursor while inactive, which is the normal state while the invisible native `TextInput` owns iOS keyboard focus. Terminal-controlled cursor visibility remains authoritative, so TUIs using DECTCEM to hide the cursor are unchanged.
- Extended the real WebView-IIFE harness to verify every desktop/phone replacement surface receives the visible inactive-cursor options. Window listeners registered by the IIFE are removed after each case so the new test and the pre-existing overlapping-surface test remain independent.

### Investigated

- 15-agent read-only Sonnet workflow (`wf_1095756b-19d`) on incident #9949: all 8 causation candidates adversarially refuted; browser-open theory refuted statically (no code path from tab creation to any kill function) AND dynamically (renderer_memory samples bracketing the burst show `browserWebviews:0` / `registeredBrowserGuests:0`).
- New evidence beyond PR #10013's close-storm model: THREE daemon generations concurrently alive (pid 2240/v23 since 07-21T01:13Z, 21764/v24 since 07-21T01:26Z, 14615/v25 since 07-22T08:00Z; daemon.log:3726/3736/4089), and the same session killed by two different daemon pids ~200ms apart (false→true, second kill logged after session-exited) — same family as #9749; stale-generation reaping is an open follow-up not covered by #10013.
- Reviewed the #10013 worktree snapshot: attribution + orphan-sweep confirm gate coherent with paired tests; one pre-merge nit — `orphan-terminal-kill-gate.ts` imports `recordRendererCrashBreadcrumb` from `@/lib/crash-diagnostics` instead of the leaf `@/lib/crash-breadcrumb-recorder` (off-pattern vs sibling call sites in the same branch).
- Resume-UX gap analysis recorded in auto-memory (`orca-agent-resume-ux-gaps`): unexpected PTY exit never captures a `SleepingAgentSessionRecord`; no `killed` agent state or explicit resume affordance; standalone repos still vanish under the sleep filter on HEAD; dead `captureSleepingAgentSessionsByWorktree` action.

### Verified

- PR #10162 passed the full mobile suite (317 files; 2,315 passed and 2 skipped), both mobile and package TypeScript checks, full mobile oxlint and format checks, Expo prebuild, all-platform Metro export, Android `:app:assembleDebug`, and an iOS simulator build of the `ExpoTerminalLiveInput` scheme. The Android debug APK is `244391175` bytes with SHA-256 `63b28ee827151e2a008fb3c2080a2d03fdda7a1088e6bb9eeaf2e2c67d9406ff`.
- Grok's three adversarial rounds on #10162 initially found Android double Enter delivery, modifier-base leakage, stale focus state, and incomplete editor-action coverage. After fixes and added tests, its final report returned `NO ACTIONABLE FINDINGS`. Claude independently reviewed the full change and the exact rebased range `8a23618310..f94b83b34a`; both gates returned `NO ACTIONABLE FINDINGS`.
- PR #10162 was pushed from the contributor fork with exact head `f94b83b34af5ae0756e6f40c536410a1f3855a7c`; GitHub reports it `OPEN`, and the hosted `Track Community PRs` check passed.
- PR #10148 exact commit `1cf9247a178d622e9efc5a205f984c9afc67df7a` passed 320 mobile test files (2,339 passed and 2 skipped), mobile lint/typecheck/format, the max-lines ratchet, diff checks, Android module compilation and `:app:assembleDebug`, the iOS module scheme, and a full iOS simulator app build with an iOS 16 deployment-target override.
- Grok's #10148 adversarial review found one valid Android AltGr risk, which was fixed by comparing the active key map with and without Ctrl and covered by regression tests. Claude's exact-head gate then returned `NO ACTIONABLE FINDINGS`. GitHub currently reports #10148 `OPEN / MERGEABLE / UNSTABLE` with a successful `Track Community PRs` check.
- PR #10123 exact-commit verification passed the full mobile suite (317 files; 2,337 passed and 2 skipped), `mobile/node_modules/.bin/tsc --noEmit`, full mobile oxlint, `oxfmt --check .` across 949 files, the max-lines ratchet, pre-commit oxlint/React Doctor/oxfmt hooks, and `git diff HEAD^..HEAD --check`.
- Claude reviewed PR #10123 read-only in the visible Herdr pane `trackpad_review` (`w5:p5`, session `8e283782-ba48-4812-ac9d-27e247b55c80`) through three gates: pure selection/control logic, React hook/send-queue integration, and the combined 13-file commit. All three returned `NO ACTIONABLE FINDINGS`; Claude independently ran 34/34 pure-function tests and 47/47 integration tests.
- A normal `pnpm exec` test launch was blocked before test execution by the configured minimum-release-age policy for `@eslint-community/eslint-utils@4.10.1` and `flatted@3.4.3`, both published on 2026-07-22. Final verification used the already-installed package-local binaries and did not modify the lockfile or package policy.
- #8313 red/green proof: the new WebView constructor assertion first failed with received `cursorInactiveStyle: 'none'`, then passed after the production change.
- After the final rebase, the mobile suite passed 315 files and 2,292 tests with 2 skipped. Full mobile oxlint/format, mobile TypeScript, the max-lines ratchet, pre-commit hooks, and `git diff --check` passed; Claude exact-head review of `2c28633662` returned `NO ACTIONABLE FINDINGS`.
- Claude adversarial review round 1 found two Low test defects (only the first replacement surface was asserted and the name described the wrong caret). Both were corrected; round 2 returned `NO ACTIONABLE FINDINGS`.
- The first normal mobile test launch was blocked before execution by the local minimum-release-age gate for two integrity-pinned entries added by upstream security PR #10006. Dependencies were installed once with `--frozen-lockfile --ignore-scripts` and a command-local age override; no lockfile or repository policy changed, and all final checks used the installed binaries directly.
- PR #10013 OPEN (created 2026-07-22T23:29:44Z, head `fix/9949-terminal-kill-attribution`); maintainer AmethystLiang responded on #9949 at 21:41Z (no repro, endorsed attribution approach). Upstream sweep: #8255 ~10 days zero human review; #9645 ~2 days; #8254/#8872 maintainer-engaged without review decision; #8253 CLOSED unmerged (memory corrected).
- Evidence: workflow output `/private/tmp/claude-501/-Users-bing--Code--orca/f8e4fc77-5541-4286-8a18-dfc372f5c26d/tasks/wz9spn70g.output`; journal `~/.claude/projects/-Users-bing--Code--orca/eeba6f98-8511-45ab-9c6f-ebbb2b0abb5c/subagents/workflows/wf_1095756b-19d/journal.jsonl`.

### Reported

- Posted the daemon-generation evidence upstream (user-approved): #9949 comment 5053049798 (three concurrent generations, cross-pid double-kills, stale `daemon-v*` artifacts, browser counters at zero) and comment 5053062485 (repro preconditions the maintainer's clean dev profile lacks: update-spanning sessions — kansoku created 07-21, older than the v25 generation that killed it; already-connected paired/CLI clients; resolver spanning generations 41×/37× hellos); #9749 comment 5053050590 cross-links the macOS evidence to the Windows surviving-generation family.

### Remaining

- PR #10162 has no physical Japanese-keyboard device validation. The native view and deterministic event sequences are built and tested on both platforms, but real iOS/Android IME callback ordering remains a device-level residual risk; the PR therefore addresses rather than closes #7427.
- A full iOS app-scheme build for #10162 remains blocked under Xcode 27 by existing deployment-target drift: after overriding older Pod targets to iOS 15.1, the unchanged Expo Router `LinkPreviewNativeActionView.swift` fails because `subtitle` requires iOS 16. The feature module's own simulator scheme builds successfully.
- PR #10148 has no physical iPad/Magic Keyboard or Android Bluetooth-keyboard validation. iOS held-key repeat, Ctrl punctuation, and app-wide Command shortcuts remain outside its verified scope.
- PR #10123 has no physical-device validation in this checkout because every attached iOS device was offline. Unit and hook tests cover the deterministic event sequences, but native React Native ordering for a stale paired-selection marker and the controlled-value/`setNativeProps` clear boundary remains a device-level residual risk; Claude could not construct a source-level failure and did not classify either as actionable.
- No native iOS build was run for PR #10123 because this checkout has no generated `mobile/ios` tree. The 2026-07-23 post-push refresh confirmed remote head `bebc550b5e`, `OPEN / MERGEABLE / UNSTABLE`, and a successful `Track Community PRs` check; refresh GitHub state before relying on that snapshot.
- #8313 has not yet been visually exercised on a physical iPhone or iPad in this checkout; automated coverage proves the real WebView passes the corrected option to every xterm replacement surface, while glyph rendering remains delegated to xterm.
- Burst initiator remains unattributed until #10013's `clientId`/`requestId` logging catches the next occurrence; multi-generation racing is the strongest lead, not a verdict.
- e2e tripwire (browser actions ⇒ zero PTY-kill RPCs) deferred per PR discussion.
- daemon.log writer-role map unknown (extra writer pids beyond the 3 generation servers, e.g. 34599); flagged to the team in the supplement comment.

## 2026-07-21

### Changed

- PR #9645 经最新 `main` 重整并推送到 fork head `1fec879d56006783fe9ddeb70695c5e9c4614b8e`；PR 描述已同步。移动端 Project 分组复用 repo/group 元数据，并以 `mobile.project-group-sync.v1` 阻止旧 host 接收不认识的 `ui.set` 值；`projectGroup.list` 失败时仅丢失分组标签，不丢失 repo 列表。
- PR #8872 经最新 `main` 重整并推送到 fork head `bb69fac7757d5e5f4cc8a1288dac727e071db9a2`；PR 描述已同步，并 request `OrcaWin` 复核及 Windows/WSL 重跑。
- 任务工作区 `/Users/bing/orca/workspaces/orca/main` 已快进到 `main` `827cd49f410f042ae29ee886538d5aa8cf8c0c46`，与 `origin/main` 一致。停止两个无输出终端后，通过 Orca 移除 `pr-8872-reconcile` worktree；临时分支 `bbingz/pr-8872-reconcile` 随之删除，远端 PR 分支仍指向 `bb69fac7`。

### Fixed

- #8872 的 lifecycle close 使用 wire-only `hostCloseReason`：host 收到 `pty-exit` 用于拒绝错误的镜像关闭，本地 close reason 保持未标记，pinned confirmation/onCancel 路径不被绕过。
- host 仅在确实重发权威 snapshot 时附带 `snapshotRepublished`；请求命中 dead leaf、同 parent 仍有 live sibling 时拒绝破坏性关闭但不重发，避免 refuse/republish/re-echo 循环。
- 客户端只为当前 publication epoch/version 开一个一次性的精确 replay 门；更旧的同 epoch snapshot 仍被拒绝，不能借 replay 清理其他 pending close intent。
- 这些约束保留了 2026-07-16 裁决所保护的 pinned 本地语义，同时以单独的 wire reason 解决当时尚未覆盖的 host adjudication；旧记录作为历史证据保留，本节为当前结论。

### Verified

- #9645：root 聚焦 Vitest 6 个文件、677 项通过；mobile 14 个文件、105 项通过；相关 root/mobile typecheck、oxlint、format、max-lines 与 `git diff --check` 通过。
- #8872：核心 Vitest 3 个文件、875 项通过；扩展回归 12 个文件、976 项通过；daemon/transport 3 个文件、93 项通过；相关 root/mobile typecheck、oxlint、format、max-lines 与 `git diff --check` 通过；独立终审为 `PASS / APPROVED`。
- package contract 23/24；唯一失败来自本机未安装可选依赖 `windows-native-registry`。相关 contract test、package manifest 与 lockfile 相对 `origin/main` 未变，故记录为环境限制而非绿灯。
- GitHub GraphQL 于 2026-07-21 复核：#9645、#8872 均 `OPEN / MERGEABLE / UNSTABLE`，head 分别为 `1fec879d`、`bb69fac7`，两者均无 hosted checks、无正式 review decision。
- 清理后 `pr-8872-reconcile` 路径、Git worktree 注册项与 Orca selector 均不存在；fork `bbingz/fix-remote-mirror-pty-exit` 回读仍为 `bb69fac7`；任务专用 `/tmp` 文件匹配为空。

### Remaining

- #9645 等待 maintainer/reviewer 回应；因权限无法正式 request `AmethystLiang`，已通过 PR 评论提醒。
- #8872 等待 `OrcaWin` 复核，并需要 Windows/WSL 与真实远端镜像 PTY 端到端重跑；当前本机未覆盖这些平台门。
- 两个 PR 当前均没有 hosted checks，且均未合并；执行后续动作前必须刷新 GitHub 状态。

## 2026-07-16

### Adjudicated

- 裁决 Codex 对事故 PR 的复审（3 项声称的 blocker，全部钉在 PR head SHA 上验证，9 个取证/反驳 agent + 人工抽查）：
  - **#8872（P1）推翻**：parked watcher 缺 `reason: 'pty-exit'` 属实，但远端镜像 PTY（`remote:`/SSH id）被 `isSnapshotBackedTerminalPty` 在冷停放选择、park-host 覆盖检查、watcher 注册三层独立拦截，失败路径不可达；主机侧 `closeMobileSessionTab` 对未知 id 抛 `tab_not_found`。不要按 Codex 建议补 reason——会改变 pinned tab 的 onCancel 语义。
  - **#8887（P2）推翻**：resume gate 用 fallback resolver 是有意为之。渲染进程 store 经 `repoWithFetchedOwner` 必然盖章 owner（本地行得 `LOCAL_EXECUTION_HOST_ID`），无主 legacy 触发态造不出来；且 PTY transport 路由用同一 fallback resolver，换成显式 resolver（Codex 修法）会重新引入 #8878 双启动/远端误路由。
  - **#8891（P2）成立**：header 拖拽把视口钳制的 `container.scrollHeight` 当 `contentBottom`，短列表下 41361a48a 的防线失效。
- 裁决详情存于 auto-memory `codex-rereview-adjudication-2026-07-16.md`，防止后续会话重开已推翻结论。

### Fixed

- PR #8891：`0788d5ad8`（fork 分支 `fix/sidebar-header-drop-nearest-boundary`，fast-forward 推送，PR head 41361a48a → 0788d5ad8）。虚拟列表内容 div 加 `data-worktree-sidebar-content` 锚点；`worktree-sidebar-header-drop-preview.ts` 新增 `measureWorktreeSidebarContentBottom()`（锚点 gBCR 底部换算到滚动坐标，缺失回退 `scrollHeight`）；两个 header drag hook 接入；新增差分回归测试（测量值 350 → null，旧 wiring 600 → 幻影 `{dropIndex: 3}`）。project-header-drag.ts 顶 max-lines 上限，靠折叠 `refreshHeaderRects` 中间变量合规腾行。实现在 worktree `~/orca/workspaces/orca/fix-8891-content-boundary`（Opus 代理实现，主会话设计与终审）。
- PR #8891 描述 Screenshots 一节改为如实说明不附录屏（语义由单测差分 + CI e2e 钉死），移除未兑现的"随后附录屏"承诺。

### Verified

- 聚焦 vitest（新测试文件 + 4 个相邻 drag/drop 套件）68/68 通过，实现代理与主会话各跑一遍；renderer `tsc -p config/tsconfig.web.json` 0 错误；oxlint 5 个改动文件 0 违规。
- 三视角对抗性复核（运行时回归 / DOM 测量语义 / 仓库规范与测试质量）3× APPROVE、零 blocker；确认锚点属性全仓唯一、autoscroll 仍正确使用 `scrollHeight`、`pt-px` 1px 偏差既有且偏宽松。
- 推送前 `ls-remote` 确认远端未移动；推送后回读 head = `0788d5ad8`。主工作区 `main` 全程未动、收工时干净。

### Remaining

- #8891 无人工端到端拖拽验证（靠差分单测 + CI e2e 兜底）；有意的 UX 变化：短列表下拖到内容下方空白带为无操作。
- 两个未修 nit：computeDrop 每帧多一次 gBCR 读取（与既有逐 header 测量同级）；`data-worktree-sidebar-content` 锚点若被移除会静默回退旧行为且测试仍绿。
- 待办 F（client-side one-shot viewport claim，任务 #6）仍未开始。
- #8872 / #8887 维持原实现等待 reviewer 处理；若复审再提这两条，先引用裁决证据链再动代码。

## 2026-07-14

### Changed

- 临时集成 `v1.4.139` tag target `0ab2e001d16839f5c95cbda84fffb46f08e77359` 与 #8294 head `c9080a3ff5c008baacdbd5dd35f031189aef309a`，生成个人签名 iOS 包 `com.stably.orca.mobile` `0.0.29 (8294)`，覆盖安装到 `Bing's iPhone A`；未提交、推送或合并源码。
- 安装后执行 `git merge --abort` 并恢复 `main` `73d83a9fb4b5c9e9711cd0879267c1d47f30e1b9`；删除 `mobile/build/`、被 `mobile/.gitignore` 忽略的 `mobile/ios/` 生成树及 `/tmp/orca-pr8294-*` 构建日志，保留 `/tmp/orca-mobile-backup-20260714-pr8294` 临时数据备份。
- 从 GitHub 实时同步 `bbingz` 在 `stablyai/orca` 的全量贡献历史到 `MEMO.md`：共 56 个 PR，包含 35 个开放、9 个已合并、12 个关闭未合并；记录创建/更新/关闭/合并时间、分支 head、merge commit，以及 12 个关闭 PR 的明确替代/拆分过程和 GitHub 证据链接。
- 将 14 个贡献 PR 分支 rebase、修复并保存到 `bbingz/orca` fork；逐一回读远端 head，并确认它们可与官方 `main` 快照 `73d83a9fb` 无冲突合并。
- 本地 checkout 已回到 `main`；同步记录前 `HEAD == origin/main == 73d83a9fb4b5c9e9711cd0879267c1d47f30e1b9`。

### Fixed

- PR #8281：`606dbc0c4` 保持 startup draft 在 remount 期间的发送所有权，避免重复发送。
- PR #8288：`00a35521a` 撤除 writable per-file session bridge 扩展；`f07fd6f0c` 修复 paginated history 重复和超大 transcript 的远端尾部种子读取。
- PR #8300：`208fddcf3` 为 keep-serving 设置补全 ES、JA、KO、ZH 本地化。
- PR #8480：`18eaace71` 保留统一 runtime hook startup，避免调用已被上游合并移除的旧入口。

### Verified

- #8294：`pnpm --dir mobile exec vitest run src/transport/host-endpoint.test.ts src/transport/host-store-endpoint.test.ts src/host-edit-route-accessibility.test.ts` 通过 3 个文件、32/32 测试；对 8 个变更文件运行 `pnpm --dir mobile exec oxlint ...` 通过。
- iOS：Expo prebuild 与 CocoaPods 安装成功（124 个依赖、131 个 Pods）；Xcode Release 真机构建成功。产物验签确认 bundle ID `com.stably.orca.mobile`、team `J25GS8J4XM`、profile `cd61dd63-0364-4583-9d9f-40f4f5ca1d83` 包含目标 UDID `00008150-000E43EA0200401C`，且未携带不受 profile 支持的推送 entitlement。
- 设备：`xcrun devicectl device install app` 覆盖安装成功；设备回报 `0.0.29 (8294)`，`xcrun devicectl device process launch` 成功并返回 PID `13370`。
- #8288：`npx -y node@24 /opt/homebrew/bin/pnpm typecheck`、`pnpm lint`、13 个相关测试文件 551/551 通过；最终分支全仓测试为 2,771 个文件通过、7 个跳过，29,345 项通过、40 项跳过。
- #8480：729 项聚焦测试、全仓测试和 Electron headless-to-desktop activation E2E 通过。
- #8300：518 项测试、typecheck、lint 与 localization parity 通过。
- #8281：PTY 相关 430 项及其余变更文件测试、typecheck、lint 通过。
- 对全部 14 个 fork heads 运行基于最新官方 `main` 的 `git merge-tree --write-tree`，均无冲突；远端 SHA 全部与预期一致。

### Local Maintenance

- 执行 `npm cache clean --force`、删除 `_npx` 与 `sentry-cli` 可再下载缓存，并以 `npm cache verify` 确认内容为 0 bytes；`~/.npm` 最终占用 24 KB。

### Remaining

- #8294 与桌面端 #7910 在 2026-07-14 复核时仍为 `OPEN / UNSTABLE / 未合并`；手机可先使用本地包，但未来官方/TestFlight 覆盖安装可能移除尚未合并的 Edit Host 功能。
- 个人通配开发 profile 不含 `aps-environment`，本地签名包推送通知可能不可用。现有配对数据未通过自动化 UI 回读；覆盖安装未执行卸载，备份仅位于 `/tmp`，重启或系统清理后可能消失。
- `pnpm --dir mobile exec tsc --noEmit` 在 `mobile/src/source-control/mobile-pr-create.ts:45` 返回 TS2366；该问题来自 v1.4.139 已知基线，不属于 #8294。
- #8288 仍显示 `CHANGES_REQUESTED`，人工 review 的四项要求已落地，但必须由 reviewer 重审后才能解除；当前没有 GitHub CI checks。
- #8296 的 Expo prebuild、生成文件检查和 `swiftc -parse` 已通过；“本机缺少 CocoaPods”的旧阻塞已解除，但本次只完整构建 #8294 + v1.4.139，未重新运行 #8296 的完整 Xcode build。
- #8288 的完整 package build 曾在 native 阶段遇到 Swift 6.4 输出目录与仓库脚本预期不一致；Electron 构建本身成功，最终 head 未重复该已知失败门。
