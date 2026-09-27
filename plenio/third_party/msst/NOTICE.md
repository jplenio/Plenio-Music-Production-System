# BS-RoFormer (vendored inference code)

Upstream: https://github.com/ZFTurbo/Music-Source-Separation-Training (MIT, see LICENSE)
Pinned commit: `84b1eac0887756b4f1a9d7a1ff49105939749ed2`
Retrieved: 2026-09-27
Checkpoint: `model_bs_roformer_ep_17_sdr_9.6568.ckpt` (release v1.0.12), MUSDB18-HQ SDR 9.66;
config: `config_bs_roformer_384_8_2_485100.yaml` of the same release, vendored as `audio_config.json`.

Vendored for Plenio's *Separate Stems* stage; imported only when a separation model is loaded
(`plenio/comfy/msst.py`), never at import time.

## Files

| Path | Upstream path | SHA-256 of the vendored file |
|---|---|---|
| `LICENSE` | `LICENSE` | `3282dc057695ef5b9a64909a7092ca40b2c292c232580fc6ace6e5d665cc0207` |
| `attend.py` | `models/bs_roformer/attend.py` | `c7abbc40a3fd20ff7f6001fa9f8ee9ad5df6452272712a5e719b8f8468bf2223` |
| `bs_roformer.py` | `models/bs_roformer/bs_roformer.py` | `5c2b9243435a9d550c84975148b54b7f2171df3465b4ebf31dab5f70b6d34cd9` |
| `audio_config.json` | `config_bs_roformer_384_8_2_485100.yaml` (release v1.0.12) | `759bcef5cde26282271d9cdb0d45d14ddd40741cf91a6db00d77215783f557d7` |

## Deliberate changes to the upstream files

Only the import below was rewritten (the package is vendored under a different name); every
other byte is upstream:

- `models/bs_roformer/bs_roformer.py: 'from models.bs_roformer.attend import' -> 'from .attend import'`

The released config was converted from YAML to JSON (the YAML uses `!!python/tuple` tags); the
values are unchanged. `beartype` (type-guard decorators, no runtime effect here) and
`rotary_embedding_torch` (the rotary position embedding) are used when installed; `_compat.py`
next to this file installs documented stand-ins when they are missing. The MUSDB18-HQ dataset
terms are research-oriented: the catalogue and every release record say so.
