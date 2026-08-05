# Orca Project Memory

> Local-only cross-AI state. This directory is intentionally gitignored and does not travel with commits.

## PR #9416 Hold Decision — 2026-08-01

- Live evidence checked 2026-08-01: PR #9416 is open, non-draft, and mergeable at head `da5cb1fea587d0eee29bbf9caa1b9671a1f329b0`; `brennanb2025` reported broad validation but explicitly withheld a merge-ready judgment because native Windows runtime QA is unavailable. Evidence: https://github.com/stablyai/orca/pull/9416#issuecomment-5149005696.
- User decision: leave #9416 unchanged and wait for further maintainer/reviewer action. Do not rebase, force-push, add commits, or otherwise modify its branch unless the user explicitly changes this instruction.
- On resume, refresh GitHub state only. A new conflict, CI result, or review comment is evidence to report, not permission to rebase.

## Closeout — 2026-07-21

### Active Checkout and Local Records

- Active task worktree: `/Users/bing/orca/workspaces/orca/main`, branch `main`, `HEAD == origin/main == 827cd49f410f042ae29ee886538d5aa8cf8c0c46` at closeout.
- Canonical local records remain `/Users/bing/-Code-/orca/MEMO.md`, `/Users/bing/-Code-/orca/CHANGELOG.md`, and `/Users/bing/-Code-/orca/.memory/MEMORY.md`. They remain ignored by the existing local `.gitignore`; no tracked documentation commit or push was made.
- The pre-existing tracked `.gitignore` modification in `/Users/bing/-Code-/orca` was preserved and not edited by this closeout.

### PR #9645 — Mobile Project Group Sync

- URL/branch/head: `https://github.com/stablyai/orca/pull/9645`, `feature/mobile-project-group-sync`, `1fec879d56006783fe9ddeb70695c5e9c4614b8e`.
- Current behavior: mobile can group workspaces by the desktop top-level project group; nested groups collapse to their root, folder-workspace synthetic repo ids map to the owning group, and Ungrouped sorts last. The additive `mobile.project-group-sync.v1` capability gates persistence to compatible hosts. `repo.list` and `projectGroup.list` are loaded together, but a group RPC failure degrades only the labels to Ungrouped.
- Verification: root focused Vitest 6 files/677 tests; mobile 14 files/105 tests; related typecheck, oxlint, format, max-lines, and diff checks passed.
- Live state checked 2026-07-21: `OPEN`, `MERGEABLE`, `UNSTABLE`, no status-check rollup, no formal review decision. A formal `AmethystLiang` review request was not permitted; reminder comment: `https://github.com/stablyai/orca/pull/9645#issuecomment-5032220242`.

### PR #8872 — Remote Mirror PTY Exit

- URL/branch/head: `https://github.com/stablyai/orca/pull/8872`, `bbingz/fix-remote-mirror-pty-exit`, `bb69fac7757d5e5f4cc8a1288dac727e071db9a2`.
- Close semantics: parked watcher sends `pty-exit` as `hostCloseReason`, so the wire carries the lifecycle reason while the local close reason remains unset and the pinned confirmation guard remains active. A host with any connected sibling refuses destructive lifecycle closure; it republishes only when the addressed surface should be restored, setting `snapshotRepublished` only for that real republish. A dead addressed leaf under a live sibling is refused without republish.
- Replay safety: the client clears the addressed close intent only after a refusal with `snapshotRepublished: true`, then permits only the exact current publication epoch/version once. Older same-epoch snapshots remain stale and cannot clear unrelated close intents.
- This is the current resolution of the 2026-07-16 concern: directly tagging the local close with `reason: 'pty-exit'` would still be wrong; the accepted design uses a separate wire-only field and tests the pinned path.
- Verification: core focused Vitest 3 files/875 tests; broader regressions 12 files/976 tests; daemon/transport 3 files/93 tests; related root/mobile typecheck, oxlint, format, max-lines, and diff checks passed. Independent final gate: `PASS / APPROVED`.
- Package contract: 23/24. The sole failure is local absence of optional `windows-native-registry`; the contract test, package manifests, and lockfile were unchanged from `origin/main`.
- Live state checked 2026-07-21: `OPEN`, `MERGEABLE`, `UNSTABLE`, no status-check rollup, no formal review decision; review requested from `OrcaWin`. Windows/WSL rerun request: `https://github.com/stablyai/orca/pull/8872#issuecomment-5032309257`.

### Cleanup and Resume Point

- Stopped the two connected but idle/no-output terminals in `/Users/bing/orca/workspaces/orca/pr-8872-reconcile`, then removed the managed worktree. Its temporary local branch `bbingz/pr-8872-reconcile` was deleted only after the fork branch was verified at `bb69fac7757d5e5f4cc8a1288dac727e071db9a2`.
- Cleanup verification: directory absent, no Git worktree entry, Orca selector returns `selector_not_found`, and `/tmp/orca-pr-9645*` plus `/tmp/update-pr-8872*` match nothing.
- No PR was merged. Resume by refreshing GitHub first, then handle maintainer feedback for #9645 and reviewer/Windows/WSL evidence for #8872; do not treat this local snapshot as live CI state.

## Snapshot — 2026-07-14

- Checkout: `/Users/bing/-Code-/orca`
- Local branch after contribution maintenance: `main`
- Official-main snapshot used for final merge checks: `73d83a9fb4b5c9e9711cd0879267c1d47f30e1b9`
- Fork: `https://github.com/bbingz/orca.git`
- Full authored-PR ledger: `MEMO.md`, queried from GitHub at `2026-07-14T01:08:39Z`; 56 total, 35 open, 9 merged, 12 closed without merge, 0 drafts. The ledger also records evidence-backed supersession/split reasons for all 12 unmerged closures.
- Maintenance scope in this run: audit, repair, rebase, verify, and preserve 14 selected open contribution PRs; no merge authority was assumed and no reviewer message was sent.

## Fork Heads Verified

| PR | Branch | Verified remote head |
| --- | --- | --- |
| #7817 | `fix/pi-disabled-extensions` | `8037d9258e3fa37ad8ee8f26347c8000887e5128` |
| #7910 | `feat/remote-orca-server-edit` | `d2cd23a36142242376f8439384756c304db85980` |
| #7939 | `fix/7934-minimum-contrast-ratio` | `b790abda601da5191af342e30a800bc85cde502e` |
| #7942 | `fix/7902-repo-icon-detection` | `0099afdf9db85dbe864519d666fff6335d87eecc` |
| #8281 | `bbingz/split-7950-startup-drafts` | `606dbc0c45817133713880bb343909975a95a975` |
| #8288 | `bbingz/split-7950-sessions-native-chat` | `f07fd6f0cfdd010af62aacae74f722199ffc0c9a` |
| #8292 | `bbingz/split-7950-hooks-status` | `67110027ba7ac08808a0809807e0ff20dc82771f` |
| #8293 | `bbingz/split-7950-auth-rate-limits` | `7e78a5074171561a84168b9d023bf1488318b8c7` |
| #8294 | `bbingz/mobile-host-endpoint-edit` | `c9080a3ff5c008baacdbd5dd35f031189aef309a` |
| #8295 | `bbingz/mobile-device-identity` | `29c36cdba60869aea8ec1ba96446312cb2a9019e` |
| #8296 | `bbingz/mobile-ios-scene-lifecycle` | `1fb3aaf78a2ce63c10ca087c3ac1579860d2271e` |
| #8300 | `bbingz/keep-serving-on-close` | `208fddcf3a7776904ff7c628b118d43dd4d5401e` |
| #8391 | `fix/wsl-agent-detect-nonsticky-empty` | `d869edb170409c7f50905dc9d3f701e0a8b79089` |
| #8480 | `fix/headless-serve-gui-activation` | `18eaace71247edb27e2dad83d64c49dc380b427f` |

All 14 heads produced a conflict-free `git merge-tree --write-tree origin/main fork/<branch>` result against the official-main snapshot above. #8293 and newer main both add tests to `src/renderer/src/components/status-bar/tooltip.test.ts`, but in separate blocks and with a clean merge tree.

## Completed Repairs

- #8281: `606dbc0c4 fix(agents): retain startup draft ownership during remount` prevents duplicate startup-draft sends after a component remount.
- #8288:
  - `00a35521a fix(codex): drop writable session bridge expansion` restores the bridge paths to upstream because hardlinks/copies cannot mirror Codex `.jsonl`/`.jsonl.zst` namespace transitions across two writable homes.
  - `f07fd6f0c fix(native-chat): bound and dedupe Codex history` makes paginated TurnItems canonical, deduplicates a truncated tail without session metadata, reads plain JSONL from a newline-aligned suffix, and retains a fixed-memory decoded suffix for compressed rollouts.
  - Upstream #8401 behavior is retained: unresolved/vanished transcripts remain retryable `notFound`, subscriptions poll until first flush, and the first watcher drain closes the read/subscribe gap.
- #8300: `208fddcf3 fix(i18n): localize keep-serving settings` replaces English placeholders in ES/JA/KO/ZH catalogs.
- #8480: `18eaace71 fix(runtime): preserve unified hook startup after rebase` removes the stale direct hook-server call and relies on the unified terminal runtime startup barrier.

## Verification Evidence

- #8288 final head:
  - `npx -y node@24 /opt/homebrew/bin/pnpm typecheck`
  - `npx -y node@24 /opt/homebrew/bin/pnpm lint`
  - 13 related Vitest files: 551/551 passed.
  - Full `pnpm test`: 2,771 files passed, 7 skipped; 29,345 tests passed, 40 skipped.
  - Bridge paths match `origin/main`; `git diff --check origin/main...HEAD` passed.
- #8480: 729 focused tests, full suite, and the Electron headless-to-desktop activation E2E passed.
- #8300: 518 tests plus typecheck, lint, and locale parity passed.
- #8281: 430 PTY tests plus the other changed-file tests, typecheck, and lint passed.
- Local npm cleanup: `npm cache verify` reported 0 cached bytes; `/Users/bing/.npm` was reduced from about 1.0 GB to 24 KB without touching project dependencies or the pnpm store.

## Local iOS #8294 Device Build — 2026-07-14

- Objective/result: make the unmerged mobile Edit Host feature usable immediately without waiting for upstream merge or TestFlight. A temporary no-commit merge combined `v1.4.139^{}` (`0ab2e001d16839f5c95cbda84fffb46f08e77359`) with #8294 head `c9080a3ff5c008baacdbd5dd35f031189aef309a`, then built and installed `Orca 0.0.29 (8294)`.
- Device/install: `Bing's iPhone A`, CoreDevice ID `6727A22D-65C3-524E-A8DB-3A711BBE3697`, UDID `00008150-000E43EA0200401C`; bundle ID remained `com.stably.orca.mobile`, so `xcrun devicectl device install app` performed an overwrite rather than adding a second app. Final device query returned `0.0.29 / 8294`; launch succeeded with PID `13370`.
- Signing boundary: Apple Development identity `75BE2CAF3D2405375EE117FF6BC55E99FCB44237`, team `J25GS8J4XM`, Xcode-managed wildcard profile `cd61dd63-0364-4583-9d9f-40f4f5ca1d83`, expiration `2027-03-29T13:32:20Z`. The profile includes the phone but not Push Notifications, so the temporary build removed `aps-environment`; Edit Host does not depend on push, but push notifications may not work.
- Verification commands/results:
  - `pnpm --dir mobile exec vitest run src/transport/host-endpoint.test.ts src/transport/host-store-endpoint.test.ts src/host-edit-route-accessibility.test.ts` — 3 files, 32/32 passed.
  - `pnpm --dir mobile exec oxlint 'app/h/[hostId]/edit.tsx' app/h/_layout.tsx app/index.tsx src/host-edit-route-accessibility.test.ts src/transport/host-endpoint.test.ts src/transport/host-endpoint.ts src/transport/host-store-endpoint.test.ts src/transport/host-store.ts` — passed.
  - `xcodebuild -workspace mobile/ios/Orca.xcworkspace -scheme Orca -configuration Release -destination 'id=00008150-000E43EA0200401C' -derivedDataPath mobile/build/pr8294-signed-derived -jobs 8 DEVELOPMENT_TEAM=J25GS8J4XM CODE_SIGN_STYLE=Automatic IPHONEOS_DEPLOYMENT_TARGET=16.0 build` — succeeded using Xcode 27 beta after accepting the current Apple Developer PLA.
  - `pnpm --dir mobile exec tsc --noEmit` — failed only at `mobile/src/source-control/mobile-pr-create.ts:45` with TS2366, a v1.4.139 baseline gap unrelated to #8294.
- GitHub state checked on 2026-07-14: #8294 head `c9080a3ff` and desktop #7910 head `d2cd23a36` were both `OPEN`, `UNSTABLE`, and unmerged. Refresh before relying on these drift-prone states.
- Cleanup/resume: the temporary merge was aborted and checkout restored to `main` `73d83a9fb4b5c9e9711cd0879267c1d47f30e1b9`; no source commit or push occurred. `mobile/build/`, the ignored `mobile/ios/` generated tree, and `/tmp/orca-pr8294-*` logs were deleted. The only visible worktree change remains the user's `.gitignore` edit. A pre-install data backup remains at `/tmp/orca-mobile-backup-20260714-pr8294`, but `/tmp` is not durable storage.

## Remaining / Resume Point

- Refresh the full contribution ledger with `gh pr list --repo stablyai/orca --author bbingz --state all --limit 1000` before relying on counts or lifecycle status; `MEMO.md` is the human-facing historical record.
- #8288 is `OPEN`, `MERGEABLE`, and still `CHANGES_REQUESTED`; no CI checks were present after the force-with-lease push. The latest human review's bridge architecture, paginated duplication, bounded tail, and #8401 conflict-resolution requirements are implemented. Next action is reviewer re-review, not additional speculative code changes.
- #8296 Expo prebuild, generated AppDelegate/SceneDelegate/Info.plist inspection, and `swiftc -parse` passed. The old local CocoaPods blocker is now cleared, but only #8294 + v1.4.139 received a complete device build in the later run; #8296 itself still needs a fresh full Xcode build before claiming that gate.
- A full package build for #8288 previously reached the native Swift phase but the local Swift 6.4 output directory differed from the repository script's expected triple path. Electron builds succeeded; treat this as a local toolchain/script gap unless reproduced in CI.
- Refresh GitHub state before acting: PR review decisions, CI, and official `main` are drift-prone. Do not treat this snapshot as live truth.
