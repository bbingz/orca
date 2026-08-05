#!/usr/bin/env python3
"""CLI for orca-demand-radar SQLite store (dedup + multi-agent exchange).

Examples:
  demand_db.py init --db ~/.grok/data/orca-demand-radar.sqlite
  demand_db.py begin-run --db ... --repo stablyai/orca --mode full --args-json '{}'
  demand_db.py upsert-issues --db ... --run-id 1 --json-file /tmp/inv.json
  demand_db.py write-shards --db ... --run-id 1 --shards 8 --out-dir /tmp/odr
  demand_db.py ingest-themes --db ... --run-id 1 --json-file /tmp/themes.json
  demand_db.py ingest-posts --db ... --run-id 1 --json-file /tmp/posts.json
  demand_db.py ingest-matched --db ... --run-id 1 --json-file /tmp/matched.json
  demand_db.py ingest-latent --db ... --run-id 1 --json-file /tmp/latent.json
  demand_db.py finish-run --db ... --run-id 1 --summary '...'
  demand_db.py stats --db ...
  demand_db.py list-themes --db ... --limit 30
  demand_db.py list-latent --db ... --limit 30
  demand_db.py export --db ... --what all --out /tmp/odr-export.json
  demand_db.py claim --db ... --worker agent-a --kind latent --limit 3
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sqlite3
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

HERE = Path(__file__).resolve().parent
DEFAULT_DB = Path.home() / ".grok" / "data" / "orca-demand-radar.sqlite"
SCHEMA = HERE / "schema.sql"


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def connect(db: Path) -> sqlite3.Connection:
    db.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(db))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def jdump(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False, sort_keys=True)


def load_payload(json_file: Path | None, json_inline: str | None) -> Any:
    if json_file:
        return json.loads(json_file.read_text(encoding="utf-8"))
    if json_inline:
        return json.loads(json_inline)
    return json.load(sys.stdin)


def fingerprint(*parts: str) -> str:
    key = " | ".join(" ".join((p or "").strip().lower().split()) for p in parts)
    return hashlib.sha256(key.encode("utf-8")).hexdigest()[:32]


def content_hash_issue(item: dict[str, Any]) -> str:
    labels = item.get("labels") or []
    if isinstance(labels, list):
        labels_s = ",".join(sorted(str(x) for x in labels))
    else:
        labels_s = str(labels)
    blob = jdump(
        {
            "n": item.get("number"),
            "t": item.get("title"),
            "l": labels_s,
            "c": item.get("comments") or 0,
            "r": item.get("reactions") or 0,
            "u": item.get("updated_at") or item.get("updatedAt") or "",
            "b": (item.get("body_snippet") or "")[:200],
        }
    )
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()[:32]


def cmd_init(db: Path) -> None:
    conn = connect(db)
    conn.executescript(SCHEMA.read_text(encoding="utf-8"))
    conn.commit()
    conn.close()
    print(jdump({"ok": True, "db": str(db), "schema": str(SCHEMA)}))


def cmd_begin_run(db: Path, repo: str, mode: str, args_json: str) -> None:
    conn = connect(db)
    cur = conn.execute(
        """INSERT INTO demand_runs(started_at, repo, mode, args_json)
           VALUES (?,?,?,?)""",
        (utc_now(), repo, mode, args_json or "{}"),
    )
    conn.commit()
    run_id = cur.lastrowid
    conn.close()
    print(jdump({"ok": True, "run_id": run_id, "repo": repo, "mode": mode}))


def cmd_finish_run(
    db: Path,
    run_id: int,
    summary: str,
    report_path: str | None,
    inventory_path: str | None,
) -> None:
    conn = connect(db)
    row = conn.execute(
        """SELECT
             (SELECT COUNT(*) FROM issues WHERE last_run_id=?) AS issue_rows,
             (SELECT COUNT(*) FROM x_posts WHERE last_run_id=?) AS post_rows
           """,
        (run_id, run_id),
    ).fetchone()
    # theme/latent deltas stored during ingest; pull latest run counters if set
    run = conn.execute("SELECT * FROM demand_runs WHERE id=?", (run_id,)).fetchone()
    theme_new = int(run["theme_new"] or 0) if run else 0
    theme_upd = int(run["theme_updated"] or 0) if run else 0
    latent_new = int(run["latent_new"] or 0) if run else 0
    latent_upd = int(run["latent_updated"] or 0) if run else 0
    conn.execute(
        """UPDATE demand_runs SET
             finished_at=?, summary=?, issue_rows=?, post_rows=?,
             report_path=COALESCE(?, report_path),
             inventory_path=COALESCE(?, inventory_path)
           WHERE id=?""",
        (
            utc_now(),
            summary,
            int(row["issue_rows"] or 0),
            int(row["post_rows"] or 0),
            report_path,
            inventory_path,
            run_id,
        ),
    )
    conn.commit()
    conn.close()
    print(
        jdump(
            {
                "ok": True,
                "run_id": run_id,
                "theme_new": theme_new,
                "theme_updated": theme_upd,
                "latent_new": latent_new,
                "latent_updated": latent_upd,
            }
        )
    )


def _issues_list(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, dict):
        if "issues" in payload:
            return list(payload["issues"] or [])
        if "items" in payload:
            return list(payload["items"] or [])
    if isinstance(payload, list):
        return list(payload)
    raise SystemExit("issues payload must be list or {issues:[...]}")


def cmd_upsert_issues(
    db: Path, run_id: int, repo: str, json_file: Path | None, json_inline: str | None
) -> None:
    payload = load_payload(json_file, json_inline)
    items = _issues_list(payload)
    if isinstance(payload, dict) and payload.get("repo"):
        repo = str(payload["repo"])
    conn = connect(db)
    now = utc_now()
    inserted = updated = unchanged = 0
    for raw in items:
        number = int(raw.get("number") or raw.get("n") or 0)
        if number <= 0:
            continue
        title = (raw.get("title") or "").strip() or f"#{number}"
        labels = raw.get("labels") or []
        if labels and isinstance(labels, list) and labels and isinstance(labels[0], dict):
            labels = [x.get("name") for x in labels if x.get("name")]
        comments = int(raw.get("comments") or 0)
        reactions = int(raw.get("reactions") or 0)
        created = raw.get("created_at") or raw.get("createdAt")
        updated_at = raw.get("updated_at") or raw.get("updatedAt")
        url = raw.get("url") or f"https://github.com/{repo}/issues/{number}"
        snippet = (raw.get("body_snippet") or raw.get("body") or "")[:400]
        ch = content_hash_issue(
            {
                "number": number,
                "title": title,
                "labels": labels,
                "comments": comments,
                "reactions": reactions,
                "updated_at": updated_at,
                "body_snippet": snippet,
            }
        )
        existing = conn.execute(
            "SELECT id, content_hash FROM issues WHERE repo=? AND number=?",
            (repo, number),
        ).fetchone()
        if existing is None:
            conn.execute(
                """INSERT INTO issues(
                     repo, number, title, labels_json, comments, reactions,
                     created_at, updated_at, url, body_snippet, content_hash,
                     first_seen_at, last_seen_at, last_run_id, raw_json
                   ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    repo,
                    number,
                    title,
                    jdump(labels),
                    comments,
                    reactions,
                    created,
                    updated_at,
                    url,
                    snippet,
                    ch,
                    now,
                    now,
                    run_id,
                    jdump(raw),
                ),
            )
            inserted += 1
        else:
            if existing["content_hash"] == ch:
                conn.execute(
                    "UPDATE issues SET last_seen_at=?, last_run_id=? WHERE id=?",
                    (now, run_id, existing["id"]),
                )
                unchanged += 1
            else:
                conn.execute(
                    """UPDATE issues SET
                         title=?, labels_json=?, comments=?, reactions=?,
                         created_at=COALESCE(?, created_at), updated_at=?,
                         url=?, body_snippet=?, content_hash=?,
                         last_seen_at=?, last_run_id=?, raw_json=?
                       WHERE id=?""",
                    (
                        title,
                        jdump(labels),
                        comments,
                        reactions,
                        created,
                        updated_at,
                        url,
                        snippet,
                        ch,
                        now,
                        run_id,
                        jdump(raw),
                        existing["id"],
                    ),
                )
                updated += 1

    inv_path = None
    if json_file:
        inv_path = str(json_file)
    conn.execute(
        """UPDATE demand_runs SET issue_rows=?, inventory_path=COALESCE(?, inventory_path)
           WHERE id=?""",
        (inserted + updated + unchanged, inv_path, run_id),
    )
    conn.execute(
        """INSERT INTO demand_events(actor, kind, ref_id, note)
           VALUES ('radar','upsert_issues',?,?)""",
        (run_id, f"ins={inserted} upd={updated} same={unchanged}"),
    )
    conn.commit()
    total = conn.execute(
        "SELECT COUNT(*) AS c FROM issues WHERE repo=?", (repo,)
    ).fetchone()["c"]
    conn.close()
    print(
        jdump(
            {
                "ok": True,
                "run_id": run_id,
                "repo": repo,
                "inserted": inserted,
                "updated": updated,
                "unchanged": unchanged,
                "loaded": len(items),
                "repo_total": total,
            }
        )
    )


def cmd_write_shards(
    db: Path,
    run_id: int,
    repo: str,
    shards: int,
    out_dir: Path,
    max_issues: int,
    only_changed: bool,
) -> None:
    if shards < 1:
        shards = 1
    out_dir.mkdir(parents=True, exist_ok=True)
    conn = connect(db)
    if only_changed:
        # Issues new/changed this run, plus any never clustered (no theme_issues)
        rows = conn.execute(
            """SELECT * FROM issues
               WHERE repo=? AND (
                 last_run_id=? AND content_hash IS NOT NULL
               )
               ORDER BY reactions DESC, comments DESC, number ASC
               LIMIT ?""",
            (repo, run_id, max_issues),
        ).fetchall()
        # If too few, fall back to full active set
        if len(rows) < max(20, max_issues // 10):
            rows = conn.execute(
                """SELECT * FROM issues WHERE repo=?
                   ORDER BY reactions DESC, comments DESC, number ASC
                   LIMIT ?""",
                (repo, max_issues),
            ).fetchall()
    else:
        rows = conn.execute(
            """SELECT * FROM issues WHERE repo=?
               ORDER BY reactions DESC, comments DESC, number ASC
               LIMIT ?""",
            (repo, max_issues),
        ).fetchall()

    issues = []
    for r in rows:
        try:
            labels = json.loads(r["labels_json"] or "[]")
        except json.JSONDecodeError:
            labels = []
        issues.append(
            {
                "number": r["number"],
                "title": r["title"],
                "labels": labels,
                "comments": r["comments"],
                "reactions": r["reactions"],
                "created_at": r["created_at"],
                "updated_at": r["updated_at"],
                "url": r["url"],
                "body_snippet": r["body_snippet"],
                "content_hash": r["content_hash"],
            }
        )

    n = len(issues)
    if n == 0:
        conn.close()
        print(jdump({"ok": True, "shards": [], "issue_count": 0, "out_dir": str(out_dir)}))
        return

    # Even slices by index (stable order = engagement rank)
    shard_paths = []
    base = n // shards
    rem = n % shards
    start = 0
    for i in range(shards):
        size = base + (1 if i < rem else 0)
        end = start + size
        if start >= n:
            break
        chunk = issues[start:end]
        if not chunk:
            break
        path = out_dir / f"run{run_id}-shard{i}.json"
        path.write_text(
            jdump(
                {
                    "run_id": run_id,
                    "repo": repo,
                    "shard": f"s{i}",
                    "shard_index": i,
                    "shards": shards,
                    "issue_count": len(chunk),
                    "issues": chunk,
                }
            ),
            encoding="utf-8",
        )
        out_path = out_dir / f"run{run_id}-shard{i}-clusters.json"
        shard_paths.append(
            {
                "shard": f"s{i}",
                "index": i,
                "issue_count": len(chunk),
                "path": str(path),
                "out_path": str(out_path),
            }
        )
        start = end

    manifest = out_dir / f"run{run_id}-shards.json"
    manifest.write_text(
        jdump(
            {
                "run_id": run_id,
                "repo": repo,
                "issue_count": n,
                "shards": shard_paths,
            }
        ),
        encoding="utf-8",
    )
    conn.execute(
        """INSERT INTO demand_events(actor, kind, ref_id, note)
           VALUES ('radar','write_shards',?,?)""",
        (run_id, f"shards={len(shard_paths)} issues={n}"),
    )
    conn.commit()
    conn.close()
    print(
        jdump(
            {
                "ok": True,
                "run_id": run_id,
                "issue_count": n,
                "shard_count": len(shard_paths),
                "out_dir": str(out_dir),
                "manifest": str(manifest),
                "shards": shard_paths,
            }
        )
    )


def cmd_ingest_shard_clusters(
    db: Path, run_id: int, json_file: Path | None, json_inline: str | None
) -> None:
    payload = load_payload(json_file, json_inline)
    if isinstance(payload, dict) and "clusters" in payload:
        shard = str(payload.get("shard") or "unknown")
        clusters = payload["clusters"] or []
    elif isinstance(payload, list):
        shard = "unknown"
        clusters = payload
    else:
        raise SystemExit("expected {shard, clusters:[...]} or list")

    conn = connect(db)
    n = 0
    for c in clusters:
        conn.execute(
            """INSERT INTO shard_clusters(run_id, shard, theme_id, title, surface, payload_json)
               VALUES (?,?,?,?,?,?)""",
            (
                run_id,
                shard,
                (c.get("theme_id") or "")[:120],
                (c.get("title") or "")[:300],
                (c.get("surface") or "")[:80],
                jdump(c),
            ),
        )
        n += 1
    conn.commit()
    conn.close()
    print(jdump({"ok": True, "run_id": run_id, "shard": shard, "rows": n}))


def _enqueue(conn: sqlite3.Connection, kind: str, ref_id: int, priority: int) -> None:
    now = utc_now()
    conn.execute(
        """INSERT INTO worker_queue(kind, ref_id, priority, available_at)
           VALUES (?,?,?,?)
           ON CONFLICT(kind, ref_id) DO UPDATE SET
             priority=MAX(worker_queue.priority, excluded.priority),
             available_at=CASE
               WHEN worker_queue.claimed_by IS NULL THEN excluded.available_at
               ELSE worker_queue.available_at END""",
        (kind, ref_id, priority, now),
    )


def cmd_ingest_themes(
    db: Path, run_id: int, repo: str, json_file: Path | None, json_inline: str | None
) -> None:
    payload = load_payload(json_file, json_inline)
    if isinstance(payload, dict) and "clusters" in payload:
        items = payload["clusters"]
    elif isinstance(payload, dict) and "themes" in payload:
        items = payload["themes"]
    elif isinstance(payload, list):
        items = payload
    else:
        raise SystemExit("expected {clusters|themes:[...]} or list")

    conn = connect(db)
    now = utc_now()
    new_n = upd_n = 0
    theme_ids = []
    for item in items:
        title = (item.get("title") or "").strip()
        summary = (item.get("summary") or item.get("why_real_need") or "").strip()
        surface = (item.get("surface") or "").strip()
        theme_slug = (item.get("theme_id") or "").strip() or "theme"
        user_job = (item.get("user_job") or "").strip()
        fp = (item.get("fingerprint") or "").strip()
        if not fp or len(fp) < 16:
            fp = fingerprint(theme_slug, surface, title, summary[:200])
        score = float(item.get("demand_score") or 0)
        priority = (item.get("priority_hint") or "").strip() or None
        rank = item.get("rank")
        rank_i = int(rank) if rank is not None else None
        issue_numbers = item.get("issue_numbers") or []
        issue_count = int(item.get("issue_count") or len(issue_numbers) or 0)
        why = item.get("why_real_need") or item.get("evidence") or ""
        evidence = item.get("evidence") or ""

        existing = conn.execute(
            "SELECT * FROM themes WHERE fingerprint=?", (fp,)
        ).fetchone()
        if existing is None:
            cur = conn.execute(
                """INSERT INTO themes(
                     fingerprint, theme_id, title, surface, user_job, summary,
                     demand_score, priority_hint, rank, status, issue_count,
                     why_real_need, evidence, first_seen_at, last_seen_at,
                     last_run_id, payload_json, updated_at
                   ) VALUES (?,?,?,?,?,?,?,?,?,'active',?,?,?,?,?,?,?,?)""",
                (
                    fp,
                    theme_slug,
                    title or summary[:80] or theme_slug,
                    surface or None,
                    user_job or None,
                    summary or title,
                    score,
                    priority,
                    rank_i,
                    issue_count,
                    why,
                    evidence,
                    now,
                    now,
                    run_id,
                    jdump(item),
                    now,
                ),
            )
            tid = int(cur.lastrowid)
            new_n += 1
            _enqueue(conn, "theme", tid, int(min(100, max(1, round(score)))))
            conn.execute(
                """INSERT INTO demand_events(actor, kind, ref_id, note)
                   VALUES ('radar','theme_new',?,?)""",
                (tid, title[:200]),
            )
        else:
            tid = int(existing["id"])
            conn.execute(
                """UPDATE themes SET
                     theme_id=?,
                     title=CASE WHEN length(?)>length(title) THEN ? ELSE title END,
                     surface=COALESCE(NULLIF(?,''), surface),
                     user_job=COALESCE(NULLIF(?,''), user_job),
                     summary=CASE WHEN length(?)>length(summary) THEN ? ELSE summary END,
                     demand_score=MAX(demand_score, ?),
                     priority_hint=COALESCE(?, priority_hint),
                     rank=COALESCE(?, rank),
                     issue_count=MAX(issue_count, ?),
                     why_real_need=CASE WHEN length(?)>length(COALESCE(why_real_need,''))
                                       THEN ? ELSE why_real_need END,
                     evidence=CASE WHEN length(?)>length(COALESCE(evidence,''))
                                  THEN ? ELSE evidence END,
                     last_seen_at=?, last_run_id=?, payload_json=?, updated_at=?
                   WHERE id=?""",
                (
                    theme_slug or existing["theme_id"],
                    title,
                    title,
                    surface,
                    user_job,
                    summary,
                    summary,
                    score,
                    priority,
                    rank_i,
                    issue_count,
                    why or "",
                    why or "",
                    evidence or "",
                    evidence or "",
                    now,
                    run_id,
                    jdump(item),
                    now,
                    tid,
                ),
            )
            upd_n += 1
            if existing["status"] == "active":
                _enqueue(conn, "theme", tid, int(min(100, max(1, round(score)))))

        # Replace links for this theme from this ingest (full refresh of membership)
        conn.execute("DELETE FROM theme_issues WHERE theme_id=?", (tid,))
        for num in issue_numbers:
            try:
                inum = int(num)
            except (TypeError, ValueError):
                continue
            conn.execute(
                """INSERT OR IGNORE INTO theme_issues(theme_id, repo, issue_number, last_run_id)
                   VALUES (?,?,?,?)""",
                (tid, repo, inum, run_id),
            )
        theme_ids.append({"id": tid, "fingerprint": fp, "theme_id": theme_slug})

    conn.execute(
        """UPDATE demand_runs SET theme_new=theme_new+?, theme_updated=theme_updated+?
           WHERE id=?""",
        (new_n, upd_n, run_id),
    )
    conn.commit()
    conn.close()
    print(
        jdump(
            {
                "ok": True,
                "run_id": run_id,
                "new": new_n,
                "updated": upd_n,
                "themes": theme_ids,
            }
        )
    )


def cmd_ingest_posts(
    db: Path, run_id: int, json_file: Path | None, json_inline: str | None
) -> None:
    payload = load_payload(json_file, json_inline)
    if isinstance(payload, dict) and "posts" in payload:
        posts = payload["posts"]
    elif isinstance(payload, list):
        posts = payload
    else:
        raise SystemExit("expected {posts:[...]} or list")

    conn = connect(db)
    now = utc_now()
    new_n = upd_n = 0
    for p in posts:
        post_id = str(p.get("post_id") or p.get("id") or "").strip()
        url = (p.get("url") or "").strip()
        if not post_id and "/status/" in url:
            post_id = url.rstrip("/").split("/status/")[-1].split("?")[0]
        if not post_id:
            continue
        author = (p.get("author") or "").strip().lstrip("@")
        text = (p.get("text") or p.get("content") or "")[:4000]
        posted_at = p.get("posted_at") or p.get("created_at")
        eng = int(p.get("engagement") or p.get("likes") or 0)
        demand_kind = p.get("demand_kind")
        slice_name = p.get("slice") or p.get("slice_name")
        why = p.get("why_relevant")
        existing = conn.execute(
            "SELECT id FROM x_posts WHERE post_id=?", (post_id,)
        ).fetchone()
        if existing is None:
            conn.execute(
                """INSERT INTO x_posts(
                     post_id, author, url, posted_at, text, engagement,
                     demand_kind, slice_name, why_relevant, first_seen_at,
                     last_seen_at, last_run_id, raw_json
                   ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
                (
                    post_id,
                    author or None,
                    url or None,
                    posted_at,
                    text,
                    eng,
                    demand_kind,
                    slice_name,
                    why,
                    now,
                    now,
                    run_id,
                    jdump(p),
                ),
            )
            new_n += 1
        else:
            conn.execute(
                """UPDATE x_posts SET
                     author=COALESCE(?, author),
                     url=COALESCE(?, url),
                     posted_at=COALESCE(?, posted_at),
                     text=CASE WHEN length(?)>length(COALESCE(text,'')) THEN ? ELSE text END,
                     engagement=MAX(engagement, ?),
                     demand_kind=COALESCE(?, demand_kind),
                     slice_name=COALESCE(?, slice_name),
                     why_relevant=COALESCE(?, why_relevant),
                     last_seen_at=?, last_run_id=?, raw_json=?
                   WHERE post_id=?""",
                (
                    author or None,
                    url or None,
                    posted_at,
                    text,
                    text,
                    eng,
                    demand_kind,
                    slice_name,
                    why,
                    now,
                    run_id,
                    jdump(p),
                    post_id,
                ),
            )
            upd_n += 1
    conn.execute(
        "UPDATE demand_runs SET post_rows=post_rows+? WHERE id=?",
        (new_n + upd_n, run_id),
    )
    conn.commit()
    conn.close()
    print(jdump({"ok": True, "run_id": run_id, "new": new_n, "updated": upd_n}))


def cmd_ingest_matched(
    db: Path, run_id: int, json_file: Path | None, json_inline: str | None
) -> None:
    payload = load_payload(json_file, json_inline)
    if isinstance(payload, dict) and "matched" in payload:
        items = payload["matched"]
    elif isinstance(payload, list):
        items = payload
    else:
        raise SystemExit("expected {matched:[...]} or list")

    conn = connect(db)
    now = utc_now()
    n = 0
    for m in items:
        theme_id = (m.get("theme_id") or "").strip()
        title = (m.get("title") or "").strip()
        fp = fingerprint("match", theme_id, title)
        # try resolve theme row
        row = None
        if theme_id:
            row = conn.execute(
                "SELECT id, fingerprint FROM themes WHERE theme_id=? ORDER BY last_seen_at DESC LIMIT 1",
                (theme_id,),
            ).fetchone()
        theme_row_id = int(row["id"]) if row else None
        theme_fp = row["fingerprint"] if row else fp
        sample = m.get("sample_urls") or []
        conn.execute(
            """INSERT INTO theme_x_matches(
                 theme_row_id, theme_fingerprint, theme_id, title, priority_boost,
                 x_support, issue_support, evidence, sample_urls_json,
                 last_run_id, first_seen_at, last_seen_at
               ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
               ON CONFLICT(theme_fingerprint, title) DO UPDATE SET
                 priority_boost=excluded.priority_boost,
                 x_support=excluded.x_support,
                 issue_support=excluded.issue_support,
                 evidence=excluded.evidence,
                 sample_urls_json=excluded.sample_urls_json,
                 theme_row_id=COALESCE(excluded.theme_row_id, theme_x_matches.theme_row_id),
                 last_run_id=excluded.last_run_id,
                 last_seen_at=excluded.last_seen_at""",
            (
                theme_row_id,
                theme_fp,
                theme_id or None,
                title or theme_id or "match",
                m.get("priority_boost"),
                m.get("x_support"),
                m.get("issue_support"),
                m.get("evidence"),
                jdump(sample),
                run_id,
                now,
                now,
            ),
        )
        n += 1
    conn.commit()
    conn.close()
    print(jdump({"ok": True, "run_id": run_id, "rows": n}))


def cmd_ingest_latent(
    db: Path, run_id: int, json_file: Path | None, json_inline: str | None
) -> None:
    payload = load_payload(json_file, json_inline)
    if isinstance(payload, dict) and "latent" in payload:
        items = payload["latent"]
    elif isinstance(payload, list):
        items = payload
    else:
        raise SystemExit("expected {latent:[...]} or list")

    conn = connect(db)
    now = utc_now()
    new_n = upd_n = 0
    out = []
    for item in items:
        title = (item.get("title") or "").strip()
        summary = (item.get("summary") or "").strip()
        surface = (item.get("surface") or "").strip()
        user_job = (item.get("user_job") or "").strip()
        fp = (item.get("fingerprint") or "").strip()
        if not fp or len(fp) < 16:
            fp = fingerprint("latent", surface, title, summary[:200])
        conf = float(item.get("confidence") or 0.5)
        conf = max(0.0, min(1.0, conf))
        existing = conn.execute(
            "SELECT * FROM latent_signals WHERE fingerprint=?", (fp,)
        ).fetchone()
        if existing is None:
            cur = conn.execute(
                """INSERT INTO latent_signals(
                     fingerprint, title, surface, user_job, summary, confidence,
                     why_unfiled, evidence, suggested_issue_title, status,
                     sample_urls_json, first_seen_at, last_seen_at, last_run_id,
                     payload_json, updated_at
                   ) VALUES (?,?,?,?,?,?,?,?,?,'open',?,?,?,?,?,?)""",
                (
                    fp,
                    title or summary[:80] or "latent",
                    surface or None,
                    user_job or None,
                    summary or title,
                    conf,
                    item.get("why_unfiled"),
                    item.get("evidence"),
                    item.get("suggested_issue_title"),
                    jdump(item.get("sample_urls") or []),
                    now,
                    now,
                    run_id,
                    jdump(item),
                    now,
                ),
            )
            lid = int(cur.lastrowid)
            new_n += 1
            _enqueue(conn, "latent", lid, int(round(conf * 100)))
        else:
            lid = int(existing["id"])
            conn.execute(
                """UPDATE latent_signals SET
                     title=CASE WHEN length(?)>length(title) THEN ? ELSE title END,
                     surface=COALESCE(NULLIF(?,''), surface),
                     user_job=COALESCE(NULLIF(?,''), user_job),
                     summary=CASE WHEN length(?)>length(summary) THEN ? ELSE summary END,
                     confidence=MAX(confidence, ?),
                     why_unfiled=COALESCE(?, why_unfiled),
                     evidence=CASE WHEN length(COALESCE(?,''))>length(COALESCE(evidence,''))
                                  THEN ? ELSE evidence END,
                     suggested_issue_title=COALESCE(?, suggested_issue_title),
                     sample_urls_json=?,
                     last_seen_at=?, last_run_id=?, payload_json=?, updated_at=?
                   WHERE id=?""",
                (
                    title,
                    title,
                    surface,
                    user_job,
                    summary,
                    summary,
                    conf,
                    item.get("why_unfiled"),
                    item.get("evidence") or "",
                    item.get("evidence") or "",
                    item.get("suggested_issue_title"),
                    jdump(item.get("sample_urls") or []),
                    now,
                    run_id,
                    jdump(item),
                    now,
                    lid,
                ),
            )
            upd_n += 1
            if existing["status"] == "open":
                _enqueue(conn, "latent", lid, int(round(conf * 100)))
        out.append({"id": lid, "fingerprint": fp, "title": title})

    conn.execute(
        """UPDATE demand_runs SET latent_new=latent_new+?, latent_updated=latent_updated+?
           WHERE id=?""",
        (new_n, upd_n, run_id),
    )
    conn.commit()
    conn.close()
    print(jdump({"ok": True, "run_id": run_id, "new": new_n, "updated": upd_n, "items": out}))


def cmd_stats(db: Path) -> None:
    conn = connect(db)
    def c(sql: str, *a: Any) -> int:
        return int(conn.execute(sql, a).fetchone()[0])

    out = {
        "ok": True,
        "db": str(db),
        "runs": c("SELECT COUNT(*) FROM demand_runs"),
        "issues": c("SELECT COUNT(*) FROM issues"),
        "themes_active": c("SELECT COUNT(*) FROM themes WHERE status='active'"),
        "themes_all": c("SELECT COUNT(*) FROM themes"),
        "latent_open": c("SELECT COUNT(*) FROM latent_signals WHERE status='open'"),
        "latent_all": c("SELECT COUNT(*) FROM latent_signals"),
        "x_posts": c("SELECT COUNT(*) FROM x_posts"),
        "matches": c("SELECT COUNT(*) FROM theme_x_matches"),
        "queue_open": c("SELECT COUNT(*) FROM worker_queue WHERE claimed_by IS NULL"),
        "last_run": None,
    }
    last = conn.execute(
        "SELECT id, started_at, finished_at, summary, issue_rows, theme_new, theme_updated, "
        "post_rows, latent_new, latent_updated, report_path FROM demand_runs ORDER BY id DESC LIMIT 1"
    ).fetchone()
    if last:
        out["last_run"] = dict(last)
    top = conn.execute(
        """SELECT theme_id, title, surface, demand_score, issue_count, priority_hint
           FROM themes WHERE status='active'
           ORDER BY demand_score DESC LIMIT 10"""
    ).fetchall()
    out["top_themes"] = [dict(r) for r in top]
    top_l = conn.execute(
        """SELECT title, surface, confidence, suggested_issue_title
           FROM latent_signals WHERE status='open'
           ORDER BY confidence DESC LIMIT 10"""
    ).fetchall()
    out["top_latent"] = [dict(r) for r in top_l]
    conn.close()
    print(jdump(out))


def cmd_list_themes(db: Path, limit: int, status: str) -> None:
    conn = connect(db)
    rows = conn.execute(
        """SELECT t.id, t.fingerprint, t.theme_id, t.title, t.surface, t.user_job,
                  t.demand_score, t.priority_hint, t.rank, t.status, t.issue_count,
                  t.summary, t.last_seen_at,
                  (SELECT GROUP_CONCAT(issue_number) FROM theme_issues ti
                   WHERE ti.theme_id=t.id) AS issue_numbers
           FROM themes t
           WHERE (?='*' OR t.status=?)
           ORDER BY t.demand_score DESC, t.last_seen_at DESC
           LIMIT ?""",
        (status, status, limit),
    ).fetchall()
    conn.close()
    print(jdump({"ok": True, "themes": [dict(r) for r in rows]}))


def cmd_list_latent(db: Path, limit: int, status: str) -> None:
    conn = connect(db)
    rows = conn.execute(
        """SELECT id, fingerprint, title, surface, user_job, summary, confidence,
                  why_unfiled, suggested_issue_title, status, last_seen_at
           FROM latent_signals
           WHERE (?='*' OR status=?)
           ORDER BY confidence DESC, last_seen_at DESC
           LIMIT ?""",
        (status, status, limit),
    ).fetchall()
    conn.close()
    print(jdump({"ok": True, "latent": [dict(r) for r in rows]}))


def cmd_export(db: Path, what: str, out: Path | None) -> None:
    conn = connect(db)
    data: dict[str, Any] = {
        "exported_at": utc_now(),
        "db": str(db),
        "what": what,
    }
    if what in ("all", "issues"):
        data["issues"] = [
            dict(r)
            for r in conn.execute(
                "SELECT repo, number, title, labels_json, comments, reactions, "
                "created_at, updated_at, url, body_snippet, content_hash, last_seen_at "
                "FROM issues ORDER BY reactions DESC, comments DESC"
            ).fetchall()
        ]
    if what in ("all", "themes"):
        themes = []
        for r in conn.execute(
            "SELECT * FROM themes WHERE status='active' ORDER BY demand_score DESC"
        ).fetchall():
            d = dict(r)
            nums = [
                row["issue_number"]
                for row in conn.execute(
                    "SELECT issue_number FROM theme_issues WHERE theme_id=? ORDER BY issue_number",
                    (r["id"],),
                ).fetchall()
            ]
            d["issue_numbers"] = nums
            themes.append(d)
        data["themes"] = themes
    if what in ("all", "latent"):
        data["latent"] = [
            dict(r)
            for r in conn.execute(
                "SELECT * FROM latent_signals WHERE status='open' ORDER BY confidence DESC"
            ).fetchall()
        ]
    if what in ("all", "posts"):
        data["x_posts"] = [
            dict(r)
            for r in conn.execute(
                "SELECT post_id, author, url, posted_at, text, engagement, demand_kind, "
                "slice_name, why_relevant, last_seen_at FROM x_posts ORDER BY engagement DESC"
            ).fetchall()
        ]
    if what in ("all", "matches"):
        data["matched"] = [
            dict(r) for r in conn.execute("SELECT * FROM theme_x_matches").fetchall()
        ]
    if what in ("all", "runs"):
        data["runs"] = [dict(r) for r in conn.execute("SELECT * FROM demand_runs ORDER BY id").fetchall()]
    conn.close()
    text = jdump(data)
    if out:
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(text, encoding="utf-8")
        print(jdump({"ok": True, "path": str(out), "bytes": len(text.encode("utf-8"))}))
    else:
        print(text)


def cmd_claim(db: Path, worker: str, kind: str, limit: int) -> None:
    conn = connect(db)
    now = utc_now()
    rows = conn.execute(
        """SELECT * FROM worker_queue
           WHERE claimed_by IS NULL AND available_at<=? AND kind=?
           ORDER BY priority DESC, id ASC
           LIMIT ?""",
        (now, kind, limit),
    ).fetchall()
    claimed = []
    for r in rows:
        conn.execute(
            """UPDATE worker_queue SET claimed_by=?, claimed_at=?, attempt_count=attempt_count+1
               WHERE id=? AND claimed_by IS NULL""",
            (worker, now, r["id"]),
        )
        if conn.total_changes:
            ref = dict(r)
            if kind == "theme":
                t = conn.execute("SELECT * FROM themes WHERE id=?", (r["ref_id"],)).fetchone()
                ref["theme"] = dict(t) if t else None
            else:
                t = conn.execute(
                    "SELECT * FROM latent_signals WHERE id=?", (r["ref_id"],)
                ).fetchone()
                ref["latent"] = dict(t) if t else None
            claimed.append(ref)
    conn.commit()
    conn.close()
    print(jdump({"ok": True, "worker": worker, "claimed": claimed}))


def cmd_issue_numbers(db: Path, repo: str) -> None:
    conn = connect(db)
    nums = [
        int(r[0])
        for r in conn.execute(
            "SELECT number FROM issues WHERE repo=? ORDER BY number", (repo,)
        ).fetchall()
    ]
    conn.close()
    print(jdump({"ok": True, "repo": repo, "count": len(nums), "numbers": nums}))


def main() -> None:
    p = argparse.ArgumentParser(description="orca-demand-radar SQLite CLI")
    p.add_argument("--db", type=Path, default=DEFAULT_DB)
    sub = p.add_subparsers(dest="cmd", required=True)

    sub.add_parser("init")

    b = sub.add_parser("begin-run")
    b.add_argument("--repo", default="stablyai/orca")
    b.add_argument("--mode", default="full")
    b.add_argument("--args-json", default="{}")

    f = sub.add_parser("finish-run")
    f.add_argument("--run-id", type=int, required=True)
    f.add_argument("--summary", default="")
    f.add_argument("--report-path", default=None)
    f.add_argument("--inventory-path", default=None)

    u = sub.add_parser("upsert-issues")
    u.add_argument("--run-id", type=int, required=True)
    u.add_argument("--repo", default="stablyai/orca")
    u.add_argument("--json-file", type=Path)
    u.add_argument("--json", dest="json_inline")

    w = sub.add_parser("write-shards")
    w.add_argument("--run-id", type=int, required=True)
    w.add_argument("--repo", default="stablyai/orca")
    w.add_argument("--shards", type=int, default=8)
    w.add_argument("--out-dir", type=Path, required=True)
    w.add_argument("--max-issues", type=int, default=1024)
    w.add_argument("--only-changed", action="store_true")

    s = sub.add_parser("ingest-shard-clusters")
    s.add_argument("--run-id", type=int, required=True)
    s.add_argument("--json-file", type=Path)
    s.add_argument("--json", dest="json_inline")

    t = sub.add_parser("ingest-themes")
    t.add_argument("--run-id", type=int, required=True)
    t.add_argument("--repo", default="stablyai/orca")
    t.add_argument("--json-file", type=Path)
    t.add_argument("--json", dest="json_inline")

    posts = sub.add_parser("ingest-posts")
    posts.add_argument("--run-id", type=int, required=True)
    posts.add_argument("--json-file", type=Path)
    posts.add_argument("--json", dest="json_inline")

    m = sub.add_parser("ingest-matched")
    m.add_argument("--run-id", type=int, required=True)
    m.add_argument("--json-file", type=Path)
    m.add_argument("--json", dest="json_inline")

    lat = sub.add_parser("ingest-latent")
    lat.add_argument("--run-id", type=int, required=True)
    lat.add_argument("--json-file", type=Path)
    lat.add_argument("--json", dest="json_inline")

    sub.add_parser("stats")

    lt = sub.add_parser("list-themes")
    lt.add_argument("--limit", type=int, default=30)
    lt.add_argument("--status", default="active")

    ll = sub.add_parser("list-latent")
    ll.add_argument("--limit", type=int, default=30)
    ll.add_argument("--status", default="open")

    e = sub.add_parser("export")
    e.add_argument("--what", default="all", choices=["all", "issues", "themes", "latent", "posts", "matches", "runs"])
    e.add_argument("--out", type=Path)

    cl = sub.add_parser("claim")
    cl.add_argument("--worker", required=True)
    cl.add_argument("--kind", default="latent", choices=["theme", "latent"])
    cl.add_argument("--limit", type=int, default=3)

    inn = sub.add_parser("issue-numbers")
    inn.add_argument("--repo", default="stablyai/orca")

    args = p.parse_args()
    db: Path = args.db

    if args.cmd == "init":
        cmd_init(db)
    elif args.cmd == "begin-run":
        cmd_begin_run(db, args.repo, args.mode, args.args_json)
    elif args.cmd == "finish-run":
        cmd_finish_run(db, args.run_id, args.summary, args.report_path, args.inventory_path)
    elif args.cmd == "upsert-issues":
        cmd_upsert_issues(db, args.run_id, args.repo, args.json_file, args.json_inline)
    elif args.cmd == "write-shards":
        cmd_write_shards(
            db,
            args.run_id,
            args.repo,
            args.shards,
            args.out_dir,
            args.max_issues,
            args.only_changed,
        )
    elif args.cmd == "ingest-shard-clusters":
        cmd_ingest_shard_clusters(db, args.run_id, args.json_file, args.json_inline)
    elif args.cmd == "ingest-themes":
        cmd_ingest_themes(db, args.run_id, args.repo, args.json_file, args.json_inline)
    elif args.cmd == "ingest-posts":
        cmd_ingest_posts(db, args.run_id, args.json_file, args.json_inline)
    elif args.cmd == "ingest-matched":
        cmd_ingest_matched(db, args.run_id, args.json_file, args.json_inline)
    elif args.cmd == "ingest-latent":
        cmd_ingest_latent(db, args.run_id, args.json_file, args.json_inline)
    elif args.cmd == "stats":
        cmd_stats(db)
    elif args.cmd == "list-themes":
        cmd_list_themes(db, args.limit, args.status)
    elif args.cmd == "list-latent":
        cmd_list_latent(db, args.limit, args.status)
    elif args.cmd == "export":
        cmd_export(db, args.what, args.out)
    elif args.cmd == "claim":
        cmd_claim(db, args.worker, args.kind, args.limit)
    elif args.cmd == "issue-numbers":
        cmd_issue_numbers(db, args.repo)
    else:
        raise SystemExit(f"unknown cmd {args.cmd}")


if __name__ == "__main__":
    main()
