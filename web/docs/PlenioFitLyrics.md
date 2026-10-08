# Fit Lyrics

Checks **new cover lyrics against the melody** they will be sung on, line by line, and sends the lines that do not fit back to the writer - only those lines, at most twice. The *Write Song* block chains three of these nodes with a writer between them; nothing else needs to be wired.

**How a line is checked.** The score's Vocal notes are split into phrases at rests of a beat. Lines and phrases are lined up in order - a line may span two or three short phrases, two or three short lines may share one, two lines may share two phrases. A line fits when it has about one syllable per note: at most as many syllables as notes (one more on six notes or more) and at most a quarter fewer (at least two) - a syllable may stretch over two notes, more syllables than notes blur. A section whose number of lines is far from its number of phrases is written anew. Syllables are counted by Plenio (rules for English and German, vowel groups for other languages), not by the writer.

**The repair request** shows the writer the whole lyrics and asks only for the failing lines, each with its target (*"2-3": section 2 [Chorus] line 3, "..." - 11 syllables, its phrase has 8 notes: write 6 to 8 syllables*), the rhyme to keep and the language. The writer builds every line syllable by syllable: the answer lists each line's syllables, then the line (`{"2-3": {"syllables": ["I", "walk", "a", "long"], "text": "I walk along"}}`). Held to its schema - a GGUF file, LM Studio or Ollama - the list **cannot** be longer or shorter than the target, which is what makes the rounds work (study A2: local models hit a syllable count when they spell it, not when they are told it). A new line that is further off than the old one is not taken (Plenio counts the line itself). When the draft fits, the writer is not asked at all.

**The last round** asks nothing more. A line still one or two syllables too long is shortened the way a singer would sing it - *I am* -> *I'm*, *going to* -> *gonna*, a leading *and* left out (English). A line still too short stays: YuE2 sings a syllable over two notes.

**Passes through unchanged:** songs (their melody is planned after the lyrics), covers with the original lyrics, instrumentals, and a cover without a score.

## Inputs

- **lyrics** - the draft (Parse Song Draft) or the previous Fit Lyrics' lyrics.
- **brief** - only a Cover Brief with new lyrics is fitted; its language, theme and lyrics closeness go into the request.
- **score** - the final score (Song Sheet · Score): its Vocal phrases are the targets.
- **reference_lyrics** - the source's lyrics (Transcribe Lyrics), for the meaning when the brief keeps close to them; requested only then.
- **state** and **answer** - the previous round's request and the writer's answer to it; the answer is requested only when lines went back.
- **last** - the last round: no new request, the short lines' last step.

## Outputs

- **lyrics** - after this round.
- **prompt** and **schema** - the repair request for the next writer (empty when the lyrics fit or in the last round).
- **state** - for the next Fit Lyrics.
- **report** - lines that fit (and how many did in the draft), what was asked, taken, kept and shortened.
