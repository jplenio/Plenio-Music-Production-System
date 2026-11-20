# YuE2 Decoder (VAE-RS)

*Experimental.* Decodes YuE2's latents with Ruach Studio's **YuE2-VAE-RS x3** decoder instead of the checkpoint's own, and encodes exactly as before.

**vae** - the VAE output of the *Plenio · YuE2 Model* block.

**decoder** - *the checkpoint's own* passes the VAE through unchanged. Otherwise a file from `models/vae`: `YuE2-VAE-RS-x3_v1.safetensors` or `YuE2-VAE-RS-x3_v2.safetensors` (decoder only, 0.75 GB each), or their `-full` files (the same decoder beside the Standard encoder). Any other file is refused with the reason.

The output is a VAE: connect it wherever the model block's VAE went - the renders' *VAE Decode Audio* and *VAE Decode Audio (Tiled)*, and the cover's *VAE Encode Audio*. Encoding keeps the checkpoint's encoder (x3 decodes the same latents), so covers are encoded as before, byte for byte.

x3 is the Standard decoder grown three times over and trained on music, aimed at Standard's 100 Hz ripple and its seams at 6 and 12 kHz; its waveform fidelity (SI-SDR) is a little lower and a decode takes about twice as long. It runs in float32 with TF32 off whatever ComfyUI's VAE precision flags say, and tiles with the exact context each side (60 latent frames), so the tiled decode's tile size (lowered to 750 when larger) changes the memory and never the audio; the overlap is not used.

Files and the study: [goldhub/YuE2-RS-Finetunes, VAE-RS/](https://huggingface.co/goldhub/YuE2-RS-Finetunes/tree/main/VAE-RS). Weights **CC BY-NC 4.0** (non-commercial; credit YuE2, m-a-p and Ruach Studio). DOI [10.5281/zenodo.24167962](https://doi.org/10.5281/zenodo.24167962).
