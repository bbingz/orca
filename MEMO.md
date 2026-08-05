## Changelog Memo

### 2026-08-04（#8281/#7840/#7817 已恢复可合并）

- [交付] 三个 PR 已按批准顺序基于 main `637c7e94c` 独立 rebase，并用精确旧 head lease 更新 fork：#8281 `bffe3f85f`、#7840 `e377983b3`、#7817 `5f6723357`。GitHub 回读均为 OPEN / 非 Draft / MERGEABLE/UNSTABLE / 0 未解决线程，无正式 review decision。
- [整合] #8281 同时保留 #12347 的 deferred-setup 前置 ownership 与更严格的 Codex idle-composer gate；#7840 合并可 abort 的无超时流式扫描和主线结构化超时错误；#7817 在新 daemon/pane reservation 结构上为三个 host-env 入口传递 disabled agents。
- [验证] #8281 定向 2407 过/1 跳，最终关键复验 562/562；#7840 16 个相关 suite 140/140；#7817 PTY 431/431。相应 TypeScript、changed-code quality、格式、max-lines、diff gate 全过，未运行 Docker。
- [CI] 新 head 的 hosted workflow 均为 `action_required`，需维护者批准；当前本地验证不等同于 hosted CI。#12238 仍为 `b9a5e813b` 并请求 `OrcaWin` review；#9416 保持只读 hold。完整证据见 `CHANGELOG.md` 顶部。

### 2026-08-04（#12238 已请求 review，新增 3 个冲突）

- [扫描] 从 `2026-08-03T15:57:23Z` 截止点复扫全部 104 个本人 PR；唯一新活动是 AmethystLiang 于 `18:27:24Z` 为 #12238 请求 OrcaWin review，没有新评论、code review、head、合并或关闭，总量仍为 54 open / 20 merged / 30 closed-unmerged / 4 draft。
- [状态] main 从 `e08eba674` 前进 20 提交到 `d7fe9d6bc`；强制重算全部 54 个开放项后为 30 MERGEABLE、24 CONFLICTING、仅 #8391 CLEAN，0 正式 decision，可见 checks 无失败或等待。#12238 两个 workflow 仍为 `action_required`。
- [冲突] 新增 #8281（`pty-connection.test.ts`）、#7840（`ssh-channel-multiplexer.ts`）、#7817（`ipc/pty.ts`）。#8281 与已合并 #12347 有重叠但未被完全替代：#12347 只改 2 文件，#8281 的核心 delivery/retry 模块仍不在 main；应先裁定/缩小重叠再决定 rebase。#7840/#7817 的上游冲突改动未实现各自功能，仍是后续单独 rebase 候选。
- [路由] #12238 current-main merge tree 干净，仍为 `b9a5e813b` MERGEABLE/UNSTABLE；main 虽触碰 reliability gate 和 daemon server，但合并树保留 attribution 逻辑。先等待 OrcaWin review 与 workflow approval，不再推送；#9416 继续只读 hold。完整证据见 `CHANGELOG.md` 顶部。

### 2026-08-03（#12238 CodeRabbit 测试建议已补）

- [修复] 基于 `OrcaWin` 改写后的 exact head `1c847773b`，提交并推送 `b9a5e813b test(daemon): cover kill attribution outcomes`；最终只改 daemon attribution 测试，未动生产代码，也未覆盖对方提交。
- [验证] deferred kill 测试固化“完成前不得记录成功”，新增 tolerated pending-spawn `SessionNotFoundError` attribution；两次临时 mutation 均让对应测试按预期失败，恢复后 3/3 通过，完整 typecheck、changed-code quality、格式、max-lines、diff 和 commit hook 通过。
- [正文] PR 描述已改为新 head、本地验证和 mutation 证据，并把 44 成功/4 跳过明确限定为旧 head `1c847773b`；旧 `18a310593` 和“仅有 track check”说明已删除。
- [阻塞] 新 head 的 `PR Checks` 运行 `30829700381` 与 `Computer-use e2e` 运行 `30829701308` 均为 `action_required`，需要维护者批准后才能执行；CodeRabbit summary 已通过 Description、Linked Issues、Out of Scope、Title，仅剩不适用的通用 docstring warning，目前无新 code review 或正式人工 decision。完整证据见 `CHANGELOG.md` 顶部。

### 2026-08-03（15:45Z 本人 PR 无新增变化）

- [扫描] 从 `15:26:14Z` 截止点复扫全部 104 个本人 PR并交叉检查 Search API：没有新增评论、review、head、关闭、合并或 Draft 变化；仍为 54 open、20 merged、30 closed-unmerged、4 draft。
- [状态] main 仍为 `e08eba674`；开放项仍是 33 MERGEABLE、21 CONFLICTING，只有 #12238 与 #8391 为 `CLEAN`，全部 54 项均无正式 review decision，可见 checks 中没有失败或等待。
- [判断] Alexander951006 的催促发生在 issue #11669，不会更新 PR #11674；内容是在请维护者合并并提供 RC 验证，不是要求 rebase。#11674 仍为 `607a83b42`、MERGEABLE/UNSTABLE，当前 main 漂移与其两个文件无重叠。完整证据见 `CHANGELOG.md` 顶部。

### 2026-08-03（#12238 被 OrcaWin 改写并跑完 CI）

- [变化] 从 `09:51:48Z` 截止点增量扫描全部 104 个本人 PR，只有 #12238 有新活动；`OrcaWin` 于 `12:36:54Z` 将 head 从 `18a310593` force-push 为 `1c847773b`，重基到当前 main `e08eba674` 并追加自己的完成提交。
- [内容] 新提交把 daemon 成功日志移到 kill 完成之后、区分失败结果，补齐 runtime/target/outcome 元数据、拓扑测试和 reliability gate；当前 PR 为 OPEN / 非 Draft / `CLEAN`，48 个 hosted checks 中 44 成功、4 跳过、0 失败或等待。
- [待办] CodeRabbit 新增 1 条有效的测试建议：用 deferred promise 固化 kill 完成顺序，并覆盖 tolerated `SessionNotFoundError` 分支的 attribution；这是 test-only follow-up，当前没有未解决 inline thread，也没有正式人工 review decision。
- [注意] PR 正文仍写旧 head `18a310593` 和“仅有 track check”，已过时；后续如获授权，必须基于 `1c847773b` 加两项测试并回写新 head/CI 证据，不能覆盖 `OrcaWin` 的改写。完整证据见 `CHANGELOG.md` 顶部。

### 2026-08-03（#12238 新回复与全队列已复扫）

- [扫描] 从 `06:43:27Z` 截止点重读本人全部 104 个 PR；唯一更新是 #12238 于 `06:46:17Z` 收到 CodeRabbit 自动总结，没有新的人工维护者评论、正式 review、head、关闭或合并。
- [处理] CodeRabbit 明确表示无可操作代码评论；其 description warning 成立，#12238 正文已于 `09:51:48Z` 补齐 Screenshots、Testing checklist、AI Review Report、Security Audit、Notes，并如实保留全量 lint/test/build 未勾选。80% docstring 属通用 warning，与仓库“仅写简短非显然注释”约定冲突，不为此制造代码 diff。
- [状态] 当前 104 total、54 open、20 merged、30 closed-unmerged；开放项 4 draft、33 MERGEABLE、21 CONFLICTING，0 正式 decision、0 未解决线程、0 可见失败或 pending，#8391 仍唯一 `CLEAN`。#12238 exact head `18a310593` 继续 MERGEABLE，唯一可见 check 成功。
- [变化] main 从 `d48cac7d0` 前进 14 提交到 `6f7a30ac2`，与 #12238 六文件无交集；唯一新增冲突是 #9752，#11987 的 Windows PATH 修改与其 `local-pty-provider.ts` 及测试冲突，但没有替代 agent ConPTY Job Object 能力。应单独 rebase 并重做定向/Windows 验证，不批量处理；#9416 继续只读 hold。完整证据见 `CHANGELOG.md` 顶部。

### 2026-08-03（#8888 残余已拆为 #12238）

- [交付] 已从最新 main `d48cac7d0` 新建非 Draft [#12238](https://github.com/stablyai/orca/pull/12238)，head `18a310593`；GitHub 回读 OPEN / MERGEABLE / 0 未解决线程，`track-community-pr` 已通过，未复用或 rebase 旧 #8888 分支。
- [实现] daemon `session-killed` 记录本地 control requester；`terminal.close` / `terminal.closeTab` 新增归因 span；新旧 session-tab close span 都复用现有非敏感 `pairedDeviceId` 作为 trace `deviceId`，bearer `clientId` 不传入 span，也有序列化不泄漏测试。
- [边界] 仅 6 文件，不恢复旧 close-policy、不改 RPC schema/能力协商/关闭决策。原 daemon 测试放入既有大文件会触发 max-lines，已迁到职责明确的独立测试文件，没有新增 disable 或无关重构。
- [验证] 红测先得到 4 个 requester/span 缺失失败，再得到 2 个 session-tab device identity 缺失失败；最终 exact-head 定向 83/83，全量 Node/CLI/Web typecheck、changed/type-aware/React Doctor quality、max-lines、oxlint、oxfmt、diff、commit hook 和 merge-tree 全过。未运行 Docker、构建、Electron E2E 或真实运行时 smoke；完整证据见 `CHANGELOG.md` 顶部。

### 2026-08-03（#7937 已回复并再次扫描）

- [回复] 已在 #7937 留下并回读获授权的技术回复：<https://github.com/stablyai/orca/pull/7937#issuecomment-5162347318>；证据将 #9166 已合入的通用 retry 与 current main `c9a37f58d` 仍存在的裸 Cursor 分类缺口分开，现等待维护者选择重开或新 PR。
- [变化] #11483 已按预期以 #11599/#11814 superseded 关闭，无需动作；#8888 也因主要事故已由 #9994/#9804/#10129 修复而关闭，但维护者明确欢迎把 daemon kill requester、非敏感设备 trace 身份及 `terminal.close`/`terminal.closeTab` span 拆成 current main 上的新小 PR。
- [判定] 不应 rebase 旧 #8888 的 31 文件分支；新实现应复用现有 `RpcContext.pairedDeviceId`，不得把 bearer `clientId` 写入 trace。#11384/#11380 因 #12145 重写相同两个 commit-message 文件而新冲突，二者独立，建议先单独适配近期已有 Windows 实测的 #11384，再处理 #11380。
- [扫描] 现为 103 total、53 open、20 merged、30 closed-unmerged；开放项 4 draft、33 MERGEABLE、20 CONFLICTING，0 正式 review decision、0 未解决线程、0 可见失败或 pending，#8391 仍唯一 `CLEAN`。#9416 继续只读 hold；完整证据见 `CHANGELOG.md` 顶部。

### 2026-08-03（两项 superseded 关闭已复核）

- [变化] `nwparker` 于 09:02–09:03 CST 将 #8467、#7937 以 superseded 关闭且未合并；本人队列现为 55 open、20 merged、28 closed-unmerged，开放项为 35 MERGEABLE、20 CONFLICTING。
- [判定] #8467 对应的 #8459 安全问题已由 #10893 通过 owner evidence、deferred SSH 保护、统一 selector 与必要确认覆盖；旧 PR 的双次 idle-shell 检查和批量 review 属于更宽强化，不应直接要求重开，若继续需先在 current main 做新复现并另开窄 PR。
- [待办] #7937 需要技术回复：其当前两文件 diff 已明确剔除 #9166 合入的通用 TOCTOU，只剩裸 `Cursor Agent` 身份识别；current main 仍令该标题的 status 为 `null`，且运行时 `classifyAgentTitle()` 未使用已导入的 `isCursorAgentTitle()`，所以关闭理由没有覆盖剩余缺口。应询问维护者是重开还是接受基于 current main 的新 PR。
- [边界] 本轮未发评论、未重开或修改任何 PR；#9416 继续只读 hold。完整源码证据与建议见 `CHANGELOG.md` 顶部。

### 2026-08-03（开放 PR 全量状态已刷新）

- [扫描] 07:39 CST 重新回读本人全部 103 个 PR：57 open、20 merged、26 closed-unmerged；开放队列现为 4 draft、37 MERGEABLE、20 CONFLICTING，仍无正式 review decision 或未解决线程，上次扫描后无维护者活动或 PR 状态变化。
- [变化] 上游 `main` 从 `0ae917440` 前进 9 个提交到 `7c7167028`；唯一新增冲突是 #10507，冲突总数由 19 变为 20。32 项只有成功的可见 rollup、25 项无 rollup，#8391 仍是唯一 `CLEAN` 项。
- [去重] 不应 rebase #10507：已合入的 #11652（`2efc6e547`）在同一 17 文件区域完成相同的 Expo 路由树清理，并提供覆盖非页面 Expo 模块及平台专属 API 路由的更强 AST guard；#10507 与 #11483 都应进入明确的 superseded/关闭决策。
- [续作] 活跃冲突顺序仍是先处理 #9415/#9434/#9435 栈，再处理 #8325；#10148 继续受移动端编译和实体键盘验证门禁，#9416 继续只读 hold。完整证据与剩余冲突清单见 `CHANGELOG.md` 顶部。

### 2026-08-02（开放 PR 全量状态已刷新）

- [扫描] 21:21 CST 重新回读本人全部 103 个 PR：57 open、20 merged、26 closed-unmerged；开放队列为 4 draft、38 MERGEABLE、19 CONFLICTING，57 项均无正式 review decision、无未解决线程。
- [变化] 上游 `main` 从 `db69cd938` 前进 21 个提交到 `0ae917440`；相对 09:05 全量基线，#9415 及下游 draft #9434/#9435 因相同 4 个 runtime/PTY 文件进入冲突，#8292 另与 `agent-hooks/server.ts` 及测试相交。期间已修复 #11489/#11384/#8281 三个旧冲突，故冲突数净从 18 变为 19；本人 PR 自 10:17 CST 后无评论、评审、head、关闭或合并变化。
- [检查] 32 项只有成功的可见 rollup、25 项无 rollup，未发现失败或 pending；这不等于完整 CI。#8391 仍是唯一 `CLEAN` 项，22 项检查成功。
- [续作] 优先处理 #9415 并保留 #9415/#9434/#9435 栈，再处理 #8325；#11483 只做 superseded/关闭决策，#10148 继续受移动端编译与实体键盘验证门禁，#9416 维持只读 hold。详细冲突清单与证据见 `CHANGELOG.md` 顶部。

### 2026-08-02（开放 PR 评审与冲突维护已执行）

- [交付] #9415 `778105006`、#8281 `a22ea6345`、#11489 `aa2255cb8`、#11384 `a720d0b99`、#11674 `607a83b42`、#11681 `3b750631a` 均已按精确旧头 lease 更新；GitHub 回读均为 MERGEABLE、0 未解决线程，未合并 upstream。
- [修复] #9415 收敛 wake timer 并回填 PTY；#8281 把失败 toast 延后到重试终止并删除死分支；#11489 淘汰已移除 runtime 的 skill cache；#11384 合并 Windows batch shim 与主线 detached GUI 语义；#11674/#11681 分别补 Kimi 参数矩阵和 external grant 不跨 symlink 的负向契约。
- [去重] #11483 已被 main 上 #11599/#11814 的更强实现覆盖，当前 main 相关测试 60/60，通过后未重写旧 PR；是否关闭留作明确决定。#9416 继续只读 hold，未改分支。
- [验证] 本轮重点测试：#9415 569、#8281 2350 过/1 跳、#11489 75、#11384 181、#11674 54、#11681 160 过/1 跳；相关 TypeScript、changed-code quality、格式、max-lines、diff 均通过，#11384 另完成全平台 relay build。未运行 Docker。
- [续作] #8325 修复未被 main 覆盖但已再次冲突，适合下一轮专门 rebase；#10148 同样冲突，且仍缺 Android 编译和实体 Android/iPad 键盘验证，不能仅凭 source rebase 宣称可合并。完整提交、验证与风险见 `CHANGELOG.md` 顶部。

### 2026-08-02（其余开放 PR 只读审计）

- [扫描] 上游当前共有 57 个本人开放 PR；排除刚核实的 #11676/#11681 后，本轮覆盖 55 个：4 个 draft、18 个冲突、37 个可合并，全部尚无正式批准或变更请求。
- [待合并] #8391 是唯一 `CLEAN` 项，22 项检查无失败/等待且已有 collaborator 明确 LGTM；作者侧无需再改代码，只等维护者动作。
- [待修] #9415 有两个已由 exact-head 源码确认的问题（重复刷新 wake timer、未传递/回填 PTY ID）；#8281 的重试前 toast 会重复且 PR 已冲突；#11674 仅需补 Kimi 参数矩阵测试。
- [冲突] 排除 #9416 hold 与两个冲突 draft 后还有 15 个非 draft 冲突；优先 #11483(P0)、#11489(P1)、#11384、#8281，其余按现有审查活跃度分批处理，避免批量重写已审分支。
- [边界] #9416 继续只读不动；本轮未发评论、未改 PR 分支、未 push/merge，未运行本地测试或 Docker。完整证据与剩余编号见 `CHANGELOG.md` 顶部。

### 2026-08-01（main、worktree 与 fork 已清理同步）

- [同步] 本地 `main` 与 `fork/main` 均已快进到上游 `5738d61fe`；fork/main 原为 `0b65d725c`，未向 upstream main 推送。
- [清理] 已删除 #11676/#11681/#11674 的三个干净本地 checkout，保留对应开放 PR 与本地/fork 分支；另删除 5 个已结束 PR 的本地分支、46 个已结束 PR 的 fork 分支和 279 MiB `out/`。
- [空间] 仓库目录由 18 GiB 降至 9.7 GiB；保留主工作区 `node_modules/` 2.4 GiB，以及 `.memory/`、本文件、`CHANGELOG.md` 和 `tools/orca-demand-radar/`。
- [PR] fork 当前没有开放 PR；上游本人开放 PR 57 个，未发现已被 main 完整吸收的开放项，因此本轮没有关闭任何上游 PR。
- [验证] 删除前逐项确认 worktree 干净、无进程占用、local/fork/PR head 一致；同步后以 Git ref、GitHub 回读和磁盘读数复核。未运行 Docker 或代码测试，完整证据见 `CHANGELOG.md` 顶部。

### 2026-07-31（#11256 / #10490 / #10419 冲突已处理）

- [交付] **三项均已重放到 `origin/main` `5fe3aaf2b` 并以精确旧头 lease 更新：#11256 `3554be2b2`、#10490 `4a267c1ea`、#10419 `2e4fba5d1`；GitHub 回读全部 OPEN / 非 Draft / MERGEABLE / 0 未解决线程，未自合 upstream。**
- [冲突] #11256 同时保留主线 JS/TS module 扩展名和 PR 的 Terraform/Justfile 测试；#10490 保留主线 GitHub/GitLab 通用状态语义并接入主题样式签名；#10419 同时保留 native-chat 与 mobile-terminal-theme 类型导入。
- [验证] #11256 定向 24/24；#10490 移动端全量 376 文件、2760 过/3 跳，终端主题 25/25、共享主题 12/12；#10419 定向 88/88。对应类型检查、变更质量、lint/format、max-lines、diff 与 merge-tree 均已执行，未用 Docker、未遇 429。
- [风险] #11256 Greptile 已 SUCCESS；#10419 仍在复审，#10490 尚无 hosted check。#10490 的独立 changed-lines React Doctor 仍有旧 head 就存在的 10 个超长文件与 2 个数组类型错误，本次未新增，需另立拆分范围或等维护者意见；完整证据见 `CHANGELOG.md` 顶部。

### 2026-07-31（#10507 已独立重放并恢复可合并）

- [交付] **#10507 已从旧 head `904088eff` 重放到最新 main `967edeb49`，以精确 lease 更新为 `9a7ce0cd8`；GitHub 回读 OPEN / 非 Draft / MERGEABLE / 0 未解决线程。**
- [收敛] 旧 PR 因携带 #10490 父栈而有 41 commits / 237 files；新 head 只有 2 commits / 17 files，不再依赖 #10490。保留 main 当前静态样式语义，只移动 8 个非 route 模块并更新 import，另加 route-tree guard。
- [冲突] 独立重放暴露 11 个路径/内容冲突；两处 route consumer 与八个移动模块均保留 main 内容，父栈专属且 main 不存在的 `themed-style-factories.test.ts` 未带入。旧 head 备份为 `backup/pr-10507-pre-replay-20260731`。
- [评审] Greptile 首轮 SUCCESS 后新增两条 P2：ESM 路径基准已改用 `import.meta.dirname`；default re-export 检测改用 TypeScript AST。语法矩阵先红 2/6 后绿 6/6，两线程均已 inline 回复并解决。
- [验证] Node 24.18.0 下最终 4 个定向测试文件 21/21、mobile typecheck、changed/type-aware quality、React Doctor、max-lines、oxlint、oxfmt、diff check 与最终 merge-tree 全绿；未使用 Docker，也未遇 429。
- [终态] Greptile 最终复审 SUCCESS，9 条线程全部解决；未跑全量 mobile、原生 Android/iOS、打包/E2E 或实机 Metro warning count。Draft #11136 未动，完整证据见 `CHANGELOG.md` 顶部。

### 2026-07-31（本人非 Draft PR 队列稳定）

- [状态] **面向 `main` 的本人 OPEN PR 共 54 个：50 个非 Draft、4 个 Draft；50 个非 Draft 全部 MERGEABLE，冲突/UNKNOWN/未解决线程/CHANGES_REQUESTED/失败或 pending check 均为 0。**
- [检查] 24 个非 Draft PR 的 hosted rollup 为 SUCCESS，26 个没有 rollup，后者未当作 CI 绿；GitHub 显示 2 个 CLEAN、48 个 UNSTABLE，当前没有可见失败证据。
- [维护者候选] 当前优先等待合并：#9416 `c359cdce7`、#8254 `2806a2672`、#9436 `a04340357`、#7910 `9bbb5afee`、#11489 `38d51a729`、#11483 `942ed8230`。
- [边界] #11489/#11483 仍 MERGEABLE，仅记录状态；本轮没有 rebase、改分支、push 或自合 upstream，也未使用 Docker。
- [恢复点] 远端 `main` 与 `origin/main` 同为 `ab665a3ce`，API 未触发 429。下一轮只处理新冲突、未解决线程或明确 review 请求；否则维持 `queue stable, waiting maintainers`。完整查询口径与风险见 `CHANGELOG.md` 顶部。

### 2026-07-31（四个 PR 的 Greptile 反馈已处理）

- [交付] **#9416 / #7910 / #9436 / #8254 已分别普通 push 到 `c359cdce7` / `9bbb5afee` / `a04340357` / `2806a2672`；全部保持 OPEN、非 Draft、MERGEABLE，未自合 upstream。**
- [修复] #9416 的动态 Claude config-dir 安装现遵守 agent allowlist，本地/远端共享 16 候选上限；#7910 无 endpoint 时不再渲染列表 endpoint 行，但编辑框仍显示 `No endpoint`；#9436 去除重复 path resolution 与 no-op mkdir。
- [验证] #8254 不需改生产逻辑：真实 WebSocket 已证明远端先关闭后 handle `close()` 不会二次关闭；preload 测试锁定 close 事件先于 pending invoke handle settle。四个 PR 共 7 条 Greptile 线程均已技术回复并解决；#9436 后续要求原子 CAS 的 CodeRabbit 线程按已记录的 TOCTOU 边界技术关闭。
- [评审] #9416 独立 Codex review 无 Critical / Important / Minor，结论 APPROVED。#11489 `38d51a729` 与 #11483 `942ed8230` 仍 MERGEABLE，无需 rebase。
- [检查] #9416 相关 794 过/5 跳，#7910 settings 809/809，#9436 77 过/4 跳，#8254 77/77；对应 typecheck、目标 lint/format/diff 门禁通过，未使用 Docker。全量 Vitest 另有 4 个无关 xterm IME 文件 59 失败；#9416 还存在本次提交外的既有 `hook-service.ts` max-lines finding。
- [待复查] #7910/#9436 Greptile 已 SUCCESS；#9416/#8254 连续多轮仍在运行，当前未解决线程为 0。下一步只刷新这两项检查与新线程，不扩张无关 feature。完整证据和恢复点见 `CHANGELOG.md` 顶部。

### 2026-07-30（#11429 已认领并提交修复）

- [认领] 已公开认领 #11429：<https://github.com/stablyai/orca/issues/11429#issuecomment-5126015353>。
- [交付] **已从 `origin/main` `f8b553b7d` 建分支并提交非 Draft [#11489](https://github.com/stablyai/orca/pull/11489)，head `38d51a729`；GitHub 回读 OPEN / MERGEABLE。**
- [修复] runtime 删除或同 ID 重新配对时，现于既有 `setRuntimeEnvironments` 退役边界精确驱逐该 runtime 的 skill discovery cache；未变化和仍存活的 runtime 继续复用缓存，不因状态刷新反复扫描。
- [边界] 已完成的缓存按精确 key 删除；正在运行的旧 discovery 以 Promise 身份放入 `WeakSet`，结束后不能把旧结果写回，也不会长期持有临时 runtime ID。没有引入 store 反向依赖或新订阅。
- [验证] 三项回归均先红后绿：单 runtime 删除、pairing revision 变化与不变、删除时仍在运行的 discovery。7 个相关测试文件 64/64 通过；Node/CLI/Web typecheck、changed-code quality、type-aware、React Doctor、max-lines、目标 oxfmt、diff check 全绿；未使用 Docker。
- [评审] community tracking 与 Greptile 两个可见 check 均成功；Greptile 对最终 head 给出 5/5 / safe to merge / 无关注文件，CodeRabbit 无可操作评论，review thread 为 0。最终 head 与最新 main `f908ba38b` 的 merge-tree 无冲突。
- [限制] 未跑全量 lint/test/build、打包、Electron E2E 或真实远端 runtime 删除/重配生命周期；PR 仍显示 `UNSTABLE`，但没有可见失败或 pending check，隐藏原因无权限确认。Issue 在合并前保持开放；详细证据见 `CHANGELOG.md` 顶部。

### 2026-07-30（#11431 已认领并提交修复）

- [认领] 外部贡献者无权写 assignee，已用公开评论认领 #11431：<https://github.com/stablyai/orca/issues/11431#issuecomment-5125832484>。
- [交付] **已从最新 `origin/main` `74563b649` 建分支并提交非 Draft [#11483](https://github.com/stablyai/orca/pull/11483)，head `942ed8230`，GitHub 回读 OPEN / MERGEABLE。**
- [修复] 剪贴板/预览与 Orca 控制终端正式分流：Git Bash 等 POSIX-family Windows shell 复制到的是可直接执行的裸 `npx skills ...`；内置 PowerShell 终端继续使用 `cmd.exe` 的 npx 预检和缺失引导。
- [边界] 只剥离本模块生成的精确 native-host 包装串；WSL PowerShell wrapper、remote runtime、无关命令及原生 PowerShell/cmd 行为不变。四个已知复制入口均走统一边界，并有完整调用点契约测试。
- [验证] 新回归先红后绿；7 个相关测试文件 52/52 通过。Node/CLI/Web typecheck、changed-code quality、type-aware、React Doctor、max-lines、目标文件 oxfmt 与 diff check 全绿；未使用 Docker。
- [评审] Greptile 对最终 head 给出 5/5 / safe to merge / 无关注文件；CodeRabbit 无可操作评论；未解决 thread 为 0。仅有通用 docstring 覆盖提示，不符合本仓库简洁注释约定，未为此扩 diff。
- [限制] 未重跑真实 Windows/Git Bash、全量 lint/test/build、打包或 Electron E2E；Issue 已有真实 Windows shell matrix。GitHub 仍显示 `UNSTABLE`，但当前唯一可见 check 已成功、无失败或 pending，推断为外部贡献分支无法触发/批准的 required context；详细证据见 `CHANGELOG.md` 顶部。

### 2026-07-30（非 Draft 冲突与新增评审全部处理）

- [交付] **#8293/#9751/#7840/#8888 已依次重放并用精确 lease 推送，当前 head 为 `5158405d2` / `d63fe270d` / `06dff8282` / `520af3344`；四个非 Draft 冲突均已消除。**
- [冲突] #8293 同时保留上游窗口分类；#9751 同时保留 IME 路由和 mouse-TUI copy；#7840 同时保留 SSH writer/`beforeResolve` 与有界流式扫描；#8888 同时保留编排兼容、stream options、source-range 与 close policy。
- [新评审] #8293 新 P2 成立：随机 hard-link probe 在持续 unlink 失败时会累积。现改为每目标稳定 probe 名并重试瞬时清理；持续失败最多保留一条。先红后绿覆盖瞬时与持续失败，已回复并解决线程。
- [新评审] #7840 三条已裁定：流式 map 加共享 100k/64 MiB 上限，恢复本地/relay 120 秒与 SSH 130 秒期限；断线和 `rpc.cancel` 本来就通过同一 signal 杀子进程，无需另加轮询。三线程均已回复解决，PR 描述也已校正。
- [新评审] #8888 三条均复现并修复：容量耗尽使用独立原因、限流拒绝不永久消费 requestId、`id:`/裸 worktree 归一化归因键；先红后绿，三线程均已回复解决。
- [旧评审] #10148 三线程已清：`589a4e5e1` 补 iOS repeat API 限制说明并把导出 `style` 收紧为 `StyleProp<ViewStyle>`；Android `F` 前缀意见按当前闭合映射实证驳回。
- [范围] #11384 已改为 `Partially addresses #11374`，正文和 Issue 回复记录真实 Windows 14.5K/28.9K 成功、32,143 字符 `ENAMETOOLONG` 及标准 Cursor IDE 缺少 `.ps1`；Issue 保持开放。
- [验证] #8293 347、#9751 29、#7840 140、#8888 326、#10148 38 项定向测试全绿；对应 TypeScript、格式、changed-code quality、type-aware、React Doctor、max-lines、diff check 均通过；#10148 未跑原生 iOS/Android build；未使用 Docker。
- [合并] 等待复审期间 main 前移到 `80c42d38c`，维护者已把 #11382 合并为 `bd9653c26d6d`；新 main 重算没有产生新冲突。
- [终态] 本人 98 个 PR：52 open / 20 merged / 26 closed；48 个开放项 MERGEABLE，冲突只剩 Draft #11136/#9433/#9434/#9435；18 个 check success、34 个无 rollup、pending/failure/未解决线程均为 0。完整冲突解法、SHA、命令与风险见 `CHANGELOG.md` 顶部。

### 2026-07-30（main 前移后的本人 PR 复扫）

- [状态] **本人 98 个 PR：53 open / 19 merged / 26 closed；开放项 45 MERGEABLE、8 CONFLICTING、UNKNOWN 0。** 非 Draft 冲突新增为 #9751/#8888/#8293/#7840；Draft 冲突为 #11136 与 #9433/#9434/#9435。
- [冲突] 精确 merge-tree：#8293 仅冲突一个 rate-limit 测试文件；#9751 仅冲突 `keyboard-handlers.ts`；#7840 仅冲突 SSH channel multiplexer；#8888 冲突 3 个 runtime RPC 核心文件。建议顺序 #8293 → #9751 → #7840 → #8888。
- [新反馈] **#11384 已由 `iFwu` 用真实 Windows、真实 standalone `cursor-agent.cmd/.ps1`、Orca renderer IPC 验证：约 14.5K/28.9K staged diff 成功。** 但 32,143 字符 prompt 报 `ENAMETOOLONG`，标准 Cursor IDE 只有 `cursor.cmd`、没有同目录 `.ps1`；因此应把 PR 的 `Fixes #11374` 收窄为部分关联并保持 Issue 开放。
- [评审] #11380/#11382/#11384 均保持非 Draft / MERGEABLE / Greptile SUCCESS。没有新 review 或 thread comment；未解决线程仍仅是 #10148 的 3 条旧 Greptile 评论。
- [检查] 16 个 open PR 有 hosted rollup、37 个无 rollup；失败 0、进行中 0、正式 review decision 0。`origin/main` 已刷新并与上游 `64aa72630` 一致。本轮未评论、改 PR 描述、推送或改分支；完整证据见 `CHANGELOG.md` 顶部。

### 2026-07-29（按顺序完成 #11375 / #11329 / #11374）

- [交付] **三项均已认领、修复并提交非 Draft PR：[#11380](https://github.com/stablyai/orca/pull/11380)、[#11382](https://github.com/stablyai/orca/pull/11382)、[#11384](https://github.com/stablyai/orca/pull/11384)，当前全部 OPEN / MERGEABLE。**
- [修复] #11380 让 source-control 命令 tokenizer 按执行主机区分 Windows/POSIX 路径语义；#11382 让原生 `OC | ...` 标题在没有 hook signal 时也能纠正陈旧 Claude 图标；#11384 在 unsafe multiline argv 下直接执行同目录 `.ps1`，避开 `cmd.exe` 二次解析。
- [评审] #11380 CodeRabbit 的一行注释风格意见已修正，Greptile 复审 5/5；#11382 Greptile 5/5，CodeRabbit docstring 覆盖率告警与本次生产 diff 无关；#11384 的评审有效指出 relay 忽略传入 `SystemRoot`、本地生成遗漏转发 `spawnEnv` 及两处 shim 逻辑重复，前两项均用可区分的先红后绿回归修正，最后抽成 Node-only 共享解析器；最终 Greptile 5/5、4 个线程全解决，head 为 `86c359467`。
- [验证] Node 24.18.0 定向回归分别 302 过/1 跳、44/44、145/145；三分支 Node/CLI/Web typecheck 全绿。#11384 另通过 oxfmt、changed-code quality、max-lines、diff check 与六个原生目标加 WSL 的完整 relay build；未使用 Docker。
- [未验证] Windows 主机 `10.0.8.6` 仍不可达，未跑真实 Cursor/Windows、全量 lint/test/build、打包或 Electron E2E；超大位置参数仍受 Windows 进程命令行长度限制。完整分支、提交和验证证据见 `CHANGELOG.md` 顶部。

### 2026-07-29（可接手 Issue 复扫）

- [结论] **当前首选 #11375。** 它仍 OPEN、未认领、无修复 PR/竞争评论；最新 `origin/main` 的命令模板 tokenizer 仍无条件按 POSIX 语义吞反斜杠，Windows 原生绝对路径会稳定损坏。
- [候选] #11329 适合下一步在本机最新 main 复现：截图明确是 `OC | ...` 却显示错误图标，但主线已有 #9102 的标题分类与回归，需先定位剩余的 activity signal / rehydration 分支。#11374 的失败链也已源码确认，作者明确开放接手，但应先用 Windows 核对 `.ps1` shim 与真实长 prompt。
- [次选] #11334 涉及跨 runtime 的 project/host 数据归属，#11312 涉及 graph-sync 热路径与 soak，均可做但不宜抢在前三项前。
- [排除] #11343 在主线已经实现分块粘贴、延迟 50ms、Enter 单独写入并有大 payload 测试；不能因 Issue 仍开放就重复修。#11123/#10917/#11143/#11160 仍被他人认领，#11123 另有 PR #11176。
- [扫描] 仓库共 1,195 个开放 Issue；未认领 `bug` 15 个，未认领 `has_repro` 仅 1 个但已有修复 PR，未认领 `good first issue` / `help wanted` 均为 0。未认领、评论或修改 GitHub；未跑 Windows/WSL/SSH/多主机实机。完整证据见 `CHANGELOG.md` 顶部。

### 2026-07-29（#9751 检查完成后的最终复扫）

- [状态] **95 个本人 PR：50 open / 19 merged / 26 closed；开放项 47 MERGEABLE，唯一冲突仍是 #9433/#9434/#9435 三个 Draft。** UNKNOWN 0、失败 0、进行中 0、正式 review decision 0。
- [检查] 13 个开放 PR check rollup SUCCESS、37 个没有 rollup（不当作成功）。#9751 `bd0931d3f` 的 Greptile 已于北京时间 21:00 完成 SUCCESS；#8274、#8325 也维持 MERGEABLE / SUCCESS / 零线程。
- [活动] 上轮收尾后没有新维护者根评论、第三方 review 或新线程；只有已记录的 #9751 自己回复。未解决线程仍仅是 #10148 在 00:05 UTC 产生的三条旧 Greptile 评论。
- [主线] `origin/main` 仍为 `4543bb682`，未再次前移，本轮 mergeability 快照没有因主线变化失效。
- [限制] 37 个无 hosted checks 的 PR 不能视为 CI 绿；#10148 三条旧线程和 Draft 栈三冲突仍是既有 backlog。完整查询口径与证据见 `CHANGELOG.md` 顶部。

### 2026-07-29（#9751 冲突与 #8274/#8325 评审已处理）

- [交付] **#9751 已从 `89ba8f26d` 重放到 main `4543bb682`，并经评审修正与跨平台补测推送为 `bd0931d3f`，GitHub 回读为非 Draft / MERGEABLE。** 冲突解法保留主线已验证的剪贴板写入路径，同时恢复 mouse-tracking TUI 空 selection 的 ETX 转发与 kitty protocol reset。
- [评审] 推送后 CodeRabbit 新增两条：裸 Cmd+C 抢走用户重绑的其他 terminal action 是真问题，已用失败优先测试修复；configured copy repeat 已被 resolver 的 `!event.repeat` 门挡住，新测试在生产修正前就通过，按误报解释。两条均已回复并解决。
- [覆盖] Greptile 要求补 non-Mac 与中间 mouse mode 覆盖，`bd0931d3f` 已加入 Linux/normal、Windows/drag 表驱动测试；连同既有 macOS/any、shell/none 覆盖四种状态，线程已回复并解决。
- [修复] **#8274 新增 `b209108a5`：只有 hook signature 与 `computeTrustKey` 同时不变才继承 Codex 写入的 hash/enabled。** 跨 key 回归先证实旧状态会被错误带入，再由守卫转绿；CodeRabbit 线程已回复并解决。
- [裁决] #8325 的布尔值刻意表示 runtime 可达性，`shouldApply` 只控制结果是否发布；现有 caller 与回归测试都支持该契约。已技术回复并解决 Greptile 线程，没有为评论改坏行为。
- [验证] #9751 相关 57 项测试、Web typecheck、oxlint、oxfmt、max-lines、diff check 全绿；#8274 hook/trust 相关 183 过/5 跳、Node typecheck 与同类静态门禁全绿。未使用 Docker。
- [状态] 本人 95 个 PR 仍为 50 open / 19 merged / 26 closed；非 Draft 冲突已清零，只剩 #9433/#9434/#9435 三条 Draft 冲突。失败检查 0、UNKNOWN 0；#8274 Greptile 已 SUCCESS，#9751 仍在运行。未解决线程只剩 #10148 的 3 条旧评论。
- [限制] 未跑全量、打包、Electron E2E、真实 mouse TUI、Windows/WSL/SSH。恢复引用和 worktree 均保留；完整 SHA、验证和风险见 `CHANGELOG.md` 顶部。

### 2026-07-29（main 前移到 `4543bb682` 后再次全量扫描）

- [状态] **95 个本人 PR：50 open / 19 merged / 26 closed，生命周期数量未变。** 50 个开放 PR 中 46 个 MERGEABLE、4 个冲突；#9433/#9434/#9435 仍是原定不动的 Draft 栈，唯一新增的非 Draft 冲突是 #9751。
- [优先] **#9751 应先处理。** 它落后 main 571 个提交，真实冲突仅在 `keyboard-handlers.ts`：主线 #10827 已接管“验证剪贴板写入”的复制路径，本 PR 则在同一位置增加空 selection 的 mouse-tracking TUI ETX 转发与 kitty protocol reset；测试文件可自动合并。
- [评审] 新增未解决线程为 #8274 1 条、#8325 1 条；#10148 仍是原有 3 条。#8274 当前唯一调用点保证旧/新 trust key 相同，评论描述的跨 key 继承目前不可达，但 helper 没有强制自身注释承诺，值得补等值守卫和测试。#8325 的布尔值刻意表示“可达”而非“已写入”，现有回归测试明确要求 guard 阻止写入时仍返回 true，生产 guard caller 也不读结果，宜解释/补文档而非按 P2 改行为。
- [低优先] #10507 只有 CodeRabbit review summary 里的 trivial 测试建议，没有未解决线程，而且涉及继承自 #10490 的 session-stream 逻辑，不是 #10507 独有 route-tree 变更。
- [检查] 13 个开放 PR hosted checks SUCCESS、37 个无 check rollup；失败 0、进行中 0、UNKNOWN 0、正式 review decision 0。上次扫描之后没有新的人类维护者评论，新增活动均来自 CodeRabbit/Greptile。
- [下一步] 依次处理 #9751、#8274；#8325 技术回复后解决。Draft 栈继续不动。完整证据与判断见 `CHANGELOG.md` 顶部。

### 2026-07-29（四个冲突 PR 与两组依赖栈已恢复）

- [交付] **#8277、#9645、#10418、#10419、#10490、#10507 均已用精确旧头 lease 更新并由 GitHub 回读为 `OPEN / 非 Draft / MERGEABLE`。** 新 head 依次为 `65adf315b`、`27af53d3b`、`233de0b80`、`786d75c23`、`f70c6b23a`、`904088eff`。
- [修复] 独立冲突只合并双方必要语义；两个子 PR 分别重放到新父 head。#10490 没加 max-lines 豁免，而是把会话主题 hook 收进样式模块；#10507 的函数工厂守卫因新父分支已有更强实现而去重。
- [评审] #9645 推送后新增的 Greptile P2 已证实并修复：移动端现在像桌面端一样保留空 Project Group 与被过滤成空的组头；原评论对 `repo` 模式的类比不准确，已在线程中说明并解决。
- [验证] Node 24 定向测试合计：#8277 12、#9645 751+58（评审修正另跑 59）、#10418 12、#10490 12+123、#10419 75、#10507 19，全部通过；相关 typecheck、oxlint、oxfmt、max-lines 与 diff check 全绿。详见 `CHANGELOG.md` 顶部。
- [状态] #8277/#9645/#10418/#10419 的 Greptile 均已 SUCCESS，六个 PR 未解决线程都是 0。监控期间 main 又前移到 `d07931c4c`，GitHub 重算后六个仍为 MERGEABLE；#10490/#10507 暂无 hosted check。
- [限制] 未跑全量套件、打包、Electron E2E、真实 SSH/Windows/移动设备；未使用 Docker。备份分支和临时 worktree 均保留。

### 2026-07-29（#11215 已认领并提交 PR #11256）

- [交付] **#11215 已通过评论认领并修复：PR [#11256](https://github.com/stablyai/orca/pull/11256) 非 Draft、MERGEABLE，fork 与远端 head 均为 `ada7fe692`。** 桌面和移动端现在都识别 `.tfvars` 及 `justfile` / `Justfile` / `.justfile` / `.just`。
- [实现] 桌面使用 Monaco 自带 HCL/shell；移动端 lowlight 缺少 HCL，复用现有 INI grammar 着色 HCL 的注释、赋值和字符串，Justfile 走 Bash。没有新增依赖或执行/文件/网络面。
- [验证] 定向红绿测试桌面 12/12、移动 10/10；移动全量 352 文件、2597 过/2 跳；root lint、typecheck、changed-code quality、Electron/Vite build 全绿。Node 24 根测试 39603 过/64 跳，仅一个无关 SSH 并发环境测试失败且单跑 3/3 通过；完整 build 只在既有 macOS `lipo` 产物路径阶段失败。详见 `CHANGELOG.md` 顶部。
- [评审] 社区跟踪和 Greptile 均通过；Greptile 5/5、CodeRabbit 无 actionable comment，未解决 review thread 为 0。后续只跟进维护者意见或状态漂移，不把 SSH npm 环境污染或 native `lipo` 路径问题并入该小 PR。

### 2026-07-28（#8072/#8292/#9750 非草稿冲突已恢复可合并）

- [交付] **仅处理指定的 #8072/#8292/#9750，全部 rebase 到 `origin/main` `0404f27b3`，以精确旧头 `--force-with-lease` 更新为 `579d49b16` / `d8133f142` / `ac67f1be4`；GitHub 回读均为 `OPEN / 非 Draft / MERGEABLE`。**
- [修复] #8072 合并主线新版异步清理与 tracker dispose；#8292 保留主线 transcript/subagent poll 语义并接回 PR 的 SessionStart 清理；#9750 把活跃 descendant 阻止 root Idle 的行为移植到主线 multi-factory/full-ancestry ownership 状态机。旧的 child interactive 提交因主线已有更强等价实现而跳过。
- [验证] #8072 1404/1404、#8292 556 过/5 跳、#9750 91/91；#9750 新回归在纯 main 上先红、适配后转绿。三个 head 的 Node/CLI/Web typecheck、changed-code quality、max-lines、oxfmt、diff check 全绿。
- [限制] fork hosted CI/check rollup 仍为空，`UNSTABLE` 不是测试失败；未跑真实 SSH relay 或 live OpenCode background-subagent。完整冲突判断、命令、备份引用与证据路径见 `CHANGELOG.md` 顶部条目。

### 2026-07-28（本人提交的全部 PR 状态已完整对账）

- [交付] **93 个 PR 已全量复扫：49 open / 18 merged / 26 closed；所有非草稿开放 PR 均已恢复 MERGEABLE。** 本轮重整并精确 lease 推送 #7840/#8057/#8281/#8292/#8295/#8467/#10419，修复或关闭 #9415/#9436/#10490/#10507 的当前 review 异常。
- [排查] 对 1,315 个仓库开放 PR 做分页 GraphQL 复核，筛出本人 49 个开放 PR：**未解决 review thread = 0，失败检查 = 0，进行中检查 = 0，未知 mergeability = 0**。
- [异常] **#10162 在修复期间被 OrcaWin 关闭，未擅自重开**；维护者要求改用原生 revisioned editor transactions + acknowledged idempotent queue 的替代设计。当前唯一冲突是按计划保留的草稿栈 #9434/#9435（#9433 草稿已可合并）。
- [验证] #10419 五提交 range-diff 仅适配 main 当前导入结构，83/83 tests、Node/Web tsc、oxfmt/oxlint、max-lines、diff check 全绿；其余分支均在精确旧头 `--force-with-lease` 前完成定向验证。完整 head、命令与风险见 `CHANGELOG.md` 顶部条目。
- [限制] fork PR 当前 `UNSTABLE` 是未运行 hosted CI（check rollup 为空），不是检查失败；真实 Windows/WSL/SSH 与 #10419 headless Linux system-theme 仍按各 PR 原说明未验证。主 checkout 曾因命令路由误差从 `505967eba` 快进到当前 `origin/main` `89968a106`，用户未跟踪文件均完整保留。

### 2026-07-28（#9265 rebase 跨过 #10885 冲突：Codex PASS 后重推，恢复 MERGEABLE）

- [交付] **#9265（`bbingz/fix-grok-hooks-discovery-compat`，2 提交）rebase 后 `86542c1e1`，Codex PASS（4 条 INFO），精确旧 SHA `--force-with-lease` 重推，GitHub 回读 head 一致 + MERGEABLE**。唯一冲突 `installer-utils.test.ts`：main 的 #10885 围绕 `command -p cat` stdin-drain 常量重写了同批 Windows Git Bash hook 命令测试。取分支侧：`wrapWindowsGitBashHookCommand` 对 bash-safe 托管脚本返回正斜杠裸路径（Grok 的兼容加载器只能 CreateProcess 单个可 spawn token，bash `if [ -f … ]` 复合命令直接 exit 1），missing-script 的 stdin drain 只留在 encoded-PowerShell fallback 分支。
- [验证] 本地 agent-hooks 套件 63 过/10 跳 + tsc node + oxlint 全绿；Codex 逐项确认：#10885 的 POSIX drain 覆盖另有 3 条精确 launcher 断言 + 生命周期测试兜底、range-diff 无补丁漂移、负断言只是冗余强化。
- [限制] fork PR 无 hosted CI；原生 Windows/Git Bash 的 CreateProcess 运行验证未独立执行（本轮 macOS 环境无法证明）；未合并（留维护者）。
- [证据] 详情见 `CHANGELOG.md` 顶部「2026-07-28 — #9265 rebased past #10885 conflict」条目；评审输出 `/tmp/codex-9265.out`；临时 worktree `/tmp/orca-9265` 分支 pr-9265。

### 2026-07-28（#9415 rebase 跨过 #10684 冲突：Codex PASS 后重推，恢复 MERGEABLE）

- [交付] **#9415（`bbingz/unknown-busy-and-wrapper-visibility`，5 提交）rebase 到 `b31617452`，`2d6164ae6→0a4d8ee8b`，Codex 复审 PASS（仅 INFO），精确旧 SHA `--force-with-lease` 重推，GitHub 回读 head 一致 + MERGEABLE**。唯一冲突文件 `worktree-status.ts`：main 的 #10684（#9040 修复——braille spinner 标题经 `containsBrailleSpinner && Boolean(launchAgent)` 归因到 tab 的 launchAgent）与分支的进程身份归因重写（TTL 门控 pane foreground evidence）撞车。解法是行为并集：`titleStatusIsAgentAttributable(title, processAgent?, launchAgent?)` 先走 fresh process 证据、再回落 spinner+launchAgent，两个调用点都同时传两者；其余 4 提交 range-diff 逐字一致。
- [验证] worktree-status 两套件 40/40 + 分支全部 11 个测试文件 1967/1967 + tsc tc.web/node 双零错 + oxlint 干净 + 两次提交前 symlink 自查为空；Codex 逐项对比 main/冲突前分支/共同基点确认无任何一侧内容丢失。
- [坑] **冲突解决的第一版把 `launchAgent` 只传给 tab-title 调用点**，#9040 的 pane-title 回归测试立刻红（'active'≠'working'）——#10684 原本两个点都传。教训：rebase 解冲突后必须跑对方 PR 自带的回归测试，不能只看自己分支的测试。
- [限制] fork PR 无 hosted CI；Codex 只读沙箱跑不起 vitest（EPERM），绿色信号来自本地；未合并（合并留维护者）。
- [证据] 详情见 `CHANGELOG.md` 顶部「2026-07-28 — #9415 rebased past #10684 conflict」条目；评审输出 `/tmp/codex-9415.out`；临时 worktree `/tmp/orca-9415` 分支 pr-9415。

### 2026-07-28（#8888 rebase 上 post-#10818 main：Codex 第 7 轮 PASS 后重推，恢复 MERGEABLE）

- [交付] **上游合并 #10818（`1fd0f731f`，"bind agent terminal output before publishing"）重构了 launch 流程，#8888 推送后随即 CONFLICTING。已 rebase 到最新 main（`b31617452`），4 提交新栈顶 `87a1a84f5`，Codex 第 7 轮（专审 rebase 解决）PASS 零发现，精确旧 SHA `--force-with-lease` 重推，GitHub 回读 head 一致 + MERGEABLE**。冲突解决把 closeIntent 逻辑重述到新收养架构上：`retire-unowned-background-terminal.ts` 适配上游 owner 联合类型（`{ tabId } | { worktreeId }`），新增 `TERMINAL_ROLLBACK_WORKTREE_PLACEHOLDER = 'terminal-rollback'` 供 tabId-owner 路径（schema 要求非空 worktreeId，但 policy 对 terminal target 只按 `ptyOrHandle` 匹配）；两个调用点（adopt 辅助 + launch catch 块）穿 `owner: { worktreeId }`；上游删掉的两个旧架构测试移植到新收养流程重挂（补 `useRemoteAgentBackgroundRuntime` 导入），20/20 过。
- [验证] vitest：launch 20/20 + agent-session/close-policy 43/43 + session-tabs/attribution/multiplex/daemon/web-runtime/transport 238/238 + tab-retirement 27/27；tsc tc.web+node 双零错；oxlint 干净；fixup 前后 `git ls-files -s | grep node_modules` 空；`git merge-tree --write-tree` 无冲突；Codex 另以 `git range-diff` 证实 `agent-session.ts`/`runtime-close-policy.ts` 与第 6 轮 PASS tip blob 级一致。
- [坑] **rebase 冲突解决一旦引入新代码，原 Codex PASS 作废**——本次占位符设计 + owner 穿参 + 移植测试都是新面，必须再过一轮异家复审才推。`git checkout origin/main -- <test>` 恢复上游测试文件会连带删掉自己追加的测试，移植稿务必留底（/tmp/new-tests.txt）。
- [限制] fork PR 无 hosted CI，新 head 的 check 仍在 pending（UNSTABLE 即此意）；Codex 沙箱只读未独立重跑测试，绿色信号来自本地；未合并（异家 review 是 push 前置，合并留维护者）。
- [证据] 详情见 `CHANGELOG.md` 顶部「2026-07-28 — #8888 rebased onto post-#10818 main」条目；评审输出 `/tmp/codex-r7.out`；临时 worktree `/tmp/orca-8888` 分支 pr-8888。

### 2026-07-28（#8888 六轮 Codex 迭代至 PASS 后推送——已被上方 rebase 条目取代）

- [交付] **#8888 `fix/session-close-kill-attribution` `f55c0317b→a6e4cd1ba` 推送完成，GitHub 回读 head 一致 + OPEN**。异家 Codex 复审共 6 轮，逐轮修复：R4 软拒计入 teardown 失败 + blockedReason 日志；R5 会话/面板关闭被策略软拒后用 `acceptCurrentSnapshot: true` 重拉快照复活乐观删除的标签（拒绝不再版，freshness gate 会丢同版本快照，必须一次性 replay permit）、四个发送端全部换 `createBrowserUuid()`（LAN HTTP 非安全上下文没有 `crypto.randomUUID`）、`retireProvider` 铸 `client-created-rollback` intent（worktreeId 显式穿参——退役时 tab 已从 store 移除，扫描查找会落空）；R6 host 侧所有权缺口——只有 legacy `terminal.create` 登记 `recordTerminalCreated`，结构化 `createAgentSession`/`ensureAgentSession` 创建无所有权导致 R5 intent 仍被 `close_rollback_not_owned` 软拒，两个 handler 现仅在 `disposition === 'created'` 时登记（adopted/replayed 不登记），各补测试。
- [验证] 推送前：主进程 3 套件 49/49 + renderer 3 套件 76/76 + tsc tc.web/node 双零错 + oxlint 干净 + fixup/autosquash 干净 + 无 node_modules symlink 入栈。精确旧 SHA `--force-with-lease` 推送，回读 head `a6e4cd1ba` 一致。
- [坑] **`codex exec` 必须 `< /dev/null`**，否则即使 prompt 走 CLI 参数也会永远挂在 "Reading additional input from stdin..."。**策略拒绝不重发快照**——乐观删除后的恢复路径必须带 replay permit，否则 resync 拿到的同版本快照被 freshness gate 静默丢弃，标签永不复活。**回滚所有权是 host 侧登记制**：新增任何创建型 RPC handler 都要考虑 `recordTerminalCreated`，否则 renderer 的 rollback intent 形同虚设。
- [限制] fork PR 无 hosted CI，绿色信号全来自本地；未合并（异家 review 是 push 前置，合并留维护者）。R5 Codex 输出末尾有 model-capacity 错误但裁决段完整。
- [证据] 逐轮发现处置与命令见 `CHANGELOG.md` 顶部「2026-07-28 — #8888」条目；临时 worktree `/tmp/orca-8888` 已清理。

### 2026-07-27（#8467/#9645 双 rebase 过 Codex 门后推送）

- [交付] **两个 deferred PR 全部 rebase + 修复 + 异家复审 + 推送完成**。**#8467** `a7c3652b9→07cffd93f`（198 落后清零，CONFLICTING→MERGEABLE）：两轮冲突解决（gates JSONC 追加、五个 locale JSON 保留 main 的 resource 块、pty.test.ts 既有错合拆开），range-diff 证实其余提交逐字一致；Codex 三发现中一条可修——gates 引用了已被 #9387 删除的 `resource-session-count-selector.test.ts`，从 testFiles 和两条 commands 串里删掉并 fixup 进 gate 提交。另两条（后台任务误判 inactive、PTY-ID 复用无 incarnation 跟踪）属架构级、rebase 前就存在，留档不扩范围。**#9645** `2f3c7c971→e6d43f5b3`（干净 rebase）：Codex 三发现修两条——闭侧栏 Cmd+1–9 排序把原始 `project-group` 传进 buildRows 落进 PR 分组分支（改走 `effectiveGroupByForRender`，补测）、`parseProjectGroupsResponse` 对畸形成功载荷加 `Array.isArray` 守卫（防抛错拖垮 repo 元数据，补测）；第三条 v3 协议兼容是能力门设计的既定取舍，不动。Codex 复审「no actionable findings」。
- [验证] #8467：修正后 10 文件 gate 命令 435/435 + `check-reliability-gates.mjs` 52 gates 通过 + tsc node/oxlint 干净。#9645：mobile 57 + desktop/shared 722 + sidebar 121 全过，tsc node/mobile + oxlint 干净，Codex 复审时独立重跑两个新测试 18/18。两次推送均精确旧 SHA `--force-with-lease`，GitHub 回读 head 一致 + MERGEABLE。
- [坑] **`git add -A` 会把 worktree 里的 node_modules 符号链接提交进去**（120000 mode），本次靠 fixup 前自查 diff 抓到，第二个 fixup 移除后才推送。临时 worktree 提交前务必 `git status` 排除 symlink。
- [坑] Codex read-only 沙箱里 vitest 起不来（pnpm 要写临时文件），但它会自己绕开 pnpm 直接调 `node_modules/.bin/vitest --no-cache --pool=threads` 跑通——其「测试过」结论可信但仍以本地重跑为准。
- [限制] 两 PR 均未合并（协调员规则：异家 review 是 push 前置，合并仍需人/维护者）；fork PR 无 hosted CI，绿色信号全来自本地。剩余 backlog（mobile 主题栈 #10417–#10423、IME 栈等）维持上轮处置，等人工/跨审。
- [证据] 新旧 head、冲突解决细节、Codex 发现逐条处置见 `CHANGELOG.md` 顶部「2026-07-27 — #8467 and #9645」条目；评审 transcript 在会话 tmp 目录。

### 2026-07-27（开放 PR 复扫：#9436/#9416 收尾 + mobile 栈三连 #10507/#10490/#10422）

- [交付] **五个开放 PR 全部扫完，该修的都修了，GitHub 回读五连 `OPEN / MERGEABLE`**。#9436 → `aeea020ef`（6 条 coderabbit 根评全清：install/remove 区分 retry-exhausted 与 unparseable、远端报错补全路径、task 命名子代理不继承 pane flavor、done 保留检测对比 `configDir`、远端备份 tmp+原子 rename；另把 `getManagedScript` 抽成 `managed-hook-script.ts` 解决 hook-service 311 行超预算，并补进 `tsconfig.cli.json` 显式 include 否则 TS6307）。#9416 → `149fdead0`（Major：候选上限 16 + 15s 总 deadline 防巨型远端 home 拖死启动；Minor：marker 探测改 `lstat` 不随符号链接，各带新测试）。#10507 → `8cd08ef52`（删掉自比较恒真断言改为对模块做 fresh `import()` 验证身份；工厂正则放宽到 `[:=]` 防带类型标注的工厂逃逸守卫；`sheetBodyAfter` 限定在下一工厂声明之前）。#10490 → `00c94290b`（`--editor-surface` 从 `bgBase` 改为独立 `editorSurface` token，failing-first 补断言；同款 `sheetBodyAfter` 界）。#10422 零提交——两条都已在 `da5ed231b` 解决，ratchet 增长约束与 #9416 守卫豁免按「设计决策」留档不回帖。
- [验证] #9436：154 文件 / 2491 过 / 5 跳过 + tsc 三配置 + oxlint + max-lines ratchet（sidebar 18 个失败经 stash A/B 证实为基座既存）。#9416：29 文件 / 526 过 / 5 跳过 + tsc node/cli + oxlint。#10507：mobile 全量 353 文件 / 2537 过 / 2 跳过。#10490：改动套件 12/12，全量中 5 个 image-preview fixture 失败经 stash A/B 证实为基座既存。五个 PR 推送后均回读 head SHA 一致 + `mergeable: true`。
- [坑] **临时 worktree 里 `pnpm install` 会重写 `mobile/pnpm-lock.yaml`**（未暂存噪音），必须先 `git checkout -- mobile/pnpm-lock.yaml` 再 `git stash pop` / 提交，否则 pop 直接报 "would be overwritten"。
- [坑] coderabbit 根评里相当一部分是**已修复**（bot 自带 "Addressed in commits X to Y" 尾注）或**假阳性**（引用了分支头部已删除的文件）；逐条对照 head 验证后再动手，别看到评论就改。#9416 的 ledger-TOCTOU 评论就是假阳性（ledger 模块在头部已不存在）。
- [限制] fork PR 无 hosted CI（外部贡献者工作流需维护者批准），绿色信号全部来自本地；#10422 的 ratchet-只增不减约束与 #9416 的末次重试豁免守卫是社会性/文档性约定，未回帖留字。
- [证据] 各 PR 新旧 head、命令、失败归因与 A/B 证明见 `CHANGELOG.md` 顶部「2026-07-27」条目。

### 2026-07-26（夜间：#9416 说明评论 + #8300 rebase 过 Codex 门后推送）

- [交付] **#8300 rebase 完成并推送**（`86ae20d38→fe0dbf0ab`，332→0 落后，精确 lease，GitHub 回读 MERGEABLE）。单提交干净落位；核心 patch 与原提交逐行一致。唯一的 rebase 损伤由测试抓到：上游给 `window:close-requested` 加了 `requestId` 字段，本 PR 新增的两条断言没跟上，按 main 相邻断言的惯例补 `requestId: expect.any(Number)` 后 amend 进原提交。
- [验证] **Codex 审查门通过才推送**（新规：代码改动须异家 review，勿自合）：codex exec 只读审查整个 rebased 提交，结论「未发现可操作问题；rebase 语义健全」。vitest 三套件 533/533，tsc node 干净。
- [交付] **#9416 已发协调评论**（comment 5083993263）：向 brennanb2025 说明 PR 描述已改写成 marker 制、列出贸易权衡措辞，请其复核——不再是开放项。
- [排查] **隐藏栈扫描**：全部开放 PR 两两比对触碰文件，无未声明的栈。#8300×#9645 共享 `persistence.ts` 等三个文件但 hunk 不相交；#8300×#8467 仅共享 locale JSON；全部 MERGEABLE 佐证可文本合并。
- [坑] grok 这次**没跑任何测试就提交了一个 rebase 结果**，被我整体丢弃重做（rebase 本身干净，无冲突解决成果损失）。派 grok 的结论必须照旧独立复核，不能因流程熟悉而省略。
- [证据] 详见 `CHANGELOG.md` 顶部「2026-07-26 (night)」条目；Codex 审查 transcript 在会话 tmp 目录。

### 2026-07-26（晚间：51 个开放 PR 全量分诊 + 4 个 rebase + 5 个优化）

- [交付] 用 Workflow 对 51 个仍开放的 bbingz PR 逐一对照 `origin/main`（`8f5a45401`）评估剩余价值：**保留 39 / 优化 5（7910、8293、8325、9416、9436）/ 需 rebase 7（8254、8255、9433、9434、9435、9752、10507）/ 放弃 0**——没有建议关闭的，故无需确认、未关任何 PR。9434/9435/10507 昨天已基于新 main，本轮免 rebase。
- [交付] 4 个 rebase 由 herdr tab 里的 **grok agent** 在独立 worktree 完成、我复核后推送（全部精确旧 SHA `--force-with-lease`）：#8254 `d40935496→b6e8557fb`（顺手把重复的联合类型抽成 `src/shared/runtime-environment-subscription-start-result.ts`）、#8255 `057681547→4c61d37d3`（保留 main 的挂起/恢复诊断，确认不会双触发，补提交 grok 漏提交的 wake-recovery 测试）、#9433 `a0335c147→887bc1740`（重定位为残余部分：typed exited 帧 + mirror-retire/pty-exit 传输拆分 + 会话 tab 生命周期快照，3 提交 11 文件，剔掉与 #9804/#9687/#9288 等重复的 hunk）、#9752 `24f55b381→e78365caa`（8 提交，identity-verify 提交整体删掉——上游 #10484/#10674 已 fail-close；重新生成 node-pty patch 并更新 lockfile 哈希）。
- [交付] 5 个优化全部提交并推送：#8325 `→a432a56e9`（把过期激活守卫提前到 main 新增的 runtime-env 刷新副作用之前）、#7910 `→f5aed4773`（PR 自己引入的 4 处 `text-[10px]` 换成文档化的 `text-xs` token）、#8293 `→a0f3e223d`（复用上游 #10136 的 `classifyCodexRateLimitWindows`，删掉自己重写的 primary/secondary 推断；bucket 保留上报的 windowDurationMins）、#9416 `→1237de310`（9 提交干净 rebase，255→0 落后，保留 brennanb2025 的 tip；PR 描述改写成 marker 制，删掉已被移除的 ledger 模块描述）、#9436 `→5d81dd747`（用脚本化 sequence editor + `rebase --onto` 重新叠回 9416 新 tip，去掉草稿标记）。
- [坑] fork 分支名**不全是** `bbingz/` 前缀：#7910 的分支是裸 `feat/remote-orca-server-edit`。推之前先 `git ls-remote fork` 核实，否则 lease 对不上报 "stale info"（本轮 8254/8255/9433 各撞一次）。
- [坑] `#9436` 直接 `rebase origin/main` 会保留与 9416 重复的 9 个提交，`rebase --onto` 旧 tip 又会得到错误的祖先；正解是先用 `GIT_SEQUENCE_EDITOR` 脚本丢掉重复 pick 再 `--onto` 9416 新头。另外 `git branch -f` 拒绝移动被别的 worktree 占用的分支。
- [验证] 每个分支推送前本地跑过定向 vitest（必须带 `--config config/vitest.config.ts`，否则 `@/` alias 解析不了）：#8254 47、#8255 41+8、#9433 124（grok 另跑 pty-connection 481）、#9752 100（grok 称 7 文件 278）、#7910 50、#8293 380 + tsc、#9416 472 通过/3 跳过、#9436 57 通过/7 跳过。GitHub 侧推送前均回读 `MERGEABLE`。
- [限制] fork PR 上没有 hosted CI（外部贡献者工作流需维护者批准），绿色信号全部来自本地；#9752 无真实 Windows ConPTY 验证；grok 自述的测试只做了抽查级复核；#9416 的描述改写尚未在 PR 评论里 ping brennanb2025。
- [证据] 各 PR 新旧 head、命令与失败归因见 `CHANGELOG.md` 顶部「2026-07-26 (evening)」条目；51 份分诊评估在 workflow `wf_9068028e-7c1` 的 journal。

### 2026-07-26（五个非草稿冲突 PR 已重整并推送）

- [交付] #7910、#7942、#9274、#9415、#9752 均重整到 `origin/main` `19d082a`，以精确旧 SHA 的 `--force-with-lease` 更新 fork；GitHub 最终回读五个均为 `OPEN / MERGEABLE`。
- [修复] #7942 保留 PNG/WebP 有界校验并排除 SVG；#9415 防止异步前台进程检查写到复用 PTY；#9752 只让实际启用 Job Object 的原生 Windows agent 跳过树清理，WSL agent 继续走身份校验的 descendant sweep，且成功恢复线程后关闭 `piClient.hThread`。
- [验证] 五个分支分别跑过定向测试与类型检查；#9752 额外通过 8 文件 / 340 项 PTY、会话与 Windows 补丁契约测试，以及 Node/CLI/Web 类型检查、lint、format、diff 检查。
- [限制] #9752 未在真实 Windows 主机运行原生 ConPTY；#9274 的完整 mobile 套件仍有 5 个不在本 PR diff 内的既存无效图片 fixture 失败；fork PR 暂无 hosted CI/check rollup 或正式 review decision。草稿 #9434/#9435 按范围未动。
- [证据] 各 PR head、命令和失败归因见本次 `CHANGELOG.md` 顶部 `2026-07-26` 条目。

### 2026-07-25（收尾：剩下 8 个路由树文件 → PR #10507）

- [交付] **PR #10507 已开**（`OPEN / MERGEABLE`，commit `9022f6e1d`，自身 17 文件 / +63−34，对 main 34 提交 / 234 文件，base 同栈用 `main`）。上一场留下的「剩余 8 个路由树文件」做完了：`accounts-screen-styles.ts` → `src/host/`，六个 session 模块 + `QuickCommandsTabButton.tsx` → `src/session/`，无新目录。
- [证明] **整个提交里每一条改动行都是 import**。不是抽查，是把 `git diff --cached -M -U0` 全量列出来逐行看：模块自身的相对深度、两个路由消费者、四个原本**反向**从 `src/session/` 伸回 `app/` 的兄弟文件、两个测试里的读文件与动态导入。这比 brief 要求的 `sheetcheck`（只覆盖被移动的样式表）更强。`oxfmt` 顺手把 `mobile-session-route-types.ts` 一条三行具名导入合成一行（路径变浅了），diff 里看得见，无语义变化。
- [守卫] 新增 `mobile/src/expo-router-route-tree.test.ts`：走 `app/`，任何不导出路由组件的文件都会带**精确路径**失败。移完之后 `app/` 下 **29 个文件全是真路由**，幽灵路由归零、守卫从绿开始。做了变异测试（丢一个 `mutation-probe-styles.ts` 进去，失败并点名）。expo-router 本身没有退出机制，所以这个不变量只能落在测试里。
- [坑] 分支基座是**重写前**的 `7f8116127`，救回来的活躺在 `b41454437`，比 #10490 的头低三个提交。逐个确认那三个提交（chip glyph / memo deps / ratchet 守卫）都没碰这 8 个文件及其消费者之后，用 `git diff --cached -M --binary` → `reset --hard 566a3fe52` → `git apply --index` 迁到新基座。
- [坑] `refactor/mobile-route-tree-only-routes` **推不上去**——fork 上有个叫 `refactor` 的裸分支（`e9b494ae3`），`refs/heads/refactor/*` 是目录/文件冲突。和 7-24 那次 `refactor/shared-terminal-theme-catalog` 同一个坑，改名 `bbingz/mobile-route-tree-only-routes` 才推成。已写进 auto-memory。
- [坑] **新 worktree 跑不了检查**：完全没有 `node_modules`（从主 checkout 软链两级即可，不要装）；接着 `tsc` 报唯一一条 `TS2307: Cannot find module './terminal-webview-engine.generated'`——那文件是 git-ignored 的生成物，`node mobile/scripts/build-terminal-webview-engine.mjs` 生成后 tsc 归零。两件事都与本次改动无关，但看起来都像「移动把东西搞坏了」。
- [验证] 350 文件 / 2513 通过 / 2 跳过 / 0 失败（基座 349/2512，+1 文件 +1 测试就是守卫），tsc exit 0、oxlint exit 0 无诊断、oxfmt 1023 文件干净、max-lines ratchet OK（354 grandfathered，无新增豁免）。退出码都是直接取的，没有经过管道。
- [未做] 真机幽灵路由计数是否真的到 0 没验（要重启 Metro + 配对模拟器），PR 里如实写明只主张静态遍历。Podfile `post_install` 部署目标修正仍未做。

### 2026-07-25（后半场：复审 → rebase → 修 → 已推 PR #10490）

- [交付] **PR #10490 已开**（32 提交 / 222 文件 / +14982−11455），叠在 #10423 上；另外 7 个分支 `--force-with-lease` 刷新，#10417–#10423 全部指向重写后的头。终态 349 文件 / 2512 通过 / 0 失败，tsc、oxlint(0 error)、oxfmt、max-lines 全绿，暗色同一性证明差集为空。
- [复审] 换了一个**全新 Grok**（不是写批次的那个）只读 ref 做八维度对抗式复审：**0 blocker**、4 should-fix、3 nit。它自己写的暗色同一性证明 **2022 = 2022、双向差集 0**，rebase 后与链重写后各重跑一次仍为空。
- [纠偏] 它的结论我改了三处：**memo deps 清单两个方向都错**（我全树 identifier 级重扫得 8 处/4 文件，它漏了 `tasks.tsx:8002`、`MermaidDiagram.tsx:22`、`MobileBrowserPane.tsx:1061`，多报 1 处）；**SF-4 高估**（合并工厂会 spread 拆分工厂，真实是 110 声明/65 注册/**72 覆盖**，不是缺 45；31 个 src 未注册里 7 个已传递覆盖、23 个长在 `.tsx` 组件里需要 mock 图，只有 `createHostScreenStyles` 值得加）；**SF-1 是真的**。
- [缺陷] SF-1 是同一缺陷类的第二例：`chipGlyphSelected` 硬编码 `rgba(10,10,10,0.5)`，而选中态底色是 `colors.textPrimary`——浅色下 `#0a0a0a` 上叠同色 50%，**对比度 1.00**。真机前后都抓了：修复前芯片只剩 `Alt`、⌥ **完全消失**；修复后 `Alt ⌥` 清晰可辨。用 `onInvertedMuted` 一对 token 修，深色字节不变。
- [守卫] 两个缺陷现有三道检查全抓不到（不是 `colors.*` 引用 → 暗色字节同一、双调色板仍有差异），所以补两道并**做了变异测试**：工厂体内色值字面量白名单（15 条，每条写明为何与模式无关）、注册表完整性断言。放回字面量会失败并打印精确 key，删掉白名单一项会失败并点名——不是空转的绿。
- [坑] **全树钉死的 ratchet 挡不住 upstream 新增文件**：#9394 加的 `CodexResetCreditAction.tsx` 带裸 `colors`，导致浅色调色板往上**每个提交**都红，含 #10418/#10420/#10422/#10423 四个已开 PR 的头。实测：修前 5/5 红，修后 9/9 绿。**更正**：我先前在这里写「这些 PR 今天本来就已经红了」是错的——它们根本没跑过 CI。`verify` 工作流从未在任何 bbingz fork PR 上执行过（抽查 25 个，唯一出现过的检查是记账用的 `track-community-pr`），因为外部贡献者的工作流需要维护者点「批准运行」；`gh api repos/stablyai/orca/commits/<head>/check-runs` 对我们的头返回 0。所以那个失败是**潜伏**而非已报告：维护者第一次跑套件或合并之后才会撞上。缺陷本身是真的、本地量过；关于 CI 状态的那句话不成立。
- [手法] 修法是 `git filter-branch --tree-filter` **按树**插入名单项——条件取自该树里那个文件是否仍带裸导入，于是它「在未转换处出现、在转换提交里消失」，17 个批次提交零冲突。两个细节：`filter-branch` 的 rev-list 必须含真实 ref（`<sha>^..HEAD`），成功时**不写** `.git/filter-branch/map`，旧新映射得靠提交标题重建（我据此重指了 23 个分支）。
- [事故] **旁边的 worktree 差一步就出大事**：`git branch -f` 会拒绝移动被别的 worktree 占用的分支，rebase 却用 `git update-ref` 静默绕过——`orca-route-tree-cleanup` 的 HEAD 指到新提交、索引还在旧提交，`git status` 出现 **239 条已暂存的「回退 27 个 upstream 提交」**，谁在那儿 `git commit -a` 就毁了，而且把 8 条真实未提交的重命名（剩余路由树工作，我先前记成「还没动」是错的）埋在噪声里。用 patch 抓走 → `reset --hard` → `git apply -3 --index` 救回，链重写后又救了一次。
- [返工] 线性化丢掉 merge 改变了 PR 形状，**已返工**：四个 PR 各被塞进同样的 5 文件/~487 行，#10418 从 **14 文件/94 行涨到 19/581**——一个 94 行的小重构背着浅色调色板和一个 200 行测试。我们是外部贡献者，没资格把这个丢给维护者，所以从原始 tip 用 `git rebase --rebase-merges` 重建了整条链，merge 被重新创建、两侧各自从 main 分出。现在每个 PR 都回到原始形状（14/94、25/931、20/623、30/1651），只有 #10422 多 1 行（它需要的 ratchet 项）。恢复 merge 还顺带**消除了 picker 那个 ratchet 修改的必要性**——那一侧根本没有 ratchet 测试——所以 #10421 回到原来的单个提交，我也把之前解释该修改的评论更正了。丢掉的 merge 早先用 `git show --cc` 验过组合 diff 为空，没有内容丢失。
- [修正] `7f8116127` 提交信息里「`src/tasks/` 是新目录」是假的（迁移前就有 62 文件，只有 `src/host/` 新），已 amend；`fix/mobile-stat-tile-light-contrast` 的错位指针已归位；安全网 `backup/pre-rebase-themed-styles` = 旧 tip。
- [发现] 应用里**根本没有外观切换 UI**，`appTheme` 只有 `preferences.ts` 在读——浅色只能靠临时改 `DEFAULT_APP_THEME` + 换端口重启 Metro 来测（`preferences.test.ts` 的 `'dark'` 断言是忘记还原的守卫）。另外 expo-router 支持深链导航，`orca://terminal-settings` 一条命令直达，不用摸坐标。
- [未做] 剩余 8 个路由树文件（仍未提交在旁边的 worktree 里，独立 PR）、Podfile `post_install` 部署目标修正。

### 2026-07-25

- [交付] **17 批迁移全部完成、ratchet 归零**。6–11 由 Grok 分三轮做、12–17 第四轮，每轮我独立复核后才放下一轮。之后两个修复提交：`79a15ac55`（浅色对比度）、`7f8116127`（样式模块移出路由树）。终态 340 文件 / 2449 通过 / 0 失败，tsc、oxlint、oxfmt(1005)、max-lines ratchet 全绿。ratchet 测试文件保留、清单置空——从「迁移账本」变成「禁止任何裸 `colors` 导入」的永久守卫。
- [拦截] **B16 不是机械转换，说清这点避免了一次回归。** `XTERM_HTML` 是模块级模板字符串、`XTERM_WEBVIEW_SOURCE` 是喂给 WebView `source` 的模块常量——一旦依赖 `colors`，切主题就改变 `source` 身份 → 文档重载、xterm 重新初始化，#10417–#10421 刻意保住的「不重挂」当场作废。改用 CSS 自定义属性（`:root` 默认值保持 `#1a1b26`/`#888888`）+ 现有 `set-theme` 消息下发 `appChrome`，未动主机协议。已逐条验过。
- [缺陷] 找到一个**静态证明抓不到的浅色缺陷**：`app/index.tsx` 的 `statCard` 硬编码 `rgba(26,26,26,0.6)`（= 深色 `bgPanel`），浅色下 composite 成中灰约 `#767676`，11px 的 `textMuted` 标签落到约 **1.2:1**，首屏三个统计块的标签真机上读不出来。深色下完全正常、先前就存在、且不是 `colors.*` 引用——所以字节同一性证明和 token 多重集天然通过，双调色板测试也不触发。加 `statTileSurface` 一对 token 修掉：**深色值就是原字面量**（像素不变），浅色 `rgba(0,0,0,0.04)` 同构造、composite 正好等于 `bgPanel`。同类字面量扫了 18 处，其余均为有意保留。
- [实测] **幽灵路由 19 → 8**。expo-router 把 `app/` 下每个文件注册成路由，非路由文件都会报 `missing the required default export` 并成为渲染空白的可导航路径。**没有退出机制**：没有 `_` 前缀约定（只 `_layout` 特殊），`EXPO_ROUTER_CTX_IGNORE` 是包内常量而非环境变量，`_ctx.ios.js` 把正则写死。已把我们新增的 11 个移到 `src/{dictation,host,tasks}/`。**提交信息有个错要 amend**：`src/tasks/` 不是新建的，迁移前就有 62 个文件，只有 `src/host/` 是新的。剩下 8 个是先前就有、不属任何批次的文件（其中一个纯类型、一个组件），已写好 brief 作独立 PR。
- [验证] **不用远程虚拟机——本机全都装好了**。Android 模拟器 `audiocam`（API 33 arm64；`Pixel_3a_API_34` 那个起不来，没装 android-34 镜像）、`adb` 在 Homebrew 里、截图可直接读。用 `orca serve --mobile-pairing --json` 无窗口配对到 Windows；6768 从 LAN 不可达（正是 app 自己那条防火墙提示），**没加防火墙规则**，改走 模拟器 → `adb reverse` → Mac → `ssh -L` → Windows；后来因为 6768 被 GLM 占用改到 6779。
- [证据] 23 张截图覆盖批次 3/4/5/6/8/11/16/17，含桌面端真实数据（worktree 分组、活的 PowerShell 会话、上游 PR 列表）。**app chrome 是浅色而终端保持 Tokyonight 深色**——这正是本轮开头推翻 #7820 前提的双槽位模型的视觉确认。实时切换也验了：同屏浅→深、app pid 不变、无 Activity 重启。
- [iOS] **构建通过、零错误、装机启动成功**，迁移没破坏 iOS 构建。但**界面审查做不到**：这个 Xcode-beta 是精简安装、没有 `Simulator.app`，`simctl` 也没有点击命令。
- [既存] **Xcode 27 不加 Podfile 修正构建不出 iOS**：pod 资源 bundle 的部署目标是 9.0/12.4/13.4，低于 Xcode 27 的 15.0 下限。我用 xcodebuild 层 `IPHONEOS_DEPLOYMENT_TARGET=16.0` 绕过（**不能用 15.1**，会压坏 expo-router 用的 iOS 16 API）。真修法是 `post_install` 统一抬高，属独立 PR。
- [事故] **四个 agent 共用这个 checkout，至少两个会动 git HEAD。** 本轮另一个 agent 把 `bbingz/fix-9704-windows-pty-descendants` 的 rebase 停在 2/6 的冲突上、HEAD 游离，工作树内容退回迁移前；随后又切到 `bbingz/split-7950-auth-rate-limits`。**没有损失**——19 个分支和两个修复提交都用 `git ls-tree` 验过完好——但我必须中断在那棵树上干活的 Grok，而且那条提交信息的 amend 得等树空出来。
- [坑] `CI=1` 会让 Metro 在启动时固化模块图，之后的编辑永远到不了 app。这废掉了一次实时切换测试（app 跑的是陈旧 `'light'` bundle 而系统是深色，看起来像主题 bug）。先前的浅色截图不受影响。重启 Metro 还有端口释放竞态——旧监听没释放时 `expo start` 在非交互模式下会直接跳过启动，**每次换新端口**才可靠。
- [坑] 把检查管进 `tail` 再读 `$?` 拿到的是 `tail` 的退出码。我因此让一整块检查打印 `tsc_exit=0` 而实际一条没跑。
- [交付] 迁移批次 **4、5 本地提交完成**（`a4522d41d` 终端设置 + 快捷键编辑器，`3a2361b76` 配对 + 引导）。ratchet 119 → 113 → 107，工厂测试覆盖 22 → 27 个。均未推送。
- [复核] 批次 1–3 是 Grok 自己提交的、没经我审，已独立复核通过。做法不是读代码而是**机械证明**：37 个文件的 `StyleSheet.create` 主体剥空白后逐字节相同（voice-settings 抽取那份 2025 字符两侧完全一致）。批次 4、5 同法再证 13 个文件。
- [复核] 逐文件比对调色板 token 多重集，3 处不符全部有解释：voice-settings 一对求和精确相等；`StatusDot.tsx` 的 `statusAmber` 由 4 降到 2，是 Grok 把 record + 三元折成 `switch` 合并 case，逐分支确认语义等价。非样式表部分 35 个里 25 个完全相同，剩下 10 处每一处都能追到「模块加载会把 `darkColors` 冻住」这一个原因，或者只是注释。
- [坑] **`pnpm exec` 在这个 checkout 里已经彻底不能用**。7-24 重链 `node_modules` 之后，pnpm 的依赖状态检查每次都触发，报 `ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY`；它建议的 `CI=true` 会**清空**重链好的 5.3G。更阴的是我第一次把命令管进 `tail`，`$?` 拿到的是 `tail` 的退出码，于是整块检查打印 `tsc_exit=0` 而实际一条都没跑。正确姿势：`mobile/` 下直接 `./node_modules/.bin/<bin>`；ratchet 脚本必须在仓库根跑，否则它只打印 `::error::Missing …baseline.txt` 然后 exit 0。
- [发现] **批次计划漏了约 10 个文件**。批次是按 ratchet 清单切的，而清单只收录直接导入 `colors` 的文件；只消费导出样式对象的文件看不见，但把那张表改成工厂就会把它打断。batch 5 撞上 `app/mobile-onboarding.tsx`，已一并改掉；余下 9 个（session-styles、diff-review-screen-styles、3 个 PR 侧栏消费者、2 个文件预览消费者、`MobileSourceControlSegments.tsx`、`TerminalWebView.tsx`）见 `scratchpad/hidden-sheet-consumers.md`。批次 1 其实已经这么处理过 `mounted-bottom-drawer.tsx`，所以错的只是计划文档。`TERMINAL_WEBVIEW_FRAME_STYLES` 需要决策而不是机械转换 —— 终端框跟的是终端主题，不是 app 主题。
- [发现] 两个文件**一行余量都没有**（`TerminalShortcutSettings` 399/400、`CustomKeyModal` 645/645），必须先抽样式表。我没照批次 3 的做法：抽出来的模块**一出生就是主题化的**。纯抽取会造出一个 ratchet 未登记的裸 `colors` 导入者，这正是 `2c5b588f1` 那一刻 ratchet 是红的原因 —— PR head 绿、CI 能过，但那个中间提交对 bisect 不友好。
- [验证] 批次 4、5 的新断言做了**变异验证**：`title.color` 改成 `textSecondary` → `expected '#888888' to be '#e0e0e0'`；`DragReorderList` 里写死 `borderSubtle` → 双调色板测试挂；引导页 `surfaceBright` 改 `textPrimary` → `expected '#e0e0e0' to be '#f5f5f5'`。其中一次变异因正则缩进写错**静默没落到文件上**，重做后才算数。
- [剩余] 批次 6–17（12 批、约 90 文件）未开始。批次 1–5 全部未推送，无 PR。
- [提交] 手机端终端配色 + 浅色模式基础共 **7 个 PR** 全部提交且 `MERGEABLE`：[#10417](https://github.com/stablyai/orca/pull/10417) 主题值门、[#10418](https://github.com/stablyai/orca/pull/10418) 目录搬到 `src/shared`、[#10419](https://github.com/stablyai/orca/pull/10419) headless host 推送主题、[#10420](https://github.com/stablyai/orca/pull/10420) 双槽位选择、[#10421](https://github.com/stablyai/orca/pull/10421) 选择器 UI、[#10422](https://github.com/stablyai/orca/pull/10422) 浅色调色板、[#10423](https://github.com/stablyai/orca/pull/10423) 主题 runtime。前五个已是完整可用功能：30 个内置主题可选、实时生效不重挂 WebView、离线与 headless 均可用。
- [不变量] 全链承诺写进每个 PR 描述：**到最后一个 PR 之前没有任何用户可见变化**，随时可以停在任意 PR 而不留下「半亮」的 app。这是对维护者唯一表态（对 #7820 说「文件太多」）的正面回应。
- [推翻] #7820 声称「终端保持深色是桌面惯例」是**错的**。桌面跑的是双槽位模型（`terminalThemeDark`/`terminalThemeLight`/`terminalUseSeparateLightTheme` 默认 true），app 切浅色时终端换到 light 槽位。已按你的决定照搬。
- [推翻] 内置主题是 **30 个不是 22 个** —— 8 个用不带引号的对象 key，只匹配引号的正则正好漏掉这 8 个。原始调研地图和第一轮对抗评审都断言 22，设计 agent 抓到后评审方撤回了自己的确认。
- [关键] 本地 checkout 停在一个**被上游 revert 的 commit** 上（`8f40ddf32` = #10179，落后 117 个 commit，已被 #10255 撤销），导致地图里的 `terminal-webview-default-theme.ts` 在上游根本不存在。全部工作已重基线到 `origin/main` = `1bd36ce04`，锚点逐条重验，校正表见 `scratchpad/verified-anchors.md`。
- [实测] session 屏只剩 **21 行** max-lines 余量而非地图说的约 315 行。因此终端主题覆盖改接在 `TerminalPaneView.tsx`（301 行余量、且 #7820 没碰），一处改动同时解掉超限风险和碰撞。
- [实测] **oxfmt 一定会打断箭头函数并整体缩进**，用仓库自己的 `.oxfmtrc.json` 在 scratch 副本上验证过，换短函数名也一样。103 个 stylesheet 的「2 行 diff」方案不可达，每个批次 PR 描述必须带 `?w=1`。
- [退回] Grok 按规格书 R11 在 #10423 里加了「host 模式与 app 模式不符时回退默认主题」，被我退回改成纯 passthrough。R11 自己的论证就能反驳它：PR7 里 Appearance 还没露出、`appMode` 恒为 dark，这条分支恰好只在它点名的可见场景触发 —— 浅色桌面用户会**悄悄丢掉**手机端的浅色终端配色。已推迟到露出开关的那个 PR。
- [验证] 栈顶全量：336 文件 / 2444–2445 通过 / 2 跳过 / 0 失败；mobile tsc exit 0、oxlint 无诊断、oxfmt 991 文件合规、max-lines ratchet 通过。桌面侧 62 + 16 通过，`typecheck:tsc:node` 与 `:web` 均 exit 0。两个新测试做了**变异验证**（把生产代码改坏确认测试会挂），不是只看绿。
- [环境] `mobile/node_modules` 是坏的：60 个顶层入口指向昨天清理时删掉的 `.rebase-wt/mobile-device-identity/`，任何移动端测试都跑不起来，构建 agent 绕过去了而没发现。用本地完好的 `.pnpm`（1252 个真实包、5.3G）重指链接修复，零下载零删除。**我第一次修漏了作用域包**（`-maxdepth 1` 没覆盖 `@scope/pkg`），补修 10 个后才真正干净。已记进 auto-memory。
- [坑] fork 上已存在名为 `refactor` 的分支，导致 `refactor/shared-terminal-theme-catalog` 推送时目录/文件冲突，改名为 `bbingz/shared-terminal-theme-catalog`。另有两次推送和一次 `gh pr create` 撞到 GitHub 5xx —— **504 那次其实已经建好了 PR**，重试前必须先查。
- [限制] 七个 PR 全部**没有真机或模拟器验证**。GitHub 显示的 20/25/30/37 文件数含栈内下层 commit，下层合并后会自动缩小。浅色调色板有 9 组配对低于 4.5:1，但每组在深色里都有同等或更差的对应值，非浅色模式引入的回归，且已被对比度测试钉住。
- [剩余] 还有 18 个 PR（PR8–PR25）：17 批 stylesheet 迁移共 156 文件 + 最后 2 文件的开关。batch 1 已本地提交 `20ec6ec77`，2–3 进行中。完整证据见 `CHANGELOG.md`。

### 2026-07-24

- [清理] 内置盘回收 **8.4 GiB**，另有 **3.1 GiB** 迁至外置盘。主仓库 13G → 8.5G，Orca worktree 目录 3.9G → 空，`.git` 2.7G → 264M，`/` 可用 461Gi → 469Gi。
- [清理] 移动端所有 git-ignored 编译产物迁到 `/Volumes/Bing-SSD-5/orca-build/<同相对路径>` 并符号链接回来：`mobile/android/app/build`（2.9G）、`mobile/ios/Pods`（205M）、`android/.gradle`、`android/build`、`ios/build`、`.expo`。迁移前以 `git check-ignore` 把关，tracked 目录会被拒绝。未改仓库任何构建配置，逐条 `mv` 即可还原。**代价：该卷未挂载时移动端构建会失败。**
- [修正] 迁移引入一个副作用：`.gitignore` 的目录式规则（`.expo/`）不匹配符号链接，`mobile/.expo` 冒成未跟踪项。已用 `.git/info/exclude`（本地、不入库）排除，未改仓库 `.gitignore`。
- [清理] `/Users/bing/orca/workspaces/orca` 下 24 个 Orca worktree 全部移除。逐个确认除符号链接 `node_modules` 外均干净；唯一真实残留（`main` 里 4K 的 `.pi/flow.json`）已先备份到 scratchpad。移除 worktree 不删分支，PR 不受影响。
- [清理] 本地分支 225 → 91，删除 134 个。删除集 = 「tip 可被保留 ref 包含的」∪「纯脚手架前缀」，再减去显式保护集：44 个开放 PR head、今天的 10 个备份 ref、`main`、`local/hotfix-1.4.141-groups-server-endpoint`、`fix/orchestration-skill-coverage`，以及所有 feature 形态的名字。**踩到一个坑**：包含性判定把今天的备份 ref 误判为可删（每个都是自身的祖先），已按名字显式保护；删除前与保护集取交集为空。
- [清理] `git reflog expire --expire-unreachable=now --all` + `git gc --prune=now` 才是 `.git` 从 2.7G 塌到 264M 的关键——单跑 `git gc` 只回收 100M，因为 reflog 还钉着已删分支的对象。事后 `git fsck` 干净，10 个备份 ref 全部可解析，9 个已推送 PR tip 全部在位。
- [限制] 4 个开放 PR 的 head 分支本地无副本（`bbingz/fix-grok-encode-cwd-dirname`、`bbingz/keep-serving-on-close`、`fix/8787-windows-setup-wrapper-quotes`、`fix/notes-send-agent-guard-toctou`）。已核实它们既不在删除列表也不在清理前的本地快照里，fork 上四个都在，PR 完好，`git fetch fork <branch>` 即可取回。
- [未做] `node_modules`（根 2.4G + mobile 5.3G）没搬，占了剩余 8.5G 的绝大部分。pnpm store 在 `/Users/bing/Library/pnpm/store/v11`，与仓库**同卷**，靠硬链接共享；单独搬 `node_modules` 会跨卷失效、逐文件复制反而更占空间。唯一合理做法是 store 与 `node_modules` 一起搬到外置盘，但 store 是全局的、影响所有项目，需你点头。
- [追加] 首批完成约半小时后上游又推进 3 个 commit（`d50ea090cf`、`e651fe91c6`、`981653f27d`），把另外两个原本干净的 PR 顶成冲突。首批 7 个复核后不受影响。两个新的先确认无维护者表态（仅 coderabbitai）再投入，已 rebase 到 `981653f27d` 并推送，现均为 `MERGEABLE`。
- [追加] [#9752](https://github.com/stablyai/orca/pull/9752) → `b9ee8d868d`（备份 `7b6fd0b9b4`）。**范围发生实质变化**：上游 #10100 已用 taskkill 落地了本 PR 早期 commit 想做的同一件事，因此那些中间冲突一律按上游结构解，只在其上保留 Job Object 层，PR 缩到 14 文件 +954/-299。已核实核心存活：`CreateJobObjectW`、`AssignProcessToJobObject`、`KILL_ON_JOB_CLOSE`、`useConptyJobObject` 均在分支上且 main 上一个都没有——反证上游选的是 taskkill 而非 Job Object，故不冗余。
- [追加] [#8277](https://github.com/stablyai/orca/pull/8277) → `0cc96efb97`（备份 `3a6c69bbe7`）。把上游 #9342 的 no-mint 守卫与本 PR 的 skip-unchanged 合进同一个 `persistWorktreeSortOrder` helper，避免两个调用点各留一套重叠守卫；`{updated:0}` 提前返回顺带跳过缓存失效与 `reposChanged` 通知。不冗余：没有本 PR，排序没变也照样每轮写 meta + 通知，刷新环依旧。
- [验证] 未采信代理自述：在临时 worktree 里独立复跑 #9752 的 6 个测试文件 235 项，与其报告逐字一致；并核对两分支零冲突标记、commit 数保留、备份 ref 齐全、以及它这次确实按要求把 `rebase-9752` worktree 重置干净、无 `.rebase-wt`/`rebase-tmp` 残留。
- [限制] #9752 的 Job Object 路径在 macOS 上只有 mock 覆盖，未在真实 Windows 主机验证；合并前值得跑一次 Windows。
- [状态] 全量扫描 `bbingz` 在 stablyai/orca 的 84 个 PR：15 已合并、45 开放、24 关闭未合并；开放中 8 个冲突、4 个草稿。移动端 [#10101](https://github.com/stablyai/orca/pull/10101) 与 [#8266](https://github.com/stablyai/orca/pull/8266) 于 07-24 合并。
- [变更] 8 个冲突 PR 已全部清零：7 个 rebase 到 `origin/main` = `cda97cec41` 并 force-push 到 fork，GitHub 侧全部由 `CONFLICTING` 转为 `MERGEABLE`，#9434/#9435 草稿状态保留。新 tip：#9415 `9c8d7c8c6c`、#9434 `190f310cad`、#9435 `55ab9a6e91`、#8467 `a7c3652b9d`、#8293 `9a2ffd508e`、#8063 `0cb2a65a95`、#8295 `788bde29bd`。
- [关闭] [#10013](https://github.com/stablyai/orca/pull/10013) 已关闭。维护者 OrcaWin 明确表态被 #10129 取代——真实成因是陈旧配对桌面 viewer 连发无理由 `session.tabs.close`，本 PR 的孤儿清扫确认门根本拦不到该 RPC 路径。#10129 尚未合并，关闭评论中已声明其有意省略的 kill-attribution 诊断可另开小 PR。
- [核实] 关 PR 前必须先验证是不是真维护者：OrcaWin 经两条独立证据确认（GitHub 计算的 `authorAssociation = COLLABORATOR`；#10129 的 head 分支位于 `stablyai/orca` 仓库内）。`collaborators/*/permission` 接口无 push 权限时返回 403，不可用。
- [边界] 其余 7 个 PR **没有任何维护者表态**——全部 PR 加起来零条人类 `APPROVED`/`CHANGES_REQUESTED`，上游仅存在 `pr-10013-*` 一个接管分支。我方对上游语义重叠的判断只作为解冲突输入，绝不作为关闭依据。
- [关键] #9415/#9434/#9435 是**一条栈**（`main → #9415 → #9434 → #9435`），虽然三者都以 `main` 为 base。#9415 是重定向到 rebase 后的 #9434 基座，不是独立 rebase，否则会重复其 5 个 commit——**推送与 rebase 必须按此顺序**。其 tip 是 brennanb2025 主动推进来帮忙落地的 commit，patch-id `56c37e95c3…` 与原版完全一致，永远不许压扁或回退。
- [让步] #8293 主动放弃「保留上报的 299/10079」，改用上游 #10136 的 300/10080 归一化；buckets 多表、auth 凭据存储、overlay 镜像、base URL 处理保留。#8467 与 #8293 各多 1 个适配上游 API 的 commit（12→13、4→5）。已在 PR 评论中写明，不让 reviewer 从 diff 里猜。
- [验证] 未全盘采信代理报告：独立复跑 #9434 双 typecheck（exit 0、零 `error TS`）与 #9415 聚焦测试（5 文件 388 项通过，与其报告数字逐字一致）；并用 `merge-base --is-ancestor` 验栈、`patch-id --stable` 验 Brennan commit、7 分支冲突标记扫描全为 0。
- [清理] 分支重写使 `/Users/bing/orca/workspaces/orca/rebase-{8063,8467,9415,9434,9435}` 五个既有 worktree 出现约 622 条**虚假**脏条目（HEAD 前跳、文件未动）。重置前先做决定性核验：各 worktree 的索引树与其 rebase 前备份 commit 的树**完全相同**、无 unstaged 改动、唯一未跟踪项是 `node_modules`、且均无 `MERGE_HEAD`（即无进行中的合并），证明不含任何独有内容；随后 `reset --hard HEAD` 并清除死残留 `AUTO_MERGE`，脏条目 624/622 → 1。原内容在 `backup/rebase-20260724/*` 中始终可恢复。
- [遗留] ~~另有 12 个 worktree 仍带惰性 `AUTO_MERGE` 残留文件，只标记未清理。~~ **已被本日稍后的清理取代**：该 12 个连同全部 24 个 Orca worktree 已整体移除，`AUTO_MERGE` 残留随之消失。本条与上一条的 5 个 worktree 重置均属中途状态，现均已不存在。
- [教训] `herdr agent prompt` 在目标 agent 工作中时**只入队不投递**，返回值照样是成功；两条修正因此滞留，导致代理自行跳过 #9415 并给已取消的 #10013 白跑一轮验证。需用 `herdr agent send-keys <name> enter` 逐条冲出。另：zsh 下 `"$br:refs/heads/$br"` 会被 `:r` 参数修饰符吃掉，必须写 `${br}`。
- [风险] 三处语义判断未获上游确认：#8293 的窗口归一化让步、#9434 的双分类器共存、#8295 在新 relay 传输上的重新实现。CI 绿不等于维护者认可。完整命令与证据见 `CHANGELOG.md`。

### 2026-07-23

- [修复] 日文 IME 组合输入已实现为 `f94b83b34a`（分支 `fix/mobile-japanese-ime`），并创建 [PR #10162](https://github.com/stablyai/orca/pull/10162)：iOS/Android 原生 Expo 输入视图只发送已确认文本，隔离 IME 确认与终端 Enter，去重 Android 双来源 Enter，并保留空字段 Backspace。
- [修复] live composition mirror 保持原有韩文行为，同时为日文尾部假名保留 300 ms 修改窗口；促音、浊音、半浊音及分解 modifier 均有回归测试，超时后到达的 modifier 通过 DEL 加修正字形收敛。
- [验证] #10162 通过移动端全量 317 个测试文件（2,315 通过、2 跳过）、两项 TypeScript、全量 oxlint/format、Expo prebuild、三平台 Metro export、Android 完整 debug app 和 iOS 原生模块模拟器构建；Grok 三轮对抗审查修复四类问题后清零，Claude 全量与 exact-head 两道门均为 `NO ACTIONABLE FINDINGS`。
- [状态] #10162 fork head 已回读为 `f94b83b34af5ae0756e6f40c536410a1f3855a7c`，GitHub 当前为 `OPEN`，`Track Community PRs` 已成功。
- [限制] 未在实体日文键盘上验证；Xcode 27 下完整 iOS App 构建在既有 Expo Router iOS 16 `subtitle` API 处失败，但本次原生模块 scheme 已成功。因此 PR 使用 `Addresses #7427`，不宣称关闭问题。
- [新增] 手机终端物理键盘支持已实现为 `1cf9247a17`（分支 `feat/mobile-hardware-keyboard`），并创建 [PR #10148](https://github.com/stablyai/orca/pull/10148)：导航、控制、功能和本地编辑键走既有有序发送路径，IME、AltGr 与 Command/Meta 仍交给系统。
- [验证] #10148 通过 320 个移动端测试文件（2,339 通过、2 跳过）、lint/typecheck/format、max-lines、Android 完整 debug app、iOS 模块及带 iOS 16 override 的完整模拟器 App 构建；Grok 发现的 AltGr 风险已修复，Claude exact-head 终审为 `NO ACTIONABLE FINDINGS`。
- [状态] #10148 当前 `OPEN / MERGEABLE / UNSTABLE`，head `1cf9247a178d622e9efc5a205f984c9afc67df7a`，`Track Community PRs` 成功；尚未做实体 iPad/Magic Keyboard 或 Android 蓝牙键盘验证。
- [新增] iOS 原生触控移动终端光标已实现并提交为 `bebc550b5e`（分支 `feat/mobile-ios-trackpad-cursor`），已创建 [PR #10123](https://github.com/stablyai/orca/pull/10123)：把隐藏 `TextInput` 的 collapsed selection 映射成 PTY 左右方向键，并支持中间插入/删除、UTF-16 安全偏移与 Hangul held syllable。
- [修复] mirror、selection、control、submit 与 external flush 统一进入同一发送队列；旧字段会在排队后同步清空，避免异步响应把随后到达的新 IME 输入擦掉，同时抑制硬件方向键 keypress 与 selection 的双发。
- [验证] #10123 的最终 commit 在最新上游 `main` 基线通过移动端全量 317 个测试文件（2,337 通过、2 跳过）、typecheck、全量 oxlint、949 文件格式检查、max-lines、提交钩子和 diff 检查；Herdr 可见 Claude 窗口按纯逻辑、Hook/队列、全量跨包三轮终审，均为 `NO ACTIONABLE FINDINGS`。
- [状态] #10123 远端 head 已回读为 `bebc550b5e`，当前 `OPEN / MERGEABLE / UNSTABLE`，`Track Community PRs` 检查成功。
- [未验证] 当前没有在线 iOS 真机，也没有生成 `mobile/ios` 工程，因此未跑真机构建/触控手势；RN 配对 selection 标记与受控值清空的极端事件时序仍属设备级残余风险，源码与测试尚无法构造失败。完整命令与证据见 `CHANGELOG.md`。
- [排查] 将移动端贡献排序改为真实使用痛点：手机新建浏览器、手机主题与配色、iOS 原生触控移动终端光标，以及相对 Termius/Moshi 的终端交互差距；不再按桌面功能清单机械补齐。
- [边界] 已有开放或 Draft PR 一律视为官方正在处理并避开：外观模式等待 #7820，桌面窗口关闭/远端继续服务路径不重复 #8300。实时复核纠正旧判断：#9180 做的是浏览器键盘/accessory bar 统一，并未占位原生终端光标移动；它只是会改到相同文件，需要处理 rebase 冲突。
- [决策] 先实现 #8313。当前手机输入由透明的原生 `TextInput` 接管，xterm 持续处于未聚焦状态，而 inactive cursor 被显式设为 `none`，与“能输入但看不到插入点”的现象吻合。
- [范围] #8313 只恢复可见光标；iOS 长按拖动光标会改变 selection、输入所有权和 live mirror 对账，另案设计。Luna 扫描与 Claude/Grok 对抗审查均支持这个拆分与优先级。
- [修复] rebased commit `2c28633662`（分支 `fix/mobile-visible-caret-8313`）将 xterm 的 inactive cursor 改为 `bar`，保持 TUI 主动隐藏光标的 DECTCEM 语义；真实 WebView IIFE 测试逐个验证 desktop、phone-resize、phone-scrollback 三个 replacement surface，并清理跨用例 window listeners；已创建 [PR #10101](https://github.com/stablyai/orca/pull/10101)。
- [验证] 新测试先以实际收到 `cursorInactiveStyle: 'none'` 红灯，再在修复后转绿；最终 rebase 后 mobile 315 个文件、2,292 项通过、2 项跳过，完整 mobile lint/format、typecheck、max-lines、pre-commit hooks 和 diff 检查通过。Claude 首轮 2 个 Low 测试问题已修复，exact-head 终审为 `NO ACTIONABLE FINDINGS`。
- [限制] 本次未在实体 iPhone/iPad 上做视觉 smoke；自动化已证明最终 WebView 将正确选项传给每个 xterm surface。上游 #10006 的两个新锁文件条目尚未跨过本机最小发布时间门槛，因此仅对一次 frozen、ignore-scripts 安装做命令级豁免，未改锁文件或仓库策略。
- [证据] 详细依据、占位 PR 和后续风险见 `CHANGELOG.md` 的 `2026-07-23 / Mobile parity decisions`。

### 2026-07-21

- [变更] 维护 [#9645](https://github.com/stablyai/orca/pull/9645)：对最新上游 `main` 重整后将 fork 分支 `feature/mobile-project-group-sync` 推到 `1fec879d56006783fe9ddeb70695c5e9c4614b8e`，同步更新 PR 描述；移动端新增与桌面一致的 Project 分组，使用 `mobile.project-group-sync.v1` 能力门保护旧 host，并让 `projectGroup.list` 失败时退化为 Ungrouped 而不丢失 `repo.list` 数据。
- [修复] 维护 [#8872](https://github.com/stablyai/orca/pull/8872)：将 fork 分支 `bbingz/fix-remote-mirror-pty-exit` 推到 `bb69fac7757d5e5f4cc8a1288dac727e071db9a2`。`hostCloseReason` 只把 `pty-exit` 送到 host、不会给本地 close reason 打标签，因此 pinned confirmation guard 仍保留；host 仅在真实重发 snapshot 时返回 `snapshotRepublished`，死 leaf 与活 sibling 并存时拒绝关闭但不重发，客户端只允许当前 epoch/version 精确重放一次，避免旧 snapshot 清掉其他 close intent。
- [裁决] 上述 #8872 方案补充并取代 2026-07-16 对“不要直接添加本地 `reason`”的早期处理结论：风险本身仍成立，但已通过 wire-only `hostCloseReason` 隔离，而不是绕过本地 pinned/onCancel 语义；最终独立 spec gate 为 `PASS / APPROVED`。
- [验证] #9645：root 聚焦测试 6 个文件、677 项通过，mobile 14 个文件、105 项通过；#8872：核心 3 个文件、875 项，扩展 12 个文件、976 项，daemon/transport 3 个文件、93 项均通过。两者相关 typecheck、lint、format、max-lines 与 `git diff --check` 均通过。
- [限制] package contract 为 23/24；唯一失败是本机 `node_modules` 缺少可选包 `windows-native-registry`，相关测试、package 与 lockfile 均未被这两个 PR 修改，未把该环境缺口记成代码通过。
- [状态] 2026-07-21 实时复核：#9645 与 #8872 均为 `OPEN / MERGEABLE / UNSTABLE`，没有 hosted checks，也没有正式 review decision。#9645 因权限无法正式 request `AmethystLiang`，已在 [评论](https://github.com/stablyai/orca/pull/9645#issuecomment-5032220242) 中提醒；#8872 已 request `OrcaWin`，并在 [评论](https://github.com/stablyai/orca/pull/8872#issuecomment-5032309257) 中请求 Windows/WSL 重跑。两项均未合并。
- [清理] 任务工作区已回到 `main`，`HEAD == origin/main == 827cd49f410f042ae29ee886538d5aa8cf8c0c46`；停止 #8872 临时 worktree 的两个空终端后移除该 worktree 与临时分支，fork PR 分支仍保全，任务专用 `/tmp/orca-pr-9645*` 与 `/tmp/update-pr-8872*` 文件均不存在。

### 2026-07-14

- [变更] 将 `v1.4.139`（tag target `0ab2e001d`）与仍未合并的 #8294 head `c9080a3ff` 临时集成，使用个人开发团队为 `com.stably.orca.mobile` 构建 `0.0.29 (8294)`，覆盖安装到 `Bing's iPhone A`；未提交、推送或合并源码。
- [验证] #8294 的 3 个聚焦 Vitest 文件 32/32 通过、相关 oxlint 通过；Xcode Release 真机构建、签名核验、`devicectl` 安装与启动均成功，设备最终回报版本 `0.0.29 (8294)`。
- [排查] GitHub 实时复核显示 #8294 与桌面端 #7910 均仍为 `OPEN / UNSTABLE / 未合并`；个人通配开发 profile 不含 `aps-environment`，因此本地包包含 Edit Host，但推送通知可能不可用。全量 mobile TypeScript 仍只命中 `mobile/src/source-control/mobile-pr-create.ts:45` 的 v1.4.139 基线错误。
- [变更] 安装后中止临时合并并恢复 `main` `73d83a9fb`，删除 `mobile/build/`、完整 `mobile/ios/` 生成树和 `/tmp/orca-pr8294-*` 日志；保留本机临时手机数据备份 `/tmp/orca-mobile-backup-20260714-pr8294`。
- [变更] 逐一复核并维护个人 fork 上的 14 个 Orca 贡献 PR；所有远端分支 SHA 已回读匹配，并对官方 `main` 快照 `73d83a9fb` 完成无冲突三方合并检查。
- [修复] #8281 修复 startup draft 在 remount 时丢失所有权；#8300 补全 keep-serving 设置的五语本地化；#8480 在 rebase 后保留统一 hook startup。
- [修复] #8288 撤除不可维持一致性的 writable session bridge 扩展，增加 paginated Codex history 去重、普通 JSONL 换行对齐尾窗和压缩 rollout 定长滚动尾窗，同时保留 #8401 的 retryable `notFound` 与 first-flush 行为。
- [验证] #8288 最终 head `f07fd6f0c` 通过 typecheck、全量 lint、551 项聚焦测试及 29,345 项全仓测试；GitHub 当前为 `OPEN / MERGEABLE / CHANGES_REQUESTED`，等待 reviewer 重审且尚无 CI checks。
- [变更] 清理本机 npm/npx 可再生成缓存，`~/.npm` 从约 1.0 GB 降至 24 KB；未触碰项目 `node_modules` 或 pnpm store。
- [排查] 只读扫描 `/Users/bing/-Code-` 全部 117 个一级项目，识别约 149.1 GiB 可再生成候选；默认保留 `_review`、数据库、快照、反编译/取证材料、`.git` 与 `.codegraph` 等非构建数据。
- [变更] 清理第一批 19 个构建目录：17 个 `AI-Panel/.claude/worktrees/*/target`、`Trading-Copilot/target-shared` 和 `ferrigate/target`；清理前 `du` 合计 `56,262,880 KiB`（约 53.66 GiB），未使用 Orca 空间清理功能，也未触碰第二批内容。
- [验证] 删除前未发现活跃 Cargo/Rustc/Maven/Gradle 编译进程；删除后 19 个目标均不存在且 17 个工作树父目录保留。Time Machine 仍在从删除前快照备份且上述目录未被排除，APFS `df` 可用空间暂未增长；未停止备份或删除本地快照。

#### 全量贡献 PR 台账（GitHub 实时快照）

- 查询条件：`repo:stablyai/orca is:pr author:bbingz`；查询时间：`2026-07-14T01:08:39Z`。
- 总计 56 个：OPEN 35、MERGED 9、CLOSED（未合并）12、Draft 0。
- 时间均为 UTC；head 和 merge commit 使用 9 位短 SHA。状态会漂移，后续处理前需重新查询 GitHub。

##### 已合并（9）

| PR | 标题 | 创建时间 | 合并时间 | Head | Merge commit |
| --- | --- | --- | --- | --- | --- |
| [#8392](https://github.com/stablyai/orca/pull/8392) | fix(grok): prefer auth.x.ai session + mention Grok in OSC52 toast | `2026-07-12T11:41:15Z` | `2026-07-13T04:45:36Z` | `1576e8e21` | `81ed5734d` |
| [#8065](https://github.com/stablyai/orca/pull/8065) | fix(terminal): route Shift+Enter by PTY host | `2026-07-10T08:36:18Z` | `2026-07-13T00:10:26Z` | `a138ef9e1` | `d197c5b86` |
| [#8058](https://github.com/stablyai/orca/pull/8058) | Add Grok orchestration group routing | `2026-07-10T08:24:33Z` | `2026-07-12T04:43:20Z` | `6724bfa3d` | `be258e23e` |
| [#7994](https://github.com/stablyai/orca/pull/7994) | fix(preflight): reject Windows paths from WSL agent lookup | `2026-07-10T01:16:53Z` | `2026-07-12T04:21:18Z` | `1cefda48c` | `1eace14c5` |
| [#7944](https://github.com/stablyai/orca/pull/7944) | fix(grok): clipboard, native chat, hooks, sessions, ConPTY KKP | `2026-07-09T14:14:45Z` | `2026-07-10T20:16:55Z` | `30800987d` | `96d1fa1d6` |
| [#7996](https://github.com/stablyai/orca/pull/7996) | feat(status-bar): Antigravity usage status | `2026-07-10T01:37:39Z` | `2026-07-10T20:11:24Z` | `6becd7488` | `4209889f6` |
| [#7842](https://github.com/stablyai/orca/pull/7842) | fix(quick-open): prune generated dirs in git fallback | `2026-07-08T22:35:58Z` | `2026-07-10T10:06:44Z` | `a2d97de09` | `c5669cceb` |
| [#7876](https://github.com/stablyai/orca/pull/7876) | fix(terminal): make xterm scrollbar gutter transparent | `2026-07-09T02:51:41Z` | `2026-07-10T04:35:02Z` | `c5873e305` | `946eb52e6` |
| [#7867](https://github.com/stablyai/orca/pull/7867) | fix(preflight): resolve WSL/SSH agent paths past shell aliases | `2026-07-09T02:27:42Z` | `2026-07-10T00:08:35Z` | `8fa3e52d5` | `5b1b8cc61` |

##### 仍开放（35）

| PR | 标题 | 创建时间 | 最近更新 | Branch / Head | Review |
| --- | --- | --- | --- | --- | --- |
| [#8631](https://github.com/stablyai/orca/pull/8631) | test(agent-hooks): isolate managed hook user data | `2026-07-14T00:44:30Z` | `2026-07-14T00:44:37Z` | `fix/codex-hook-test-runtime-isolation` / `edc3abba0` | — |
| [#8551](https://github.com/stablyai/orca/pull/8551) | test(terminal): make PTY lifecycle cases deterministic | `2026-07-13T11:08:56Z` | `2026-07-13T16:47:05Z` | `fix/process-exit-poll-jitter` / `412145e76` | — |
| [#8480](https://github.com/stablyai/orca/pull/8480) | fix(runtime): preserve terminals during headless desktop activation | `2026-07-13T04:56:43Z` | `2026-07-14T00:38:36Z` | `fix/headless-serve-gui-activation` / `18eaace71` | — |
| [#8467](https://github.com/stablyai/orca/pull/8467) | fix(resource-manager): protect live unbound terminal sessions | `2026-07-13T03:43:05Z` | `2026-07-13T16:47:20Z` | `fix/resource-manager-orphan-safety` / `c707d2b2a` | — |
| [#8391](https://github.com/stablyai/orca/pull/8391) | fix(preflight): do not pin empty WSL/local agent detection (#8366) | `2026-07-12T11:40:07Z` | `2026-07-14T00:38:38Z` | `fix/wsl-agent-detect-nonsticky-empty` / `d869edb17` | — |
| [#8325](https://github.com/stablyai/orca/pull/8325) | fix(windows): keep workspace selection and surface in sync | `2026-07-11T22:56:34Z` | `2026-07-13T10:40:45Z` | `fix/windows-stale-workspace-surface` / `1210a63d6` | — |
| [#8300](https://github.com/stablyai/orca/pull/8300) | feat: keep serving remote clients when the main window closes (keepServingOnClose) | `2026-07-11T16:09:58Z` | `2026-07-14T00:40:57Z` | `bbingz/keep-serving-on-close` / `208fddcf3` | — |
| [#8296](https://github.com/stablyai/orca/pull/8296) | fix(mobile): adopt the iOS scene lifecycle | `2026-07-11T14:36:23Z` | `2026-07-14T00:38:29Z` | `bbingz/mobile-ios-scene-lifecycle` / `1fb3aaf78` | — |
| [#8295](https://github.com/stablyai/orca/pull/8295) | feat(mobile): report paired device identity | `2026-07-11T14:29:14Z` | `2026-07-14T00:41:19Z` | `bbingz/mobile-device-identity` / `29c36cdba` | — |
| [#8294](https://github.com/stablyai/orca/pull/8294) | feat(mobile): edit saved host endpoints | `2026-07-11T14:29:11Z` | `2026-07-14T00:41:50Z` | `bbingz/mobile-host-endpoint-edit` / `c9080a3ff` | — |
| [#8293](https://github.com/stablyai/orca/pull/8293) | fix(codex): align auth config and rate limits | `2026-07-11T14:26:21Z` | `2026-07-14T00:38:21Z` | `bbingz/split-7950-auth-rate-limits` / `7e78a5074` | — |
| [#8292](https://github.com/stablyai/orca/pull/8292) | fix(codex): preserve hook-driven agent status | `2026-07-11T14:26:19Z` | `2026-07-14T00:38:18Z` | `bbingz/split-7950-hooks-status` / `67110027b` | — |
| [#8288](https://github.com/stablyai/orca/pull/8288) | fix(codex): recover and read bridged sessions safely | `2026-07-11T13:46:45Z` | `2026-07-14T00:58:13Z` | `bbingz/split-7950-sessions-native-chat` / `f07fd6f0c` | CHANGES_REQUESTED |
| [#8284](https://github.com/stablyai/orca/pull/8284) | fix(windows): serialize worktree terminal teardown | `2026-07-11T13:29:35Z` | `2026-07-14T00:29:04Z` | `fix/windows-terminal-daemon-worktree-removal` / `5e140c5ac` | APPROVED |
| [#8281](https://github.com/stablyai/orca/pull/8281) | fix(agents): recover Codex startup draft delivery | `2026-07-11T13:09:33Z` | `2026-07-14T00:41:57Z` | `bbingz/split-7950-startup-drafts` / `606dbc0c4` | — |
| [#8277](https://github.com/stablyai/orca/pull/8277) | fix(workspaces): stop unchanged smart-sort refresh loops | `2026-07-11T12:43:55Z` | `2026-07-13T10:38:26Z` | `fix/remote-host-smart-sort-loop` / `0990010e9` | — |
| [#8274](https://github.com/stablyai/orca/pull/8274) | fix(codex): preserve WSL hook trust across launches | `2026-07-11T12:27:06Z` | `2026-07-13T10:36:16Z` | `fix/wsl-codex-hook-trust` / `8244ecd69` | — |
| [#8266](https://github.com/stablyai/orca/pull/8266) | fix(windows): detect Cursor Agent Node wrapper | `2026-07-11T10:14:46Z` | `2026-07-13T10:40:50Z` | `fix/windows-cursor-agent-detection` / `54ebfd0a1` | — |
| [#8255](https://github.com/stablyai/orca/pull/8255) | fix(remote): recover terminals after transport interruption | `2026-07-11T08:57:53Z` | `2026-07-13T11:25:17Z` | `bbingz/fix-remote-runtime-recovery` / `5b5a48b17` | — |
| [#8254](https://github.com/stablyai/orca/pull/8254) | fix(remote): preserve structured terminal stream failures | `2026-07-11T08:57:27Z` | `2026-07-13T11:25:23Z` | `bbingz/fix-remote-runtime-stream-close` / `f68be3754` | — |
| [#8253](https://github.com/stablyai/orca/pull/8253) | fix(remote): harden runtime liveness and shared-control recovery | `2026-07-11T08:56:42Z` | `2026-07-13T11:25:13Z` | `bbingz/fix-remote-runtime-transport-foundations` / `1efbdef25` | — |
| [#8188](https://github.com/stablyai/orca/pull/8188) | fix(settings): show a way back to local accounts when a remote server owns provider-account scope | `2026-07-11T00:23:42Z` | `2026-07-13T10:44:50Z` | `bbingz/accounts-pane-remote-scope-affordance` / `d802a0eea` | — |
| [#8124](https://github.com/stablyai/orca/pull/8124) | fix(agent-status): prevent pending status replay after teardown | `2026-07-10T15:40:09Z` | `2026-07-13T10:44:51Z` | `fix/agent-status-pending-reentry` / `3115913d2` | — |
| [#8072](https://github.com/stablyai/orca/pull/8072) | fix(runtime): republish projects after renderer reload | `2026-07-10T08:55:15Z` | `2026-07-13T11:09:57Z` | `fix/remote-projects-after-renderer-reload` / `2a7686c2a` | — |
| [#8064](https://github.com/stablyai/orca/pull/8064) | fix(status-bar): show usage after mid-session installs | `2026-07-10T08:36:02Z` | `2026-07-13T10:44:54Z` | `fix/status-bar-live-agent-usage` / `03b13a4c3` | — |
| [#8063](https://github.com/stablyai/orca/pull/8063) | fix(terminals): remap stale worktree ids on restore | `2026-07-10T08:35:44Z` | `2026-07-13T10:44:56Z` | `fix/reattach-remap-stale-worktree-id` / `d883baa4d` | — |
| [#8057](https://github.com/stablyai/orca/pull/8057) | Deliver replyable orchestration messages to background PTYs | `2026-07-10T08:24:33Z` | `2026-07-13T10:35:15Z` | `bbingz/fix-replyable-agent-review-routing` / `a55a2d35f` | — |
| [#8047](https://github.com/stablyai/orca/pull/8047) | fix(rate-limits): authenticate OpenCode Go through a session cookie jar | `2026-07-10T07:55:36Z` | `2026-07-13T10:44:57Z` | `fix/opencode-go-windows-session-cookie` / `2d85ed6f0` | — |
| [#7942](https://github.com/stablyai/orca/pull/7942) | fix(repo-icon): detect Tauri, WebP, and SVG icons | `2026-07-09T13:47:22Z` | `2026-07-14T00:38:01Z` | `fix/7902-repo-icon-detection` / `0099afdf9` | — |
| [#7939](https://github.com/stablyai/orca/pull/7939) | feat(terminal): make minimum contrast ratio configurable | `2026-07-09T13:14:41Z` | `2026-07-14T00:37:59Z` | `fix/7934-minimum-contrast-ratio` / `b790abda6` | — |
| [#7937](https://github.com/stablyai/orca/pull/7937) | fix(notes-send): tolerate transient agent-status gaps in send guard | `2026-07-09T12:42:51Z` | `2026-07-13T11:25:20Z` | `fix/notes-send-agent-guard-toctou` / `85e1b904a` | — |
| [#7910](https://github.com/stablyai/orca/pull/7910) | feat(runtime): show and edit Remote Orca Server connection details | `2026-07-09T07:55:43Z` | `2026-07-14T00:38:05Z` | `feat/remote-orca-server-edit` / `d2cd23a36` | — |
| [#7883](https://github.com/stablyai/orca/pull/7883) | fix(kimi): refresh expired usage tokens | `2026-07-09T03:46:25Z` | `2026-07-13T11:39:23Z` | `fix/kimi-usage-refresh` / `18a862e82` | — |
| [#7840](https://github.com/stablyai/orca/pull/7840) | fix(space): stream workspace space scans | `2026-07-08T22:22:37Z` | `2026-07-13T10:39:49Z` | `fix/space-stream-scans` / `f2b75e997` | — |
| [#7817](https://github.com/stablyai/orca/pull/7817) | fix(pi): respect per-agent disabled state when installing status hook extensions | `2026-07-08T14:33:32Z` | `2026-07-14T00:37:52Z` | `fix/pi-disabled-extensions` / `8037d9258` | — |

##### 已关闭、未合并（12）

| PR | 标题 | 创建时间 | 关闭时间 | Branch / Head |
| --- | --- | --- | --- | --- |
| [#8552](https://github.com/stablyai/orca/pull/8552) | test(terminal): dispose foreground trackers between cases | `2026-07-13T11:13:28Z` | `2026-07-13T11:15:51Z` | `test/dispose-pane-foreground-trackers` / `f36c36f06` |
| [#8390](https://github.com/stablyai/orca/pull/8390) | test(codex): validate guarded POSIX hook launchers | `2026-07-12T11:22:10Z` | `2026-07-13T11:06:27Z` | `fix/codex-hooks-argv-safe-posix` / `305bf6b8e` |
| [#8386](https://github.com/stablyai/orca/pull/8386) | fix(terminal): stop leaking Shift+Enter CSI-u without Kitty handshake | `2026-07-12T10:24:30Z` | `2026-07-12T22:09:42Z` | `fix/grok-shift-enter-csi-u-leak` / `716905270` |
| [#7838](https://github.com/stablyai/orca/pull/7838) | fix(agents): keep Pi status through session_shutdown; open browser in Agents View | `2026-07-08T22:07:24Z` | `2026-07-12T05:12:01Z` | `fix/7791-7813-pi-status-agents-browser` / `ba2ad6fe6` |
| [#8285](https://github.com/stablyai/orca/pull/8285) | fix(runtime): stop remote sort-order refresh loops | `2026-07-11T13:31:28Z` | `2026-07-12T01:06:05Z` | `bbingz/fix-8272-remote-host-refresh-loop` / `796ba4d69` |
| [#7949](https://github.com/stablyai/orca/pull/7949) | feat(mobile): edit host address, report device model, fix iOS 27 launch | `2026-07-09T15:56:37Z` | `2026-07-11T14:39:41Z` | `feat/mobile-edit-host-and-device-identity` / `1487fc914` |
| [#7950](https://github.com/stablyai/orca/pull/7950) | fix(codex): improve CLI compatibility across hooks, sessions, and launch | `2026-07-09T16:07:57Z` | `2026-07-11T14:39:05Z` | `fix/codex-cli-compat` / `2c89b7a32` |
| [#7854](https://github.com/stablyai/orca/pull/7854) | fix(terminal): arbitrate multi-desktop PTY size ownership | `2026-07-09T00:44:42Z` | `2026-07-11T08:53:04Z` | `fix/desktop-pty-size-arbitration` / `d26343e87` |
| [#7841](https://github.com/stablyai/orca/pull/7841) | fix(terminal): drop orphaned XTVERSION bodies; set TERM_PROGRAM on remote PTYs | `2026-07-08T22:26:46Z` | `2026-07-10T20:17:18Z` | `fix/7839-remote-xtversion-reply-leak` / `aa27ee668` |
| [#7901](https://github.com/stablyai/orca/pull/7901) | Add Grok usage status and managed accounts | `2026-07-09T06:51:05Z` | `2026-07-10T01:37:55Z` | `fix/grok-usage-status` / `61bb1fff1` |
| [#7878](https://github.com/stablyai/orca/pull/7878) | fix(status-bar): keep Antigravity usage visible | `2026-07-09T03:18:09Z` | `2026-07-10T01:37:49Z` | `fix/antigravity-usage-status` / `444c365d4` |
| [#7872](https://github.com/stablyai/orca/pull/7872) | fix(git): do not wake WSL for host-missing glab auth probes | `2026-07-09T02:39:05Z` | `2026-07-09T02:42:17Z` | `fix/no-wsl-glab-auth-probe` / `e2ba63f8c` |


##### 关闭与替代过程（GitHub 明确证据）

| 原 PR | 关闭原因 / 后续去向 | 证据 |
| --- | --- | --- |
| #8552 | 两项 PTY 测试生命周期修复合并到仍开放的 #8551，避免冲突和重复 review。 | [关闭说明](https://github.com/stablyai/orca/pull/8552#issuecomment-4957356892) |
| #8390 | exact-head 审计推翻原始根因；直接 launcher 会重新引入 exit-127/Broken-pipe 且不能支持带空格路径，因此恢复安全行为后主动关闭。 | [关闭说明](https://github.com/stablyai/orca/pull/8390#issuecomment-4957280066) |
| #8386 | 被已合并的 #8427 替代；后者保留 live Kitty-state gate，并避免更宽改动对 Ctrl+Enter 与 Windows Grok 路径的回归。 | [维护者说明](https://github.com/stablyai/orca/pull/8386#issuecomment-4952965656) |
| #7838 | #7791 部分被已合并的 #8355 替代；剩余 #7813 browser 改动要求改为独立聚焦 PR。 | [维护者说明](https://github.com/stablyai/orca/pull/7838#issuecomment-4950051399) |
| #8285 | 被 #8277 替代；两个独有 IPC/runtime integration tests 已移植到 #8277，避免保留重复实现和设计文档。 | [关闭说明](https://github.com/stablyai/orca/pull/8285#issuecomment-4949420278) |
| #7949 | umbrella PR 拆为 #8294（host endpoint）、#8295（device identity）、#8296（iOS scene lifecycle）三个可独立审查/回滚的 PR。 | [关闭说明](https://github.com/stablyai/orca/pull/7949#issuecomment-4946876456) |
| #7950 | umbrella PR 拆为 #8292（hooks/status）、#8281（startup drafts）、#8293（auth/rate limits）、#8288（sessions/native chat）四个聚焦 PR。 | [关闭说明](https://github.com/stablyai/orca/pull/7950#issuecomment-4946871893) |
| #7854 | 被 #8252 替代；后者吸收 ownership arbitration 要点并整合 #7825 与当时主线。 | [维护者说明](https://github.com/stablyai/orca/pull/7854#issuecomment-4944097136) |
| #7841 | 被后来已合并的 #7944 替代；#7944 纳入 XTVERSION/remote terminal 修复及相关 Grok compatibility 回归覆盖。 | [维护者说明](https://github.com/stablyai/orca/pull/7841#issuecomment-4939206230) |
| #7901 | 与 #7878 合并为 replacement PR #7996；#7996 后续已合并。 | [关闭说明](https://github.com/stablyai/orca/pull/7901#issuecomment-4931175816) |
| #7878 | 与 #7901 合并为 replacement PR #7996；#7996 后续已合并。 | [关闭说明](https://github.com/stablyai/orca/pull/7878#issuecomment-4931175407) |
| #7872 | 与更早针对同一 #7536 问题的 #7580 重复，因此主动关闭并转为协助 review/test。 | [关闭说明](https://github.com/stablyai/orca/pull/7872#issuecomment-4921075645) |
