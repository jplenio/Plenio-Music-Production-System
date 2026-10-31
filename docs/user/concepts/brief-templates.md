# Brief templates: what a template fills, and what it never touches

The **template** in Song Brief and Cover Brief is a starting point: it sets a style and the settings that go with it (for example *pop/singer-songwriter-acoustic-vocal* or *cinematic/epic-orchestral-instrumental*). Everything you change yourself always wins.

## What you see

Choose a template and its values **appear in the fields**: the description, genre, mood, tempo, key, meter, language, voice, theme, the lyrics idea and the lead instrument - and the template's vocals (sung, sparse vocals or instrumental), length and melody. Change any of them; the rest stays the template's.

- **Another template** replaces every value a template put there - the fields you changed keep your value, so changing the template cannot destroy an edit. A choice follows the same way: a length you set yourself (for short test songs) stays.
- **An empty field** is filled with the template's value again (an empty field always meant "the template's value" - the run reads it the same way).
- **A workflow saved before 1.5.0** opens with its empty fields filled from its template; its typed values stay.
- The summary after a run lists which fields came from the template (`from_template`).

| Field class | Fields | Effective value |
|---|---|---|
| text | description, genre, mood, tempo, key, meter, language, voice, theme, lyrics, lead instrument | **the field's text** · an empty field: the **template's text** · else empty ("the writer decides") |
| choice | length, vocals, melody | always the **widget value**; choosing a template sets it to the template's |

## Lists - and your own values

Genre, mood, tempo, key, meter, language, voice, theme and lead instrument are **lists**: every value the style templates have (and common keys, meters, languages and tempos), as the Plenio Player's form offers them. **✎ type your own …** at the top of a list asks for any text of your own; it then stays in the list. A value saved in a workflow shows even when no template has it. The description and the lyrics stay free text.

## The lyrics field

A sung song (and one with sparse vocals) has two inputs after the theme:

- **lyrics** - *written from the idea below* (default) or *my own, sung as written below*;
- **lyrics idea or text** - with *written from the idea*: what the words should be about (a story, an image, a message); the template's idea appears here and the writer writes the lyrics from it. With *my own*: your lyrics, sung exactly as written - the writer writes only the title, the style and the cover-art prompt for them, and the title comes from your words. Section tags (`[Verse]`, `[Chorus]` …) are kept; without them every block of lines becomes a verse and a block that comes back a chorus.

Switching to *my own* empties the field if it still holds the template's idea. A template never fills your own lyrics.

The template's **description** says how the song **sounds** - character, instruments, arrangement; what it is **about** is in its lyrics idea (since 1.5.0 the shipped templates keep the two apart).

## The panel under the template selector

- **From the template: genre, tempo, … · your own: mood** - which fields show the template's value and which hold yours;
- **The template suggests: length = short (about 1:30)** - choice fields where the template differs from the widget value;
- **Use template choices** - sets length, vocals and melody to the template's values;
- **Refill from template** - puts the template's value back into every text field you changed (with a confirmation);
- **↻** asks again.

The panel asks the backend for the template's values (`/plenio/brief/fields`), so what it shows is exactly what the brief resolves to - there is no second copy of the rule.

## The legacy `custom` placeholder

The predecessor toolkit used the word `custom` in `key` and `meter` to mean "let the model decide". It can still arrive through *Reuse parameters* of old jobs. Plenio treats it as **empty** (with a note in the summary), the editor clears it from the text fields when a workflow is loaded, and the writer never sees the word.

## Writing your own lyrics

The lyrics are a document of the Song Sheet like any other, and you can take them over completely:

- **Use my own lyrics** (Lyrics tab) switches the document to *manual*: the writer is not consulted any more, and these words reach the model unchanged;
- the **section tags** under the editor (`[Intro]`, `[Verse]`, `[Pre-Chorus]`, `[Chorus]`, `[Bridge]`, `[Instrumental]`, `[Outro]`) insert the tags YuE2 sings section by section, as their own line where the cursor is (at the end before you click into the text); `[Instrumental]` is a section without words;
- the node's summary and the App-mode sheet button show **lyrics: yours (manual)**;
- an *edited* lyrics text is protected too: when the upstream draft changes, the run **stops with a conflict** instead of replacing your words.

**Batch mode** (*new song every run*): a manual lyrics document is used for every song of the series - the titles, styles and takes change, the words stay yours. If you want new words per run, leave the document *automatic*.

## Limits

- The writer cannot read a manual lyrics text (there is no graph connection back from the sheet). When the lyrics are manual but the title and style were drafted, the sheet adds the note *"Title and style were drafted from the brief, not from your lyrics."*
- An instrumental song has no lyrics; the field is not shown.
