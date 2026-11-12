"""Jobs of the Song API v2 on disk (phase 5.2)."""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from plenio.core.api import jobstore
from plenio.core.api.jobstore import JobStore


class Clock:
    def __init__(self) -> None:
        self.now = 1_000_000.0

    def __call__(self) -> float:
        return self.now


def store(folder: Path, instance: str = "here:8188", clock: Clock | None = None) -> JobStore:
    return JobStore(folder, instance, clock=clock or Clock())


def test_a_job_is_kept_whole_and_read_again(tmp_path: Path) -> None:
    jobs = store(tmp_path)
    job = jobs.create(
        template="yue2-song", kind="song", prompt="p1", owner="here", key="k1", request={"fields": {}}
    )
    assert job.id.startswith("job_") and job.status == "queued" and job.prompts == ("p1",)
    jobs.update(job.id, status="running")
    jobs.update(job.id, status="waiting_for_review", stage="text")
    jobs.update(job.id, status="running", prompt="p2")
    done = jobs.update(job.id, status="succeeded", result={"title": "x"})
    assert done.prompts == ("p1", "p2") and done.ended is not None
    again = store(tmp_path)
    assert again.get(job.id) == done and again.by_prompt("p2") == done
    assert not list(tmp_path.glob("*.tmp"))
    assert json.loads((tmp_path / f"{job.id}.json").read_text(encoding="utf-8"))["schema"] == jobstore.SCHEMA
    with pytest.raises(ValueError, match="ended"):
        again.update(job.id, status="running")


def test_a_restart_fails_this_servers_running_jobs_and_frees_their_keys(tmp_path: Path) -> None:
    jobs = store(tmp_path)
    mine = jobs.create(template="yue2-song", kind="song", prompt="p1", owner="here", key="night-1")
    other = JobStore(tmp_path, "other:8189").create(
        template="yue2-song", kind="song", prompt="q", owner="here"
    )
    assert jobs.by_key("here", "night-1") == mine and jobs.by_key("token:a", "night-1") is None
    after = store(tmp_path)  # the same server again
    failed = after.get(mine.id)
    assert failed is not None and failed.status == "failed" and failed.error["code"] == "interrupted"
    assert after.get(other.id).status == "queued"  # another ComfyUI's job is left alone
    assert after.by_key("here", "night-1") is None  # posted again, it starts a new run


def test_damaged_and_half_written_files_are_skipped(tmp_path: Path) -> None:
    (tmp_path / "job_broken.json").write_text("{not json", encoding="utf-8")
    (tmp_path / "job_other.json").write_text(json.dumps({"schema": "x"}), encoding="utf-8")
    (tmp_path / ".job_abc.123.tmp").write_bytes(b"half")
    jobs = store(tmp_path)
    assert sorted(jobs.skipped) == ["job_broken.json", "job_other.json"]
    assert not list(tmp_path.glob(".job_*.tmp"))


def test_old_and_surplus_ended_jobs_are_forgotten(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    clock = Clock()
    jobs = store(tmp_path, clock=clock)
    monkeypatch.setattr(jobstore, "KEEP", 3)
    made = []
    for index in range(5):
        clock.now += 10
        job = jobs.create(template="t", kind="song", prompt=f"p{index}", owner="here")
        made.append(jobs.update(job.id, status="succeeded"))
    running = jobs.create(template="t", kind="song", prompt="live", owner="here")
    assert jobs.prune() == 2
    assert {j.id for j in jobs.listing()} == {made[2].id, made[3].id, made[4].id, running.id}
    clock.now += jobstore.KEEP_DAYS * 86400 + 100
    assert jobs.prune() == 3 and [j.id for j in jobs.listing()] == [running.id]  # a live job stays


def test_the_listing_is_the_callers(tmp_path: Path) -> None:
    jobs = store(tmp_path)
    a = jobs.create(template="t", kind="song", prompt="1", owner="token:a")
    jobs.create(template="t", kind="song", prompt="2", owner="token:b")
    assert [j.id for j in jobs.listing(owner="token:a")] == [a.id]
    assert len(jobs.listing()) == 2 and jobs.listing(statuses=["succeeded"]) == []


def test_a_lost_runs_key_makes_a_new_one(tmp_path: Path) -> None:
    jobs = store(tmp_path)
    job = jobs.create(template="yue2-song", kind="song", prompt="p1", owner="here", key="k1")
    assert jobs.by_key("here", "k1") == job
    jobs.update(job.id, status="failed", error={"code": "lost", "message": "gone"})
    assert jobs.by_key("here", "k1") is None


def test_old_jobs_are_forgotten_while_the_server_runs(tmp_path: Path) -> None:
    clock = Clock()
    jobs = store(tmp_path, clock=clock)
    old = jobs.create(template="yue2-song", kind="song", prompt="p1", owner="here")
    jobs.update(old.id, status="succeeded", result={})
    clock.now += jobstore.KEEP_DAYS * 86400 + jobstore.PRUNE_EVERY_S + 1
    jobs.create(template="yue2-song", kind="song", prompt="p2", owner="here")
    assert jobs.get(old.id) is None and not (tmp_path / f"{old.id}.json").exists()
