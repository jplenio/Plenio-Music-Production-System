# Licensing in plain words

*This is a summary, not legal advice. The licence texts linked on each model card are authoritative.*

## Plenio

Plenio's code is Apache-2.0. You may use, change and share it, also commercially, under that licence.

## Models

Plenio never ships model weights; the templates point to the official downloads. Each model has its own licence:

| Model | Licence | What it means |
|---|---|---|
| YuE2-3B, YuE2 VAE, SheetSage2 | CC BY-NC 4.0 | **non-commercial** use only, with attribution |
| YuE2 instrumental LoRA (community) | CC BY-NC 4.0 | non-commercial |
| MiniMax Music 3 | MiniMax-Music3 Community License | commercial use has conditions (see the licence) |
| Gemma 4, Qwen 3.5 (Comfy-Org repackaging) | Apache-2.0 | permissive |
| faster-whisper large-v3 (lyrics ASR of covers) | MIT | permissive |
| FLUX.2 Klein 4B, its Qwen3 4B text encoder and the FLUX.2 VAE (optional Cover Art) | Apache-2.0 | permissive (check the model cards of other FLUX.2 variants before switching: their licences may differ) |

Songs made with a YuE2 path are therefore subject to the non-commercial terms of YuE2 (and SheetSage2 and the adapter in covers). Plenio writes the licence notices of the models used into each release record (`<song>.plenio.json`): the music model's licence, and SheetSage2 and the instrumental adapter when the workflow loads them.

A cover image made with the optional Cover Art block (FLUX.2 Klein 4B) is under the permissive Apache-2.0 terms of that model; the song itself keeps the terms of its music model.

## Optional Python packages

Plenio installs no Python packages. **mutagen**, which embeds cover art into FLAC and MP3, is optional and GPL-2.0-or-later; Plenio only imports it when you installed it yourself. Without it the cover is saved next to the audio.

## Covers

A cover uses somebody else's composition - its melody and, with *original lyrics*, its words. The model licences above do not cover those rights: publishing a cover generally needs the permission of the rights holders (for example a mechanical licence), even when the recording itself was made legally. Only transcribe and cover recordings you are allowed to use.
