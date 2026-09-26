# Brief templates

Markdown files with a front matter block, grouped by folder. A template fills only the brief fields the user leaves empty.

```text
---
name: German pop
group: Pop
genre: pop
tempo: Midtempo (100-120 BPM)
meter: 4/4
vocals: sung | instrumental
language: German
voice: male vocal
theme: hope & resilience
length: short (about 1:30) | standard (about 3:00) | long (about 4:30)
---

Free description of the song (sent to the writing model).
```

Other fields: `mood`, `key`, `melody` (`instrument plays the lead` / `accompaniment only`), `lead_instrument`.

`length` accepts every option of the Song Brief (since 0.2.2 from `very short (about 1:00)` to `very long (about 6:00)`); the shipped templates use the three named ones above. The work mode is not part of a template: it belongs to the workflow, not to the song.

## Provenance

The 239 templates were imported once (2026-09-25) from the legacy toolkit's `prompts/user` library with `tools/import_legacy_templates.py` and then edited:

- 14 instrumental templates no longer mention vocal sounds (for example "vocal chop" became "synth stab"), because vocal words in an instrumental style make vocals more likely;
- 6 German descriptions were translated to English (the song language stays German);
- lengths were mapped to the three length presets.

User templates are saved to `<ComfyUI user directory>/plenio/templates/` and never into the package.
