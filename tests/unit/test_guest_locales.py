"""The guests' page in seven languages (phase 6.6, ADR-0013): every language has every word, with the same blanks;
no word of the page is left in its source; the guests' server hands each language out and nothing else."""

from __future__ import annotations

import json
import re
import threading
from html.parser import HTMLParser
from pathlib import Path

import pytest

from plenio.player import guest as guest_module
from plenio.player.guest import LANGUAGES, LOCALES, PAGE, GuestHub, serve_guests
from plenio.player.library import Library

TECHNICAL = {"use strict", "pill off", "44px 1fr auto"}
"""Strings of the script that are words but no text: a directive, a class name, a CSS value."""
ENGLISH = json.loads((LOCALES / "en.json").read_text(encoding="utf-8"))
SOURCE = PAGE.read_text(encoding="utf-8")


def blanks(text: str) -> set[str]:
    return set(re.findall(r"\{(\w+)\}", text))


@pytest.mark.parametrize("language", LANGUAGES)
def test_every_language_has_every_word_with_the_same_blanks(language: str) -> None:
    words = json.loads((LOCALES / f"{language}.json").read_text(encoding="utf-8"))
    assert set(words) == set(ENGLISH), language
    for key, text in words.items():
        assert isinstance(text, str) and text.strip(), (language, key)
        assert blanks(text) == blanks(ENGLISH[key]), (language, key)
    assert sorted(p.stem for p in LOCALES.glob("*.json")) == sorted(LANGUAGES)


def test_the_page_uses_every_word_and_only_known_ones() -> None:
    used = set(re.findall(r'data-i18n(?:-placeholder)?="([\w.]+)"', SOURCE))
    used |= set(re.findall(r'\bt\("([\w.]+)"', SOURCE))
    used |= {"react.tally", "react.tallyOne"}  # chosen by a condition: t(onePerSong ? ... : ...)
    assert used == set(ENGLISH)
    assert '"en", "de", "es", "fr", "it", "pt", "ja"' in SOURCE  # the page's own list is the server's


class Text(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.inside: list[str] = []
        self.words: list[str] = []
        self.attributes: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.inside.append(tag)
        for name, value in attrs:
            if name in ("placeholder", "title", "aria-label", "alt") and value:
                self.attributes.append(value)

    def handle_endtag(self, tag: str) -> None:
        if self.inside and self.inside[-1] == tag:
            self.inside.pop()

    def handle_data(self, data: str) -> None:
        if not any(tag in ("script", "style") for tag in self.inside) and re.search(r"[A-Za-z]{2,}", data):
            self.words.append(data.strip())


def test_no_word_of_the_page_is_left_in_its_source() -> None:
    page = Text()
    page.feed(SOURCE)
    assert page.words == [] and page.attributes == []
    script = SOURCE[SOURCE.index("<script>") : SOURCE.index("</script>")]
    literals = re.findall(r'"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`', script)
    sentences = [
        a or b
        for a, b in literals
        if re.search(r"[A-Za-z]{2,} +[A-Za-z]{2,}", re.sub(r"\$\{[^}]*\}", "", a or b))
    ]
    assert [s for s in sentences if s not in TECHNICAL] == []


@pytest.mark.io
def test_the_guests_server_hands_out_each_language(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> None:
    import http.client

    monkeypatch.setattr(guest_module, "PORTS", range(0, 1))
    library = Library([tmp_path / "songs"], cache=tmp_path / "state" / "cache.json")
    hub = GuestHub(library, tmp_path / "state", host="127.0.0.1")
    hub.settings["on"] = True  # the page answers below its token only while the access is on
    server = serve_guests(hub, "127.0.0.1", 0)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    token, port = hub.settings["token"], server.server_address[1]
    try:
        for language in LANGUAGES:
            connection = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
            connection.request("GET", f"/{token}/locales/{language}")
            answer = connection.getresponse()
            assert answer.status == 200 and json.loads(answer.read())["brand"] == "Plenio Live"
            connection.close()
        for wrong in (f"/{token}/locales/xx", f"/{token}/locales/../guest", "/locales/en"):
            connection = http.client.HTTPConnection("127.0.0.1", port, timeout=10)
            connection.request("GET", wrong)
            assert connection.getresponse().status == 404, wrong
            connection.close()
    finally:
        server.shutdown()
        server.server_close()
