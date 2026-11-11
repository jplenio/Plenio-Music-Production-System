# Model Choice

Chooses the file of one model - the YuE2 music model, the MiniMax DiT, the FLUX.2 text encoder, ... - and hands its name to the loader beside it. The templates' model blocks have one Model Choice per model, all set to **auto**.

| Entry | File |
|---|---|
| `auto` | the file of Plenio's catalogue that suits this computer: the best one that runs on its graphics card, or an installed one that is nearly as good. A pin in `config.toml` (`[models.pins]`, for example `yue2 = "my_finetune.safetensors"`) comes first; `[models] prefer` (`balanced`, `quality`, `speed`, `small`) changes the order. |
| a file of the catalogue | that file, whatever the card - with a warning when the card has less memory than it needs |
| any other file in the model's folder | your own file, a finetune for example; Plenio does not check it |

`auto` is decided **when the workflow runs, on the computer that runs it**: a workflow made on another computer, the Song API and the Plenio Player get the files of the computer that renders. The node's summary says which file it took and why ("4.0 GB of graphics memory: runs on the card, installed").

When the chosen file is not on this computer, the run stops with the file's name and folder, and ComfyUI's page opens **Plenio Setup** at that model, which downloads it into the right folder. A file of your own that is missing is named with its folder.

**component** decides which list the node offers; the list shows `auto`, the catalogue's files (best first) and the other files of that folder. Press **R** after adding a file.
