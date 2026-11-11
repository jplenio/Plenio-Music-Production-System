"""The Studio add-on: the functions of Plenio that start a program on this computer.

Three modules, each one function of the player or the writer that is a convenience and never needed to make a
song in ComfyUI:

- ``studio_launcher`` - the Plenio Player starts ComfyUI (*Start the studio*);
- ``llm_server`` - a ``llama-server`` program found on this computer runs a GGUF file for the writer;
- ``file_manager`` - *Open the folder* shows one of the player's folders in the system's file manager.

A ``git clone`` and the release zip carry this folder. The Comfy Registry package leaves it out
(``.comfyignore``): that package starts nothing but its own Python with Plenio's own modules
(``plenio/core/workers/protocol.py``, ``plenio/player/launch.py``, the llama-cpp-python shim in
``plenio/core/llm/runtime.py``), which ``tools/package_gate.py`` checks on the packed zip.

Nothing outside this folder imports it directly: callers ask ``plenio.core.features.has`` and load the module
through ``plenio.core.features.load``, and say what to do instead when it is not there.
"""
