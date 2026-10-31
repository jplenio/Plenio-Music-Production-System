# Creativity

One slider on **Song Brief** and **Cover Brief**: **0 steady ... 25 balanced ... 50 experimental (the default) ...
100 adventurous**. It makes a song simpler and more predictable, or bolder and more surprising - in the writing and,
with YuE2, in how freely the score is planned and performed.

**Since 1.5.0 the default, 50, writes and samples as 1.4 did at 100** - its experimental setting gave the best songs
in listening. **25 is 1.4's reference** (its 50): the writer's prompt without creativity rules and YuE2's own
sampling. Below 50 the slider is 1.4's scale at half the numbers; above 50 it goes further, moderately.

A workflow saved before the slider has no value for it and gets 50. A song made with 1.4 keeps how it was made: the
player and the song page show its number on today's scale (1.4's 60 is today's 30).

## What it changes

| | 0-9 steady | 10-19 restrained | 20-30 balanced | 31-40 varied | 41-75 experimental | 76-100 adventurous |
|---|---|---|---|---|---|---|
| **Lyrics** | plain everyday words, short regular lines, simple rhymes; the chorus repeats word for word | familiar images, regular lines, a repeated chorus | as before the slider | fresh, concrete images; line lengths and rhythm differ between sections; the hook stays, its last repeat may change a few words | an unexpected angle and imagery, inventive rhymes and rhythms; may add one contrasting section (a bridge, or a break before the last chorus) | a surprising perspective - an object that speaks, a letter, a dialogue, a story told from its end - with vivid unusual images; the chorus hook stays simple enough to sing along; may add a contrasting section |
| **Style** (YuE2) | the genre's usual instruments, one steady groove, a simple production | the genre's usual sound | as before the slider | the same short line, more specific: named instruments and how they are played, a production colour, a word or two for contrast and movement | as varied, plus one unexpected but fitting colour - an unusual instrument, a touch of a neighbouring genre, an uncommon rhythm feel | as varied, plus two such colours |
| **Caption** (MiniMax) | one steady groove, the same instruments throughout | a conventional arrangement | as before the slider | the *Arrangement* part tells an arc of contrasts: an intimate start, a build, a full high point, a contrasting bridge or a breakdown, instruments answering the voice | as varied, plus one surprising turn: a key lift, a change of rhythm feel or an unusual solo | as varied, plus two surprising turns - the song still flows as one |

The sampling moves smoothly with the slider, in straight lines between the values below:

| | 0 | 25 | **50** | 100 |
|---|---|---|---|---|
| **Writer's temperature** (first draft) | 0.6 | 0.8 | **1.0** | 1.1 |
| **Creative mode's plan** (temperature) | 0.55 | 0.7 | **0.9** | 1.0 |
| **YuE2 plan**: temperature / top-p / top-k | 0.55 / 0.85 / 20 | 0.7 / 0.9 / 30 | **0.92 / 0.95 / 50** | 1.0 / 0.96 / 64 |
| **YuE2 take**: temperature / top-p / top-k | 0.9 / 0.92 / 60 | 1.0 / 0.95 / 100 | **1.1 / 0.97 / 150** | 1.15 / 0.98 / 200 |

The plan is the score (notes, chords, rhythms), the take the performance (voice, instruments, sound). The values at
25 are YuE2's own defaults. Above 50 the slider stays moderate on purpose: there is no official guidance for YuE2's
sampling, and users report that a plan temperature above 1.0 and a take temperature above 1.15 lose the song's
thread - so 100 stops at those edges and only widens top-p and top-k a little. The repetition penalties are never
changed - music lives from repetition - nor is MiniMax Music 3's own sampling.

## Why the YuE2 style gets more specific, not longer

YuE2 reads its style as a short list of descriptors, and longer style prose was **sung** by it in tests. So a
more varied style stays one line of about 40 words and swaps generic words for exact ones:

- balanced: *English, warm piano pop, expressive female voice, acoustic piano, rounded bass and light drums,
  lyrical memorable melody, unhurried phrasing, 88 BPM*
- varied: *English, indie folk-pop, breathy female alto, fingerpicked nylon guitar, muted trumpet, pulsing
  upright bass, brushed drums, sparse-to-full contrast, dynamic build-ups, instrumental fills between phrases,
  layered backing vocals, 92 BPM*

## Good to know

- **More surprises, more misses.** Above 50, listen to a few takes: the take seed 🎲 renders a new one every run,
  and in a cover *YuE2 Takes* renders several at once.
- **Song sections with a plan** - quiet verses and a big final chorus, instruments answering the voice, a
  breakdown, a key change - are the [creative modes](creative-modes.md) (*arrangement* on the brief). The slider
  does not switch them on; with one on, it sets how freely the writer plans.
- **When a finished score reaches YuE2** - a creative mode's arrangement, a score you edited, the DAW template -
  YuE2 does not plan any more, so only the take's sampling follows the slider.
- **A workflow saved before the slider:** when it opens, Plenio gives it the current blocks - Write Song,
  Arrange and the YuE2 blocks - and links the YuE2 blocks' *creativity* to the brief, so the slider reaches the
  sampling as in the current template; a message names the blocks. Save the workflow to keep it. A block whose
  sampling you changed inside it stays as it was (the message says so); its numbers stay fixed.
- **In the player** a song whose workflow had its sampling fixed while the brief asked for another creativity
  says so beside the numbers: *fixed in the workflow, not from the creativity*.
- **Other ways to more variety:** another draft seed, *thinking* on Write Song with a model that reasons, a larger
  writer model, a key or meter in the brief (*D dorian*, *6/8*).
- **Tags:** `{creativity}` puts the value into a tag or a file name (Export Release).
- **In the Plenio Player** a song's *Details* show its creativity and the sampling it gave, and the filters
  have a *Creativity* row; the search takes `creativity:>50` or `creativity:adventurous`. Songs made before the
  slider count as 25: they were made as 25 makes them now.

The research and the decisions behind the values: [docs/design/creativity.md](../../design/creativity.md).
