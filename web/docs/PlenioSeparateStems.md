# Separate Stems

*Experimental.* Splits a song into at most four stems (for example vocals, drums, bass, other) with a separation model from **Load Audio Model**, before mastering.

Everything the separation misses is kept as the **residual** (the input minus the stems). **Stem Mixer** always mixes it as the strip *rest*, so a neutral mix returns the input unchanged: separation errors only matter where you change something.

The report lists the stems and how much of the song's energy the residual holds.
