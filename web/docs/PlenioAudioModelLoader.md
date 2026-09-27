# Load Audio Model

*Experimental.* Loads a model for the audio stages that come after rendering.

**kind** - *super-resolution*: a model for **Refine (48 kHz)**, from `models/audio_sr`; *separation*: a model for **Separate Stems**, from `models/audio_separation`.

**model** - the file in that folder.

The engines that read these files (UniverSR for super-resolution, a 4-stem BS-RoFormer for separation) are integrated in a later release. Until then every file is refused with a message that says so; **Refine** works without any model with the engine *resample only*, and the Stems block stays bypassed.

The model is loaded only when a stage that needs it runs: a bypassed block or Refine set to *resample only* does not ask for the file.
