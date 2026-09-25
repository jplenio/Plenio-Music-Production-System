"""Song Sheet state and precedence matrix (testing-strategy section 4.1)."""

import json

import pytest
from hypothesis import given
from hypothesis import strategies as st

from plenio.core.errors import PlenioUserError
from plenio.core.hashing import sha256_text
from plenio.core.sheet import (
    DocEntry,
    DocState,
    DocStatus,
    SheetState,
    approval_matches,
    needs_upstream,
    normalize_document,
    parse_sheet_state,
    resolve,
)


def edited(text: str, base: str) -> DocEntry:
    return DocEntry(DocState.EDITED, text, sha256_text(normalize_document(base)))


# --- state parsing -----------------------------------------------------------


@pytest.mark.parametrize("value", [None, "", "   "])
def test_empty_value_is_the_default_state(value: str | None) -> None:
    assert parse_sheet_state(value) == SheetState()


def test_round_trip() -> None:
    state = SheetState(
        docs={
            "lyrics": edited("[Verse]\nmine", "[Verse]\ndraft"),
            "style": DocEntry(DocState.MANUAL, "pop, 90 BPM"),
            "title": DocEntry(),
        },
        approved_fingerprint="abc",
    )
    text = state.to_json()
    assert json.loads(text)["schema"] == "plenio.sheet_state/1"
    assert "title" not in json.loads(text)["docs"]  # automatic documents are not stored
    parsed = parse_sheet_state(text)
    assert parsed.entry("lyrics") == state.entry("lyrics")
    assert parsed.entry("style") == state.entry("style")
    assert parsed.entry("title") == DocEntry()
    assert parsed.approved_fingerprint == "abc"


@pytest.mark.parametrize(
    "value",
    [
        "{not json",
        "[]",
        '{"schema": "plenio.sheet_state/2", "docs": {}}',
        '{"schema": "plenio.sheet_state/1", "docs": {"melody": {"state": "auto"}}}',
        '{"schema": "plenio.sheet_state/1", "docs": {"lyrics": {"state": "fuzzy"}}}',
        '{"schema": "plenio.sheet_state/1", "docs": {"lyrics": {"state": "edited", "text": "x"}}}',
        '{"schema": "plenio.sheet_state/1", "docs": {"lyrics": {"state": "manual"}}}',
        '{"schema": "plenio.sheet_state/1", "docs": {"lyrics": {"state": "auto", "text": "x"}}}',
        '{"schema": "plenio.sheet_state/1", "extra": 1}',
    ],
)
def test_malformed_state_is_an_error_not_a_reset(value: str) -> None:
    with pytest.raises(PlenioUserError):
        parse_sheet_state(value)


# --- precedence matrix -------------------------------------------------------

DRAFT = "[Verse]\nfirst draft"
NEW_DRAFT = "[Verse]\nsecond draft"


def test_auto_uses_the_upstream_draft() -> None:
    result = resolve(SheetState(), {"lyrics": DRAFT}, ["lyrics"])
    assert result.docs["lyrics"].status is DocStatus.AUTO
    assert result.text("lyrics") == DRAFT


def test_auto_without_upstream_is_missing() -> None:
    result = resolve(SheetState(), {"lyrics": None}, ["lyrics"])
    assert result.docs["lyrics"].status is DocStatus.MISSING
    assert result.text("lyrics") == ""


def test_edited_is_used_while_the_draft_is_unchanged() -> None:
    state = SheetState(docs={"lyrics": edited("[Verse]\nmy words", DRAFT)})
    result = resolve(state, {"lyrics": DRAFT}, ["lyrics"])
    assert result.docs["lyrics"].status is DocStatus.EDITED
    assert result.text("lyrics") == "[Verse]\nmy words"


def test_edited_with_a_changed_draft_is_a_conflict() -> None:
    state = SheetState(docs={"lyrics": edited("[Verse]\nmy words", DRAFT)})
    result = resolve(state, {"lyrics": NEW_DRAFT}, ["lyrics"])
    assert result.docs["lyrics"].status is DocStatus.CONFLICT
    assert result.docs["lyrics"].text is None
    assert result.fingerprint() is None
    assert [doc.kind for doc in result.conflicts] == ["lyrics"]


def test_edited_with_a_disconnected_draft_is_a_conflict() -> None:
    state = SheetState(docs={"lyrics": edited("[Verse]\nmy words", DRAFT)})
    assert resolve(state, {}, ["lyrics"]).docs["lyrics"].status is DocStatus.CONFLICT


@pytest.mark.parametrize("upstream", [DRAFT, NEW_DRAFT, None])
def test_manual_wins_and_does_not_need_upstream(upstream: str | None) -> None:
    state = SheetState(docs={"lyrics": DocEntry(DocState.MANUAL, "[Chorus]\nmine")})
    assert needs_upstream(state, "lyrics") is False
    result = resolve(state, {"lyrics": upstream}, ["lyrics"])
    assert result.docs["lyrics"].status is DocStatus.MANUAL
    assert result.text("lyrics") == "[Chorus]\nmine"


def test_needs_upstream_for_auto_and_edited() -> None:
    state = SheetState(docs={"lyrics": edited("x", DRAFT)})
    assert needs_upstream(state, "lyrics") and needs_upstream(state, "style")


def test_whitespace_normalisation_does_not_create_conflicts() -> None:
    state = SheetState(docs={"lyrics": edited("mine", DRAFT)})
    windows_draft = "\r\n" + DRAFT.replace("\n", "  \r\n") + "\r\n\r\n"
    assert resolve(state, {"lyrics": windows_draft}, ["lyrics"]).docs["lyrics"].status is DocStatus.EDITED


def test_normalize_document() -> None:
    assert normalize_document("\n\n a \r\nb  \r\n\n") == " a\nb"
    assert normalize_document("") == ""


# --- fingerprint and approval --------------------------------------------------


def test_approval_matches_only_the_approved_documents() -> None:
    result = resolve(SheetState(), {"lyrics": DRAFT, "style": "pop"}, ["lyrics", "style"])
    fingerprint = result.fingerprint()
    assert fingerprint is not None
    approved = SheetState(approved_fingerprint=fingerprint)
    assert approval_matches(approved, result)
    changed = resolve(SheetState(), {"lyrics": NEW_DRAFT, "style": "pop"}, ["lyrics", "style"])
    assert not approval_matches(approved, changed)
    assert not approval_matches(SheetState(), result)


def test_missing_and_empty_documents_have_different_fingerprints() -> None:
    missing = resolve(SheetState(), {"style": None}, ["style"]).fingerprint()
    empty = resolve(SheetState(), {"style": ""}, ["style"]).fingerprint()
    assert missing != empty


@given(st.text(max_size=40), st.text(max_size=40))
def test_fingerprint_changes_exactly_when_a_document_changes(first: str, second: str) -> None:
    a = resolve(SheetState(), {"lyrics": first}, ["lyrics"]).fingerprint()
    b = resolve(SheetState(), {"lyrics": second}, ["lyrics"]).fingerprint()
    assert (a == b) == (normalize_document(first) == normalize_document(second))
