"""Party songs made from the player (owner's request 2026-10-25; docs/design/party-songs.md §3): who may, the line
(move among one's own places, edit and delete while waiting), the worker that sends one song at a time to the Song
API and follows it, the finished song in the library, the estimates - and the routes of the player's and the
guests' servers."""

from __future__ import annotations

import http.client
import json
import threading
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import pytest

from plenio.player import guest as guest_module
from plenio.player import maker as maker_module
from plenio.player.accounts import Accounts
from plenio.player.guest import GuestHub
from plenio.player.library import Library
from plenio.player.maker import MakerError, PartySongs, Studio, StudioError, StudioUnavailableError
from plenio.player.server import State, serve

ADMIN = {"kind": "admin", "id": "admin", "name": "Admin"}
ANNA = {"kind": "user", "id": "aaaaaaaaaaaa", "name": "Anna"}
BEN = {"kind": "user", "id": "bbbbbbbbbbbb", "name": "Ben"}
GUEST = {"kind": "guest", "id": "g123", "name": "Guest"}
SONG = {
    "genre": "synthwave",
    "length": "about 2:00",
    "vocals": "sung",
    "language": "English",
    "voice": "warm female vocal",
}


class FakeStudio:
    """The Song API as the worker sees it: jobs it was sent, their status as the test sets it."""

    def __init__(self) -> None:
        self.sent: list[dict[str, Any]] = []
        self.keys: list[str] = []
        self.uploads: list[tuple[str, bytes]] = []
        self.cancelled: list[str] = []
        self.views: dict[str, dict[str, Any]] = {}
        self.down = False
        self.refuse: StudioError | None = None

    def _check(self) -> None:
        if self.down:
            raise StudioUnavailableError("ComfyUI is not running")

    def queue(self) -> dict[str, Any]:
        self._check()
        return {"running": None, "pending": 0, "pending_api": [], "recent": []}

    def template(self, template_id: str) -> dict[str, Any]:
        raise StudioUnavailableError("not in this test")

    def briefs(self, kind: str) -> dict[str, Any]:
        raise StudioUnavailableError("not in this test")

    def upload(self, path: Path, name: str) -> dict[str, Any]:
        self._check()
        self.uploads.append((name, path.read_bytes()))
        return {"name": f"plenio-api-000000000000-{name}", "bytes": path.stat().st_size}

    def create(self, body: dict[str, Any], key: str) -> dict[str, Any]:
        self._check()
        if self.refuse is not None:
            raise self.refuse
        self.sent.append(body)
        self.keys.append(key)
        job_id = f"comfy-{len(self.sent)}"
        self.views[job_id] = {"id": job_id, "status": "queued", "queue_position": 1}
        return dict(self.views[job_id])

    def job(self, job_id: str) -> dict[str, Any]:
        self._check()
        if job_id not in self.views:
            raise StudioError(404, "not_found", "no such job")
        return dict(self.views[job_id])

    def cancel(self, job_id: str) -> dict[str, Any]:
        self.cancelled.append(job_id)
        return {"id": job_id, "status": "cancelled"}


def record(title: str) -> dict[str, Any]:
    return {
        "schema": "plenio.release/1",
        "title": title,
        "created": "2026-10-25T20:00:00Z",
        "prompt": {"1": {"class_type": "PlenioSongBrief", "inputs": {"genre": "synthwave"}}},
        "audio": {"seconds": 120.0, "tags": {"artist": "Anna", "album": "Party-Song 2026-10-25"}},
        "files": [{"name": f"{title}.flac", "format": "flac"}],
    }


class Clock:
    def __init__(self) -> None:
        self.now = 1_800_000_000.0

    def __call__(self) -> float:
        return self.now


@pytest.fixture
def party(tmp_path: Path) -> tuple[PartySongs, FakeStudio, Clock, Library]:
    library_folder = tmp_path / "library"
    library_folder.mkdir()
    library = Library([library_folder], cache=tmp_path / "state" / "cache.json")
    studio = FakeStudio()
    clock = Clock()
    songs = PartySongs(library, tmp_path / "state", studio, clock=clock)  # type: ignore[arg-type]
    songs.configure({"on": True})
    return songs, studio, clock, library


def test_nobody_but_the_admin_makes_songs_until_it_is_switched_on(tmp_path: Path) -> None:
    songs = PartySongs(Library([tmp_path]), tmp_path / "state", FakeStudio())  # type: ignore[arg-type]
    assert songs.may(ADMIN) == (True, "")
    assert songs.may(ANNA)[0] is False and songs.may(GUEST)[0] is False
    songs.configure({"on": True, "guests": False})
    assert songs.may(ANNA) == (True, "") and songs.may(GUEST)[0] is False and not songs.guests_may()
    with pytest.raises(MakerError) as error:
        songs.create(GUEST, {"fields": SONG})
    assert error.value.status == 403
    kept = json.loads((tmp_path / "state" / "party-songs.json").read_text(encoding="utf-8"))
    assert kept["settings"]["on"] is True and kept["settings"]["guests"] is False


def test_a_listener_makes_no_songs_and_a_helper_has_the_admins_rights(party: Any) -> None:
    """The groups (owner's request 2026-10-29): a listener may not make songs - not through the network with the
    whole studio either; a helper (the group *admin*) makes them like the admin and sees everybody's."""
    songs, _studio, _clock, _library = party
    songs.configure({"remote": True})
    listener = {**ANNA, "group": "listener"}
    allowed, why = songs.may({**listener, "remote": True})
    assert allowed is False and "listens only" in why
    with pytest.raises(MakerError):
        songs.create(listener, {"fields": SONG})
    assert songs.may({**ANNA, "group": "maker"}) == (True, "")
    helper = {"kind": "admin", "id": "hhhhhhhhhhhh", "name": "Hal", "group": "admin"}
    made = songs.create(ANNA, {"fields": SONG})
    assert songs.full(helper) and made["id"] in [j["id"] for j in songs.status(helper, everyone=True)["jobs"]]
    # Anna made a helper later still sees her own song
    assert made["id"] in [j["id"] for j in songs.status({**ANNA, "kind": "admin"})["jobs"]]


def test_a_song_waits_in_the_line_and_only_its_owner_and_the_admin_see_it(party: Any) -> None:
    songs, _studio, _clock, _library = party
    made = songs.create(GUEST, {"fields": {**SONG, "description": "  a  night\ndrive  "}})
    assert made["status"] == "waiting" and made["position"] == 1 and made["mine"]
    assert made["label"] == "synthwave · 2:00 · warm female vocal"
    assert made["fields"]["description"] == "a night\ndrive"
    assert made["can"] == {
        "edit": True,
        "up": False,
        "down": False,
        "delete": True,
        "listen": False,
        "release": False,
        "discard": False,
    }
    assert songs.listing(ANNA) == []
    everyone = songs.status(ADMIN, everyone=True)["jobs"]
    assert [j["owner"] for j in everyone] == [{"kind": "guest", "name": "Guest"}]
    assert "fields" not in songs.view(songs.jobs[0], ANNA)


@pytest.mark.parametrize(
    ("fields", "message"),
    [
        ({"genre": ""}, "Choose a style"),
        ({**SONG, "length": "very long (about 6:00)"}, "up to about 4:00"),
        ({**SONG, "vocals": "rap"}, "Vocals"),
        ({**SONG, "genre": "x" * 121}, "too long"),
        ({**SONG, "description": "x" * 1501}, "too long"),
        ({**SONG, "template": "../evil"}, "No such style"),
        ({**SONG, "lyrics_from": "my own, sung as written below"}, "Write your lyrics"),
        ({**SONG, "lyrics_from": "chanted"}, "Lyrics: one of"),
        ({**SONG, "lyrics": "x" * 6001}, "too long"),
    ],
)
def test_a_form_that_is_not_right_is_refused(party: Any, fields: dict[str, Any], message: str) -> None:
    songs = party[0]
    with pytest.raises(MakerError, match=message):
        songs.create(ANNA, {"fields": fields})


def test_ones_own_lyrics_keep_their_lines_and_an_instrumental_sends_none(party: Any) -> None:
    songs, studio, _clock, _library = party
    own = {**SONG, "lyrics_from": "my own, sung as written below", "lyrics": "Line one\r\n\n  Line   two  "}
    made = songs.create(ANNA, {"fields": own})["fields"]
    assert made["lyrics"] == "Line one\n\nLine two" and made["lyrics_from"] == "my own, sung as written below"
    assert songs.create(ANNA, {"fields": SONG})["fields"]["lyrics_from"] == "written from the idea below"
    songs.tick()
    assert studio.sent[0]["fields"]["lyrics"] == "Line one\n\nLine two"
    assert songs.form(ANNA)["limits"]["lyrics"] == maker_module.LYRICS_LIMIT


def test_the_admin_may_make_longer_songs_and_a_length_in_minutes_is_one_of_the_choices(party: Any) -> None:
    songs = party[0]
    assert (
        songs.create(ADMIN, {"fields": {**SONG, "length": "very long (about 6:00)"}})["fields"]["length"]
        == "very long (about 6:00)"
    )
    assert songs.create(ANNA, {"fields": {**SONG, "length": "2:25"}})["fields"]["length"] == "about 2:30"
    assert songs.form(ANNA)["song"]["choices"]["length"][-1] == "about 4:00"
    assert songs.form(ADMIN)["song"]["choices"]["length"][-1] == "very long (about 6:00)"


def test_a_person_has_so_many_songs_in_the_making(party: Any) -> None:
    songs = party[0]
    songs.configure({"per_person": 2})
    songs.create(GUEST, {"fields": SONG})
    songs.create(GUEST, {"fields": SONG})
    with pytest.raises(MakerError) as error:
        songs.create(GUEST, {"fields": SONG})
    assert error.value.status == 429
    songs.create(ANNA, {"fields": SONG})  # another person
    for _ in range(3):
        songs.create(ADMIN, {"fields": SONG})  # the admin has no limit


def test_one_moves_among_ones_own_places_and_the_admin_moves_any(party: Any) -> None:
    songs = party[0]
    a1 = songs.create(ANNA, {"fields": {**SONG, "genre": "a1"}})["id"]
    songs.create(BEN, {"fields": {**SONG, "genre": "b1"}})
    a2 = songs.create(ANNA, {"fields": {**SONG, "genre": "a2"}})["id"]

    def order() -> list[str]:
        return [j["fields"]["genre"] for j in songs.jobs if j["status"] == "waiting"]

    assert songs.view(songs.jobs[2], ANNA)["can"]["up"] is True
    songs.move(ANNA, a2, -1)
    assert order() == ["a2", "b1", "a1"]  # Ben keeps his place in the middle
    with pytest.raises(MakerError, match="first already"):
        songs.move(ANNA, a2, -1)
    songs.move(ADMIN, a1, -1)
    assert order() == ["a2", "a1", "b1"]
    with pytest.raises(MakerError) as error:
        songs.move(BEN, a1, 1)
    assert error.value.status == 404  # not his song


def test_a_waiting_song_is_edited_and_one_being_made_is_not(party: Any) -> None:
    songs, studio, _clock, _library = party
    job = songs.create(ANNA, {"fields": SONG})["id"]
    assert songs.update(ANNA, job, {"fields": {**SONG, "genre": "disco"}})["fields"]["genre"] == "disco"
    songs.tick()
    assert studio.sent and songs.jobs[0]["status"] == "queued"
    with pytest.raises(MakerError) as error:
        songs.update(ANNA, job, {"fields": SONG})
    assert error.value.status == 409


def test_the_worker_sends_one_song_at_a_time_with_the_party_settings(party: Any) -> None:
    songs, studio, clock, _library = party
    first = songs.create(GUEST, {"fields": {**SONG, "template": "electronic/synthwave"}})["id"]
    songs.create(ANNA, {"fields": {**SONG, "vocals": "instrumental", "voice": "ignored"}})
    songs.tick()
    assert len(studio.sent) == 1 and studio.keys == [f"plenio-player-{first}"]
    body = studio.sent[0]
    assert body["template"] == "yue2-song" and body["strict"] is False
    assert body["fields"]["finish.hq_mastering"] is False and body["fields"]["finish.cover_art"] is True
    assert body["fields"]["template"] == "electronic/synthwave" and body["fields"]["length"] == "about 2:00"
    date = maker_module._today(clock.now)
    assert body["release"] == {
        "folder": f"plenio/Party-Songs-{date}",
        "album": f"Party-Song {date}",
        "artist": "Guest",
    }
    songs.tick()
    assert len(studio.sent) == 1  # the next waits for this one
    studio.views["comfy-1"] = {
        "id": "comfy-1",
        "status": "succeeded",
        "started_at": clock.now - 300,
        "finished_at": clock.now,
        "result": {"title": "Neon", "record": ""},
    }
    songs.tick()
    songs.tick()
    assert len(studio.sent) == 2
    second = studio.sent[1]
    # a user's song is not a party song (owner's request 2026-10-28): the template's folder and tags, as in ComfyUI
    assert second["release"] == {} and "voice" not in second["fields"]  # an instrumental has no voice


def test_a_finished_song_comes_into_the_library_also_from_outside_its_folders(
    party: Any, tmp_path: Path
) -> None:
    songs, studio, clock, library = party
    songs.create(ANNA, {"fields": SONG})
    songs.tick()
    party_folder = tmp_path / "comfy-output" / "plenio" / "Party-Songs-2026-10-25"
    party_folder.mkdir(parents=True)
    path = party_folder / "Neon.plenio.json"
    path.write_text(json.dumps(record("Neon")), encoding="utf-8")
    (party_folder / "Neon.flac").write_bytes(b"f" * 64)
    studio.views["comfy-1"] = {
        "id": "comfy-1",
        "status": "running",
        "started_at": clock.now,
        "stage": {"group": "5 · RENDER", "text": "singing and playing"},
    }
    songs.tick()
    running = songs.listing(ANNA)[0]
    assert (
        running["status"] == "running"
        and running["stage"]["text"] == "singing and playing"
        and running["eta"]
    )
    clock.now += 400
    studio.views["comfy-1"] = {
        "id": "comfy-1",
        "status": "succeeded",
        "started_at": clock.now - 400,
        "finished_at": clock.now,
        "result": {"title": "Neon", "record": str(path)},
    }
    songs.tick()
    done = songs.listing(ANNA)[0]
    assert done["status"] == "done" and done["result"]["title"] == "Neon"
    song = library.song(done["result"]["song"])
    assert song is not None and song.record == path
    assert songs.folders == [str(party_folder.resolve())]
    assert song.summary["title"] == "Neon"
    # the estimates learnt how long a song takes here: a two-minute song took 400 s
    assert songs.estimate(songs.jobs[0]) == pytest.approx(400, rel=0.01)


def test_a_song_from_outside_the_folders_is_new_for_live_play_when_it_comes_in(
    party: Any, tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    """Tutorial recording 2026-10-27: the day's first party song was written into a folder the player did not
    read yet. Once the folder was added its record was older than Live Play's last "now", so Live Play never
    took the song in (the later ones of the folder came in)."""
    from plenio.player import library as library_module

    songs, studio, clock, library = party
    songs.create(ANNA, {"fields": SONG})
    songs.tick()
    party_folder = tmp_path / "comfy-output" / "plenio" / "Party-Songs-2026-10-27"
    party_folder.mkdir(parents=True)
    path = party_folder / "Neon.plenio.json"
    path.write_text(json.dumps(record("Neon")), encoding="utf-8")
    (party_folder / "Neon.flac").write_bytes(b"f" * 64)
    # Live Play asks again half a minute after the record was written (a clock that moves on with every look)
    ahead = [library_module.time.time() + 30]

    def later() -> float:
        ahead[0] += 0.25
        return ahead[0]

    monkeypatch.setattr(library_module.time, "time", later)
    library.scan(force=True)
    since = library.scan_started
    assert library.newer(since) == []
    studio.views["comfy-1"] = {
        "id": "comfy-1",
        "status": "succeeded",
        "started_at": clock.now - 300,
        "finished_at": clock.now,
        "result": {"title": "Neon", "record": str(path)},
    }
    songs.tick()
    assert songs.folders == [str(party_folder.resolve())]
    library.scan(force=True)  # read once more before Live Play asks: still new for it
    assert [s["title"] for s in library.newer(since)] == ["Neon"]
    # once only: from the answer's "now" on it is not new again
    assert library.newer(library.scan_started) == []


def test_a_song_comfyui_forgot_is_made_again_once(party: Any) -> None:
    songs, studio, _clock, _library = party
    songs.create(ANNA, {"fields": SONG})
    songs.tick()
    studio.views.clear()  # ComfyUI restarted
    songs.tick()
    job = songs.jobs[0]
    assert job["status"] == "waiting" and job["retried"] and job["note"].startswith("ComfyUI restarted")
    songs.tick()
    studio.views.clear()
    songs.tick()
    assert songs.jobs[0]["status"] == "failed" and "lost" in songs.jobs[0]["error"]


def test_without_comfyui_the_song_waits_and_a_refusal_is_said(party: Any) -> None:
    songs, studio, _clock, _library = party
    studio.down = True
    songs.create(ANNA, {"fields": SONG})
    songs.tick()
    assert songs.jobs[0]["status"] == "waiting" and not studio.sent
    assert songs.status(ADMIN)["studio"]["reachable"] is False
    studio.down = False
    songs.studio_state["checked"] = 0.0
    studio.refuse = StudioError(400, "comfyui_rejected", "ComfyUI refused the run: a model file is missing.")
    songs.tick()
    assert songs.jobs[0]["status"] == "failed" and "model file" in songs.jobs[0]["error"]


def test_deleting_takes_a_waiting_song_out_and_stops_one_being_made(party: Any) -> None:
    songs, studio, _clock, _library = party
    first = songs.create(ANNA, {"fields": SONG})["id"]
    second = songs.create(ANNA, {"fields": SONG})["id"]
    assert songs.remove(ANNA, second) == {"id": second, "removed": True}
    songs.tick()
    stopped = songs.remove(ANNA, first)
    assert stopped["status"] == "cancelled" and studio.cancelled == ["comfy-1"]
    assert songs.remove(ANNA, first) == {"id": first, "removed": True}  # off the list
    assert songs.jobs == []


def test_a_cover_sends_its_recording_and_keeps_the_originals_tempo_and_length(party: Any) -> None:
    songs, studio, _clock, _library = party
    source = songs.add_source(GUEST, "My Song.mp3", b"ID3" + b"\x00" * 64)
    assert source["name"] == "My Song.mp3" and source["title"] == "My Song"
    with pytest.raises(MakerError, match="audio file"):
        songs.add_source(GUEST, "evil.exe", b"MZ")
    job = songs.create(
        GUEST,
        {
            "source": source["id"],
            "fields": {"genre": "jazz", "vocals": "original lyrics", "tempo": "120 BPM", "theme": "x"},
        },
    )
    assert job["kind"] == "cover" and job["label"].startswith("Cover of My Song")
    with pytest.raises(MakerError, match="No such recording"):
        songs.create(ANNA, {"source": source["id"], "fields": {"genre": "jazz"}})  # not her recording
    songs.tick()
    body = studio.sent[0]
    assert body["template"] == "yue2-cover" and studio.uploads[0][0] == "My Song.mp3"
    assert body["fields"]["source.audio"] == "plenio-api-000000000000-My Song.mp3"
    assert "tempo" not in body["fields"] and "theme" not in body["fields"]  # original lyrics keep their theme
    songs.configure({"covers": False})
    with pytest.raises(MakerError) as error:
        songs.add_source(GUEST, "b.mp3", b"ID3")
    assert error.value.status == 403


def test_the_line_says_roughly_when_each_song_will_be_ready(party: Any) -> None:
    songs, _studio, clock, _library = party
    for _ in range(3):
        songs.create(ANNA, {"fields": SONG})
    jobs = songs.listing(ANNA)
    etas = [j["eta"] for j in jobs]
    assert etas == sorted(etas) and etas[0] > clock.now
    per_song = songs.estimate(songs.jobs[0])
    assert etas[2] - etas[1] == pytest.approx(per_song, abs=1.5)
    assert [j["position"] for j in jobs] == [1, 2, 3]


def test_the_state_survives_a_restart(party: Any, tmp_path: Path) -> None:
    songs, studio, _clock, library = party
    songs.create(ANNA, {"fields": SONG})
    songs.jobs[0]["status"] = "sending"
    songs._save()
    again = PartySongs(library, tmp_path / "state", studio)  # type: ignore[arg-type]
    assert again.jobs[0]["status"] == "waiting" and again.settings["on"] is True


def test_who_made_a_party_song_is_shown_as_the_admin_chooses(party: Any, tmp_path: Path) -> None:
    songs, studio, _clock, library = party
    assert songs.settings["credit"] == "off"  # not shown until the admin says so
    with pytest.raises(MakerError):
        songs.configure({"credit": "everywhere"})
    songs.configure({"credit": "drift"})
    assert songs.status(ANNA)["settings"]["credit"] == "drift"  # every listener's player shows it
    assert PartySongs(library, tmp_path / "state", studio).settings["credit"] == "drift"  # type: ignore[arg-type]
    assert maker_module.party_maker({"album": "Party-Song 2026-10-25", "artist": "Anna"}) == "Anna"
    assert maker_module.party_maker({"album": "Party-Song 2026-10-25"}) == "Guest"
    assert maker_module.party_maker({"album": "Summer", "artist": "Anna"}) is None


def test_the_guests_see_who_made_the_party_song_that_plays(party: Any, tmp_path: Path) -> None:
    songs, _studio, _clock, library = party
    folder = tmp_path / "library" / "Party-Songs-2026-10-25"
    folder.mkdir()
    (folder / "Neon.plenio.json").write_text(json.dumps(record("Neon")), encoding="utf-8")
    (folder / "Neon.flac").write_bytes(b"f" * 64)
    library.scan(force=True)
    song_id = library.songs()[0]["id"]
    hub = GuestHub(library, tmp_path / "state", host="127.0.0.1")
    hub.maker = songs
    hub.publish({"live": True, "playing": True, "now": {"id": song_id}})
    assert hub.snapshot["now"]["made_by"] == ""  # the admin has not chosen to show it
    songs.configure({"credit": "spotlight"})
    hub.publish({"live": True, "playing": True, "now": {"id": song_id}, "next": [{"id": song_id}]})
    assert hub.snapshot["now"]["made_by"] == "Anna" and hub.snapshot["next"][0]["made_by"] == "Anna"


# --- again from a song; the whole studio (2026-10-26) -------------------------------------------------------

REMOTE = {"kind": "user", "id": "cccccccccccc", "name": "Cleo", "remote": True}
DOCUMENTS = {
    "title": "Neon",
    "style": "synthwave, warm female vocal",
    "lyrics": "[verse]\nCity lights\n\n[chorus]\nNeon nights",
    "score": "X:1\nK:C\nC|",
    "artwork_prompt": "a car at night",
}


def made_song(
    folder: Path,
    title: str,
    *,
    model: str = "YuE2GenerateMusic",
    brief: str = "PlenioSongBrief",
    length: str = "very short (about 1:00)",
    **docs: Any,
) -> None:
    """A song as Export Release leaves it: its record (the brief, the model, the documents) and its audio."""
    documents = {
        k: {"state": "auto", "text": v} for k, v in {**DOCUMENTS, "title": title, **docs}.items() if v
    }
    data = {
        "schema": "plenio.record/1",
        "title": title,
        "created": "2026-10-25T20:00:00Z",
        "prompt": {
            "2": {
                "class_type": brief,
                "inputs": {
                    "genre": "synthwave",
                    "length": length,
                    "vocals": "sung",
                    "vocals.voice": "warm female vocal",
                    "description": "a night drive",
                },
                "_meta": {"title": "Song Brief"},
            },
            "15": {"class_type": model, "inputs": {}, "_meta": {"title": "render"}},
        },
        "documents": documents,
        "audio": {"seconds": 64.0, "tags": {"artist": "Anna", "album": "Party-Song 2026-10-25"}},
        "files": [{"name": f"{title}.flac", "format": "flac"}],
    }
    (folder / f"{title}.plenio.json").write_text(json.dumps(data), encoding="utf-8")
    (folder / f"{title}.flac").write_bytes(b"fLaC" + b"\0" * 60)


class AgainStudio(FakeStudio):
    """The Song API's ``/from-record`` too: the song's request, from its record."""

    def __init__(self) -> None:
        super().__init__()
        self.records: list[dict[str, Any]] = []

    def from_record(self, record: dict[str, Any]) -> dict[str, Any]:
        self._check()
        self.records.append(record)
        cover = any(n.get("class_type") == "PlenioCoverBrief" for n in record["prompt"].values())
        made = any(n.get("class_type", "").startswith("YuE2") for n in record["prompt"].values())
        return {
            "template": "yue2-cover" if cover else "yue2-song",
            "kind": "cover" if cover else "song",
            "title": record["title"],
            "model": "YuE2" if made else "MiniMax Music 3",
            "fields": {
                "genre": "synthwave",
                "creativity": 60,
                "finish.hq_mastering": True,
                "finish.cover_art": True,
            },
            "release": {"folder": "plenio", "album": "Night drives", "mp3": True},
            "seeds": {"draft": 11, "plan": 12, "take": 13, "cover": 14},
            "documents": {k: d["text"] for k, d in record["documents"].items()},
            "take": {"possible": made, "why": "" if made else "It was made with MiniMax Music 3."},
            "warnings": [],
        }


@pytest.fixture
def again(tmp_path: Path) -> tuple[PartySongs, AgainStudio, Clock, Library, dict[str, str]]:
    folder = tmp_path / "library"
    folder.mkdir()
    made_song(folder, "Neon")
    made_song(folder, "Unplanned", score="")
    made_song(folder, "Old", model="MiniMaxMusic")
    library = Library([folder], cache=tmp_path / "state" / "cache.json")
    library.scan(force=True)
    ids = {s["title"]: s["id"] for s in library.songs()}
    studio = AgainStudio()
    clock = Clock()
    songs = PartySongs(library, tmp_path / "state", studio, clock=clock)  # type: ignore[arg-type]
    songs.configure({"on": True})
    return songs, studio, clock, library, ids


def test_a_song_of_the_library_says_what_can_be_made_of_it_again(again: Any) -> None:
    songs, _studio, _clock, _library, ids = again
    start = songs.remake(ANNA, ids["Neon"])
    assert start["can"] == {"take": True, "song": True, "cover": True} and start["start"] == "take"
    assert start["song"]["title"] == "Neon" and start["song"]["model"] == "YuE2"
    assert start["fields"]["genre"] == "synthwave" and start["fields"]["voice"] == "warm female vocal"
    assert (
        start["documents"]["lyrics"].startswith("[verse]") and start["studio"] is None
    )  # not the whole studio
    assert songs.remake(ADMIN, ids["Neon"])["studio"]["release"]["album"] == "Night drives"
    unplanned = songs.remake(ANNA, ids["Unplanned"])
    assert not unplanned["can"]["take"] and unplanned["why"]["take"] == "its record has no score."
    old = songs.remake(ANNA, ids["Old"])
    assert not old["can"]["take"] and "MiniMax" in old["why"]["take"] and old["can"]["song"]
    with pytest.raises(MakerError):
        songs.create(ANNA, {"from": {"song": ids["Old"], "as": "take"}})
    with pytest.raises(MakerError) as caught:
        songs.remake(ANNA, "0123456789ab")
    assert caught.value.status == 404


def test_a_new_take_keeps_the_songs_documents_and_draws_a_new_take_seed(again: Any) -> None:
    songs, studio, clock, _library, ids = again
    job = songs.create(
        ANNA, {"from": {"song": ids["Neon"], "as": "take"}, "documents": {"title": "Neon (live)"}}
    )
    assert job["label"] == "New take of Neon" and job["again"] == "take" and job["from"]["title"] == "Neon"
    assert job["estimate"] == round(60 + 1.5 * 64)  # nothing to write or plan
    songs.tick()
    body = studio.sent[0]
    assert body["template"] == "yue2-song" and studio.records[0]["title"] == "Neon"
    assert body["documents"] == {**DOCUMENTS, "title": "Neon (live)"}  # the notes too: the same song
    assert body["seeds"] == {"draft": 11, "plan": 12, "cover": 14}  # the take seed drawn anew
    # the player's rules: HQ mastering off, cover art on - the song's own settings else; a user's take is no party song
    assert body["fields"] == {
        "genre": "synthwave",
        "creativity": 60,
        "finish.hq_mastering": False,
        "finish.cover_art": True,
    }
    assert body["release"] == {}


def test_new_words_for_a_take_get_new_notes(again: Any) -> None:
    songs, studio, _clock, _library, ids = again
    lyrics = "[verse]\nCity rain\n\n[chorus]\nNeon again"
    songs.create(ANNA, {"from": {"song": ids["Neon"], "as": "take"}, "documents": {"lyrics": lyrics}})
    songs.tick()
    body = studio.sent[0]
    assert body["documents"]["lyrics"] == lyrics and "score" not in body["documents"]
    with pytest.raises(MakerError):
        songs.create(ANNA, {"from": {"song": ids["Neon"], "as": "take"}, "documents": {"title": "a\nb"}})


def test_a_new_song_like_it_and_a_cover_of_it(again: Any) -> None:
    songs, studio, clock, library, ids = again
    like = songs.create(
        ANNA, {"from": {"song": ids["Neon"], "as": "song"}, "fields": {**SONG, "genre": "italo disco"}}
    )
    assert like["label"].startswith("Like Neon · italo disco")
    cover = songs.create(
        BEN, {"from": {"song": ids["Neon"], "as": "cover"}, "fields": {"genre": "bossa nova"}}
    )
    assert cover["kind"] == "cover" and cover["label"].startswith("Cover of Neon")
    songs.tick()
    assert "documents" not in studio.sent[0] and studio.sent[0]["fields"]["genre"] == "italo disco"
    studio.views["comfy-1"] = {"id": "comfy-1", "status": "succeeded", "result": {"title": "x", "record": ""}}
    songs.tick()
    songs.tick()
    # the song's own audio file is the original - sent to ComfyUI, and nothing of the library removed
    assert studio.uploads == [
        ("Neon.flac", (library.song(ids["Neon"]).record.parent / "Neon.flac").read_bytes())
    ]
    assert studio.sent[1]["fields"]["source.audio"] == "plenio-api-000000000000-Neon.flac"
    songs.remove(BEN, cover["id"])
    assert (library.song(ids["Neon"]).record.parent / "Neon.flac").is_file()


def test_the_partys_guests_make_again_only_their_own_songs(again: Any) -> None:
    songs, studio, clock, _library, ids = again
    party_guest = {**GUEST, "party": True}
    with pytest.raises(MakerError) as caught:
        songs.remake(party_guest, ids["Neon"])
    assert caught.value.status == 404
    with pytest.raises(MakerError):
        songs.create(party_guest, {"from": {"song": ids["Neon"], "as": "take"}})
    mine = songs.create(party_guest, {"fields": SONG})["id"]
    job = next(j for j in songs.jobs if j["id"] == mine)
    job.update(status="done", result={"title": "Neon", "record": "", "song": ids["Neon"]})
    assert songs.remake(party_guest, ids["Neon"])["can"]["take"]
    assert songs.create(party_guest, {"from": {"song": ids["Neon"], "as": "take"}})["again"] == "take"


def test_the_whole_studio_from_the_network(again: Any) -> None:
    songs, studio, clock, _library, ids = again
    songs.configure({"on": False})
    assert songs.may(REMOTE) == (True, "")  # at any time
    assert songs.status(REMOTE)["me"]["full"] is True
    assert songs.form(REMOTE)["studio"] == {
        "unavailable": "ComfyUI is not running - its settings show once it runs."
    }
    studio_values = {
        "fields": {
            "finish.hq_mastering": True,
            "finish.cover_art": False,
            "writer.model": "qwen3.5-9b.gguf",
            "creativity": 80,
        },
        "release": {"folder": "plenio/Cleo", "mp3": True, "wav": False, "album": "Home"},
    }
    long = {**SONG, "length": "very long (about 6:00)"}  # no party limit
    songs.create(REMOTE, {"fields": long, "studio": studio_values})
    songs.tick()
    body = studio.sent[0]
    assert body["fields"]["finish.hq_mastering"] is True and body["fields"]["finish.cover_art"] is False
    assert body["fields"]["writer.model"] == "qwen3.5-9b.gguf" and body["fields"]["creativity"] == 80
    assert body["release"] == {
        "folder": "plenio/Cleo",
        "album": "Home",
        "mp3": True,
        "wav": False,
    }
    # a new take with the whole studio: the song's release, as changed
    songs.create(
        REMOTE,
        {"from": {"song": ids["Neon"], "as": "take"}, "studio": {"fields": {}, "release": {"wav": True}}},
    )
    studio.views["comfy-1"] = {"id": "comfy-1", "status": "succeeded", "result": {"title": "x", "record": ""}}
    songs.tick()
    songs.tick()
    take = studio.sent[1]
    assert (
        take["release"]["folder"] == "plenio"
        and take["release"]["wav"] is True
        and take["release"]["mp3"] is True
    )
    assert take["fields"]["finish.hq_mastering"] is True  # the song's own, not the party's
    # not for others, and only folders below ComfyUI's output folder
    with pytest.raises(MakerError) as caught:
        songs.create({**ANNA}, {"fields": SONG, "studio": studio_values})
    assert caught.value.status == 403
    for folder in ("../outside", "C:/Windows", "/etc"):
        with pytest.raises(MakerError):
            songs.create(REMOTE, {"fields": SONG, "studio": {"release": {"folder": folder}}})
    songs.configure({"remote": False})
    assert songs.may(REMOTE)[0] is False and songs.status(REMOTE)["me"]["full"] is False


def test_a_song_made_again_never_overwrites_the_one_it_comes_from(again: Any) -> None:
    songs, studio, _clock, _library, ids = again
    plain = studio.from_record

    def overwriting(record: dict[str, Any]) -> dict[str, Any]:
        answer = plain(record)
        answer["release"] = {**answer["release"], "collision": "overwrite"}
        return answer

    studio.from_record = overwriting  # type: ignore[method-assign]
    # the studio starts from the song's release - but a new number, the template's rule, for the files
    assert songs.remake(ADMIN, ids["Neon"])["studio"]["release"] == {
        "folder": "plenio",
        "album": "Night drives",
        "mp3": True,
    }
    songs.create(ADMIN, {"from": {"song": ids["Neon"], "as": "take"}})
    songs.tick()
    assert (
        "collision" not in studio.sent[0]["release"] and studio.sent[0]["release"]["album"] == "Night drives"
    )


def test_a_covers_words_stay_as_they_are_in_a_new_take(again: Any, tmp_path: Path) -> None:
    songs, studio, _clock, library, _ids = again
    made_song(tmp_path / "library", "Covered", brief="PlenioCoverBrief")
    library.scan(force=True)
    covered = next(s["id"] for s in library.songs() if s["title"] == "Covered")
    words = {"title": "Covered (again)", "lyrics": "[verse]\nOther words"}
    job = songs.create(ANNA, {"from": {"song": covered, "as": "take"}, "documents": words})
    assert job["kind"] == "cover" and job["documents"] == {"title": "Covered (again)"}
    songs.tick()
    body = studio.sent[0]
    assert body["template"] == "yue2-cover" and body["documents"]["title"] == "Covered (again)"
    # they follow the original's melody: the lyrics and the notes as the cover has them
    assert (
        body["documents"]["lyrics"] == DOCUMENTS["lyrics"]
        and body["documents"]["score"] == DOCUMENTS["score"]
    )
    assert job["estimate"] == round(120 + 1.5 * 64)  # it reads the original again: as long as a cover


def test_a_take_is_as_long_as_the_party_allows_but_the_whole_studio_has_no_limit(
    again: Any, tmp_path: Path
) -> None:
    songs, _studio, _clock, library, _ids = again
    made_song(tmp_path / "library", "Epic", length="very long (about 6:00)")
    made_song(tmp_path / "library", "Early", length="1 minute")  # a length as Plenio 0.1 named it
    library.scan(force=True)
    found = {s["title"]: s["id"] for s in library.songs()}
    assert (
        songs.remake(ANNA, found["Epic"])["why"]["take"] == "it is longer than the host allows (about 4:00)."
    )
    with pytest.raises(MakerError):
        songs.create(ANNA, {"from": {"song": found["Epic"], "as": "take"}})
    assert (
        songs.remake(ADMIN, found["Epic"])["can"]["take"]
        and songs.remake(REMOTE, found["Epic"])["can"]["take"]
    )
    assert songs.create(REMOTE, {"from": {"song": found["Epic"], "as": "take"}})["again"] == "take"
    assert songs.remake(ANNA, found["Early"])["can"]["take"]


# --- the Song API over HTTP -----------------------------------------------------------------------------


def test_the_studio_client_says_why_and_asks_only_this_computer() -> None:
    with pytest.raises(StudioUnavailableError):
        Studio(lambda: "http://192.168.1.5:8188").queue()
    with pytest.raises(StudioUnavailableError):
        Studio(lambda: None).queue()


# --- the routes ---------------------------------------------------------------------------------------------


def call(
    port: int, method: str, path: str, body: Any = None, raw: bytes | None = None, **headers: str
) -> tuple[int, dict[str, str], Any]:
    connection = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    if body is not None:
        headers.setdefault("Content-Type", "application/json")
    connection.request(method, path, body=data, headers=headers)
    answer = connection.getresponse()
    payload = answer.read()
    connection.close()
    try:
        parsed = json.loads(payload)
    except ValueError:
        parsed = payload
    return answer.status, dict(answer.getheaders()), parsed


@pytest.fixture
def servers(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> Iterator[tuple[int, GuestHub, PartySongs, FakeStudio]]:
    library = Library([tmp_path / "library"], cache=tmp_path / "state" / "cache.json")
    studio = FakeStudio()
    songs = PartySongs(library, tmp_path / "state", studio)  # type: ignore[arg-type]
    monkeypatch.setattr(guest_module, "PORTS", range(0, 1))
    hub = GuestHub(library, tmp_path / "state", host="127.0.0.1")
    hub.maker = songs
    page = tmp_path / "guest_static"
    (page / "assets").mkdir(parents=True)
    (page / "index.html").write_text("<!doctype html><title>Plenio · Make a song</title>", encoding="utf-8")
    (page / "assets" / "make-1.js").write_text("console.log(1)", encoding="utf-8")
    monkeypatch.setattr(guest_module, "MAKER_PAGE", page)
    player = serve(
        library,
        State(tmp_path / "state" / "state.json"),
        "127.0.0.1",
        0,
        guests=hub,
        accounts=Accounts(tmp_path / "state"),
        maker=songs,
    )
    threading.Thread(target=player.serve_forever, daemon=True).start()
    yield player.server_address[1], hub, songs, studio
    hub.close()
    player.shutdown()
    player.server_close()


def test_the_players_routes(servers: Any) -> None:
    port, _hub, songs, _studio = servers
    status, _headers, answer = call(port, "GET", "/api/make")
    assert status == 200 and answer["admin"] is True and answer["may"] is True and answer["on"] is False
    # a guest from the network (the gateway's header): no account, a cookie of their own - and the whole studio,
    # at any time, until the admin says no
    status, headers, answer = call(port, "GET", "/api/make", **{"X-Plenio-Remote": "1"})
    assert answer["me"] == {"kind": "guest", "name": "Guest", "full": True, "remote": True} and answer["may"]
    songs.configure({"remote": False})
    status, headers, answer = call(port, "GET", "/api/make", **{"X-Plenio-Remote": "1"})
    assert answer["me"]["full"] is False and answer["may"] is False
    cookie = headers["Set-Cookie"].split(";")[0]
    assert cookie.startswith("plenio_maker=") and "HttpOnly" in headers["Set-Cookie"]
    assert (
        call(port, "PUT", "/api/make/settings", {"on": True}, **{"X-Plenio-Remote": "1", "Cookie": cookie})[0]
        == 403
    )
    assert call(port, "PUT", "/api/make/settings", {"on": True})[2]["settings"]["on"] is True
    made = call(
        port, "POST", "/api/make/jobs", {"fields": SONG}, **{"X-Plenio-Remote": "1", "Cookie": cookie}
    )
    assert made[0] == 201 and made[2]["mine"] and "Set-Cookie" not in made[1]
    mine = call(port, "GET", "/api/make", **{"X-Plenio-Remote": "1", "Cookie": cookie})[2]
    assert [j["id"] for j in mine["jobs"]] == [made[2]["id"]]
    assert call(port, "GET", "/api/make", **{"X-Plenio-Remote": "1"})[2]["jobs"] == []  # another browser
    # changes only as JSON from the page; a recording only with the page's header
    assert call(port, "POST", "/api/make/jobs", raw=b"{}", **{"Content-Type": "text/plain"})[0] == 403
    assert call(port, "POST", "/api/make/sources?name=a.mp3", raw=b"ID3x")[0] == 403
    source = call(port, "POST", "/api/make/sources?name=a.mp3", raw=b"ID3x", **{"X-Plenio-Player": "1"})
    assert source[0] == 201 and source[2]["name"] == "a.mp3"
    job_id = made[2]["id"]
    assert (
        call(
            port,
            "PUT",
            f"/api/make/jobs/{job_id}",
            {"fields": {**SONG, "genre": "ska"}},
            **{"X-Plenio-Remote": "1", "Cookie": cookie},
        )[2]["fields"]["genre"]
        == "ska"
    )
    assert (
        call(
            port,
            "POST",
            f"/api/make/jobs/{job_id}/move",
            {"by": -1},
            **{"X-Plenio-Remote": "1", "Cookie": cookie},
        )[0]
        == 409
    )
    assert call(port, "GET", "/api/make/form")[2]["templates"]  # the package's templates without ComfyUI
    assert call(
        port,
        "DELETE",
        f"/api/make/jobs/{job_id}",
        **{"X-Plenio-Remote": "1", "Cookie": cookie, "Content-Type": "application/json"},
    )[2] == {"id": job_id, "removed": True}
    assert songs.jobs == []


def test_the_guests_server_lets_party_guests_make_songs_when_the_host_allows(servers: Any) -> None:
    port, hub, songs, _studio = servers
    call(port, "PUT", "/api/guests", {"on": True})
    guest_port, token = hub.settings["port"], hub.settings["token"]
    assert json.loads(json.dumps(call(guest_port, "GET", f"/{token}/api/live")[2]))["make"] is False
    assert call(guest_port, "GET", f"/{token}/api/make")[0] == 403
    songs.configure({"on": True})
    assert call(guest_port, "GET", f"/{token}/api/live")[2]["make"] is True
    status, headers, answer = call(guest_port, "GET", f"/{token}/api/make")
    assert status == 200 and answer["me"]["kind"] == "guest"
    cookie = headers["Set-Cookie"].split(";")[0]
    made = call(guest_port, "POST", f"/{token}/api/make/jobs", {"fields": SONG}, Cookie=cookie)
    assert made[0] == 201
    assert (
        call(
            guest_port,
            "POST",
            f"/{token}/api/make/jobs",
            raw=b"{}",
            **{"Content-Type": "text/plain", "Cookie": cookie},
        )[0]
        == 415
    )
    assert (
        call(guest_port, "POST", f"/{token}/api/make/sources?name=a.mp3", raw=b"ID3x", Cookie=cookie)[0]
        == 403
    )
    assert (
        call(
            guest_port,
            "POST",
            f"/{token}/api/make/sources?name=a.mp3",
            raw=b"ID3x",
            **{"Cookie": cookie, "X-Plenio-Live": "1"},
        )[0]
        == 201
    )
    assert (
        call(guest_port, "DELETE", f"/{token}/api/make/jobs/{made[2]['id']}", Cookie=cookie)[2]["removed"]
        is True
    )
    page = call(guest_port, "GET", f"/{token}/make/")
    assert (
        page[0] == 200
        and b"Make a song" in page[2]
        and "script-src 'self'" in page[1]["Content-Security-Policy"]
    )
    asset = call(guest_port, "GET", f"/{token}/make/assets/make-1.js")
    assert asset[0] == 200 and asset[1]["Content-Type"].startswith("text/javascript")
    assert call(guest_port, "GET", f"/{token}/make")[1]["Location"] == f"/{token}/make/"
    for wrong in ("/make/assets/../index.html", "/make/assets/.hidden.js", "/make/other"):
        assert call(guest_port, "GET", f"/{token}{wrong}")[0] == 404
    assert call(guest_port, "GET", "/make/")[0] == 404  # without the token: nothing


# --- several takes, several songs (owner's request 2026-10-26) ------------------------------------------------


def test_the_whole_studio_orders_several_takes_and_they_follow_the_song(again: Any, tmp_path: Path) -> None:
    songs, studio, clock, library, _ids = again
    first = songs.create(ADMIN, {"fields": SONG, "takes": 3})
    assert first["takes_left"] == 2 and first["group"] and first["of"] == 3 and first["number"] == 1
    assert len(songs.jobs) == 1  # the takes come when the song is made: they need its words and notes
    songs.tick()
    folder = library.folders[0]
    made_song(folder, "Comet")
    clock.now += 300
    studio.views["comfy-1"] = {
        "id": "comfy-1",
        "status": "succeeded",
        "started_at": clock.now - 300,
        "finished_at": clock.now,
        "result": {"title": "Comet", "record": str(folder / "Comet.plenio.json")},
    }
    songs.tick()
    done, *takes = songs.listing(ADMIN)
    assert done["status"] == "done" and done["takes_left"] == 0
    assert [t["again"] for t in takes] == ["take", "take"] and [t["number"] for t in takes] == [2, 3]
    assert {t["group"] for t in takes} == {done["group"]} and all(t["of"] == 3 for t in takes)
    assert all(t["from"]["song"] == done["result"]["song"] and t["status"] == "waiting" for t in takes)
    # each take is sent as a new take of the song made: its documents, a new take seed
    songs.tick()
    assert studio.records[-1]["title"] == "Comet" and "take" not in studio.sent[-1]["seeds"]


def test_several_takes_or_songs_at_once_are_for_the_whole_studio(
    again: Any, monkeypatch: pytest.MonkeyPatch
) -> None:
    songs, _studio, _clock, _library, ids = again
    takes = songs.create(ADMIN, {"from": {"song": ids["Neon"], "as": "take"}, "takes": 2})
    assert takes["again"] == "take" and takes["of"] == 2
    assert [j["number"] for j in songs.jobs] == [1, 2] and len({j["group"] for j in songs.jobs}) == 1
    many = songs.create(ADMIN, {"fields": SONG, "copies": 3})
    assert many["of"] == 3 and len(songs.jobs) == 5 and not many["takes_left"]
    for wrong, status in (
        ({"takes": 2}, 403),
        ({"copies": 2}, 403),
    ):
        with pytest.raises(MakerError) as refused:
            songs.create(ANNA, {"fields": SONG, **wrong})
        assert refused.value.status == status
    for wrong in ({"takes": 5}, {"copies": 6}, {"takes": 2, "copies": 2}, {"takes": "2"}, {"takes": 1.5}):
        with pytest.raises(MakerError):
            songs.create(ADMIN, {"fields": SONG, **wrong})
    # every song ordered counts against the line, not only the first
    monkeypatch.setattr(maker_module, "LINE_LIMIT", 6)
    with pytest.raises(MakerError) as full:
        songs.create(ADMIN, {"fields": SONG, "copies": 2})
    assert full.value.status == 429 and len(songs.jobs) == 5
    songs.create(ADMIN, {"fields": SONG})
    assert len(songs.jobs) == 6


def test_a_waiting_song_starts_the_studio_when_the_admin_wants_it(party: Any) -> None:
    songs, _studio, clock, _library = party

    class Launcher:
        def __init__(self) -> None:
            self.calls: list[bool] = []

        def tick(self, waiting: bool) -> None:
            self.calls.append(waiting)

    launcher = Launcher()
    songs.launcher = launcher
    songs.tick()
    songs.create(ANNA, {"fields": SONG})
    songs.tick()
    assert launcher.calls == [False, True]


# --- released, or not (owner's request 2026-10-29) ---------------------------------------------------------


def exported(folder: Path, title: str) -> Path:
    """A song as Export Release writes it into its folder: the record, FLAC, MP3, the cover and its page."""
    folder.mkdir(parents=True, exist_ok=True)
    data = {
        **record(title),
        "files": [
            {"name": f"{title}.flac", "format": "flac"},
            {"name": f"{title}.mp3", "format": "mp3"},
            {"name": f"{title}.jpg", "role": "cover"},
        ],
        "fingerprint": "old",
    }
    (folder / f"{title}.plenio.json").write_text(json.dumps(data), encoding="utf-8")
    (folder / f"{title}.flac").write_bytes(b"fLaC" + b"f" * 60)
    (folder / f"{title}.mp3").write_bytes(b"ID3" + b"m" * 1000)
    (folder / f"{title}.jpg").write_bytes(b"\xff\xd8\xff" + b"j" * 20)
    (folder / f"{title}.html").write_text("<!doctype html>", encoding="utf-8")
    return folder / f"{title}.plenio.json"


def finish(songs: PartySongs, studio: FakeStudio, clock: Clock, title: str) -> dict[str, Any]:
    """The song being made is done: Export Release wrote it where the request said."""
    sent = studio.sent[-1]
    comfy = f"comfy-{len(studio.sent)}"
    output = songs.library.folders[0]
    record_path = exported(output / sent["release"].get("folder", "plenio"), title)
    clock.now += 300
    studio.views[comfy] = {
        "id": comfy,
        "status": "succeeded",
        "started_at": clock.now - 300,
        "finished_at": clock.now,
        "result": {"title": title, "record": str(record_path)},
    }
    songs.tick()
    return next(j for j in songs.jobs if j.get("comfy") == comfy)


def titles(library: Library) -> list[str]:
    library.scan(force=True)
    return sorted(s["title"] for s in library.songs())


def test_a_song_waits_for_its_maker_and_an_admin_before_everybody_hears_it(party: Any) -> None:
    songs, studio, clock, library = party
    songs.configure({"listen_first": True, "approve": True})
    assert songs.status(ANNA)["settings"]["listen_first"] is True  # the makers are told
    made = songs.create(ANNA, {"fields": SONG})
    songs.tick()
    # made into a folder of its own, which the library does not read
    assert studio.sent[-1]["release"]["folder"] == f"plenio/_waiting/{made['id']}"
    job = finish(songs, studio, clock, "Neon")
    assert job["release"] == "maker" and titles(library) == []
    view = songs.listing(ANNA)[0]
    assert view["release"] == "maker" and view["can"]["listen"] and view["can"]["release"]
    assert not view["can"]["delete"]
    # Anna hears it first on her own device (the MP3, which every phone plays); nobody else but the admins
    assert songs.listen(ANNA, made["id"]).name == "Neon.mp3"
    assert songs.listen(ANNA, made["id"], "cover").name == "Neon.jpg"
    assert songs.listen(ADMIN, made["id"]).name == "Neon.mp3"
    with pytest.raises(MakerError):
        songs.listen(BEN, made["id"])
    with pytest.raises(MakerError):
        songs.release(BEN, made["id"])
    # she releases it: now an admin approves it
    assert songs.release(ANNA, made["id"])["release"] == "admin" and titles(library) == []
    with pytest.raises(MakerError) as refused:
        songs.release(ANNA, made["id"])
    assert refused.value.status == 403
    assert [j["id"] for j in songs.status(ADMIN)["approvals"]] == [made["id"]]
    assert songs.status(ANNA)["approvals"] == []
    # waiting songs are kept however long they wait
    clock.now += 2 * 86400
    songs.tick()
    assert any(j["id"] == made["id"] for j in songs.jobs)
    # the admin approves: it moves to its folder and comes into the library - new for Live Play
    since = library.scan_started
    released = songs.release(ADMIN, made["id"])
    assert released["release"] == "released" and released["result"]["song"]
    output = library.folders[0]
    assert (output / "plenio" / "Neon.mp3").is_file()
    assert not (output / "plenio" / "_waiting" / made["id"]).exists()
    assert titles(library) == ["Neon"]
    assert [s["title"] for s in library.newer(since)] == ["Neon"]
    with pytest.raises(MakerError):
        songs.release(ADMIN, made["id"])  # not waiting any more


def test_a_released_song_takes_a_number_where_its_name_is_taken(party: Any) -> None:
    songs, studio, clock, library = party
    songs.configure({"approve": True})
    output = library.folders[0]
    exported(output / "plenio", "Neon")
    made = songs.create(ANNA, {"fields": SONG})
    songs.tick()
    # nothing to hear first: the admin's turn at once
    assert finish(songs, studio, clock, "Neon")["release"] == "admin"
    songs.release(ADMIN, made["id"])
    assert (output / "plenio" / "Neon (2).mp3").is_file() and (output / "plenio" / "Neon (2).html").is_file()
    data = json.loads((output / "plenio" / "Neon (2).plenio.json").read_text(encoding="utf-8"))
    assert [f["name"] for f in data["files"]] == ["Neon (2).flac", "Neon (2).mp3", "Neon (2).jpg"]
    assert data["fingerprint"] != "old"
    assert titles(library) == ["Neon", "Neon (2)"]  # the library numbers the second one's title, as ever


def test_a_song_not_released_is_kept_aside_and_the_admins_songs_never_wait(party: Any) -> None:
    songs, studio, clock, library = party
    songs.configure({"listen_first": True})
    first = songs.create(ANNA, {"fields": SONG})
    songs.tick()
    finish(songs, studio, clock, "Rain")
    gone = songs.discard(ANNA, first["id"])
    assert gone["release"] == "discarded" and not gone["can"]["listen"]
    output = library.folders[0]
    assert (output / "plenio" / "_waiting" / "not released" / first["id"] / "Rain.mp3").is_file()
    assert titles(library) == []
    # with the admin's approval too: the admin rejects one Ben released
    songs.configure({"approve": True})
    second = songs.create(BEN, {"fields": SONG})
    songs.tick()
    finish(songs, studio, clock, "Snow")
    songs.release(BEN, second["id"])
    with pytest.raises(MakerError):
        songs.discard(BEN, second["id"])  # the admin decides now
    assert songs.discard(ADMIN, second["id"])["release"] == "rejected"
    # the admin's own song, and a helper's, are released at once
    helper = {"kind": "admin", "id": "hhhhhhhhhhhh", "name": "Hal"}
    mine = songs.create(helper, {"fields": SONG})
    songs.tick()
    assert studio.sent[-1]["release"].get("folder") is None
    done = finish(songs, studio, clock, "Sun")
    assert done["id"] == mine["id"] and done.get("release") is None and titles(library) == ["Sun"]


def test_a_waiting_song_is_heard_and_released_through_the_routes(servers: Any) -> None:
    port, hub, songs, studio = servers
    songs.configure({"on": True, "listen_first": True})
    call(port, "PUT", "/api/guests", {"on": True})
    guest_port, token = hub.settings["port"], hub.settings["token"]
    _status, headers, _ = call(guest_port, "GET", f"/{token}/api/make")
    cookie = headers["Set-Cookie"].split(";")[0]
    made = call(guest_port, "POST", f"/{token}/api/make/jobs", {"fields": SONG}, Cookie=cookie)[2]
    clock = Clock()
    songs.clock = clock
    songs.tick()
    finish(songs, studio, clock, "Party")
    # the guest hears it on their phone, in parts as a phone's player asks
    path = f"/{token}/api/make/jobs/{made['id']}/audio"
    whole = call(guest_port, "GET", path, Cookie=cookie)
    assert whole[0] == 200 and whole[1]["Content-Type"] == "audio/mpeg" and whole[2].startswith(b"ID3")
    part = call(guest_port, "GET", path, Cookie=cookie, Range="bytes=0-9")
    assert part[0] == 206 and part[1]["Content-Range"] == "bytes 0-9/1003" and len(part[2]) == 10
    assert call(guest_port, "GET", path)[0] == 404  # another phone
    assert call(port, "GET", f"/api/make/jobs/{made['id']}/audio")[0] == 200  # the admin, on this computer
    remote = {"X-Plenio-Remote": "1"}
    assert call(port, "GET", f"/api/make/jobs/{made['id']}/audio", **remote)[0] == 404
    released = call(guest_port, "POST", f"/{token}/api/make/jobs/{made['id']}/release", {}, Cookie=cookie)
    assert released[0] == 200 and released[2]["release"] == "released"
    assert call(guest_port, "GET", path, Cookie=cookie)[0] == 409


def test_the_guests_hear_the_partys_songs_again_on_their_phones(servers: Any) -> None:
    """The party's songs made at it, once they played, to hear again on one's own phone (owner's request
    2026-10-29) - no other song, and only this party's."""
    port, hub, songs, studio = servers
    songs.configure({"on": True})
    call(port, "PUT", "/api/guests", {"on": True})
    assert hub.settings["party_since"] > 0  # switched on: a party begins
    guest_port, token = hub.settings["port"], hub.settings["token"]
    _status, headers, _ = call(guest_port, "GET", f"/{token}/api/make")
    cookie = headers["Set-Cookie"].split(";")[0]
    call(guest_port, "POST", f"/{token}/api/make/jobs", {"fields": SONG}, Cookie=cookie)
    songs.tick()
    job = finish(songs, studio, Clock(), "Party")
    made = job["result"]["song"]
    other = exported(songs.library.folders[0] / "plenio", "Old")
    songs.library.scan(force=True)
    old = songs.library.find_record(other)
    assert made and old is not None
    # nothing to hear again before it played
    assert call(guest_port, "GET", f"/{token}/api/party")[2] == {"on": True, "songs": []}
    assert call(guest_port, "GET", f"/{token}/song/{made}")[0] == 404
    # the player's page says what played: the party's song - and a song of the library
    hub.publish({"live": True, "playing": True, "played": [{"id": made}, {"id": old.id}]})
    listed = call(guest_port, "GET", f"/{token}/api/party")[2]
    assert [(s["title"], s["by"]) for s in listed["songs"]] == [("Party", "Guest")]
    assert call(guest_port, "GET", f"/{token}/api/live")[2]["replay"] is True
    heard = call(guest_port, "GET", f"/{token}/song/{made}", Range="bytes=0-2")
    assert heard[0] == 206 and heard[1]["Content-Type"] == "audio/mpeg" and heard[2] == b"ID3"
    assert call(guest_port, "GET", f"/{token}/song/{old.id}")[0] == 404
    page = call(guest_port, "GET", f"/{token}/")
    assert "media-src 'self'" in page[1]["Content-Security-Policy"]
    # the host switches it off - and a new party starts with nothing to hear again
    call(port, "PUT", "/api/guests", {"replay": False})
    assert call(guest_port, "GET", f"/{token}/api/party")[2] == {"on": False, "songs": []}
    assert call(guest_port, "GET", f"/{token}/song/{made}")[0] == 404
    call(port, "PUT", "/api/guests", {"replay": True, "new_party": True})
    assert call(guest_port, "GET", f"/{token}/api/party")[2]["songs"] == []
    # a song made before this party began is not this party's
    hub.publish({"live": True, "playing": True, "played": [{"id": made}]})
    assert call(guest_port, "GET", f"/{token}/api/party")[2]["songs"] == []
