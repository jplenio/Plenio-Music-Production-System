# Compose Writing Prompt

Builds the writing prompt from the brief and the rules of the loaded music model: style conventions, lyrics format, section order and roughly how many lines fit the target length. Connect **prompt** to any text-generation node (the template uses the native *Generate Text*) and **request** to *Parse Song Draft*.

- **score** (optional) - when a score is connected, the lyrics must follow its sections.
- **detail** (advanced) - concise, standard or rich lyrics.
