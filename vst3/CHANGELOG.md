# Changelog

All notable changes to Plenio VST3. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/);
versions follow [Semantic Versioning](https://semver.org/).

## [0.1.0-alpha] - 2026-11-09

The first release: the Plenio Music Production System as a VST3 instrument in your DAW.

### Added

- **Plenio**, a VST3 instrument: a new song or a cover from a style, an idea or your own lyrics, made by Plenio in
  ComfyUI on your own graphics card. Up to four takes per run, all on the same track, each with its stems, its cover
  art, its lyrics, melody and chords.
- **Change it and render again**: the words (new words get new notes), the melody and instrument line in a piano roll,
  the chords, or the whole brief. *Generate* says what it will do; every run adds takes, also when the song gets longer
  or shorter.
- **In time with your DAW**: the chosen take plays from bar 1, the stems on outputs of their own, the melody,
  instrument line and chords as MIDI out.
- **Files for your project**: the take and its stems as WAV, the score as MIDI with the song's tempo of every bar,
  the tempo map alone and a click track, dragged straight from the plug-in onto your timeline.
- **REAPER, deeper**: *Put on tracks* lays the song out on the project's own tracks: every take as one of REAPER's takes,
  the stems, the MIDI, the lyrics, the sections as regions, the tempo map from the measured bars, the cover art as the
  tracks' icon. The take chosen in REAPER and in Plenio stay the same; Plenio's audio keeps its speed when the tempo
  map changes.
- **Plenio ARA** (ARA 2, on a clip in REAPER, Cubase, Studio One and other ARA hosts): knows Plenio's takes, gives
  the host their tempo, bars, key, sung notes and chords, and plays any other take of the song in the same clip.
- **Every DAW's own steps** in the plug-in's DAW tab (and in [docs/DAWS.md](docs/DAWS.md)): REAPER, Cubase and Nuendo,
  Studio One, Ableton Live, FL Studio, Bitwig Studio, Cakewalk and Sonar.
- **Your songs stay yours**: a saved project plays and edits without ComfyUI and Plenio; only *Generate* needs them.
  Every song lives in a library folder (`Documents\Plenio\Songs`) with its takes, stems, files and `cover.jpg`.
- **New Plenio versions come in by themselves**: styles, fields and models come from Plenio's Song API; the status
  shows when a newer Plenio brings more (stems and measured bars need Plenio 1.6).
- Installers: Windows (installer and portable zip); macOS (`.pkg`, universal, **experimental**: built, not yet tried on
  a Mac).

[0.1.0-alpha]: https://github.com/jplenio/Plenio-Music-Production-System/releases/tag/v0.1.0-alpha
