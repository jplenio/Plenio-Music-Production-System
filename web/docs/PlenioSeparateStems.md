# Separate Stems

*Experimental.* Splits a song into at most four stems (for example vocals, drums, bass, other) with a separation model from **Load Audio Model**, before mastering.

Everything the separation misses is kept as the **residual** (the input minus the stems). **Stem Mixer** always mixes it as the strip *rest*, so a neutral mix returns the input unchanged: separation errors only matter where you change something.

The report lists the stems and how much of the song's energy the residual holds.

With the shipped BS-RoFormer the model works at 44.1 kHz on stereo: the node resamples the input there, separates chunk by chunk with crossfades and returns every stem at the **input's rate and length** (float32). ComfyUI caches this node, so changing only the mixer does not re-run the separation.
