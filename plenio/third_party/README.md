# Third-party code

Files in this folder are **unchanged** copies of upstream code. Do not edit them; Plenio adapts them in `plenio/core`.

| File | Upstream | Version | SHA-256 | Licence |
|---|---|---|---|---|
| `yue2_abc_tools.py` | `skills/yue2-music/scripts/abc_tools.py` in [multimodal-art-projection/YuE](https://github.com/multimodal-art-projection/YuE/blob/e76a8753dcd23358726e7b59f4a014498e8895c6/skills/yue2-music/scripts/abc_tools.py) | commit `e76a8753dcd23358726e7b59f4a014498e8895c6` (last change to the file; identical at `main` `09a1e8a85bf35a93b8c01b3f12b139b558b49852`, checked 2026-09-25) | `ea04b922dacebec7ad257a2f8d83bdb5dfecb7a23110c1a3121c5c41c313930e` | Apache-2.0, see `LICENSE-YuE.txt` |
| `yue2_vae_rs.py` | `VAE-RS/kit/yue2_vae_rs.py` in [goldhub/YuE2-RS-Finetunes](https://huggingface.co/goldhub/YuE2-RS-Finetunes/tree/main/VAE-RS/kit) (Ruach Studio) | 1.0.0 | `b7fd8baeddbe1f8c5dd9940cc071d9e4dd4a0f137ef695cb8f301396ecfb21a1` | Apache-2.0, see `LICENSE-YuE2-VAE-RS.txt`; its `NOTICE-YuE2-VAE-RS.txt` travels with it (Apache-2.0 section 4 (d)) |

`tests/unit/test_import_boundary.py` pins the hashes, so an accidental edit fails the test suite.
