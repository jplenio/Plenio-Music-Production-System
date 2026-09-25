# Engine Profile

Identifies the music model behind a CLIP and outputs its rules. Sits inside the *YuE2 Model* block.

Because the rules come from the model that is actually loaded, writing prompts, validation and the token budget always match it. The profile also provides the model's own tokenizer, so the Song Sheet computes the context budget exactly instead of estimating it.

Stops with an error if the connected model is not a supported music model.
