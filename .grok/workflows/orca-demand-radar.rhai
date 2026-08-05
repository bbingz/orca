// orca-demand-radar — FULL issue clustering + X latent demand + SQLite durable store
//
// Fixes v1 truncation: inventory goes to disk/SQLite; shards cover ALL issues
// (default 8 shards × ~50 issues). Results dedup into SQLite for multi-agent exchange.
//
// CLI: tools/orca-demand-radar/demand_db.py
// DB:  ~/.grok/data/orca-demand-radar.sqlite
//
// HARD RULES:
// - Do NOT post to X, GitHub, or open PRs/issues.
// - Prefer evidence (issue numbers, post URLs, multi-author counts).

let meta = #{
    name: "orca-demand-radar",
    description: "Full-shard cluster Orca enhancement issues + X latent demand; durable SQLite for dedup and multi-agent exchange.",
    when_to_use: "Product discovery with durable demand DB: full issue themes, social latent demand, exportable for other agents.",
    phases: [
        #{ title: "Init", detail: "SQLite init + begin-run" },
        #{ title: "Inventory", detail: "gh full enhancement dump → upsert issues" },
        #{ title: "Shard", detail: "write-shards covering all loaded issues" },
        #{ title: "Cluster", detail: "parallel full-shard clustering" },
        #{ title: "Merge", detail: "merge themes + rank demand" },
        #{ title: "IngestThemes", detail: "dedup themes into SQLite" },
        #{ title: "HarvestX", detail: "parallel X feature-demand slices" },
        #{ title: "Crosswalk", detail: "match X to themes / mark latent" },
        #{ title: "IngestSocial", detail: "posts + matched + latent → SQLite" },
        #{ title: "Report", detail: "markdown + finish-run + stats" },
    ],
};

// ---------- schemas ----------

let run_id_schema = #{
    "type": "object",
    "required": ["ok", "run_id", "notes"],
    "properties": #{
        "ok": #{ "type": "boolean" },
        "run_id": #{ "type": "integer" },
        "notes": #{ "type": "string" },
        "db": #{ "type": "string" },
    },
};

let inventory_schema = #{
    "type": "object",
    "required": ["ok", "issue_count", "inventory_path", "notes"],
    "properties": #{
        "ok": #{ "type": "boolean" },
        "issue_count": #{ "type": "integer" },
        "inventory_path": #{ "type": "string" },
        "upsert_inserted": #{ "type": "integer" },
        "upsert_updated": #{ "type": "integer" },
        "upsert_unchanged": #{ "type": "integer" },
        "notes": #{ "type": "string" },
    },
};

let shard_plan_schema = #{
    "type": "object",
    "required": ["ok", "issue_count", "shard_count", "manifest", "shards"],
    "properties": #{
        "ok": #{ "type": "boolean" },
        "issue_count": #{ "type": "integer" },
        "shard_count": #{ "type": "integer" },
        "manifest": #{ "type": "string" },
        "out_dir": #{ "type": "string" },
        "notes": #{ "type": "string" },
        "shards": #{
            "type": "array",
            "maxItems": 16,
            "items": #{
                "type": "object",
                "required": ["shard", "path", "out_path", "issue_count"],
                "properties": #{
                    "shard": #{ "type": "string" },
                    "path": #{ "type": "string" },
                    "out_path": #{ "type": "string" },
                    "issue_count": #{ "type": "integer" },
                    "index": #{ "type": "integer" },
                },
            },
        },
    },
};

let shard_cluster_schema = #{
    "type": "object",
    "required": ["shard", "cluster_count", "out_path", "clusters"],
    "properties": #{
        "shard": #{ "type": "string" },
        "cluster_count": #{ "type": "integer" },
        "out_path": #{ "type": "string" },
        "notes": #{ "type": "string" },
        "clusters": #{
            "type": "array",
            "maxItems": 16,
            "items": #{
                "type": "object",
                "required": [
                    "theme_id", "title", "surface", "user_job",
                    "summary", "issue_numbers", "demand_score", "evidence"
                ],
                "properties": #{
                    "theme_id": #{ "type": "string" },
                    "title": #{ "type": "string" },
                    "surface": #{ "type": "string" },
                    "user_job": #{ "type": "string" },
                    "summary": #{ "type": "string" },
                    "issue_numbers": #{
                        "type": "array",
                        "maxItems": 80,
                        "items": #{ "type": "integer" },
                    },
                    "demand_score": #{ "type": "number" },
                    "evidence": #{ "type": "string" },
                    "example_titles": #{
                        "type": "array",
                        "maxItems": 8,
                        "items": #{ "type": "string" },
                    },
                },
            },
        },
    },
};

let merge_schema = #{
    "type": "object",
    "required": ["clusters", "orphan_issues", "out_path", "notes"],
    "properties": #{
        "notes": #{ "type": "string" },
        "out_path": #{ "type": "string" },
        "orphan_issues": #{
            "type": "array",
            "maxItems": 80,
            "items": #{ "type": "integer" },
        },
        "coverage_pct": #{ "type": "number" },
        "clusters": #{
            "type": "array",
            "maxItems": 40,
            "items": #{
                "type": "object",
                "required": [
                    "rank", "theme_id", "title", "surface", "user_job",
                    "summary", "issue_numbers", "issue_count",
                    "demand_score", "why_real_need", "priority_hint"
                ],
                "properties": #{
                    "rank": #{ "type": "integer" },
                    "theme_id": #{ "type": "string" },
                    "title": #{ "type": "string" },
                    "surface": #{ "type": "string" },
                    "user_job": #{ "type": "string" },
                    "summary": #{ "type": "string" },
                    "issue_numbers": #{
                        "type": "array",
                        "maxItems": 120,
                        "items": #{ "type": "integer" },
                    },
                    "issue_count": #{ "type": "integer" },
                    "demand_score": #{ "type": "number" },
                    "why_real_need": #{ "type": "string" },
                    "priority_hint": #{ "type": "string" },
                    "example_titles": #{
                        "type": "array",
                        "maxItems": 10,
                        "items": #{ "type": "string" },
                    },
                },
            },
        },
    },
};

let ingest_schema = #{
    "type": "object",
    "required": ["ok", "notes"],
    "properties": #{
        "ok": #{ "type": "boolean" },
        "notes": #{ "type": "string" },
        "theme_new": #{ "type": "integer" },
        "theme_updated": #{ "type": "integer" },
        "post_new": #{ "type": "integer" },
        "post_updated": #{ "type": "integer" },
        "latent_new": #{ "type": "integer" },
        "latent_updated": #{ "type": "integer" },
        "matched_rows": #{ "type": "integer" },
    },
};

let harvest_schema = #{
    "type": "object",
    "required": ["slice", "posts", "notes"],
    "properties": #{
        "slice": #{ "type": "string" },
        "notes": #{ "type": "string" },
        "posts": #{
            "type": "array",
            "maxItems": 30,
            "items": #{
                "type": "object",
                "required": ["post_id", "author", "text", "url"],
                "properties": #{
                    "post_id": #{ "type": "string" },
                    "author": #{ "type": "string" },
                    "text": #{ "type": "string" },
                    "url": #{ "type": "string" },
                    "posted_at": #{ "type": "string" },
                    "engagement": #{ "type": "integer" },
                    "why_relevant": #{ "type": "string" },
                    "demand_kind": #{ "type": "string" },
                },
            },
        },
    },
};

let crosswalk_schema = #{
    "type": "object",
    "required": ["matched", "latent", "matched_path", "latent_path", "notes"],
    "properties": #{
        "notes": #{ "type": "string" },
        "matched_path": #{ "type": "string" },
        "latent_path": #{ "type": "string" },
        "matched": #{
            "type": "array",
            "maxItems": 25,
            "items": #{
                "type": "object",
                "required": [
                    "theme_id", "title", "x_support", "issue_support",
                    "priority_boost", "evidence"
                ],
                "properties": #{
                    "theme_id": #{ "type": "string" },
                    "title": #{ "type": "string" },
                    "x_support": #{ "type": "string" },
                    "issue_support": #{ "type": "string" },
                    "priority_boost": #{ "type": "string" },
                    "evidence": #{ "type": "string" },
                    "sample_urls": #{
                        "type": "array",
                        "maxItems": 8,
                        "items": #{ "type": "string" },
                    },
                },
            },
        },
        "latent": #{
            "type": "array",
            "maxItems": 20,
            "items": #{
                "type": "object",
                "required": [
                    "title", "surface", "user_job", "summary",
                    "confidence", "why_unfiled", "evidence"
                ],
                "properties": #{
                    "title": #{ "type": "string" },
                    "surface": #{ "type": "string" },
                    "user_job": #{ "type": "string" },
                    "summary": #{ "type": "string" },
                    "confidence": #{ "type": "number" },
                    "why_unfiled": #{ "type": "string" },
                    "evidence": #{ "type": "string" },
                    "sample_urls": #{
                        "type": "array",
                        "maxItems": 8,
                        "items": #{ "type": "string" },
                    },
                    "suggested_issue_title": #{ "type": "string" },
                },
            },
        },
    },
};

let report_schema = #{
    "type": "object",
    "required": ["ok", "report_path", "summary"],
    "properties": #{
        "ok": #{ "type": "boolean" },
        "report_path": #{ "type": "string" },
        "summary": #{ "type": "string" },
        "db_stats_path": #{ "type": "string" },
        "top_themes": #{
            "type": "array",
            "maxItems": 12,
            "items": #{ "type": "string" },
        },
        "top_latent": #{
            "type": "array",
            "maxItems": 12,
            "items": #{ "type": "string" },
        },
    },
};

// ---------- args ----------
// repo, max_issues (≤1024), max_clusters, shards (2–12, default 8)
// hours, mode: full|issues-only|x-only, focus, db_path, tools_root
// only_changed: if true, prefer issues changed this run for shards (still falls back)
// skip_x: bool, write_repo_copy: bool

let repo = "stablyai/orca";
let max_issues = 1024;
let max_clusters = 24;
let shards = 8;
let hours = 336;
let mode = "full";
let focus = "all";
let write_repo_copy = false;
let only_changed = false;
let since_date = "";
let db_path = "/Users/bing/.grok/data/orca-demand-radar.sqlite";
let tools_root = "/Users/bing/-Code-/orca/tools/orca-demand-radar";
let work_dir = "/tmp/orca-demand-radar-work";

if args != () {
    if args.repo != () { repo = args.repo; }
    if args.max_issues != () { max_issues = args.max_issues; }
    if args.max_clusters != () { max_clusters = args.max_clusters; }
    if args.shards != () { shards = args.shards; }
    if args.hours != () { hours = args.hours; }
    if args.mode != () { mode = args.mode; }
    if args.focus != () { focus = args.focus; }
    if args.write_repo_copy != () { write_repo_copy = args.write_repo_copy; }
    if args.only_changed != () { only_changed = args.only_changed; }
    if args.since_date != () { since_date = args.since_date; }
    if args.db_path != () { db_path = args.db_path; }
    if args.tools_root != () { tools_root = args.tools_root; }
    if args.work_dir != () { work_dir = args.work_dir; }
}

if max_issues < 40 { max_issues = 40; }
if max_issues > 1024 { max_issues = 1024; }
if max_clusters < 8 { max_clusters = 8; }
if max_clusters > 40 { max_clusters = 40; }
if shards < 2 { shards = 2; }
if shards > 12 { shards = 12; }
if hours < 24 { hours = 24; }
if hours > 2160 { hours = 2160; }
if mode != "full" && mode != "issues-only" && mode != "x-only" {
    mode = "full";
}

let demand_py = tools_root + "/demand_db.py";
let do_issues = mode == "full" || mode == "issues-only";
let do_x = mode == "full" || mode == "x-only";

log("orca-demand-radar v2 FULL shards repo=" + repo
    + " max_issues=" + max_issues.to_string()
    + " shards=" + shards.to_string()
    + " max_clusters=" + max_clusters.to_string()
    + " hours=" + hours.to_string()
    + " mode=" + mode + " focus=" + focus);
log("db=" + db_path);
log("POLICY: discovery only — no posts to X/GitHub");

// ============================================================
// Phase 1 — Init DB + begin run
// ============================================================
phase("Init");

let init_p = "";
init_p += "Initialize orca-demand-radar SQLite and open a run row.\n";
init_p += "HARD: local only. No network posts.\n";
init_p += "DB: " + db_path + "\n";
init_p += "CLI: python3 " + demand_py + "\n\n";
init_p += "Run exactly:\n";
init_p += "1) mkdir -p " + work_dir + "\n";
init_p += "2) python3 " + demand_py + " --db " + db_path + " init\n";
init_p += "3) python3 " + demand_py + " --db " + db_path
    + " begin-run --repo " + repo + " --mode " + mode
    + " --args-json '{\"max_issues\":" + max_issues.to_string()
    + ",\"shards\":" + shards.to_string()
    + ",\"max_clusters\":" + max_clusters.to_string()
    + ",\"hours\":" + hours.to_string()
    + ",\"focus\":\"" + focus + "\"}'\n";
init_p += "4) Parse begin-run JSON for integer run_id. NEVER invent run_id.\n";
init_p += "Return {ok:true, run_id:<int>, db, notes}. On failure ok=false run_id=0.\n";

let init_r = agent(init_p, #{
    label: "init-db",
    capability_mode: "execute",
    output_schema: run_id_schema,
});

let run_id = 0;
if init_r != () && init_r.success && init_r.output != () && init_r.output.run_id != () {
    run_id = init_r.output.run_id;
}
if run_id <= 0 {
    pause("infra", "Could not obtain SQLite run_id. Check demand_db.py / db path, then resume.");
}
log("run_id=" + run_id.to_string());

let inventory_path = work_dir + "/run" + run_id.to_string() + "-inventory.json";
let themes_path = work_dir + "/run" + run_id.to_string() + "-themes.json";
let posts_path = work_dir + "/run" + run_id.to_string() + "-posts.json";
let matched_path = work_dir + "/run" + run_id.to_string() + "-matched.json";
let latent_path = work_dir + "/run" + run_id.to_string() + "-latent.json";
let report_path = work_dir + "/run" + run_id.to_string() + "-report.md";
let shard_out_dir = work_dir + "/shards-run" + run_id.to_string();

// ============================================================
// Phase 2 — Inventory (FULL dump to file + upsert)
// ============================================================
phase("Inventory");

let issue_count = 0;
let inventory_notes = "";

if do_issues {
    let inv = "";
    inv += "FULL inventory of open feature issues for " + repo + " into a JSON file + SQLite.\n";
    inv += "HARD RULES: read-only on GitHub (gh list only). Do NOT comment/label/create issues.\n";
    inv += "Cap: " + max_issues.to_string() + " (load ALL open enhancements up to cap — do NOT keep only top-10).\n";
    inv += "DB: " + db_path + "  run_id: " + run_id.to_string() + "\n";
    inv += "inventory_path: " + inventory_path + "\n";
    inv += "CLI: python3 " + demand_py + "\n\n";
    inv += "Steps:\n";
    inv += "1) Page ALL open issues with label enhancement:\n";
    inv += "   gh issue list --repo " + repo + " --label enhancement --state open --limit 100 \\\n";
    inv += "     --json number,title,labels,comments,createdAt,updatedAt,body,url,reactionGroups\n";
    inv += "   Continue until exhausted or cap. Also list --label 'collecting upvote'.\n";
    inv += "2) Normalize each issue to:\n";
    inv += "   number,title,labels[name],comments,reactions(sum THUMBS_UP/HEART/ROCKET/HOORAY),\n";
    inv += "   created_at,updated_at,url,body_snippet(first ~280 chars).\n";
    inv += "3) Dedup by number. Prefer higher comments+reactions when over cap.\n";
    inv += "4) Write {ok,repo,issue_count,issues:[...],notes} to " + inventory_path + "\n";
    inv += "   MUST include every loaded issue in the file (hundreds OK). Do not truncate the file to 10.\n";
    inv += "5) python3 " + demand_py + " --db " + db_path
        + " upsert-issues --run-id " + run_id.to_string()
        + " --repo " + repo + " --json-file " + inventory_path + "\n";
    inv += "6) Return ONLY summary: {ok, issue_count, inventory_path, upsert_*, notes}.\n";
    inv += "   Do NOT embed the full issues array in your tool return schema payload beyond what's required — the file is source of truth.\n";

    let inv_r = agent(inv, #{
        label: "inventory-gh",
        capability_mode: "execute",
        output_schema: inventory_schema,
    });

    if inv_r != () && inv_r.success && inv_r.output != () {
        if inv_r.output.issue_count != () { issue_count = inv_r.output.issue_count; }
        if inv_r.output.inventory_path != () && inv_r.output.inventory_path != "" {
            inventory_path = inv_r.output.inventory_path;
        }
        if inv_r.output.notes != () { inventory_notes = inv_r.output.notes; }
        if inv_r.output.ok != true {
            log("inventory ok=false: " + inventory_notes);
        }
    }

    if issue_count <= 0 && mode == "issues-only" {
        let empty_md = "# Orca Demand Radar — empty inventory\n\n" + inventory_notes + "\n";
        let ep = write_scratch_file("orca-demand-radar-report.md", empty_md);
        agent("python3 " + demand_py + " --db " + db_path
            + " finish-run --run-id " + run_id.to_string()
            + " --summary 'empty inventory'", #{
            label: "finish-empty",
            capability_mode: "execute",
        });
        complete(#{ path: ep, summary: "empty inventory", run_id: run_id, issue_count: 0 });
    }
    log("Inventory issue_count=" + issue_count.to_string() + " path=" + inventory_path);
} else {
    log("Skipping inventory (mode=" + mode + ")");
}

// ============================================================
// Phase 3 — Write shards covering ALL issues in DB
// ============================================================
phase("Shard");

let shard_list = [];
let sharded_issue_count = 0;
let manifest_path = "";

if do_issues {
    let sp = "";
    sp += "Write clustering shards from SQLite covering up to " + max_issues.to_string() + " issues.\n";
    sp += "HARD: local only.\n";
    sp += "Run:\n";
    sp += "mkdir -p " + shard_out_dir + "\n";
    sp += "python3 " + demand_py + " --db " + db_path
        + " write-shards --run-id " + run_id.to_string()
        + " --repo " + repo
        + " --shards " + shards.to_string()
        + " --out-dir " + shard_out_dir
        + " --max-issues " + max_issues.to_string();
    if only_changed {
        sp += " --only-changed";
    }
    sp += "\n";
    sp += "Parse JSON. Return {ok, issue_count, shard_count, manifest, out_dir, shards:[{shard,path,out_path,issue_count,index}], notes}.\n";
    sp += "CRITICAL: issue_count must reflect ALL issues written across shards (expect ~400 if inventory succeeded), not a sample of 10.\n";

    let sp_r = agent(sp, #{
        label: "write-shards",
        capability_mode: "execute",
        output_schema: shard_plan_schema,
    });

    if sp_r != () && sp_r.success && sp_r.output != () {
        if sp_r.output.issue_count != () { sharded_issue_count = sp_r.output.issue_count; }
        if sp_r.output.manifest != () { manifest_path = sp_r.output.manifest; }
        if sp_r.output.shards != () { shard_list = sp_r.output.shards; }
    }
    log("Shards issue_count=" + sharded_issue_count.to_string()
        + " shard_count=" + shard_list.len().to_string()
        + " manifest=" + manifest_path);

    if shard_list.len() == 0 && mode == "issues-only" {
        pause("infra", "write-shards produced no shards; inspect DB/inventory then resume.");
    }
}

// ============================================================
// Phase 4 — Parallel FULL shard clustering
// ============================================================
phase("Cluster");

let raw_clusters = [];
let shard_out_paths = [];

if do_issues && shard_list.len() > 0 {
    let cjobs = [];
    for sh in shard_list {
        let shard_name = "";
        let in_path = "";
        let out_path = "";
        let ic = 0;
        if sh.shard != () { shard_name = sh.shard; }
        if sh.path != () { in_path = sh.path; }
        if sh.out_path != () { out_path = sh.out_path; }
        if sh.issue_count != () { ic = sh.issue_count; }

        let cp = "";
        cp += "You FULLY cluster a shard of Orca GitHub feature issues into real user-need themes.\n";
        cp += "HARD RULES: read-only. Do not invent issue numbers. Cluster EVERY issue in the file if possible;\n";
        cp += "leave true one-offs unclustered rather than inventing themes, but do NOT ignore large groups.\n";
        cp += "Shard: " + shard_name + " issues≈" + ic.to_string() + "\n";
        cp += "INPUT FILE (read with read_file or python/cat): " + in_path + "\n";
        cp += "OUTPUT FILE (must write JSON): " + out_path + "\n";
        cp += "Repo: " + repo + " focus: " + focus + "\n\n";
        cp += "Rules:\n";
        cp += "- Merge near-duplicates / same job-to-be-done.\n";
        cp += "- surface: terminal|mobile|agent-workflow|git|ssh-remote|editor-lsp|browser|settings-ux|runtime-vm|docs|extensions|performance|other\n";
        cp += "- theme_id: short slug; user_job: need phrase; demand_score 0-100 from count+comments+reactions\n";
        cp += "- issue_numbers must be subset of input; cap ~12-16 clusters per shard\n";
        cp += "- Titles need-shaped not ticket-shaped\n\n";
        cp += "Write to out_path: {shard, clusters:[...], notes}\n";
        cp += "Also return same clusters in schema {shard, cluster_count, out_path, clusters, notes}.\n";
        cp += "Then: python3 " + demand_py + " --db " + db_path
            + " ingest-shard-clusters --run-id " + run_id.to_string()
            + " --json-file " + out_path + "\n";

        cjobs.push(#{
            prompt: cp,
            label: "cluster:" + shard_name,
            capability_mode: "execute",
            output_schema: shard_cluster_schema,
        });
    }

    let cresults = parallel(cjobs);
    let ci = 0;
    for r in cresults {
        if r != () && r.success && r.output != () {
            if r.output.clusters != () {
                for c in r.output.clusters {
                    raw_clusters.push(c);
                }
            }
            if r.output.out_path != () {
                shard_out_paths.push(r.output.out_path);
            }
            let sn = "";
            if r.output.shard != () { sn = r.output.shard; }
            let cc = 0;
            if r.output.cluster_count != () { cc = r.output.cluster_count; }
            log("shard " + sn + " clusters=" + cc.to_string());
        } else {
            log("cluster shard failed index=" + ci.to_string());
        }
        ci += 1;
    }
}
log("Raw clusters=" + raw_clusters.len().to_string());

// ============================================================
// Phase 5 — Merge + rank (full coverage)
// ============================================================
phase("Merge");

let merged_clusters = [];
let orphan_issues = [];
let merge_notes = "";
let coverage_pct = 0.0;

if do_issues && raw_clusters.len() > 0 {
    let raw_json = json_encode(raw_clusters);
    let paths_json = json_encode(shard_out_paths);

    let mp = "";
    mp += "Merge shard clusters into a ranked demand map with HIGH ISSUE COVERAGE.\n";
    mp += "HARD: do not invent issue numbers. Prefer reading shard out files if schema clusters look truncated.\n";
    mp += "Shard out paths JSON: " + paths_json + "\n";
    mp += "Also: python3 " + demand_py + " --db " + db_path + " issue-numbers --repo " + repo + "\n";
    mp += "gives the full issue universe for orphan detection.\n";
    mp += "Max merged clusters: " + max_clusters.to_string() + "\n";
    mp += "Focus: " + focus + "\n\n";
    mp += "Tasks:\n";
    mp += "1) Merge overlapping themes across shards (same user_job); union issue_numbers unique.\n";
    mp += "2) Recompute demand_score; rank 1..N; priority_hint now|next|later|park.\n";
    mp += "3) orphan_issues: universe numbers in no cluster (cap 80).\n";
    mp += "4) coverage_pct = 100 * clustered_unique / universe_count.\n";
    mp += "5) Write final {clusters, orphan_issues, coverage_pct, notes} to " + themes_path + "\n";
    mp += "6) Return same in schema with out_path=" + themes_path + "\n\n";
    mp += "RAW CLUSTERS (may be partial — prefer files):\n";
    mp += raw_json;
    mp += "\n";

    let merge_r = agent(mp, #{
        label: "merge-rank",
        capability_mode: "execute",
        output_schema: merge_schema,
    });

    if merge_r != () && merge_r.success && merge_r.output != () {
        if merge_r.output.clusters != () { merged_clusters = merge_r.output.clusters; }
        if merge_r.output.orphan_issues != () { orphan_issues = merge_r.output.orphan_issues; }
        if merge_r.output.notes != () { merge_notes = merge_r.output.notes; }
        if merge_r.output.coverage_pct != () { coverage_pct = merge_r.output.coverage_pct; }
        if merge_r.output.out_path != () && merge_r.output.out_path != "" {
            themes_path = merge_r.output.out_path;
        }
    }

    let capped = [];
    let dropped = 0;
    for c in merged_clusters {
        if capped.len() < max_clusters {
            capped.push(c);
        } else {
            dropped += 1;
        }
    }
    if dropped > 0 {
        log("Truncated " + dropped.to_string() + " themes to max_clusters");
    }
    merged_clusters = capped;
    log("Merged themes=" + merged_clusters.len().to_string()
        + " orphans=" + orphan_issues.len().to_string()
        + " coverage_pct=" + coverage_pct.to_string());
}

// ============================================================
// Phase 6 — Ingest themes to SQLite
// ============================================================
phase("IngestThemes");

if do_issues && merged_clusters.len() > 0 {
    // Ensure themes file exists even if merge agent skipped write
    let ensure = "";
    ensure += "Ingest merged themes into SQLite (dedup by fingerprint).\n";
    ensure += "1) If " + themes_path + " missing or empty, write it from the following JSON:\n";
    ensure += json_encode(#{ clusters: merged_clusters, orphan_issues: orphan_issues, coverage_pct: coverage_pct, notes: merge_notes });
    ensure += "\n2) python3 " + demand_py + " --db " + db_path
        + " ingest-themes --run-id " + run_id.to_string()
        + " --repo " + repo + " --json-file " + themes_path + "\n";
    ensure += "3) python3 " + demand_py + " --db " + db_path + " list-themes --limit 30\n";
    ensure += "Return {ok, theme_new, theme_updated, notes}.\n";

    let ig = agent(ensure, #{
        label: "ingest-themes",
        capability_mode: "execute",
        output_schema: ingest_schema,
    });
    if ig != () && ig.success && ig.output != () && ig.output.notes != () {
        log("ingest-themes: " + ig.output.notes);
    }
}

// ============================================================
// Phase 7 — Harvest X
// ============================================================
phase("HarvestX");

let all_posts = [];

if do_x {
    let slices = [
        "wish_feature",
        "vs_competitors",
        "agent_workflow_pain",
        "terminal_mobile",
        "git_worktree_ssh",
        "editor_lsp_review",
        "chronic_wishlist",
    ];

    let hjobs = [];
    for sl in slices {
        let hp = "";
        hp += "Harvest public X/Twitter posts about Orca (Stably / onorca / @orca_build / @onorca) FEATURE DEMAND.\n";
        hp += "HARD: do NOT post/reply/like. Orca = coding ADE (worktrees/agents/terminals), not animals.\n";
        hp += "Slice: " + sl + " recency ~" + hours.to_string() + "h (chronic may look longer).\n";
        if since_date != "" {
            hp += "Prefer since:" + since_date + "\n";
        }
        hp += "Focus: " + focus + "\n";
        hp += "Use x_keyword_search / x_semantic_search / x_thread_fetch / web_search.\n";
        hp += "Keywords with Orca/@orca_build/onorca:\n";
        if sl == "wish_feature" {
            hp += "  wish, need, please add, missing, would love, feature request\n";
        }
        if sl == "vs_competitors" {
            hp += "  vs Cursor, VS Code, Warp, Zed, switched from/to, better than\n";
        }
        if sl == "agent_workflow_pain" {
            hp += "  agent, handoff, multi-agent, session, resume, orchestration, codex, claude\n";
        }
        if sl == "terminal_mobile" {
            hp += "  terminal, mobile, iOS, Android, pane, theme, keyboard\n";
        }
        if sl == "git_worktree_ssh" {
            hp += "  worktree, PR, git, SSH, remote, WSL, Windows, multi-repo\n";
        }
        if sl == "editor_lsp_review" {
            hp += "  LSP, go to definition, diff, review, editor, refactor\n";
        }
        if sl == "chronic_wishlist" {
            hp += "  still waiting, dealbreaker, almost perfect except, if only, every day\n";
        }
        hp += "Return ≤18 posts: post_id,author,text,url,posted_at,engagement,why_relevant,\n";
        hp += "demand_kind: feature_wish|workaround|comparison|pain|praise_with_gap|other\n";
        hp += "Return {slice, notes, posts}.\n";

        hjobs.push(#{
            prompt: hp,
            label: "x:" + sl,
            capability_mode: "all",
            output_schema: harvest_schema,
        });
    }

    let hresults = parallel(hjobs);
    let hi = 0;
    for r in hresults {
        if r != () && r.success && r.output != () && r.output.posts != () {
            let sln = "";
            if r.output.slice != () { sln = r.output.slice; }
            for p in r.output.posts {
                // stamp slice if missing — agent may omit
                all_posts.push(p);
            }
            log("x slice=" + sln + " posts=" + r.output.posts.len().to_string());
        } else {
            log("x harvest failed index=" + hi.to_string());
        }
        hi += 1;
    }
    log("X total posts=" + all_posts.len().to_string());
}

// ============================================================
// Phase 8 — Crosswalk
// ============================================================
phase("Crosswalk");

let matched = [];
let latent = [];
let cross_notes = "";

if do_x {
    // Prefer themes from file/DB over in-memory if large
    let xp = "";
    xp += "Crosswalk X feature demand against GH themes for Orca. No posting.\n";
    xp += "Load themes from " + themes_path + " if present, else use provided JSON.\n";
    xp += "Also: python3 " + demand_py + " --db " + db_path + " list-themes --limit 40\n";
    xp += "Write posts JSON to " + posts_path + " from provided posts.\n";
    xp += "Produce:\n";
    xp += "A) matched — X strengthens existing theme (priority_boost strong|moderate|weak)\n";
    xp += "B) latent — real demand not well represented in themes (confidence 0-1)\n";
    xp += "Write matched to " + matched_path + " as {matched:[...]}\n";
    xp += "Write latent to " + latent_path + " as {latent:[...]}\n";
    xp += "Cap matched 20, latent 15. Prefer multi-author concrete needs.\n";
    xp += "Return schema with matched, latent, matched_path, latent_path, notes.\n\n";
    xp += "THEMES JSON:\n";
    xp += json_encode(merged_clusters);
    xp += "\n\nX POSTS JSON:\n";
    xp += json_encode(all_posts);
    xp += "\n";

    let xr = agent(xp, #{
        label: "crosswalk",
        capability_mode: "execute",
        output_schema: crosswalk_schema,
    });

    if xr != () && xr.success && xr.output != () {
        if xr.output.matched != () { matched = xr.output.matched; }
        if xr.output.latent != () { latent = xr.output.latent; }
        if xr.output.notes != () { cross_notes = xr.output.notes; }
        if xr.output.matched_path != () && xr.output.matched_path != "" {
            matched_path = xr.output.matched_path;
        }
        if xr.output.latent_path != () && xr.output.latent_path != "" {
            latent_path = xr.output.latent_path;
        }
    }
    log("Crosswalk matched=" + matched.len().to_string() + " latent=" + latent.len().to_string());
}

// ============================================================
// Phase 9 — Ingest social → SQLite
// ============================================================
phase("IngestSocial");

if do_x {
    let isp = "";
    isp += "Ingest X posts, matched, and latent into SQLite (dedup).\n";
    isp += "DB " + db_path + " run_id " + run_id.to_string() + "\n";
    isp += "1) Ensure " + posts_path + " contains {posts:[...]} — write from:\n";
    isp += json_encode(#{ posts: all_posts });
    isp += "\n2) python3 " + demand_py + " --db " + db_path
        + " ingest-posts --run-id " + run_id.to_string()
        + " --json-file " + posts_path + "\n";
    isp += "3) Ensure " + matched_path + " has {matched:[...]} — write if needed from:\n";
    isp += json_encode(#{ matched: matched });
    isp += "\n4) python3 " + demand_py + " --db " + db_path
        + " ingest-matched --run-id " + run_id.to_string()
        + " --json-file " + matched_path + "\n";
    isp += "5) Ensure " + latent_path + " has {latent:[...]} — write if needed from:\n";
    isp += json_encode(#{ latent: latent });
    isp += "\n6) python3 " + demand_py + " --db " + db_path
        + " ingest-latent --run-id " + run_id.to_string()
        + " --json-file " + latent_path + "\n";
    isp += "7) python3 " + demand_py + " --db " + db_path + " stats\n";
    isp += "Return {ok, post_new, post_updated, latent_new, latent_updated, matched_rows, notes}.\n";

    let isr = agent(isp, #{
        label: "ingest-social",
        capability_mode: "execute",
        output_schema: ingest_schema,
    });
    if isr != () && isr.success && isr.output != () && isr.output.notes != () {
        log("ingest-social: " + isr.output.notes);
    }
}

// ============================================================
// Phase 10 — Report + finish
// ============================================================
phase("Report");

let rp = "";
rp += "Write the final Orca product-demand radar report (Chinese product language, keep issue titles exact).\n";
rp += "HARD: local files only; no posts.\n";
rp += "Use SQLite as source of truth:\n";
rp += "  python3 " + demand_py + " --db " + db_path + " stats\n";
rp += "  python3 " + demand_py + " --db " + db_path + " list-themes --limit 40\n";
rp += "  python3 " + demand_py + " --db " + db_path + " list-latent --limit 30\n";
rp += "  python3 " + demand_py + " --db " + db_path + " export --what all --out "
    + work_dir + "/run" + run_id.to_string() + "-export.json\n";
rp += "Also read " + themes_path + " / " + latent_path + " if present.\n\n";
rp += "Report sections:\n";
rp += "1. Executive summary\n";
rp += "2. Top issue themes table (score, issue_count, sample #, priority)\n";
rp += "3. Social amplifiers matched\n";
rp += "4. Latent X demand\n";
rp += "5. Now/Next/Later bets\n";
rp += "6. Method: issue_count, shard_count, coverage_pct, db path, how other agents use demand_db.py\n\n";
rp += "Write report to " + report_path + "\n";
if write_repo_copy {
    rp += "Also copy to .memory/orca-demand-radar-latest.md under the Orca workspace if writable.\n";
}
rp += "Finish run:\n";
rp += "python3 " + demand_py + " --db " + db_path
    + " finish-run --run-id " + run_id.to_string()
    + " --summary 'full demand radar' --report-path " + report_path
    + " --inventory-path " + inventory_path + "\n";
rp += "Return {ok, report_path, summary, top_themes, top_latent, db_stats_path}.\n";
rp += "Context: sharded_issues=" + sharded_issue_count.to_string()
    + " themes=" + merged_clusters.len().to_string()
    + " x_posts=" + all_posts.len().to_string()
    + " coverage_pct=" + coverage_pct.to_string()
    + " inventory_notes=" + inventory_notes + "\n";

let report_r = agent(rp, #{
    label: "write-report",
    capability_mode: "execute",
    output_schema: report_schema,
});

// Fallback assembled report for scratch UI
let report_md = "";
report_md += "# Orca Demand Radar (SQLite-backed full shards)\n\n";
report_md += "repo: " + repo + " | mode: " + mode + " | run_id: " + run_id.to_string() + "\n";
report_md += "db: `" + db_path + "`\n\n";
report_md += "## Counts\n\n";
report_md += "- inventory_issue_count: " + issue_count.to_string() + "\n";
report_md += "- sharded_issue_count: " + sharded_issue_count.to_string() + "\n";
report_md += "- shards: " + shard_list.len().to_string() + "\n";
report_md += "- merged_themes: " + merged_clusters.len().to_string() + "\n";
report_md += "- coverage_pct: " + coverage_pct.to_string() + "\n";
report_md += "- x_posts: " + all_posts.len().to_string() + "\n";
report_md += "- matched: " + matched.len().to_string() + "\n";
report_md += "- latent: " + latent.len().to_string() + "\n\n";

if report_r != () && report_r.success && report_r.output != () && report_r.output.summary != () {
    report_md += "## Agent summary\n\n";
    report_md += report_r.output.summary;
    report_md += "\n\n";
}

report_md += "## Themes\n\n";
let ti = 0;
for c in merged_clusters {
    ti += 1;
    let title = "";
    let surface = "";
    let summary = "";
    let score = "";
    let nums_s = "";
    if c.title != () { title = c.title; }
    if c.surface != () { surface = c.surface; }
    if c.summary != () { summary = c.summary; }
    if c.demand_score != () { score = c.demand_score.to_string(); }
    if c.issue_numbers != () {
        for n in c.issue_numbers {
            if nums_s != "" { nums_s += ", "; }
            nums_s += "#" + n.to_string();
        }
    }
    report_md += ti.to_string() + ". **" + title + "** (" + surface + ") score=" + score + "\n";
    report_md += "   - issues: " + nums_s + "\n";
    report_md += "   - " + summary + "\n\n";
}

report_md += "## Latent\n\n";
let li = 0;
for L in latent {
    li += 1;
    let title = "";
    let summary = "";
    let conf = "";
    if L.title != () { title = L.title; }
    if L.summary != () { summary = L.summary; }
    if L.confidence != () { conf = L.confidence.to_string(); }
    report_md += li.to_string() + ". **" + title + "** (conf=" + conf + ")\n";
    report_md += "   - " + summary + "\n\n";
}

report_md += "## Exchange for other agents\n\n";
report_md += "```bash\n";
report_md += "python3 " + demand_py + " --db " + db_path + " stats\n";
report_md += "python3 " + demand_py + " --db " + db_path + " list-themes --limit 30\n";
report_md += "python3 " + demand_py + " --db " + db_path + " list-latent --limit 30\n";
report_md += "python3 " + demand_py + " --db " + db_path + " export --what all --out /tmp/odr-export.json\n";
report_md += "python3 " + demand_py + " --db " + db_path + " claim --worker OTHER --kind latent --limit 3\n";
report_md += "```\n";

let scratch = write_scratch_file("orca-demand-radar-report.md", report_md);

let agent_path = report_path;
let summary = "run_id=" + run_id.to_string()
    + " issues=" + sharded_issue_count.to_string()
    + " themes=" + merged_clusters.len().to_string()
    + " latent=" + latent.len().to_string()
    + " matched=" + matched.len().to_string()
    + " x_posts=" + all_posts.len().to_string()
    + " coverage=" + coverage_pct.to_string();

if report_r != () && report_r.success && report_r.output != () {
    if report_r.output.report_path != () && report_r.output.report_path != "" {
        agent_path = report_r.output.report_path;
    }
    if report_r.output.summary != () && report_r.output.summary != "" {
        summary = report_r.output.summary;
    }
}

log("Done scratch=" + scratch + " report=" + agent_path + " db=" + db_path);
complete(#{
    path: scratch,
    agent_report_path: agent_path,
    db_path: db_path,
    run_id: run_id,
    summary: summary,
    issue_count: sharded_issue_count,
    inventory_issue_count: issue_count,
    clusters: merged_clusters.len(),
    latent: latent.len(),
    matched: matched.len(),
    x_posts: all_posts.len(),
    coverage_pct: coverage_pct,
    shards: shard_list.len(),
});
