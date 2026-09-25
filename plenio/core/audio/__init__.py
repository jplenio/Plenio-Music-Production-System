"""Model-independent audio DSP: EQ, dynamics, loudness metering, resampling, presets.

Pure numpy/SciPy code (SciPy is a ComfyUI requirement); audio is ``[channels, frames]`` float data.
"""

from .dynamics import Compressor, Target, compress, limit, master
from .loudness import Measurement, measure
from .resample import resample

__all__ = ["Compressor", "Measurement", "Target", "compress", "limit", "master", "measure", "resample"]
