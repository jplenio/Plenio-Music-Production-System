import math
from abc import ABC, abstractmethod
from typing import Optional

import torch
import torch.nn as nn
import torch.nn.functional as F
from einops import rearrange
from timm.models.layers import DropPath, trunc_normal_

class ConditionalVectorFieldModel(nn.Module, ABC):
    """
    Base class for DNN-based VF model
    MLP-parameterization of the learned vector field u_t^theta(x)
    """

    @abstractmethod
    def forward(self, x:torch.Tensor, t:torch.Tensor, y:torch.Tensor):
        """
        Args:
        - x: (bs, c, h, w)
        - t: (bs, 1, 1, 1)
        - y: (bs,)
        Returns:
        - u_t^theta(x|y): (bs, c, h, w)
        """
        pass
    
class SinusoidalTimeEmbedding(nn.Module):
    """
    Based on https://github.com/lucidrains/denoising-diffusion-pytorch/blob/main/denoising_diffusion_pytorch/karras_unet.py#L183
    & DiffWave / WaveFM
    """
    def __init__(self, dim: int=128, mode: str='learnable', time_scale=1):
        super().__init__()
        assert dim % 2 == 0, "Dimension must be an even number"
        assert mode in ['fixed', 'learnable'], "Mode must be 'fixed' or 'learnable'"
        
        self.dim = dim              # D
        self.half_dim = dim // 2
        self.mode = mode
        self.time_scale = time_scale  # 1(diffusion) or 100(flow)
        
        if self.mode == 'learnable':
            self.weights = nn.Parameter(torch.randn(1, self.half_dim)) # [1,D/2]
            
    def forward(self, t: torch.Tensor) -> torch.Tensor:
        """
        Args:
        - t: Time tensor. Shape can be [B] or [B, 1].
        Returns:
        - embeddings: Time embeddings of shape [B, D]
        """
        # Ensure t has shape [B, 1] for broadcasting
        t = t.view(-1, 1)
        device = t.device

        if self.mode == 'fixed':
            # Create a sequence from 0 to D/2 - 1
            pos = torch.arange(self.half_dim, device=device).unsqueeze(0) # [1,D/2]
            freqs = self.time_scale * t * 10.0 ** (pos * 4.0 / (self.half_dim - 1)) # 100 is a magnitude hyperparameter
            
            sin_embed = torch.sin(freqs)
            cos_embed = torch.cos(freqs)
            
            return torch.cat([sin_embed, cos_embed], dim=-1)

        elif self.mode == 'learnable':
            freqs = t * self.weights * 2 * math.pi
            
            sin_embed = torch.sin(freqs)
            cos_embed = torch.cos(freqs)
            
            return torch.cat([sin_embed, cos_embed], dim=-1) * math.sqrt(2)
        
class GRN(nn.Module):
    """ GRN (Global Response Normalization) layer
    """
    def __init__(self, dim):
        super().__init__()
        self.gamma = nn.Parameter(torch.zeros(1, 1, 1, dim))
        self.beta = nn.Parameter(torch.zeros(1, 1, 1, dim))

    def forward(self, x):
        Gx = torch.norm(x, p=2, dim=(1,2), keepdim=True)
        Nx = Gx / (Gx.mean(dim=-1, keepdim=True) + 1e-6)
        return self.gamma * (x * Nx) + self.beta + x
    
class LayerNorm(nn.Module):
    """ LayerNorm that supports two data formats: channels_last (default) or channels_first. 
    The ordering of the dimensions in the inputs. channels_last corresponds to inputs with 
    shape (batch_size, height, width, channels) while channels_first corresponds to inputs 
    with shape (batch_size, channels, height, width).
    """
    def __init__(self, normalized_shape, eps=1e-6, data_format="channels_last"):
        super().__init__()
        self.weight = nn.Parameter(torch.ones(normalized_shape))
        self.bias = nn.Parameter(torch.zeros(normalized_shape))
        self.eps = eps
        self.data_format = data_format
        if self.data_format not in ["channels_last", "channels_first"]:
            raise NotImplementedError 
        self.normalized_shape = (normalized_shape, )
    
    def forward(self, x):
        if self.data_format == "channels_last":
            return F.layer_norm(x, self.normalized_shape, self.weight, self.bias, self.eps)
        elif self.data_format == "channels_first":
            u = x.mean(1, keepdim=True)
            s = (x - u).pow(2).mean(1, keepdim=True)
            x = (x - u) / torch.sqrt(s + self.eps)
            x = self.weight[:, None, None] * x + self.bias[:, None, None]
            return x        
        
class Block(nn.Module):
    """ ConvNeXt V2 Block.
    
    Args:
        dim (int): Number of input channels.
        drop_path (float): Stochastic depth rate. Default: 0.0
    """
    def __init__(self, dim, drop_path=0.):
        super().__init__()
        self.dwconv = nn.Conv2d(dim, dim, kernel_size=7, padding=3, groups=dim, padding_mode="reflect") 
        self.norm = LayerNorm(dim, eps=1e-6)
        self.pwconv1 = nn.Linear(dim, 4 * dim) 
        self.act = nn.GELU()
        self.grn = GRN(4 * dim) # GRN for V2
        self.pwconv2 = nn.Linear(4 * dim, dim)
        self.drop_path = DropPath(drop_path) if drop_path > 0. else nn.Identity()

    def forward(self, x):
        # This Block preserves the input shape (C, H, W) -> (C, H, W)
        input = x
        x = self.dwconv(x)
        x = x.permute(0, 2, 3, 1) # [N,C,H,W] -> [N,H,W,C]
        x = self.norm(x)
        x = self.pwconv1(x)
        x = self.act(x)
        x = self.grn(x)
        x = self.pwconv2(x)
        x = x.permute(0, 3, 1, 2) # [N,H,W,C] -> [N,C,H,W]

        x = input + self.drop_path(x) # Residual connection
        return x

class BlockWithEmbedding(nn.Module):
    """ ConvNeXt block with time embedding injection
    """
    def __init__(self, dim, drop_path=0., time_embed_dim=128):
        super().__init__()
        self.block = Block(dim, drop_path)
        self.time_adapter = nn.Sequential(
            nn.Linear(time_embed_dim, time_embed_dim),
            nn.SiLU(),
            nn.Linear(time_embed_dim, dim),
        )
    def forward(self, x, t_embed):
        t_embed = self.time_adapter(t_embed).unsqueeze(-1).unsqueeze(-1) # [B,C,1,1]
        x = x + t_embed
        x = self.block(x)
        
        return x

class EncoderBlock(nn.Module):
    def __init__(self, dim_in, dim_out, num_blocks, drop_path, time_embed_dim):
        super().__init__()
        self.blocks= nn.ModuleList(
            [BlockWithEmbedding(dim_in, drop_path, time_embed_dim) 
             for _ in range(num_blocks)]
        )
        self.downsampler = nn.Sequential(
            LayerNorm(dim_in, eps=1e-6, data_format="channels_first"),
            nn.Conv2d(dim_in, dim_out, kernel_size=2, stride=2),
        )
    
    def forward(self, x, t_emb):
        for block in self.blocks:
            x = block(x, t_emb)
        x = self.downsampler(x)
        return x
        
class Midcoder(nn.Module):
    def __init__(self, dim, num_blocks, drop_path, time_embed_dim):
        super().__init__()
        self.blocks = nn.ModuleList(
            [BlockWithEmbedding(dim, drop_path, time_embed_dim)
             for _ in range(num_blocks)]    
        )
        
    def forward(self, x, t_emb):
        for block in self.blocks:
            x = block(x, t_emb)
        return x
    
class DecoderBlock(nn.Module):
    def __init__(self, dim_in, dim_out, num_blocks, drop_path, time_embed_dim):
        super().__init__()
        self.upsampler = nn.ConvTranspose2d(dim_in, dim_out, kernel_size=2, stride=2)
        self.blocks = nn.ModuleList(
            [BlockWithEmbedding(dim_out, drop_path, time_embed_dim)
            for _ in range(num_blocks)]
        )
    def forward(self, x, t_emb):
        x = self.upsampler(x)
        for block in self.blocks:
            x = block(x, t_emb)
        return x

class ConditioningEncoder2D(nn.Module):
    def __init__(self, cond_dim, num_blocks=3):
        """
        Args:
            cond_dim (int): The main conditioning dimension (D).
            num_blocks (int): The number of shared 2D ConvNeXt blocks.
        """
        super().__init__()       
        self.cond_dim = cond_dim        
        self.film_generator = nn.Linear(cond_dim, 4)
        self.head = nn.Conv2d(2, cond_dim, kernel_size=1)
        self.sr_adapter = nn.Sequential(
            nn.Linear(cond_dim, cond_dim),
            nn.GELU(),
            nn.Linear(cond_dim, cond_dim * 2)
        )
        self.blocks = nn.Sequential(*[
            Block(dim=cond_dim) for _ in range(num_blocks)
        ])
        self.freq_pool = nn.AdaptiveAvgPool2d((1,None))
        
    def forward(self, y_lr, f_emb_lr, sr_emb):
        """
        Args:
            y_lr (Tensor): LR Spec [B, 2, F1, T]
            f_emb : Freq positional embedding for lr spec [F1,D]
            sr_emb: Sampling rate embedding [B,D]
        Returns:
            z (Tensor): Conditioning Emb [B, D, T]
        """
        film_params = self.film_generator(f_emb_lr) # [F1, 4]
        gamma, beta = torch.chunk(film_params, chunks=2, dim=-1) # [F1,2]
        gamma = rearrange(gamma, 'f c -> 1 c f 1')  # [1,2,F1,1]
        beta = rearrange(beta, 'f c -> 1 c f 1')    # [1,2,F1,1]
        z = y_lr * gamma + beta    # [B, 2, F1, T]
        z = self.head(z)                # [B,D,F1,T]
        
        sr_film_params = self.sr_adapter(sr_emb)                    # [B, 2*D]
        sr_gamma, sr_beta = torch.chunk(sr_film_params, 2, dim=-1)  # [B,D]
        sr_gamma = sr_gamma.unsqueeze(-1).unsqueeze(-1)             # [B,D,1,1]
        sr_beta = sr_beta.unsqueeze(-1).unsqueeze(-1)               # [B,D,1,1]
        z = z * sr_gamma + sr_beta                                  # [B,D,F1,T]
        z = self.blocks(z)                                          # [B,D,F1,T]
        z = self.freq_pool(z).squeeze(2) # [B,D,T]
        return z
    
class FrequencyPositionalEmbedding(nn.Module):
    def __init__(self, num_bins: int, emb_dim: int):
        super().__init__()
        # (F, D)
        pe = torch.zeros(num_bins, emb_dim)
        position = torch.arange(num_bins, dtype=torch.float32).unsqueeze(1)  # (F,1)
        div_term = torch.exp(
            torch.arange(0, emb_dim, 2, dtype=torch.float32) *
            -(math.log(10000.0) / emb_dim)
        )  # (D/2,)
        pe[:, 0::2] = torch.sin(position * div_term)
        pe[:, 1::2] = torch.cos(position * div_term)
        self.register_buffer('pe', pe)

    def forward(self):
        # returns (F, D)
        return self.pe        
        
class ConvNeXtUNetCond(ConditionalVectorFieldModel):
    def __init__(self, in_channels=2, out_channels=2,
                 dims=[64,128,256,512], depths=[2,2,2,4],
                 drop_path=0., time_dim=128,
                 cond_dim=256, # D1
                 total_freq_bins=512,
                 hr_freq_bins=432,
                 feature_enc_layers=10,
                 cond_dropout_prob=0.1,
                 sr_to_lr_bins={8: 80, 12: 128, 16: 170, 24: 256},
                 ):
        super().__init__()
        self.strides = 2**len(dims)
        self.time_embedder = SinusoidalTimeEmbedding(dim=time_dim)        
        self.total_freq_bins = total_freq_bins
        self.hr_freq_bins = hr_freq_bins
        self.sr_to_lr_bins = sr_to_lr_bins
        self.sr_values_list = sorted(list(sr_to_lr_bins.keys()))       # (8,12,16,24) kHz
        self.sr_to_idx = {sr: i for i, sr in enumerate(self.sr_values_list)}
        self.sr_embedder = nn.Embedding(len(self.sr_values_list), cond_dim)   # [4,D]
        self.cond_dropout_prob = cond_dropout_prob
        self.cond_dim = cond_dim
        self.uncond_emb = nn.Parameter(torch.randn(cond_dim))
        self.sr_projector = nn.Linear(cond_dim, time_dim) # projector to t_emb

        self.freq_pos_enc = FrequencyPositionalEmbedding(num_bins=total_freq_bins, emb_dim=cond_dim)
        self.film_generator = nn.Linear(cond_dim, cond_dim * 2)
        
        self.conditioning_encoder = ConditioningEncoder2D(
            cond_dim=cond_dim,
            num_blocks=feature_enc_layers,
        )

        self.init_conv = nn.Sequential(
                nn.Conv2d(in_channels+cond_dim, dims[0], kernel_size=1),
                LayerNorm(dims[0], eps=1e-6, data_format="channels_first")
        )
        self.encoders = nn.ModuleList()
        self.decoders = nn.ModuleList()
        
        # Encoder              
        for i in range(len(depths)):
            dim_in = dims[i]
            dim_out = dims[i+1] if i+1 < len(dims) else dims[i]
            self.encoders.append(EncoderBlock(dim_in, dim_out, depths[i], drop_path, time_dim))
        
        # Midcoder
        self.midcoder = Midcoder(dims[-1], depths[-1], drop_path, time_dim)
        
        # Decoder
        for i in reversed(range(len(depths))):
            dim_in = dims[i+1] if i+1 < len(dims) else dims[i]
            dim_out = dims[i]
            self.decoders.append(DecoderBlock(dim_in, dim_out, depths[i], drop_path, time_dim))
        
        self.final_conv = nn.Conv2d(dims[0], out_channels, kernel_size=1)
        self.apply(self._init_weights)

    def _init_weights(self, m):
        if isinstance(m, (nn.Conv2d, nn.Linear)):
            trunc_normal_(m.weight, std=.02)
            nn.init.constant_(m.bias, 0)
        
    def _pad_frames(self, x):
        num_frames = x.shape[-1]
        pad_len = (self.strides - num_frames % self.strides) % self.strides
        if pad_len:
            x = torch.nn.functional.pad(x, [0,pad_len,0,0], mode='reflect')
        assert x.shape[-1] % self.strides == 0, \
            f"After padding, time dim:{x.shape(-1)} must be multiples of {self.strides}"        
        return x, pad_len
        
    def forward(self, x, t, y, sr_values):
        """
        x : x_t noisy spec [B,2,F,T]
        t : time embedding [B,1] or [B] 
        y : condition lr spectrum [B,2,F,T]
        sr_values: input sampling_rate [B] or [1] 
        """
        # Pad logic
        x, pad_len = self._pad_frames(x)
        if pad_len > 0 and y is not None:
            y = torch.nn.functional.pad(y, [0, pad_len, 0, 0], mode='reflect')
        B, _, F, T = x.shape
        
        # get number of lr bins for input sr
        if isinstance(sr_values, int):
            current_sr = sr_values
        else:
            current_sr = sr_values[0].item() if hasattr(sr_values[0], 'item') else sr_values[0]
        
        lr_bin_count = self.sr_to_lr_bins[current_sr]
        
        # freq pe
        pe_full = self.freq_pos_enc()          # [F,D]
        pe_low = pe_full[:lr_bin_count,:]      # [F1,D]
        hf_start_bin = self.total_freq_bins - self.hr_freq_bins # 512 - 432
        pe_high = pe_full[hf_start_bin:, :]    # [F2=432,D]

        # time / sr embedding
        t_embed = self.time_embedder(t) # [B,timedim]
        sr_idx = self.sr_to_idx[current_sr]
        sr_emb = self.sr_embedder(torch.tensor([sr_idx], device=x.device)).expand(B,-1) # [B, D]
        t_embed = t_embed + self.sr_projector(sr_emb) # [B, timedim]
        
        if y is not None:    # (Training) 
            y_cond_real = self.conditioning_encoder(y, pe_low, sr_emb)   # [B,D,T]    
            # Uncond token masking
            if self.training and self.cond_dropout_prob > 0:
                # random mask for uncond
                mask = (torch.rand(B, device=x.device) < self.cond_dropout_prob) # [B]
                uncond = self.uncond_emb.reshape(1,self.cond_dim,1).expand(B,self.cond_dim,T) # [B,D,T]
                y_cond = torch.where(mask.reshape(B,1,1), uncond, y_cond_real)
            else:
                y_cond = y_cond_real
        else: # Unconditional (inference)
            y_cond = self.uncond_emb.reshape(1,self.cond_dim,1).expand(B,self.cond_dim,T)

        y_cond = y_cond.unsqueeze(2)                            # [B,D,1,T]
                
        # FiLM Conditioning of freq-bins
        film_params = self.film_generator(pe_high) # [F2,D] -> [F2,2D]
        gamma_high, beta_high = torch.chunk(film_params, chunks=2, dim=-1) # [F2, D]
        gamma_high = rearrange(gamma_high, 'f d -> 1 d f 1') # [1,D,F2,1]
        beta_high = rearrange(beta_high, 'f d -> 1 d f 1')   # [1,D,F2,1]
        spatial_cond = y_cond * gamma_high + beta_high # [B,D,F2,T]
        
        x = torch.cat([x, spatial_cond], dim=1) # [B,2+D,F2,T]

        x = self.init_conv(x)
        skip_connections = [x]
        
        for encoder in self.encoders:
            x = encoder(x, t_embed)
            skip_connections.append(x)
        
        x = self.midcoder(x, t_embed)

        for decoder in self.decoders:
            skip = skip_connections.pop()
            if x.shape != skip.shape:
                x = nn.functional.interpolate(x, size=skip.shape[2:])
            x = x + skip
            x = decoder(x, t_embed)

        skip = skip_connections.pop()
        x = x + skip
        x = self.final_conv(x)

        # Crop out
        if pad_len:
            x = x[...,:-pad_len]
        return x

def main():
    """
    Dummy forward pass test for ConvNeXtUNetCond.
    """
    from torchinfo import summary

    batch_size = 2
    hr_freq_bins = 432  # High-res bins to be generated (fixed)
    lr_freq_bins = 128   # Low-res bins for this specific test case (e.g., for 8kHz)
    T = 256             # Number of time frames
    
    sr_config = {8: 80, 12: 128, 16: 170, 24: 256}

    model = ConvNeXtUNetCond(
        in_channels=2,
        out_channels=2,
        dims=[96, 192, 384, 768],
        depths=[2, 2, 4, 2],
        time_dim=256,
        cond_dim=384,
        total_freq_bins=512,
        hr_freq_bins=hr_freq_bins,
        feature_enc_layers=4,
        cond_dropout_prob=0.1,
        sr_to_lr_bins=sr_config, # Pass the dictionary
    )
    
    x = torch.randn(batch_size, 2, hr_freq_bins, T)
    y = torch.randn(batch_size, 2, lr_freq_bins, T)
    t = torch.randint(0, 1000, (batch_size,))
    sr_values = [12] * batch_size

    print("\n--- Model Summary ---")
    summary(
        model,
        input_data=[x, t, y, sr_values],
        depth=4,
        col_names=("input_size", "output_size", "num_params", 
                   "kernel_size", "mult_adds", "trainable"),
        verbose=1
    )
if __name__ == "__main__":
    main()
