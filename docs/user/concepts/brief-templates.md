# Brief templates: what a template fills, and what it never touches

The **template** in Song Brief and Cover Brief is a starting point: it suggests a style and the settings that go with it (for example *pop/singer-songwriter-acoustic-vocal* or *cinematic/epic-orchestral-instrumental*). Everything you type yourself always wins.

## The rule

| Field class | Fields | Effective value |
|---|---|---|
| text | description, genre, mood, tempo, key, meter, language, voice, theme, lead instrument | **your text** if the field is not empty · else the **template's text** · else empty ("the writer decides") |
| choice | length, vocals, melody | always the **widget value**; the template's different choice is only a suggestion |

The rule is stateless and deterministic, and it never writes into a widget on its own:

- changing the template cannot destroy a value you typed;
- clearing a field returns it to the template's value;
- the summary after a run lists which fields came from the template (`from_template`).

## The panel under the template selector

Pick a template and the panel below the selector says what it would fill:

- **Template fills: genre (indie pop), tempo (88 BPM), …** - the empty text fields the template covers;
- **The template suggests: length = short (about 1:30)** - choice fields where the template differs from your widget value;
- three actions, so nothing happens silently:
  - **Copy template text** - writes the template's text into the fields that are still empty (turning them into your own, editable text);
  - **Use template choices** - sets length, vocals and melody to the template's values;
  - **Reset all to template** - clears every text field you typed into (with a confirmation), so the template applies again;
- **↻** asks again after you changed something.

The panel asks the backend for the answer (`/plenio/brief/fields`), so what it shows is exactly what the brief will resolve to - there is no second copy of the rule.

## Ghost text

Empty fields do **not** show the template's value as grey placeholder text: the ComfyUI frontend does not pass a placeholder to a single-line text widget, and a *dynamic* placeholder has no extension API (checked against frontend 1.53.6). The panel's *Template fills:* line is the readable equivalent; the App-mode form is unchanged.

## The legacy `custom` placeholder

The predecessor toolkit used the word `custom` in `key` and `meter` to mean "let the model decide". It can still arrive through *Reuse parameters* of old jobs. Plenio treats it as **empty** (with a note in the summary), the editor clears it from the text fields when a workflow is loaded, and the writer never sees the word.

## Writing your own lyrics

The lyrics are a document of the Song Sheet like any other, and you can take them over completely:

- **Use my own lyrics** (Lyrics tab) switches the document to *manual*: the writer is not consulted any more, and these words reach the model unchanged;
- the **section tags** under the editor (`[Intro]`, `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Bridge]`, `[Outro]`) insert the tags YuE2 sings section by section;
- the node's summary and the App-mode sheet button show **lyrics: yours (manual)**;
- an *edited* lyrics text is protected too: when the upstream draft changes, the run **stops with a conflict** instead of replacing your words.

**Batch mode** (*new song every run*): a manual lyrics document is used for every song of the series - the titles, styles and takes change, the words stay yours. If you want new words per run, leave the document *automatic*.

## Limits

- The writer cannot read a manual lyrics text (there is no graph connection back from the sheet). When the lyrics are manual but the title and style were drafted, the sheet adds the note *"Title and style were drafted from the brief, not from your lyrics."*
- An instrumental song has no lyrics; the field is not shown.
