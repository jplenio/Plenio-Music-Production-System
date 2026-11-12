# Plenio Player: Videos

A song as a video, with its visual and its lyrics. The player's guide in seven pages: [Listening](listening.md) · [Visuals](visuals.md) · [Party](party.md) · [Making songs](making-songs.md) · [People & access](people.md) · [Sharing](sharing.md) · [Videos](videos.md).

## Save a song as a video
<!-- media: player.videos.save-a-song-as-a-video -->

**Video…** on a song's page (or *Save as a video…* in its menu) makes an **MP4 video** of the song: a visual
moving with the music, and over it what you choose.

- **Size**: 1920 × 1080 (Full HD), 1280 × 720, 2560 × 1440 (QHD), 3840 × 2160 (4K), 1080 × 1080 or 2160 × 2160
  (square), 1080 × 1350 (4:5, an Instagram post), 1080 × 1920, 720 × 1280 or 2160 × 3840 (upright, for Shorts,
  Reels and TikTok). **24, 25, 30, 50 or 60 frames a second.**
- **Quality**: seven steps from *Low* (the smallest file) through *Medium*, *Standard*, *High* and *Very high* to
  *Best* - or **a bitrate of your own** (0.5 to 200 Mbit/s), **constant** if a platform asks for a constant rate
  (else variable: quiet parts take less, busy ones more). The dialog says what it means: so many Mbit/s, about so
  many MB a minute. **More about the encoding**: a full picture every 1, 2, 4 or 8 seconds (closer: a player jumps
  in it more quickly; farther: a smaller file), the encoder (as the browser chooses, the graphics card or the
  processor) and the sound (AAC at 128, 192, 256 or 320 kbit/s). The picture is H.264, which every player and
  platform plays.
- **The part**: the whole song, or from - to (in seconds; the section chips set a section). A part cut out
  of the song fades in and out.
- **The visuals**: **one visual** all the way, **a new one at every section** (verse, chorus …) or **every few
  seconds**. A strip shows the part of the song with its sections or spans, as wide as they last, each with a still
  of its visual; click one, and a **gallery** opens with every visual this browser can draw - classic, Plenio Drop,
  Plenio Nova, your own presets - each in a little window **playing to the music of that part**, so you see how it
  moves with this song before you choose. Jump to a group, find one by name, show only those that suit a mood; *large*
  shows larger windows with what each one shows.
  The first window, **At random**, leaves the choice to the dice: *Shuffle the random ones* draws others, from the
  visuals ticked in the visuals' settings, from those that suit the song, or from every visual. **The same visual for
  every chorus, every verse …** (on by default) gives every section of one name the visual of the first one - a
  choice for one is a choice for all. **Change on the beat** lets a change wait for the next beat (at most a second
  and a half). The **crossfade** (morph, melt, fade, zoom, slide, flash on the beat …) and how long it takes; the
  colours - and, if you like, **other colours at every change**. The visuals chosen are kept per song.
- **The look**: **the cover behind the visual** - blurred, slowly drifting, glowing through the dark of the visual;
  **breathes with the beat** - the picture grows a little on every beat; **how strongly the visuals react**;
  **film grain**; **darker corners**; **cinema bars** (2.39:1, for a wide video); **in from black, out to black** (on
  by default); **the section's name** in large letters for a moment as each section begins; **an end card** - the
  cover, the title and who made it (the song's artist and album, *Guest · Party-Song …* for a party song) over the
  last seconds.
- **Over the visual**: the **lyrics** as subtitles, as **karaoke** (large, the line before and after it) or
  **word by word** (the word sung now large, popping in on a little tilt, the words before it smaller above),
  lit up as they are sung - in the player's font, colour and effect, or another for the video (*as in the
  player* brings the player's back).
  - **Where**: at the bottom, in the middle, at the top - or **a new place every line** (one of nine spots,
    never the one before, slightly tilted).
  - **A line comes in**: fading, rising from below, zooming in (a little past, then back), dropping in with a
    bounce, coming into focus, wiped in, glitching in - or a different one every line.
  - **On the beat**: a line comes in in one beat of the song's tempo, and the lyrics pulse with the beat.
- **The cover, all the way through**: in a corner, at a side, in the middle or **drifting slowly** over the
  picture; its size; **rounded, square, round or a spinning record** (33 turns a minute, the cover as its
  label); pulsing with the beat. The song's name in the corner keeps clear of it.
- **Also over the visual**: **the notation**, the line of music sounding with a cursor at the notes and the
  notes aglow; a **title card** at the start with the cover; the song in the **corner**; a **progress bar**
  with the sections; *made with Plenio*.
- **Into the visual**: the title at the start, the line sung and the cover drawn into a Plenio Drop visual's
  smoke - they melt and swirl with it (over a classic visual: a soft glow). The Drop visuals *Cover Galaxy*,
  *Title Smoke*, *Lyric Tunnel*, *Album Kaleido* and *Cover Echo* draw the song by themselves - also in the
  player.
- **Sound**: the master, or the unmastered take.

**Preview** draws one frame as the video will show it. **Make the video** puts it in the queue ([In the
making](sharing.md#in-the-making-videos-and-shared-players-in-the-background)): every frame is drawn from the song's own
sound - the visuals react exactly as when it plays - and encoded on the graphics card where the browser can:
usually several times faster than the song lasts (12 seconds of Full HD in about 3 seconds on a current
graphics card). The dialog shows it grow, how fast and how long it still takes; close it, and it goes on.
The finished MP4 (H.264 with AAC sound) is in the player's **videos** folder (`~/.plenio/player/videos`);
download it, watch it, or open the folder - also later, under *Videos* in Settings. The video settings are
kept for the next one.

It needs a browser that can encode video (WebCodecs with H.264): current Chrome and Edge can, on Windows,
macOS and Linux. Each preview and each video gives its graphics memory back as soon as it is done, and a video that
fails is tried once more by itself; when the browser runs out of memory all the same, the message says so - close
other tabs, or choose a smaller size or 30 frames a second.
