# Sung Pitch

The sung melody of a recording as a **pitch curve** for the score editor: a separation model takes out the vocals and a pitch tracker follows them, every 20 ms, with the intonation (a note sung a little sharp shows as such). Connect it to **Song Sheet** (*sung_pitch*): the piano roll draws the curve over the transcribed notes, bar by bar where the transcription's timeline puts it, so you see at a glance where a note was transcribed wrong - a wrong pitch, an octave off, a note that is not sung.

- **audio** - the source recording (the cover template connects its *Source recording*, after the optional excerpt).
- **separation** - a separation model in `models/audio_separation`, the same file as the *Stems* block (`model_bs_roformer_ep_17_sdr_9.6568.ckpt`); *whole mix* tracks the loudest pitch of the mix without separating - often an instrument, so only a fallback.

Output: **sung_pitch** (`PLENIO_PITCH`), for Song Sheet. It is **display only**: it never reaches the music model, and nothing changes because of it.

The curve is worked out once per recording (ComfyUI keeps it while the source does not change). Separating takes about half the song's length on a 16 GB card (a 4-minute song: about two minutes) and about 1.7 GB of GPU memory. Without the model - or when the separation fails - the node still finishes: the editor then says why there is no curve, and the cover goes on.

How the pitch is found: YIN on the vocal stem (16 kHz, 64 ms frames every 10 ms, 65-1050 Hz), voiced where the dip is clear and the singing is no quieter than 35 dB under its loud parts; octave errors are folded, the curve is median-smoothed, and runs shorter than 60 ms are left out.

Licence: the separation model's licence is that of the *Stems* block (MIT trainer; the checkpoint was trained on MUSDB18-HQ, whose dataset terms are research-oriented).
