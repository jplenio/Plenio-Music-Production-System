"""The test run of one mutant (tools/mutation.py): pytest with a wall-clock limit. A mutant that makes a test hang
counts as found (exit 1) when the limit ends - mutmut's own timeout does not stop a hung process on Windows.

    python tools/mutation_runner.py <seconds> <pytest arguments ...>
"""

from __future__ import annotations

import subprocess
import sys


def main(argv: list[str]) -> int:
    limit, arguments = float(argv[0]), argv[1:]
    process = subprocess.Popen([sys.executable, "-m", "pytest", *arguments])  # noqa: S603 - this Python, pytest
    try:
        return process.wait(timeout=limit)
    except subprocess.TimeoutExpired:
        subprocess.run(
            ["taskkill", "/F", "/T", "/PID", str(process.pid)], capture_output=True, check=False
        ) if sys.platform == "win32" else process.kill()  # noqa: S603, S607
        process.wait()
        print(f"mutation runner: the tests ran longer than {limit:.0f} s - the mutant counts as found")
        return 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
