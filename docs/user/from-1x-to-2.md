# From 1.x to 2.0

What changes when you update from Plenio 1.x, who notices it and what to do. Workflows saved with 1.x open and run;
the Song API's `/plenio/api/v1` answers a program on your computer as before; the Plenio Player reads everything it
kept (accounts, playlists, settings, the party's songs).

| Change | Who notices | What to do |
|---|---|---|
| **ComfyUI <!--fact:comfyui.minimum-->0.41.0<!--/fact--> is the minimum** (1.x: 0.37.0) | users of ComfyUI 0.37 to 0.40 | update ComfyUI; Plenio 1.6.0 stays installable for an older one |
| **Another computer needs a token for the Song API** (v1 and v2) | a VST3 plug-in or a script that reaches ComfyUI over the network | make a token in **Plenio Setup > API access** and give it to the program - or set `remote = "open"` under `[api]` in the config file, as 1.x behaved ([Configuration](configuration.md)) |
| **The Comfy Registry package carries no Studio add-on**: it starts no other program | those who installed with the ComfyUI Manager or `comfy node install` and let the player start ComfyUI, or ran a GGUF writer through a `llama-server` Plenio found | start ComfyUI the way you usually do (the player finds it); run the GGUF in LM Studio, Ollama or a `llama-server` you start, install `llama-cpp-python`, or take ComfyUI's own Gemma writer - or install with `git clone`, which keeps the add-on ([two ways to install](getting-started.md#two-ways-to-install)) |
| **The templates' model blocks say `auto`** | everyone, in new workflows | nothing: `auto` takes the files that suit your card ([Models and downloads](models.md)); a workflow you saved keeps the files it names |
| **Plenio Setup** finds, plans and downloads the model files | everyone | open it from the *Plenio* menu or the sidebar; nothing is downloaded before you confirm |
| **The player's roles have new names**: *Admin*, *helper* and *In your network* are now *Host*, *Co-host* and *My devices*; *Maker*, *Listener* and *Party guest* are new | the player's users | nothing: accounts and their rights are the same ([People & access](player/people.md)) |
| **A player started with `--host` never counts another computer as this one** | those who reached such a player from another device without logging in | log in on that device, or add it under *My devices* |
| **Video links go through `…/go/<name>/`** pages | nobody: they open the same videos | - |

## The Song API

`/plenio/api/v1` stays as it was for a program on your computer. `/plenio/api/v2` adds jobs that survive a restart,
review stops, an event stream, tokens and the released songs; [Coming from v1](../api/coming-from-v1.md) shows each
v1 call next to its v2 form.

## If something does not work after the update

Open **0 · System Check** or Plenio Setup: every finding says what is the matter and how to fix it, and
[Troubleshooting](troubleshooting.md) lists them by their id. After any update, restart ComfyUI and reload every open
ComfyUI page (F5); a player that was running keeps its old code until it is restarted.
