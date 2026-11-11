# Load Audio by Name

Loads an audio file of ComfyUI's **input** folder by its name, as ComfyUI's *Load Audio* reads it. *Load Audio* takes its file from the list it shows; this node takes the name as text, so **Brief List** can hand it one file per run - the recipe *Master a folder of files* works through a list of recordings this way.

- **file**: the file's name in the input folder, or a path inside it. A name outside the input folder is refused.

Output: **audio**. The summary names the file.
