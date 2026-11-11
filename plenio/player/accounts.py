"""Who listens (owner's request 2026-10-23): a simple login, so that a listener keeps the same playlists, likes,
plays and settings on every device. The player opens with a login page: a user of this player (name and
password, set up by the admin), the admin - only on the computer the player runs on, where everything is kept
anyway - or a guest, whose things stay in that browser, as the player had them before.

Every user is in a group (owner's request 2026-10-29): **listener** (listens, may not make songs), **maker**
(may also make songs, where the party's settings let users make them) or **admin** - a helper with the admin's
rights, to step in when needed (approve songs, set up users, change the party's settings), from any device with
their password. The admin's own things stay the admin's: a helper keeps playlists and likes of their own.

The admin's things are the player's state as it was (``state.json``): the owner's playlists stay where they
are. Every user has a folder of their own beside it (``users/<id>/``) with a state file of the same form and
an avatar. Passwords are kept only as PBKDF2-SHA256 hashes; a login gives the browser a random session
(cookie ``plenio_session``, HttpOnly), of which the server keeps only the hash. Standard library only.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import re
import secrets
import shutil
import threading
import time
from collections import deque
from pathlib import Path
from typing import Any

COOKIE = "plenio_session"
USERS_FILE = "users.json"
USERS_DIR = "users"
ADMIN = "admin"
ITERATIONS = 240_000
SESSION_DAYS = 400
"""A device stays logged in until it logs out (or a year passes without the cookie being renewed)."""
MIN_PASSWORD = 4
NAME_LIMIT = 40
AVATAR_LIMIT = 2 * 2**20
AVATAR_TYPES = {b"\x89PNG\r\n\x1a\n": ".png", b"\xff\xd8\xff": ".jpg", b"GIF87a": ".gif", b"GIF89a": ".gif"}
FAILURES_PER_10_MIN = 8
"""Wrong passwords one address may try in ten minutes."""
COLORS = ("#e4573d", "#e0a83c", "#4fbf7f", "#3fa7d6", "#7a6ff0", "#d65db1", "#2fb5a5", "#c46b2d")
_USER_ID = re.compile(r"[0-9a-f]{12}")
GROUPS = ("listener", "maker", "admin")
DEFAULT_GROUP = "maker"
"""A user set up before the groups: they could make songs where the host let users make them."""


def group_of(value: Any) -> str:
    return value if value in GROUPS else DEFAULT_GROUP


class AccountError(ValueError):
    """A request the accounts refuse; ``status`` is the HTTP status to answer with."""

    def __init__(self, message: str, status: int = 400):
        super().__init__(message)
        self.status = status


def _hash(password: str, salt: bytes, iterations: int | None = None) -> str:
    """PBKDF2-SHA256 of a password; without ``iterations``, with the rounds a new password gets."""
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations or ITERATIONS).hex()


def session_key(token: str) -> str:
    """What the server keeps of a session token: its hash."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def avatar_suffix(data: bytes) -> str | None:
    """The file ending of an avatar picture (PNG, JPEG, GIF, WebP), ``None`` for anything else."""
    for magic, suffix in AVATAR_TYPES.items():
        if data.startswith(magic):
            return suffix
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return ".webp"
    return None


class Accounts:
    """The player's users and sessions, kept in ``<folder>/users.json`` (beside the state)."""

    def __init__(self, folder: Path):
        self.folder = folder
        self.path = folder / USERS_FILE
        self.lock = threading.Lock()
        self._failures: dict[str, deque[float]] = {}

    # --- the file -------------------------------------------------------------------------------------

    def _load(self) -> dict[str, Any]:
        try:
            data = json.loads(self.path.read_text(encoding="utf-8"))
        except (OSError, ValueError):
            data = {}
        if not isinstance(data, dict):
            data = {}
        data.setdefault("users", [])
        data.setdefault("sessions", {})
        data.setdefault("admin", {"name": "Admin", "avatar": "", "color": COLORS[0]})
        return data

    def _save(self, data: dict[str, Any]) -> None:
        self.folder.mkdir(parents=True, exist_ok=True)
        temp = self.path.with_suffix(".tmp")
        temp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
        temp.replace(self.path)

    @staticmethod
    def _public(user: dict[str, Any], admin: bool = False) -> dict[str, Any]:
        """A user as the pages see them: ``admin`` is the player's admin (this computer's), ``group`` what they may
        (the admin's: ``admin``), ``helper`` a user with the admin's rights."""
        group = "admin" if admin else group_of(user.get("group"))
        return {
            "id": ADMIN if admin else user["id"],
            "name": user.get("name") or ("Admin" if admin else "?"),
            "admin": admin,
            "group": group,
            "helper": group == "admin" and not admin,
            "avatar": bool(user.get("avatar")),
            "color": user.get("color") or COLORS[0],
        }

    def users(self, *, details: bool = False) -> list[dict[str, Any]]:
        """The users as the login page shows them (with ``details``: when made, when last logged in)."""
        data = self._load()
        out = []
        for user in data["users"]:
            entry = self._public(user)
            if details:
                entry.update(created=user.get("created", 0), last_login=user.get("last_login", 0))
            out.append(entry)
        return out

    def admin(self) -> dict[str, Any]:
        return self._public(self._load()["admin"], admin=True)

    def user(self, user_id: str) -> dict[str, Any] | None:
        if user_id == ADMIN:
            return self.admin()
        found = next((u for u in self._load()["users"] if u["id"] == user_id), None)
        return self._public(found) if found else None

    # --- users ---------------------------------------------------------------------------------------

    @staticmethod
    def _name(name: Any) -> str:
        text = re.sub(r"\s+", " ", str(name or "")).strip()
        if not text or len(text) > NAME_LIMIT or any(ord(c) < 32 for c in text):
            raise AccountError(f"A name of 1 to {NAME_LIMIT} characters.")
        return text

    @staticmethod
    def _password(password: Any) -> str:
        text = str(password or "")
        if len(text) < MIN_PASSWORD:
            raise AccountError(f"A password of at least {MIN_PASSWORD} characters.")
        return text

    @staticmethod
    def _group(group: Any) -> str:
        if group not in GROUPS:
            raise AccountError("A group: listener, maker or admin.")
        return str(group)

    def create(self, name: Any, password: Any, group: Any = DEFAULT_GROUP) -> dict[str, Any]:
        clean, secret, kind = self._name(name), self._password(password), self._group(group)
        with self.lock:
            data = self._load()
            if any(u["name"].lower() == clean.lower() for u in data["users"]) or clean.lower() == "admin":
                raise AccountError(f"There is a user named {clean} already.", 409)
            salt = secrets.token_bytes(16)
            user = {
                "id": secrets.token_hex(6),
                "name": clean,
                "salt": salt.hex(),
                "hash": _hash(secret, salt),
                "iterations": ITERATIONS,
                "avatar": "",
                "color": COLORS[(len(data["users"]) + 1) % len(COLORS)],
                "created": int(time.time()),
                "group": kind,
            }
            data["users"].append(user)
            self._save(data)
        return self._public(user)

    def update(self, user_id: str, changes: dict[str, Any]) -> dict[str, Any]:
        """A user's (or the admin's) new name and colour; a user's new password (their sessions end, but the
        one that changed it) and group (the admin's is always ``admin``)."""
        with self.lock:
            data = self._load()
            user = (
                data["admin"]
                if user_id == ADMIN
                else next((u for u in data["users"] if u["id"] == user_id), None)
            )
            if user is None:
                raise AccountError("No such user.", 404)
            if "name" in changes:
                clean = self._name(changes["name"])
                if user_id != ADMIN and any(
                    u["name"].lower() == clean.lower() and u["id"] != user_id for u in data["users"]
                ):
                    raise AccountError(f"There is a user named {clean} already.", 409)
                user["name"] = clean
            if "color" in changes and changes["color"] in COLORS:
                user["color"] = changes["color"]
            if "group" in changes and user_id != ADMIN:
                user["group"] = self._group(changes["group"])
            if "password" in changes and user_id != ADMIN:
                salt = secrets.token_bytes(16)
                user.update(
                    salt=salt.hex(),
                    hash=_hash(self._password(changes["password"]), salt),
                    iterations=ITERATIONS,
                )
                keep = changes.get("keep_session")  # the session that changed it stays
                data["sessions"] = {
                    key: s for key, s in data["sessions"].items() if s.get("user") != user_id or key == keep
                }
            self._save(data)
        return self._public(user, admin=user_id == ADMIN)

    def delete(self, user_id: str) -> None:
        """A user gone, with their things (their folder) and their sessions."""
        if not _USER_ID.fullmatch(user_id):
            raise AccountError("No such user.", 404)
        with self.lock:
            data = self._load()
            if not any(u["id"] == user_id for u in data["users"]):
                raise AccountError("No such user.", 404)
            data["users"] = [u for u in data["users"] if u["id"] != user_id]
            data["sessions"] = {k: s for k, s in data["sessions"].items() if s.get("user") != user_id}
            self._save(data)
        shutil.rmtree(self.folder / USERS_DIR / user_id, ignore_errors=True)

    # --- avatars --------------------------------------------------------------------------------------

    def _user_dir(self, user_id: str) -> Path:
        return self.folder / USERS_DIR / user_id

    def set_avatar(self, user_id: str, picture: bytes | None) -> dict[str, Any]:
        """A picture for a user (PNG, JPEG, GIF or WebP up to 2 MB), or none (``None``)."""
        suffix = avatar_suffix(picture) if picture else None
        if picture is not None and (suffix is None or len(picture) > AVATAR_LIMIT):
            raise AccountError("A picture: PNG, JPEG, GIF or WebP, up to 2 MB.")
        with self.lock:
            data = self._load()
            user = (
                data["admin"]
                if user_id == ADMIN
                else next((u for u in data["users"] if u["id"] == user_id), None)
            )
            if user is None:
                raise AccountError("No such user.", 404)
            folder = self._user_dir(user_id)
            for old in folder.glob("avatar.*") if folder.is_dir() else []:
                old.unlink(missing_ok=True)
            user["avatar"] = ""
            if picture is not None and suffix is not None:
                folder.mkdir(parents=True, exist_ok=True)
                (folder / f"avatar{suffix}").write_bytes(picture)
                user["avatar"] = f"avatar{suffix}"
            self._save(data)
        return self._public(user, admin=user_id == ADMIN)

    def avatar(self, user_id: str) -> Path | None:
        user = (
            self._load()["admin"]
            if user_id == ADMIN
            else next((u for u in self._load()["users"] if u["id"] == user_id), None)
        )
        if not user or not user.get("avatar") or not (user_id == ADMIN or _USER_ID.fullmatch(user_id)):
            return None
        path = self._user_dir(user_id) / str(user["avatar"])
        return path if path.is_file() else None

    # --- sessions -------------------------------------------------------------------------------------

    def _limited(self, address: str) -> bool:
        now = time.monotonic()
        tries = self._failures.setdefault(address, deque())
        while tries and now - tries[0] > 600:
            tries.popleft()
        return len(tries) >= FAILURES_PER_10_MIN

    def login(self, user_id: str, password: str, address: str = "") -> tuple[str, dict[str, Any]]:
        """A new session for a user whose password is right: its token (for the cookie) and the user."""
        if self._limited(address):
            raise AccountError("Too many wrong passwords - wait a few minutes.", 429)
        with self.lock:
            data = self._load()
            user = next((u for u in data["users"] if u["id"] == user_id), None)
            ok = user is not None and hmac.compare_digest(
                _hash(
                    str(password or ""),
                    bytes.fromhex(user["salt"]),
                    int(user.get("iterations") or ITERATIONS),
                ),
                str(user["hash"]),
            )
            if user is None or not ok:
                self._failures[address].append(time.monotonic())
                raise AccountError("The name or the password is not right.", 401)
            user["last_login"] = int(time.time())
            token = self._open(data, user["id"])
            self._save(data)
        return token, self._public(user)

    def login_admin(self) -> tuple[str, dict[str, Any]]:
        """A session for the admin (the caller made sure the request came from this computer)."""
        with self.lock:
            data = self._load()
            token = self._open(data, ADMIN)
            self._save(data)
        return token, self._public(data["admin"], admin=True)

    @staticmethod
    def _open(data: dict[str, Any], user_id: str) -> str:
        now = time.time()
        data["sessions"] = {k: s for k, s in data["sessions"].items() if s.get("expires", 0) > now}
        token = secrets.token_urlsafe(32)
        data["sessions"][session_key(token)] = {"user": user_id, "expires": now + SESSION_DAYS * 86400}
        return token

    def session(self, token: str) -> dict[str, Any] | None:
        """The user of a session token, ``None`` when it is unknown or over."""
        if not token:
            return None
        entry = self._load()["sessions"].get(session_key(token))
        if not isinstance(entry, dict) or entry.get("expires", 0) <= time.time():
            return None
        return self.user(str(entry.get("user")))

    def logout(self, token: str) -> None:
        with self.lock:
            data = self._load()
            if data["sessions"].pop(session_key(token), None) is not None:
                self._save(data)

    def state_path(self, user_id: str) -> Path:
        """Where a user's playlists, likes, plays and settings are kept (not for the admin: the player's own)."""
        if not _USER_ID.fullmatch(user_id):
            raise AccountError("No such user.", 404)
        return self._user_dir(user_id) / "state.json"


def token_of(cookie_header: str | None) -> str:
    """The session token in a request's ``Cookie`` header (``""``: none)."""
    for part in (cookie_header or "").split(";"):
        name, _, value = part.strip().partition("=")
        if name == COOKIE:
            return value.strip()
    return ""


def session_cookie(token: str, *, forget: bool = False) -> str:
    if forget:
        return f"{COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax"
    return f"{COOKIE}={token}; Path=/; Max-Age={SESSION_DAYS * 86400}; HttpOnly; SameSite=Lax"
