// review-campaign-prs — deep review of a list of GitHub PRs (fork → upstream)
//
// Hard rules for agents:
// - Read-only: gh + git fetch + read_file/grep only. Do NOT push, comment, approve, or merge.
// - Evidence over vibes: every finding must cite file:line or a concrete diff hunk.
// - Fail closed on missing evidence when verifying claims.

let meta = #{
    name: "review-campaign-prs",
    description: "Parallel deep review of campaign PRs with adversarial verify + markdown report",
    when_to_use: "After a multi-PR campaign: re-review all open PRs for correctness before merge",
    phases: [
        #{ title: "Inventory", detail: "normalize PR list + fetch metadata" },
        #{ title: "Review", detail: "one deep reviewer per PR" },
        #{ title: "Verify", detail: "adversarial check of high/medium findings" },
        #{ title: "Report", detail: "write consolidated markdown report" },
    ],
};

let inventory_schema = #{
    "type": "object",
    "required": ["prs"],
    "properties": #{
        "prs": #{
            "type": "array",
            "maxItems": 20,
            "items": #{
                "type": "object",
                "required": ["number", "title", "head", "url", "mergeable"],
                "properties": #{
                    "number": #{ "type": "integer" },
                    "title": #{ "type": "string" },
                    "head": #{ "type": "string" },
                    "url": #{ "type": "string" },
                    "mergeable": #{ "type": "string" },
                    "base": #{ "type": "string" },
                },
            },
        },
        "notes": #{ "type": "string" },
    },
};

let review_schema = #{
    "type": "object",
    "required": ["pr", "verdict", "summary", "findings"],
    "properties": #{
        "pr": #{ "type": "integer" },
        "verdict": #{ "type": "string" },
        "summary": #{ "type": "string" },
        "risk": #{ "type": "string" },
        "merge_ready": #{ "type": "boolean" },
        "findings": #{
            "type": "array",
            "maxItems": 10,
            "items": #{
                "type": "object",
                "required": ["severity", "title", "file", "detail"],
                "properties": #{
                    "severity": #{ "type": "string" },
                    "title": #{ "type": "string" },
                    "file": #{ "type": "string" },
                    "detail": #{ "type": "string" },
                    "suggestion": #{ "type": "string" },
                },
            },
        },
        "test_gaps": #{
            "type": "array",
            "maxItems": 6,
            "items": #{ "type": "string" },
        },
        "platform_notes": #{ "type": "string" },
    },
};

let verdict_schema = #{
    "type": "object",
    "required": ["pr", "finding_title", "real", "reason", "evidence"],
    "properties": #{
        "pr": #{ "type": "integer" },
        "finding_title": #{ "type": "string" },
        "real": #{ "type": "boolean" },
        "reason": #{ "type": "string" },
        "evidence": #{ "type": "string" },
    },
};

// ---------- args ----------
let prs_arg = if args == () { () } else { args.prs };
let repo = if args == () || args.repo == () { "stablyai/orca" } else { args.repo };
if prs_arg == () {
    pause("verification", "Pass args.prs as an array of PR numbers, e.g. {\"prs\":[12581,12582],\"repo\":\"stablyai/orca\"}");
}

// Normalize prs to array of integers encoded as strings for prompt building
let pr_numbers = [];
if type_of(prs_arg) == "array" {
    for p in prs_arg {
        pr_numbers.push(p);
    }
} else {
    pause("verification", "args.prs must be an array of PR numbers");
}
if pr_numbers.len() == 0 {
    pause("verification", "args.prs is empty");
}
if pr_numbers.len() > 16 {
    pause("verification", "Cap is 16 PRs per run; split the list");
}

phase("Inventory");
log("Inventory for " + pr_numbers.len().to_string() + " PRs on " + repo);

let inv_prompt = "";
inv_prompt += "You are inventorying GitHub PRs for a review campaign. READ-ONLY.\n";
inv_prompt += "Repo: " + repo + "\n";
inv_prompt += "PR numbers: " + json_encode(pr_numbers) + "\n\n";
inv_prompt += "For EACH PR number, run:\n";
inv_prompt += "  gh pr view <N> --repo " + repo + " --json number,title,headRefName,baseRefName,url,mergeable,body,files,additions,deletions,commits\n";
inv_prompt += "Return {prs:[{number,title,head,url,mergeable,base}], notes}.\n";
inv_prompt += "If a PR is missing, still include it with mergeable=\"MISSING\" and title=\"missing\".\n";
inv_prompt += "Do not post comments or mutate anything.\n";

let inv = agent(inv_prompt, #{
    label: "inventory",
    capability_mode: "read-only",
    output_schema: inventory_schema,
});

let pr_list = [];
if inv != () && inv.success && inv.output.prs != () {
    for p in inv.output.prs {
        pr_list.push(p);
    }
}
if pr_list.len() == 0 {
    // Fall back to bare numbers so review can still try gh pr view
    for n in pr_numbers {
        pr_list.push(#{
            number: n,
            title: "PR " + n.to_string(),
            head: "",
            url: "https://github.com/" + repo + "/pull/" + n.to_string(),
            mergeable: "UNKNOWN",
            base: "main",
        });
    }
    log("Inventory agent failed or empty; falling back to bare PR numbers");
}

phase("Review");
log("Deep-reviewing " + pr_list.len().to_string() + " PRs in parallel");

let review_jobs = [];
for p in pr_list {
    let n = p.number;
    let title = if p.title != () { p.title } else { "" };
    let head = if p.head != () { p.head } else { "" };
    let url = if p.url != () { p.url } else { "" };
    let mergeable = if p.mergeable != () { p.mergeable } else { "UNKNOWN" };

    let prompt = "";
    prompt += "Deep code review of ONE GitHub PR. READ-ONLY. Do not comment/approve/merge/push.\n\n";
    prompt += "Repo: " + repo + "\n";
    prompt += "PR: #" + n.to_string() + " — " + title + "\n";
    prompt += "URL: " + url + "\n";
    prompt += "Head branch: " + head + "\n";
    prompt += "Mergeable (inventory): " + mergeable + "\n\n";
    prompt += "Steps (use tools; do not answer from memory):\n";
    prompt += "1) gh pr view " + n.to_string() + " --repo " + repo + " --json title,body,files,additions,deletions,commits,baseRefName,headRefName,mergeable\n";
    prompt += "2) gh pr diff " + n.to_string() + " --repo " + repo + "\n";
    prompt += "3) Read the changed source files around the hunks (read_file/grep). Prefer checking out nothing; use gh/git show if needed.\n";
    prompt += "4) Check tests in the diff: do they cover the bug path? Missing negatives?\n";
    prompt += "5) Cross-platform: macOS/Linux/Windows/WSL/SSH/folder-workspace implications.\n";
    prompt += "6) Security/i18n/max-lines only if relevant to the diff.\n\n";
    prompt += "Verdict must be one of: APPROVE, APPROVE_WITH_NITS, CHANGES_REQUESTED, BLOCK.\n";
    prompt += "risk: low|medium|high.\n";
    prompt += "findings severity: critical|high|medium|low|nit. Max 10 findings. Empty findings only after reading the full diff.\n";
    prompt += "Every finding needs file (path or \"diff\") + concrete detail with evidence.\n";
    prompt += "Output schema fields: pr, verdict, summary, risk, merge_ready, findings[], test_gaps[], platform_notes.\n";
    prompt += "Set pr=" + n.to_string() + ".\n";

    review_jobs.push(#{
        prompt: prompt,
        label: "review-pr-" + n.to_string(),
        capability_mode: "read-only",
        output_schema: review_schema,
    });
}

let review_results = parallel(review_jobs);

let reviews = [];
let i = 0;
for r in review_results {
    if r != () && r.success && r.output != () {
        reviews.push(r.output);
    } else {
        let failed_pr = pr_list[i].number;
        reviews.push(#{
            pr: failed_pr,
            verdict: "BLOCK",
            summary: "Review agent failed or returned unusable output",
            risk: "high",
            merge_ready: false,
            findings: [#{
                severity: "high",
                title: "reviewer-failed",
                file: "workflow",
                detail: "Parallel review slot failed; re-run this PR alone",
                suggestion: "Re-run review-campaign-prs with only this PR number",
            }],
            test_gaps: [],
            platform_notes: "",
        });
    }
    i += 1;
}

// Collect high/medium/critical findings for adversarial verify (cap 16)
phase("Verify");
let to_verify = [];
for rev in reviews {
    if rev.findings == () { continue; }
    for f in rev.findings {
        let sev = if f.severity != () { f.severity } else { "low" };
        if sev == "critical" || sev == "high" || sev == "medium" {
            if to_verify.len() < 16 {
                to_verify.push(#{
                    pr: rev.pr,
                    title: f.title,
                    file: f.file,
                    detail: f.detail,
                    severity: sev,
                });
            }
        }
    }
}

log(to_verify.len().to_string() + " findings queued for adversarial verify");

let confirmed = [];
let rejected = [];
if to_verify.len() > 0 {
    let vjobs = [];
    for f in to_verify {
        let vp = "";
        vp += "Adversarially verify ONE review finding. READ-ONLY.\n";
        vp += "Repo: " + repo + "\n";
        vp += "PR #" + f.pr.to_string() + "\n";
        vp += "Claimed severity: " + f.severity + "\n";
        vp += "Finding title: " + f.title + "\n";
        vp += "File: " + f.file + "\n";
        vp += "Detail: " + f.detail + "\n\n";
        vp += "Independently inspect the PR diff and surrounding code:\n";
        vp += "  gh pr diff " + f.pr.to_string() + " --repo " + repo + "\n";
        vp += "  read_file/grep the cited paths.\n";
        vp += "Set real=true ONLY with concrete evidence you inspected (quote file:line or hunk).\n";
        vp += "Default real=false if uncertain, speculative, already fixed on base, or out of scope.\n";
        vp += "Output: pr, finding_title, real, reason, evidence.\n";
        vjobs.push(#{
            prompt: vp,
            label: "verify-" + f.pr.to_string(),
            capability_mode: "read-only",
            output_schema: verdict_schema,
        });
    }
    let verdicts = parallel(vjobs);
    let vi = 0;
    for v in verdicts {
        let src = to_verify[vi];
        if v != () && v.success && v.output != () && v.output.real == true
            && v.output.evidence != () && v.output.evidence != "" {
            confirmed.push(#{
                pr: src.pr,
                title: src.title,
                severity: src.severity,
                file: src.file,
                detail: src.detail,
                evidence: v.output.evidence,
                reason: v.output.reason,
            });
        } else {
            rejected.push(#{
                pr: src.pr,
                title: src.title,
                severity: src.severity,
            });
        }
        vi += 1;
    }
}

log(confirmed.len().to_string() + " confirmed / " + rejected.len().to_string() + " rejected");

phase("Report");
// Build markdown report in-script (no extra agent) for determinism
let md = "";
md += "# Campaign PR Review Report\n\n";
md += "Repo: `" + repo + "`\n\n";
md += "Reviewed PRs: " + pr_list.len().to_string() + "\n\n";
md += "## Scoreboard\n\n";
md += "| PR | Verdict | Risk | Merge ready | Summary |\n";
md += "|---:|---|---|---|---|\n";
for rev in reviews {
    let v = if rev.verdict != () { rev.verdict } else { "?" };
    let risk = if rev.risk != () { rev.risk } else { "?" };
    let ready = if rev.merge_ready == true { "yes" } else { "no" };
    let sum = if rev.summary != () { rev.summary } else { "" };
    // strip pipes/newlines from table cells lightly
    md += "| #" + rev.pr.to_string() + " | " + v + " | " + risk + " | " + ready + " | " + sum + " |\n";
}

md += "\n## Confirmed findings (survived adversarial verify)\n\n";
if confirmed.len() == 0 {
    md += "_None confirmed._\n\n";
} else {
    for c in confirmed {
        md += "### PR #" + c.pr.to_string() + " — " + c.title + " (" + c.severity + ")\n\n";
        md += "- **File:** `" + c.file + "`\n";
        md += "- **Detail:** " + c.detail + "\n";
        md += "- **Evidence:** " + c.evidence + "\n";
        md += "- **Why real:** " + c.reason + "\n\n";
    }
}

md += "## Per-PR reviews\n\n";
for rev in reviews {
    md += "### PR #" + rev.pr.to_string() + " — " + rev.verdict + "\n\n";
    md += rev.summary + "\n\n";
    if rev.platform_notes != () && rev.platform_notes != "" {
        md += "**Platform:** " + rev.platform_notes + "\n\n";
    }
    if rev.findings != () && rev.findings.len() > 0 {
        md += "Findings:\n";
        for f in rev.findings {
            md += "- **[" + f.severity + "]** " + f.title + " (`" + f.file + "`): " + f.detail + "\n";
        }
        md += "\n";
    } else {
        md += "_No findings reported._\n\n";
    }
    if rev.test_gaps != () && rev.test_gaps.len() > 0 {
        md += "Test gaps:\n";
        for g in rev.test_gaps {
            md += "- " + g + "\n";
        }
        md += "\n";
    }
}

md += "## Rejected findings (failed verify)\n\n";
if rejected.len() == 0 {
    md += "_None._\n";
} else {
    for r in rejected {
        md += "- PR #" + r.pr.to_string() + ": " + r.title + " (" + r.severity + ")\n";
    }
}

let report_path = write_scratch_file("campaign-pr-review.md", md);
log("Wrote report " + report_path);

complete(#{
    path: report_path,
    pr_count: pr_list.len(),
    confirmed_count: confirmed.len(),
    rejected_count: rejected.len(),
    reviews: reviews,
    confirmed: confirmed,
});
