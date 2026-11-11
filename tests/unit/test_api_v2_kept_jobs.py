"""Song API v2 (review after phase 5): a job is answered from what is kept on disk - a succeeded job's files and
record without ComfyUI's history, a job at a review stop without asking ComfyUI - and a lost run is told on the
event stream."""

from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any

import pytest

from plenio.comfy import song_api_v2 as v2
from plenio.core.api.jobstore import JobStore
from plenio.core.song_api import SongApiError


@pytest.fixture
def store(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> JobStore:
    jobs = JobStore(tmp_path / "jobs", "test")
    monkeypatch.setattr(v2, "_store", jobs)
    monkeypatch.setattr(v2.host, "output_directory", lambda: tmp_path / "output")
    return jobs


def made(store: JobStore, tmp_path: Path) -> Any:
    folder = tmp_path / "output" / "plenio" / "Tests"
    folder.mkdir(parents=True)
    (folder / "Song.plenio.json").write_text('{"documents": {}}', encoding="utf-8")
    (folder / "Song.flac").write_bytes(b"fLaC")
    job = store.create(template="yue2-song", kind="song", prompt="p1", owner="here")
    files = [{"name": "Song.flac"}, {"name": "Song.plenio.json", "role": "record"}]
    return store.update(
        job.id, status="succeeded", result={"record": str(folder / "Song.plenio.json"), "files": files}
    )


def test_a_succeeded_jobs_file_needs_no_history(
    store: JobStore, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    job = made(store, tmp_path)
    monkeypatch.setattr(v2.v1, "_history", lambda prompt: None)  # ComfyUI restarted: its history is empty
    answer = v2._serve(job, "Song.flac")
    assert Path(answer._path).name == "Song.flac"  # noqa: SLF001 - aiohttp keeps the file it serves there
    with pytest.raises(SongApiError) as refused:
        v2._serve(job, "other.flac")
    assert refused.value.status == 404
    assert v2._record(job).name == "Song.plenio.json"


def test_a_job_without_a_song_has_no_record(store: JobStore) -> None:
    job = store.create(template="yue2-song", kind="song", prompt="p2", owner="here")
    with pytest.raises(SongApiError) as refused:
        v2._record(job)
    assert refused.value.status == 404 and "queued" in str(refused.value)


def test_a_job_at_a_review_stop_does_not_ask_comfyui(
    store: JobStore, monkeypatch: pytest.MonkeyPatch
) -> None:
    job = store.create(template="yue2-song", kind="song", prompt="p3", owner="here")
    job = store.update(
        job.id, status="waiting_for_review", stage="text", result={"waiting": {"stage": "text"}}
    )

    def asked(prompt: str) -> None:
        raise AssertionError("ComfyUI was asked")

    monkeypatch.setattr(v2.v1, "job_view", asked)
    assert v2._refresh(job)[0].status == "waiting_for_review"


def test_a_lost_run_is_told(store: JobStore, monkeypatch: pytest.MonkeyPatch) -> None:
    async def body() -> None:
        job = store.create(template="yue2-song", kind="song", prompt="p4", owner="here")
        monkeypatch.setattr(v2.v1, "job_view", lambda prompt: None)
        monkeypatch.setattr(v2.time, "time", lambda: job.updated + 60)
        hub = v2.EventHub()
        monkeypatch.setattr(v2, "HUB", hub)
        listener = hub.subscribe(asyncio.get_running_loop(), here=True, owner=None)
        lost, _view = v2._refresh(job)
        await asyncio.sleep(0)
        assert lost.status == "failed" and (lost.error or {}).get("code") == "lost"
        assert [listener.queue.get_nowait().kind] == ["job.failed"]

    asyncio.run(body())
