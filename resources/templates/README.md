# Brief templates

Markdown files with a front matter block, grouped by folder. Choosing a template in a brief fills its fields (and the
vocals, the length and the melody); a field the user changes keeps the user's value, and a field left empty takes the
template's.

```text
---
name: German pop
group: Pop
genre: pop
tempo: Midtempo (100-120 BPM)
meter: 4/4
vocals: sung | sparse vocals | instrumental
language: German
voice: male vocal
theme: hope & resilience
lyrics: About a promise kept after many years.
length: short (about 1:30) | standard (about 3:00) | long (about 4:30)
---

How the song sounds: its character, instruments and arrangement (sent to the writing model).
```

Other fields: `mood`, `key`, `melody` (`instrument plays the lead` / `accompaniment only`), `lead_instrument`.

The description says how the song **sounds**; what its words are about goes into `lyrics`: an idea the writer writes
the lyrics from (a story, an image, a message; one line). Since 1.5.0 the shipped templates keep the two apart - a
brief's *lyrics* field can then also hold one's own lyrics, sung as written. Instrumental templates have no `lyrics`.

`length` accepts every option of the Song Brief (since 0.2.2 from `very short (about 1:00)` to `very long (about 6:00)`); the shipped templates use the three named ones above. The work mode is not part of a template: it belongs to the workflow, not to the song.

## Provenance

The 239 templates were imported once (2026-09-25) from the legacy toolkit's `prompts/user` library with `tools/import_legacy_templates.py` and then edited:

- 14 instrumental templates no longer mention vocal sounds (for example "vocal chop" became "synth stab"), because vocal words in an instrumental style make vocals more likely;
- 6 German descriptions were translated to English (the song language stays German);
- lengths were mapped to the three length presets.

In 1.5.0 the sung templates' "Lyrics about ..." sentences moved from the description into `lyrics` (26 written by
hand where the description had none or mixed sound and words), and 11 sung templates were added for occasions and
genres without one: birthday songs (English, German), party Schlager, a German carnival song, a wedding first dance, a
German Liedermacher, pop rock, melodic trap, Latin pop, J-rock and Italian pop - 250 templates in all.

User templates are saved to `<ComfyUI user directory>/plenio/templates/` and never into the package.
