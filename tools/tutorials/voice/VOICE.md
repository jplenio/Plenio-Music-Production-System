# The narrator's voice

The voice of the tutorial videos is **cloned** for every line from one reference recording, so all
videos have the same speaker.

| File | What it is |
|---|---|
| `narrator.wav` | the reference: 11.7 s, 24 kHz mono |
| `narrator.txt` | its transcript (the clone needs it as *reference text*) |

## How the reference was made

With **OmniVoice** (k2-fsa, Apache-2.0; the bf16 weights in `models/TTS/omnivoice/OmniVoice`) through
**TTS Audio Suite** in ComfyUI: an *OmniVoice Engine* in mode *Voice Design* and a *Voice Designer* node.

- voice instruction: `male, middle-aged, low pitch, american accent`
- seed: `44` (four seeds were tried - 11, 22, 33, 44 - and 44 had the widest natural pitch range,
  76-117 Hz, at a median of 90 Hz)
- reference text: the transcript in `narrator.txt`

The voice is synthetic: it imitates no real person.

## How the lines are spoken

*OmniVoice Engine* in mode *Text to Speech* (language English, 32 steps, guidance 2.0, speed **0.9**,
the other settings at their defaults), *Character Voices* with `narrator.wav` and `narrator.txt`, and
*TTS Text* per line (seed 1). Pauses inside a line are TTS Audio Suite's `[pause:0.4s]` tags. Names are
written the way the TTS says them right (`tools/tutorials/narration/lexicon.txt`: "YuE2" is spoken
"Yu-eh two", "ComfyUI" "Comfy U I"; "Plenio" stays as it is).

For a whole video at once, the *TTS SRT* node takes the video's `.srt` with the same engine and narrator.
