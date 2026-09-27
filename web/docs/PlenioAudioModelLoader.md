# Load Audio Model

*Experimental.* Loads a model for the audio stages that come after rendering.

**kind** - *super-resolution*: a model for **Refine (48 kHz)**, from `models/audio_sr`; *separation*: a model for **Separate Stems**, from `models/audio_separation`.

**model** - the file in that folder.

The engines that read these files are **UniverSR** for super-resolution (a `pytorch_model.bin` from `woongzip1/universr-audio`) and a 4-stem **BS-RoFormer** for separation (`model_bs_roformer_ep_17_sdr_9.6568.ckpt`). A file of another architecture is refused with a message that says so; **Refine** works without any model with the engine *resample only*, and a bypassed Stems block never asks for the file.

The model is loaded only when a stage that needs it runs: a bypassed block or Refine set to *resample only* does not ask for the file.
