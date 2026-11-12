# Plenio Drop: visuals of your own

The [Plenio Player](player.md) has three kinds of visuals. The *classic* ones (bars, oscilloscope, fire …),
**Plenio Nova** - scenes the graphics card works out for every pixel (see the player's page) - and **Plenio
Drop**: visuals in the spirit of Winamp's MilkDrop, drawn by Plenio's own renderer on your graphics card. Plenio Drop comes with 21 presets - five of them draw the song itself, its cover, its title and
the words sung, into the picture - and *Drop · Random*, which makes up a new one every time it is chosen. And
you can write your own: a preset is a short text file.

This page explains how Plenio Drop draws, then the preset file, every value in it, and a few recipes. No
programming is needed: a preset is a list of numbers and small formulas like `1.01 + 0.02 * bass`.

## How Plenio Drop draws

Every frame (60 times a second), Plenio Drop does three things:

1. **Warp.** It takes the last frame and draws it again, a little changed: zoomed, turned, pushed, bent by
   one of six patterns, and a little darker. This is the feedback loop that makes MilkDrop look the way it
   does. Whatever was drawn becomes a trail of smoke, a tunnel, a swirl.
2. **Draw.** On top it draws pictures, if the preset wants them - the song's cover, its title, the line or the
   word sung now - and the music: waves (the waveform as a circle, a line, a spiral …), shapes (polygons and
   glowing dots) and, if you like, a grid of strokes showing the motion. What is drawn becomes part of the
   smoke: a title melts, a cover is pulled into a swirl.
3. **Show.** It puts the picture on the screen with brightness, an echo, mirrors and colour effects.

A preset decides the values for each of these steps, every frame, from the music: how loud the bass is now,
whether a beat just hit, the time. When the visual changes from one Drop preset to the next, the picture
stays and the values glide from the old preset to the new one - over the crossfade's time set in the visuals'
settings (3 seconds unless you change it).

## Your presets folder

Your presets live in the player's state folder, in `visuals`:

- Windows: `C:\Users\<you>\.plenio\player\visuals`
- Linux and macOS: `~/.plenio/player/visuals`

(If you set `PLENIO_PLAYER_STATE`, it is the `visuals` folder in there.) Every `.json` file in this folder
is a visual of yours. The visuals' settings (✦ in Now playing, or **V**) list them under **My presets**, as
*My · <name>*, and you choose them like any other visual: in the mode's choice, as the fixed visual, for a
song or for a playlist.

**The quickest start:** play a Plenio Drop visual you like, open the visuals' settings, and click
**Edit a copy**. The player saves a copy of that preset in your folder (for example
`star-gate-my-copy.json`); **Open my folder** shows the folder. Choose the copy (*My · Star Gate (my
copy)*), open the file in any text editor, change a number and save: **the visual changes on screen within
three seconds.** No reload, no restart.

If a file has a mistake, the visuals' settings show the file's name and what is wrong and where, for example
`broken.json frame.zoom: unknown name "bas"`. The other presets keep working.

## A first preset

```json
{
  "name": "Blue Breath",
  "blurb": "A ring that breathes with the bass, its trail flowing outwards.",
  "suits": ["calm", "electronic"],
  "base": { "decay": 0.97, "gamma": 1.6 },
  "frame": {
    "zoom": "1.01 + 0.02 * bass"
  },
  "waves": [
    { "mode": "circle", "scale": "0.5 + 0.3 * bass_att", "hue": "time * 0.05" }
  ]
}
```

What it does:

- `base` sets the starting values of every frame: the picture keeps 97 % of its brightness each frame
  (`decay`), and it is shown a little brighter (`gamma`).
- `frame` is worked out every frame: the picture zooms in by 1 % plus up to a few % more when the bass is
  loud. So the ring's old copies drift outwards, faster with the bass.
- `waves` draws the waveform as a circle whose size follows the smoothed bass, its colour moving slowly
  through the colour scheme.

Save it as `blue-breath.json` in your folder, and it is there.

## The file

A preset is a JSON object with these keys. Only `name` is required.

| Key | What it is |
|---|---|
| `name` | the preset's name (the list shows *My · name*) |
| `blurb` | one sentence: what you see (shown when you point at it) |
| `suits` | what music it suits, for the mode *Match the music*: any of `energetic`, `calm`, `acoustic`, `electronic`, `dark`. A preset naming none of them comes only for songs these words do not describe |
| `base` | starting values of the parameters, every frame |
| `init` | your own variables and their values at the start (numbers only) |
| `frame` | lines worked out every frame, in order: each sets a parameter or one of your variables |
| `waves` | the waves to draw: a list |
| `shapes` | the shapes to draw: a list |
| `sprites` | the pictures to draw - the cover, the title, the line or word sung: a list ([see below](#pictures-the-cover-the-title-the-lyrics)) |

Every value in `base`, `frame`, `waves`, `shapes` and `sprites` can be a **number** (`0.97`), a **formula** in quotes
(`"1.01 + 0.02 * bass"`) or, where the value is one of a list, a **name** (`"swirl"`, `"circle"`,
`"left-right"`). `true` and `false` count as 1 and 0.

### What happens every frame

1. Every parameter starts at its default (the table below), then gets the value from `base`.
2. The lines of `frame` are worked out from top to bottom. A line can read everything set before it: the
   music, the parameters (so `"zoom": "zoom * 1.01"` builds on the value from `base`), and your variables.
3. Your variables keep their values to the next frame. Parameters do not: they start again from `base`.
4. The waves, shapes and pictures are worked out, each with the values of this frame.

## Formulas

A formula is ordinary arithmetic:

| Write | Means |
|---|---|
| `1.5`, `.25`, `2e-3` | numbers |
| `+ - * /` | add, subtract, multiply, divide |
| `%` | remainder (`7 % 4` is 3) |
| `^` | power (`2 ^ 3` is 8; `-x^2` is `-(x^2)`) |
| `( )` | brackets |
| `< <= > >= == !=` | comparisons: 1 if true, else 0 |
| `&&  \|\|  !` | and, or, not |
| `c ? a : b` | if `c` is not 0 then `a`, else `b` |

Dividing by zero gives 0, and so does anything that would not be a number. A formula never stops the visual.

**Functions:**

| Function | Gives |
|---|---|
| `sin(x)` `cos(x)` `tan(x)` | sine, cosine, tangent (`x` in radians: `pi` is half a turn) |
| `asin(x)` `acos(x)` `atan(x)` `atan2(y, x)` | the angles back |
| `abs(x)` `sign(x)` | size without sign, the sign (-1, 0, 1) |
| `sqrt(x)` `exp(x)` `log(x)` `pow(x, y)` | square root, e to the x, natural log, power |
| `floor(x)` `ceil(x)` `round(x)` `fract(x)` | round down, up, to the nearest; the part after the point |
| `min(a, b, …)` `max(a, b, …)` | the smallest, the largest |
| `clamp(x, low, high)` | `x`, but not below `low` or above `high` |
| `mix(a, b, t)` | from `a` (t = 0) to `b` (t = 1) |
| `step(edge, x)` | 0 below `edge`, 1 from it on |
| `smoothstep(a, b, x)` | 0 below `a`, 1 above `b`, a smooth curve between |
| `rand()` `rand(x)` | a random number from 0 to 1 (or to `x`), new every time |
| `hash(x)` | a random-looking number from 0 to 1, always the same for the same `x` |

**Names you can read:**

| Name | What it is |
|---|---|
| `bass` `mid` `treb` | the low, middle and high sound now, against the song's usual level: about 1 normally, 2 when loud, up to 3; near 0 when quiet |
| `bass_att` `mid_att` `treb_att` | the same, smoothed over a third of a second: calmer, for sizes |
| `vol` | the level now, 0 to 1 |
| `beat` | 1 in the frame a beat hits, else 0 |
| `pulse` | 1 when a beat hits, falling to 0 before the next |
| `time` | seconds since the visual started |
| `frame` | frames since the visual started |
| `dt` `fps` | seconds since the last frame, frames per second |
| `aspect` | the picture's width over its height (16:9 is 1.78) |
| `songtime` | seconds into the song (for a title at the start: `clamp(1 - songtime / 8, 0, 1)`) |
| `line_on` | 1 while a lyrics line is sung, else 0 |
| `line_age` | seconds since the line sung now began |
| `anticipation` | 0..1, rising in the 180 ms before a strong onset of the song (from its analysis; 0 without one) |
| `impact` | 1 on a strong onset, falling within about 120 ms |
| `tension` | 0..1 across the two bars before a louder section |
| `beat_phase`, `bar_phase` | 0 on a beat (a bar's first beat), rising to 1 at the next |
| `section_energy` | 0..1, how loud the section that plays is against the song's loudest |
| `pi` `e` | 3.14159…, 2.71828… |
| every parameter | its value so far this frame (`zoom`, `decay` …) |
| your variables | the names in `init` and the new names in `frame` |
| `i` `n` | in waves, shapes and pictures with `repeat`: which copy (0, 1, 2 …) and how many |

**Your own variables** are the names in `init`, and any name in `frame` that is not a parameter. They start
at their `init` value (or 0) and keep their value from frame to frame. A name is letters, digits and `_`,
starting with a letter, and none of the names above.

Formulas are read by the player's own small calculator, never run as a program: a preset can only draw. A
preset someone shares with you is safe to open.

## The parameters

Set them in `base` or `frame`. Motion is per frame at 60 frames a second, as in MilkDrop; on a screen with
more (or fewer) frames a second the player scales it, so a preset moves equally fast everywhere.

**The warp: how the last picture is drawn again**

| Parameter | Default | What it does |
|---|---|---|
| `decay` | 0.97 | how much of the picture stays each frame: 0.9 short trails, 0.97 long, 0.99 very long |
| `zoom` | 1 | above 1 the picture grows every frame (things flow outwards), below 1 it shrinks (things flow in) |
| `zoomExp` | 1 | how zoom depends on the distance from the centre: above 1 stronger at the edges (a rush), below 1 stronger at the centre |
| `rot` | 0 | turn per frame in radians: positive anticlockwise (0.01 is about half a degree) |
| `cx` `cy` | 0.5 | the centre of zoom and turn: 0 left/bottom, 1 right/top |
| `dx` `dy` | 0 | push per frame, as a share of the screen: positive right and up (0.005 is half a percent) |
| `sx` `sy` | 1 | stretch per frame across and up: 1.01 pulls the picture 1 % wider (taller) every frame |
| `warp` | 0 | a wobbling bend of the whole picture: 0 none, 1 gentle, 3 wild |
| `warpSpeed` | 1 | how fast the wobble moves |
| `warpScale` | 1 | the size of the wobble's waves: larger numbers, smaller waves |
| `family` | plain | one of twelve patterns that bend the picture (next table) |
| `famA` `famB` | 0, 1 | the pattern's two values |
| `wrap` | 0 | 1: what leaves on one side comes back on the other; 0: the edges are repeated |
| `hueShift` | 0 | turns the picture's colours a little every frame (0.01 goes once round the colours in about ten seconds) |
| `darkenCenter` | 0 | darkens the middle a little every frame (MilkDrop's *darken center*): 0.03 to 0.06 keeps a zoom from piling white light there |

**The twelve patterns** (`family`):

| `family` | `famA` | `famB` |
|---|---|---|
| `plain` | - | - |
| `swirl` | the turn at the centre per frame (0.1 to 0.3) | how far out the swirl reaches (0.5 to 1.5) |
| `waves` | how far the waves push (0.002 to 0.01) | how many waves (3 to 10) |
| `tunnel` | how strongly rings breathe (0.01 to 0.05) | how close the rings are (6 to 16) |
| `kaleidoscope` | a small twist (0 to 1) | how many mirrored slices (3 to 12) |
| `ripple` | how strong the ripples are (0.01 to 0.05) | how close the rings are (14 to 34) |
| `twist` | the turn per frame, growing outwards (0.01 to 0.05) | how fast it grows with the distance (1 to 2.5) |
| `fold` | how far each fold moves (0.05 to 0.2): a fractal grows in the feedback | the turn of each fold in radians (0.2 to 0.8) |
| `lens` | how strongly the lens breathes (0.01 to 0.05, negative: the other way) | the distance where it neither grows nor shrinks (0.2 to 0.4) |
| `tiles` | how much of the tiled picture is laid over the last one each frame (0.03 to 0.3) | how many tiles across (2 or 3) |
| `spiral` | the twist of the endless spiral (0.005 to 0.03, negative: the other way) | a multiplier for it (1) |
| `drain` | the turn at the middle (0.003 to 0.02): fastest there, as water into a drain | how far from the middle it eases (0.05 to 0.3) |

**Drawing on top**

| Parameter | Default | What it does |
|---|---|---|
| `mvec` | 0 | motion vectors: a grid of short strokes along the flow, this many across (0: none, 24 is a good grid) |
| `mvAlpha` | 0.5 | how bright the strokes are |

**Showing the picture**

| Parameter | Default | What it does |
|---|---|---|
| `gamma` | 1.5 | brightness: 1 as drawn, 2 twice as bright |
| `echoAlpha` | 0 | a second copy of the picture over it, 0 none to 1 full |
| `echoZoom` | 1 | the copy's size: above 1 larger |
| `echoOrient` | 0 | the copy flipped: 0 not, 1 left-right, 2 upside down, 3 both |
| `mirror` | none | `none`, `left-right`, `top-bottom`, `both` (or 0 to 3) |
| `invert` | 0 | 0 normal to 1 a negative |
| `solarize` | 0 | 0 normal to 1 dark and bright swapped, the middle glowing |
| `vignette` | 0.35 | how dark the edges are, 0 to 1 |

## Waves

Each wave in `waves` draws the music once per frame. All fields are optional:

| Field | Default | What it does |
|---|---|---|
| `mode` | circle | what is drawn (next table) |
| `scale` | 1 | its size: 1 is a circle a third of the screen's height across, a line half the screen high at its loudest |
| `x` `y` | 0 | where: -1 left/bottom edge, 0 the middle, 1 right/top edge |
| `thick` | 0.006 | the line's thickness: 0.006 is about 3 pixels at 1080p |
| `alpha` | 0.9 | how bright, 0 to 1 (waves add light: where they cross, they glow) |
| `hue` | 0 | the colour, from the colour scheme (see *Colours*) |
| `repeat` | 1 | how many copies (up to 64), each with its own `i` (a number, not a formula) |

| `mode` | Draws |
|---|---|
| `circle` | the waveform as a ring that swells with the sound |
| `scope` | left against right, as a vectorscope draws it (for nearly mono songs, the sound against itself a moment later, so it draws loops) |
| `line` | the waveform as a line across the screen |
| `spectrum` | the spectrum as a line across the screen, low on the left, mirrored below |
| `stereo` | two lines: left above, right below |
| `dots` | a turning ring of dots, the spectrum pushing them out |
| `vertical` | the waveform as a line from top to bottom |
| `spiral` | the spectrum along a turning spiral |

## Shapes

Each shape in `shapes` is a filled polygon with a soft glow: bright in the centre (`inner`), fading to its
edge (`alpha`). With many sides it is a dot or a disc.

| Field | Default | What it does |
|---|---|---|
| `sides` | 6 | 3 a triangle, 4 a square … 40 and more a circle |
| `radius` | 0.1 | its size: 0.1 is a twentieth of the screen's height |
| `x` `y` | 0 | where, as for waves |
| `angle` | 0 | turned by this many radians |
| `hue` | 0.5 | the colour |
| `alpha` | 0.4 | the edge's brightness |
| `inner` | 0.8 | the centre's brightness |
| `repeat` | 1 | how many copies (up to 64), each with its own `i` |

With `repeat`, `i` counts the copies from 0 and `n` is how many there are. So five lights in a circle:

```json
"shapes": [
  { "repeat": 5, "sides": 24, "radius": 0.03,
    "x": "0.5 * cos(time + i * 2 * pi / n)", "y": "0.5 * sin(time + i * 2 * pi / n)",
    "hue": "i / n", "inner": 1, "alpha": 0.2 }
]
```

## Pictures: the cover, the title, the lyrics

Each entry in `sprites` draws a picture into the feedback, before the waves - so it melts, swirls and trails
with everything else. The pictures are the song's own:

| `source` | The picture |
|---|---|
| `cover` | the song's cover (a song without one: nothing is drawn) |
| `title` | the song's title, as white glowing text |
| `line` | the lyrics line sung now (nothing between lines - use `line_on` to fade it) |
| `word` | the word sung now |

| Field | Default | What it does |
|---|---|---|
| `source` | `cover` | which picture (above) |
| `x` `y` | 0 | where its middle is, as for waves |
| `size` | 0.3 | its half height in screen heights: 0.3 is three tenths of the screen above and below the middle; the width follows the picture |
| `angle` | 0 | turned by this many radians |
| `alpha` | 0.8 | how strongly it shows (0 not at all) |
| `tint` | 0 | 0 its own colours, 1 the colour scheme's colour at `hue` (a title in the song's colours) |
| `hue` | 0 | the colour for `tint` |
| `blend` | `add` | `add`: its light added (glowing); `over`: laid over what is there (the cover, and text that should stay readable) |
| `repeat` | 1 | how many copies, each with its own `i` |

The title at the start of a song, fading after eight seconds, and the line sung rising as smoke:

```json
{
  "name": "My title smoke",
  "base": { "decay": 0.982, "dy": 0.0025, "warp": 0.9 },
  "sprites": [
    { "source": "title", "size": 0.12, "alpha": "clamp(1 - songtime / 8, 0, 1) * 0.3", "blend": "over" },
    { "source": "line", "y": -0.45, "size": 0.075, "alpha": "line_on * 0.25", "blend": "over", "tint": 0.5, "hue": "time * 0.03" }
  ]
}
```

A picture is drawn every frame, into a picture the visual keeps:

- **Text with `add` burns white**: its light is added again every frame, and where the visual keeps its picture
  long (a `decay` near 1) or zooms slowly, it adds up to a white streak. Lay text `over` with a small `alpha`
  (0.25 to 0.4) - it stays its own colour and melts into the rest.
- **Draw in bursts** for pictures that should fly: a word drawn every frame while the visual zooms leaves a
  smear; drawn only on the beat (`"alpha": "line_on * clamp(kick * 2 - 1, 0, 1)"` with a `kick` set to 1 on
  a beat in `frame`), each copy flies off on its own - as in *Lyric Tunnel*.
- **In a kaleidoscope** only half of the first slice is copied, mirrored into all the others: from the right,
  going up, half of 360 degrees over `famB` (36 degrees for 5 slices). A picture outside it is drawn once and gone; put it
  inside - at an angle in the middle of the slice, `"x": "0.42 * cos(0.314) / aspect", "y": "0.42 * sin(0.314)"`
  for 5 slices - and it becomes the mandala, as in *Album Kaleido*.
- **To fill the picture**, let it reach the edges before it fades: the farther the zoom carries it, the closer
  to 1 `decay` must be (a zoom of 1.01 needs about 0.988 to reach the edge from the middle).

The built-in *Cover Galaxy*, *Title Smoke*, *Lyric Tunnel*, *Album Kaleido* and *Cover Echo* are made this way -
*Edit a copy* shows how. In a song's video, *Into the visual* adds the title, the line and the cover to any Drop
preset, without changing it.

## Colours

`hue` picks a colour from the colour scheme set under **Look** in the visuals' settings (the song's colours,
Winamp classic, neon, sunset, monochrome). It goes round: 0 and 1 are the same colour, so `"time * 0.05"`
moves through the scheme and back without a jump. The same preset looks different with each scheme, and
with each song when the scheme is the song's colours.

## Recipes

**A flash on every kick.** A variable that jumps to 1 on a beat and dies away:

```json
"init": { "kick": 0 },
"frame": {
  "kick": "beat ? 1 : kick * 0.9",
  "zoom": "1.01 + 0.08 * kick",
  "gamma": "1.5 + kick"
}
```

**Something that keeps turning faster with the music.** A variable that adds up:

```json
"frame": {
  "spin": "spin + 0.01 + 0.02 * mid",
  "rot": "0.01 * sin(spin)"
}
```

**Calm verses, wild choruses.** `bass_att` is high when the song is loud:

```json
"frame": { "warp": "bass_att > 1.3 ? 2.5 : 0.5" }
```

**A tunnel in a kaleidoscope.** `"family": "kaleidoscope", "famB": 8` in `base` and `"zoom": "1.03"`.

**A starting point for anything:** the player's own presets are written exactly this way. *Edit a copy* gives
you any of them, ready to change.

## Quality and speed

Plenio Drop draws on the graphics card and runs at the screen's full frame rate on ordinary computers. Under
**Plenio Drop and Nova > Quality** in the visuals' settings:

- **Fast**: draws the picture at half the size and scales it up. For a slow computer or a very large screen.
- **Balanced** (the default): Plenio Drop at three quarters of the size, Plenio Nova at the screen's own size.
- **Sharp**: Plenio Drop with every pixel; Plenio Nova finer still - up to one and a half times each way - and
  smoothed down onto the screen, for the calmest edges.

Plenio Nova's visuals take only as many pixels as the graphics card draws smoothly (each one is timed on it), so a
heavy one can stay below the size its quality asks for.

While frames come late (the graphics card busy with something else), the player draws fewer pixels for a while,
and more again when it can. Plenio Drop needs WebGL 2 drawn by the graphics card, which every current browser has;
where it is missing, or the browser draws WebGL with the processor, Plenio Drop and Plenio Nova are not offered (the
visuals' settings say why) - the classic visuals work everywhere.

## Sharing presets

A preset is one small `.json` file: send it, and the other person puts it in their `visuals` folder. Because
the player only reads numbers and formulas from it, a preset cannot do anything but draw. Files larger than
256 KB are not read, and at most 200 files.
