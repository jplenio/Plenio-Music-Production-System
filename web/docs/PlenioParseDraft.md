# Parse Song Draft

Reads the writing model's answer and extracts title, style, lyrics and artwork prompt. Models do not always follow the layout, so the parser accepts labelled blocks (`TITLE:`), headings and unlabelled answers.

It enforces the format deterministically and **reports every change**: one-line style, `[Tag]` sections, repeat marks written out, stage directions removed, and for instrumentals: tags only and no vocal or language descriptors. The report lists the changes and the engine's checks on the draft.

If the answer has no recognisable style and lyrics, the node stops and shows the beginning of the answer.
