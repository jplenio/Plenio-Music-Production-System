# LoRAs for YuE2

A LoRA is a small file that nudges a model towards what it was trained on - a genre, a band's sound, an
instrumentation. The YuE2 templates (*1 · YuE2 · Song*, *2 · YuE2 · Cover*, *5 · YuE2 · DAW*) have a
**YuE2 LoRAs** node under the music model, in the *MUSIC MODEL* group: up to four LoRAs, each with its
strength. With every slot on *none* - as the templates ship - YuE2 runs as loaded.

▶ **Video:** [Tutorial 11 · YuE2 LoRAs](https://youtu.be/o7NtC3U2pEg) - the node, a LoRA chosen with its strength, an instrumental made with it and what the node says after the run. All of them in the [tutorial playlist](https://www.youtube.com/playlist?list=PLAFqTtP59fgE).

## Use one

1. Put the LoRA file into ComfyUI's `models/loras` folder (or a folder of `extra_model_paths.yaml`) and reload
   the ComfyUI page (or press *R*), so the node lists it.
2. In the *MUSIC MODEL* group, choose it in **LoRA 1** and set its **strength**: 1 is as trained, 0 off.
3. Run. After the run the node says, per LoRA, how many of its weights went to the **plan** and how many to the
   **sound** - and which it left out, and why.

YuE2 has two halves, and a LoRA is trained on one of them (or both):

| Half | In ComfyUI | What a LoRA there changes | Often called | A strength to start with |
|---|---|---|---|---|
| the planner - it writes the score and the music's tokens | the CLIP output | the plan: structure, melody, genre | AR | about 0.5 |
| the acoustic model - it renders them | the MODEL output | the sound: timbre, instrumentation, mix | NAR | about 1 |

The node reads which half a file is for from its weights, so you need not know it. The model card of a LoRA
says the strengths its maker found best; far above them the sound breaks up. Two LoRAs on one half add up.

**Two layouts** are read: ComfyUI's (the `*_comfyui.safetensors` files, which ComfyUI's own *Load LoRA* reads
as well) and the original one of m-a-p's YuE2 code (`lora_A` / `lora_B` per projection), which the node
joins for ComfyUI's YuE2 - ComfyUI's own loader skips such a file. For the original layout, an
`adapter_config.json` or `<name>.json` beside the file with `rank` and `alpha` gives the trained scale;
without one the node takes alpha = rank.

**Safe to try**: a file that does not fit - an image model's LoRA, one of YuE 1, a broken download, weights of
another shape - is left out and named in the summary; the run goes on with the others. The *Instrumental
adapter* of the cover template acts on top of the LoRAs.

**Where the LoRAs show**: the release record keeps them with their strengths (in its workflow), and the song's
page lists them under *How it was made*. A song made from the Plenio Player - a new take, a party song - is made
with the template as it ships, without LoRAs.

## Where LoRAs come from

YuE2 LoRAs are young: a few are shared on Hugging Face (search for *YuE2 LoRA*), most of them for a genre or
an artist's sound, some for instrumentals. Read the card of each: what it was trained on, its licence, and
for which checkpoint it was made (most on `yue2_3b_bf16`; on the int8 checkpoint a LoRA may act a little
differently). YuE2 itself is CC BY-NC 4.0 - non-commercial use only - and so is what you make with it.

A **finetune** is another thing: a whole model, chosen under *checkpoint* in the model block - see [YuE2 finetunes](../models.md#yue2-finetunes). A LoRA made for the original may act differently on a finetune, and a merge that already holds an adapter must not get it again.

## Training your own

Plenio does not train LoRAs. Training YuE2 is still experimental, and its makers' own tools for it are not
released:

- The **sound** half (NAR) can be trained from plain audio files - a community trainer for ComfyUI encodes the
  songs with YuE2's VAE. It asks for about 24 GB of graphics memory, and its author says that cloning a voice
  does not work yet.
- The **plan** half (AR) needs the songs as YuE2's music tokens, and m-a-p has not released the encoder that
  turns audio into them; community encoders and trainers exist and are experimental.

General LoRA trainers with YuE2 support (for example Ostris' *AI Toolkit*) and community nodes for ComfyUI
can train one; the files they write in ComfyUI's layout or m-a-p's go into the *YuE2 LoRAs* node as they are.
A training node may come to Plenio once audio-to-token encoding is released and training on 16 GB is
practical.
