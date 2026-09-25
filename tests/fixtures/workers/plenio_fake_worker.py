"""Fake worker for the protocol tests. Behaviour is chosen by ``request["mode"]``."""

from __future__ import annotations

import os
import sys
import time
from typing import Any

from plenio.core.errors import PlenioUserError
from plenio.core.workers.runtime import Job, serve


def handle(job: Job) -> dict[str, Any]:
    mode = job.request["mode"]
    if mode == "ok":
        job.progress(0.5, "half way")
        job.progress(1.0, "done")
        return {"echo": job.request.get("payload"), "python": sys.executable}
    if mode == "user_error":
        raise PlenioUserError("The request was rejected.", hint="Send a better request.")
    if mode == "exception":
        raise RuntimeError("boom")
    if mode == "crash":
        sys.stderr.write("fatal: simulated out of memory\n")
        sys.stderr.flush()
        os._exit(3)
    if mode == "silent":
        time.sleep(30)
        return {}
    if mode == "busy":
        while True:
            job.progress(None, "still working")
            time.sleep(0.05)
    raise ValueError(f"unknown mode {mode}")


if __name__ == "__main__":
    raise SystemExit(serve(handle))
