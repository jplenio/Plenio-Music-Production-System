# Engine Profile

Identifies the music model behind a CLIP - **YuE2** or **MiniMax Music 3** - and outputs its rules. Sits inside the *YuE2 Model* and *MiniMax Model* blocks.

Because the rules come from the model that is actually loaded, writing prompts, validation and the token budget always match it. The profile also provides the model's own tokenizer, so the Song Sheet computes the budget exactly instead of estimating it (YuE2: the shared context of 24 576 tokens; MiniMax: the 5 000-token prompt limit).

Stops with an error if the connected model is not a supported music model.
