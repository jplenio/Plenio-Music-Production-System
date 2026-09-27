import math
from abc import ABC, abstractmethod
from typing import Optional

import torch
import torch.nn as nn
from einops import rearrange
from torch import Tensor

class InvertibleFeatureExtractor(nn.Module, ABC):
    """
    An invertible feature extractor, i.e. a one-to-one mapping that has a forward and a true inverse.
    It should hold up to numerical error that `extractor.invert(extractor(x)) == x`.
    """
    @abstractmethod
    def forward(self, x, **kwargs):
        pass
    
    @abstractmethod
    def invert(self, x, **kwargs):
        pass
    
    def analysis_synthesis(self, x, **kwargs):
        return self.invert(self.forward(x, **kwargs), **kwargs)
        
class AmplitudeCompressedComplexSTFT(InvertibleFeatureExtractor):
    """
    A convenient composition of ComplexSTFT() and CompressAmplitudesAndScale().
    """
    def __init__(
        self,
        window_fn, n_fft, sampling_rate,
        alpha, beta, comp_eps,
        hop_length=None, n_hops=None,
        learnable_window=False,
        *args, **kwargs,
    ):
        super().__init__(*args, **kwargs)
        self.complex_stft = ComplexSTFT(
            window_fn, n_fft, sampling_rate, hop_length=hop_length, n_hops=n_hops,
            learnable_window=learnable_window,
        )
        self.compress = CompressAmplitudesAndScale(
            compression_exponent=alpha,
            scale_factor=beta,
            comp_eps=comp_eps,
        )

    def forward(self, x: Tensor, **kwargs):
        X = self.complex_stft(x, **kwargs)
        out = self.compress(X, **kwargs)
        return out

    def invert(self, X: Tensor, **kwargs):
        X = self.compress.invert(X, **kwargs)
        x = self.complex_stft.invert(X, **kwargs)
        return x


class ComplexSTFT(InvertibleFeatureExtractor):
    def __init__(
            self, window_fn, n_fft, sampling_rate, hop_length=None, n_hops=None, learnable_window=False,
            *args, **kwargs):
        super().__init__(*args, **kwargs)
        assert (hop_length is not None) ^ (n_hops is not None),\
            "Exactly one of {hop_length, n_hops} must be specified!"
        if hop_length is None:
            hop_length = int(math.ceil(n_fft / n_hops))

        window_fn = getattr(torch.signal.windows, window_fn)
        self.learnable_window = learnable_window
        self.window = nn.Parameter(window_fn(n_fft), requires_grad=learnable_window)
        self.n_fft = n_fft
        self.hop_length = hop_length
        self.sampling_rate = sampling_rate
        self.center = True

    def forward(self, x: Tensor, **kwargs):
        """Assumes x is an audio tensor of shape [B, C, T] or [B, T]
        
        [B,C,T] -> [B,C,F,T]
        [B,C,T] -> [B,F,T]
    
        """
        bc = "b c" if x.ndim == 3 else "b"
        X = torch.stft(
            rearrange(x, f"{bc} t -> ({bc}) t"), n_fft=self.n_fft, hop_length=self.hop_length,
            window=self.window.to(x.device), center=self.center,
            onesided=True, return_complex=True,
        )
        X = rearrange(X, f"({bc}) f t -> {bc} f t", b=x.shape[0])
        return X

    def invert(self, X: Tensor, orig_length: Optional[int] = None, **kwargs):
        """Assumes X is a (complex) spectrogram tensor of shape [B, C, F, T] or [B, F, T]"""
        bc = "b c" if X.ndim == 4 else "b"
        x = torch.istft(
            rearrange(X, f"{bc} f t -> ({bc}) f t"), n_fft=self.n_fft, hop_length=self.hop_length,
            window=self.window.to(X.device), center=self.center,
            onesided=True, return_complex=False,
            length=orig_length,
        )
        x = rearrange(x, f"({bc}) t -> {bc} t", b=X.shape[0])
        return x

class CompressAmplitudesAndScale(InvertibleFeatureExtractor):
    def __init__(self, compression_exponent: float, scale_factor: float, comp_eps: float, *args, **kwargs):
        super().__init__()
        self.compression_exponent = compression_exponent
        self.scale_factor = scale_factor
        self.comp_eps = comp_eps

    def forward(self, X: Tensor, **kwargs):
        """
        Assumes X is a complex STFT (complex spectrogram).
        """
        alpha = self.compression_exponent
        beta = self.scale_factor
        if alpha != 1:
            X = X + self.comp_eps
            X = X.abs()**alpha * torch.exp(1j * X.angle())
        return X * beta

    def invert(self, X: Tensor, **kwargs):
        """
        Assumes X is an amplitude-compressed and scaled complex STFT.
        """
        alpha = self.compression_exponent
        beta = self.scale_factor
        X = X / beta
        if alpha != 1:
            X = X.abs()**(1/alpha) * torch.exp(1j * X.angle())
        return X


