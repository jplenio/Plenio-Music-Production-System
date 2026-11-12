"""Start the Plenio Player: ``python -m plenio.player [--folder <songs>] [--port 8765]``.

Without ``--folder`` it plays ComfyUI's output folder when Plenio sits in ``ComfyUI/custom_nodes``
(``PLENIO_PLAYER_FOLDER`` overrides), else the current folder. It runs without ComfyUI; ComfyUI's
*Plenio Player* button starts it this way too (``plenio.player.launch``).
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
import threading
import webbrowser
from pathlib import Path

from .. import __version__
from . import folders as folder_choice
from .accounts import Accounts
from .guest import GuestHub
from .library import Library
from .maker import PartySongs, Studio
from .measured import measured_for
from .network import NetworkAccess
from .paths import default_folders, state_dir
from .server import State, comfyui_at, find_comfyui, serve, studio_finder
from .studio import StudioLauncher


def say(text: str) -> None:
    sys.stdout.write(text + "\n")
    sys.stdout.flush()


def make_library(started: list[Path], directory: Path) -> Library:
    """The library of the folders chosen in Settings (``library.json``), else of the folders it starts with
    (``--folder``, the default) - which stay known, to go back to."""
    chosen = folder_choice.load(directory)
    folders = [f.path for f in chosen] if chosen else started
    other = [f.path for f in chosen or [] if f.other]
    library = Library(folders, cache=directory / "library-cache.json", other=other)
    library.started_with = [Path(p).resolve() for p in started]
    return library


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="plenio-player", description=__doc__)
    parser.add_argument(
        "--folder", action="append", type=Path, help="a folder with Plenio songs (repeatable)"
    )
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--no-browser", action="store_true", help="do not open the browser")
    parser.add_argument("--comfyui", default="", help="the ComfyUI address that Open in ComfyUI goes to")
    parser.add_argument(
        "--guests-host",
        # guests reach the live playlist from the network; PLENIO_GUESTS_HOST also reaches a player ComfyUI starts
        default=os.environ.get("PLENIO_GUESTS_HOST", "").strip() or "0.0.0.0",  # noqa: S104
        help="where the guests' access to the live playlist listens when switched on (default: every network; "
        "PLENIO_GUESTS_HOST sets it too)",
    )
    parser.add_argument(
        "--network-host",
        default=os.environ.get("PLENIO_NETWORK_HOST", "").strip()
        or os.environ.get("PLENIO_GUESTS_HOST", "").strip()
        or "0.0.0.0",  # noqa: S104
        help="where the player and ComfyUI listen for the network when Open from your network is on (default: "
        "every network; PLENIO_NETWORK_HOST sets it too)",
    )
    args = parser.parse_args(argv)
    # what goes wrong while it runs: with the time, in its window (or player.log, started from ComfyUI)
    logging.basicConfig(level=logging.WARNING, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    started = args.folder or default_folders()
    directory = state_dir()
    library = make_library(started, directory)
    folders = library.folders
    guests = GuestHub(library, directory, host=args.guests_host)
    # the studio - ComfyUI - the player can start itself (Settings > The studio), and where it then answers
    launcher = StudioLauncher(directory, reachable=lambda url: comfyui_at(url, timeout=0.6) is not None)
    # the ComfyUI on this computer, found again every few seconds: the party songs are made through its Song API, and
    # while one answers (the one that started the player, ComfyUI Desktop ...) the player starts none of its own
    comfy = studio_finder(args.comfyui, also=launcher.url)
    launcher.elsewhere = comfy
    maker = PartySongs(library, directory, Studio(comfy))
    maker.launcher = launcher
    guests.maker = maker
    ports: list[int] = []
    network = NetworkAccess(
        directory,
        player_port=lambda: ports[0] if ports else args.port,
        comfyui=lambda: (find_comfyui(args.comfyui, launcher.url) or {}).get("url"),
        host=args.network_host,
    )
    try:
        server = serve(
            library,
            State(directory / "state.json"),
            args.host,
            args.port,
            comfyui=args.comfyui,
            guests=guests,
            network=network,
            accounts=Accounts(directory),
            maker=maker,
            launcher=launcher,
        )
    except OSError as error:
        say(
            f"Port {args.port} on {args.host} is taken ({error.strerror or error}) - is the player already "
            f"running? Open http://{args.host}:{args.port}/ or start it with --port {args.port + 1}."
        )
        return 1
    ports.append(server.server_address[1])
    # on every network (0.0.0.0, ::) the browser here opens it by the loopback address: this computer is then the admin
    shown = "127.0.0.1" if args.host in ("0.0.0.0", "::", "") else args.host  # noqa: S104 - the bind address
    url = f"http://{shown}:{server.server_address[1]}/"
    say(f"Plenio Player {__version__} is running at {url} - stop it with Ctrl+C")

    # The songs are read while the player already answers (owner's report 2026-10-23: with thousands of
    # records - all read anew after an update - the player took longer than ComfyUI's button waited, which
    # then started a second player that found the port taken). The page waits for the library meanwhile.
    def read_songs() -> None:
        say(f"Reading the songs of {', '.join(str(f) for f in folders)} ...")
        library.scan(force=True)
        say(f"{len(library.songs())} songs ({len(library.errors)} records could not be read)")
        # the stars of the songs not measured yet, for the library's filter: measured in the background
        measured_for(directory / "cache").start(library)

    threading.Thread(target=read_songs, name="plenio-library", daemon=True).start()
    maker.start()
    guests.resume()
    network.resume()
    if network.status()["on"]:
        say(f"From your network: {network.status()['url'] or 'no network address'}")
    if guests.status()["on"]:
        say(
            f"Guests in your network see the live playlist at {guests.status()['url'] or 'no network address'}"
        )
    if not args.no_browser:
        threading.Timer(0.6, lambda: webbrowser.open(url)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        measured_for(directory / "cache").close()
        maker.close()
        guests.close()
        network.close()
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
