# Third-party code

Files in this folder are **unchanged** copies of upstream code. Do not edit them; Plenio adapts them in `plenio/core`.

| File | Upstream | Version | SHA-256 | Licence |
|---|---|---|---|---|
| `yue2_abc_tools.py` | `skills/yue2-music/scripts/abc_tools.py` in [multimodal-art-projection/YuE](https://github.com/multimodal-art-projection/YuE/blob/e76a8753dcd23358726e7b59f4a014498e8895c6/skills/yue2-music/scripts/abc_tools.py) | commit `e76a8753dcd23358726e7b59f4a014498e8895c6` (last change to the file; identical at `main` `09a1e8a85bf35a93b8c01b3f12b139b558b49852`, checked 2026-09-25) | `ea04b922dacebec7ad257a2f8d83bdb5dfecb7a23110c1a3121c5c41c313930e` | Apache-2.0, see `LICENSE-YuE.txt` |

`tests/unit/test_third_party.py` pins the hash, so an accidental edit fails the test suite.
