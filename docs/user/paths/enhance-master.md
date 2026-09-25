# 4 · Enhance & Master

Finishes an existing recording - a take you rendered earlier, or any song file - without a music model and without a GPU: a gentle EQ, loudness and dynamics, and a release export with tags and cover.

```text
Load Audio -> EQ -> Loudness & Dynamics -> Preview
                                        -> Export Release (FLAC 24-bit + MP3 V0, tags copied, original kept)
```

## Quick start

1. Open **4 · Enhance & Master** from the template browser.
2. Upload the file in **Load Audio** (FLAC, WAV, MP3, OGG, M4A ...).
3. Press **Run**. The defaults: a *warm, gentle* tone match, -14 LUFS with a true peak of at most -1 dBTP (streaming), *Balanced - gentle glue* compression, the source's sample rate.
4. The result plays in the preview; the files are in `output/plenio/enhanced/`:
   - `<title>.flac` and `<title>.mp3` - the master, with the source file's tags and cover,
   - `<title> (original).flac` - the unmastered source, for comparison,
   - `<title>.plenio.json` - the release record (settings, measured loudness, reports).

## The three stages

**EQ** ([help](../../../web/docs/PlenioEQ.md)) - *flat* (no change), *manual* (drag bands on the curve under the node; double-click adds a band, the wheel changes Q), *match preset* (Plenio measures the audio and proposes up to a few gentle peak bands towards a **warm** or **bright** tilt, or towards a **reference** recording you connect), *custom match* (the same with your own strength and limits). The EQ does not normalise: a boost can raise the peak - the next stage takes care of level.

**Loudness & Dynamics** ([help](../../../web/docs/PlenioLoudness.md)) - a target (*streaming* -14, *Apple Music / podcasts* -16, *dynamic* -18, *broadcast EBU R128* -23, *loud* -9 LUFS, or *custom*), a compression style (or *off* for the limiter alone), and the output sample rate. The node measures the result and says whether the target was reached; when reaching it would need more limiting than the style allows, it stops short and warns instead of squashing the song.

**Export Release** ([help](../../../web/docs/PlenioExportRelease.md)) - FLAC 24-bit, MP3 VBR V0 and/or WAV 32-bit float; tags *title only*, typed *tags*, or *copy from loaded file* (the file in the one Load Audio node of the workflow; the *title* input, when connected, wins). A connected *cover* image replaces the copied cover.

## Using it after a song path

The song templates 1-3 finish with the same stages as the **Plenio · Master** block (node library, *Plenio/Mastering*): it sits between the render and **Export Release**, and Export keeps the unmastered take as `(original).flac`. Use this template to master a take again with other settings.

## Skipping a stage

Bypass a node (Ctrl+B) or choose *flat* in the EQ: the audio then passes through unchanged - same samples, sample rate and length; Export still writes the tags you chose. Choose *keep* as the sample rate to never convert.

## App mode

Switch **Graph / App** at the top left: the app asks for the file, the EQ mode, the loudness target and the compression style ([App mode](../concepts/app-mode.md)).

## Good to know

- The targets are **measured**, not estimated: integrated loudness per ITU-R BS.1770-4 and true peak with 4x oversampling, after the final sample-rate conversion. The export's record shows the numbers again, measured on the exported audio. Details and limits: [Mastering and audio formats](../concepts/mastering.md).
- A song that is already loud and limited (most commercial masters) gains little from another pass; the *original* file lets you compare.
- Cover art is embedded into FLAC and MP3 only when the optional package **mutagen** is installed (`<ComfyUI python> -m pip install mutagen`); without it the cover is saved as `<title>.jpg` next to the audio and the export notes this. WAV files carry basic tags (RIFF INFO) and no cover.
