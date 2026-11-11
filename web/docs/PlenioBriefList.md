# Brief List

Hands one line of a list to the next node per run: a series of songs from a list of briefs, a cover in three styles, the same lyrics in three genres, a folder of files to master.

- **entries**: one entry per line - a brief's description, a genre, a file name. Empty lines and lines starting with `#` are left out.
- **file**: or a text file in ComfyUI's **input** folder, one entry per line (its lines come after the ones above). Only files inside the input folder are read.
- **index**: which entry this run takes, counted from 0; it wraps round at the end. With *increment* (the default) every run takes the next one - set the **batch count** beside *Run* to the number of entries and press *Run* once.

Outputs: **text** (the entry - connect it to a field of the Song Brief or Cover Brief, or to *Load Audio by Name*), **position** (from 1) and **count**. The node's summary says which entry the run took.

The recipes in `example_workflows/recipes/` use it; see [Recipes](../../docs/user/recipes.md).
