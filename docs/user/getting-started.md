# Getting started

## Requirements

- ComfyUI **0.37.0** or newer (it provides the native YuE2, SheetSage2, MiniMax Music 3 and text-generation nodes Plenio builds on)
- an NVIDIA GPU is strongly recommended; the System Check tells you what your machine can do

## Install

Install through the ComfyUI Manager/Registry (`comfyui-plenio-music`) or clone the repository into `ComfyUI/custom_nodes` and restart ComfyUI. Plenio does not install extra Python packages.

## First run

1. Open the template browser and choose **0 · System Check** (listed under the Plenio package).
2. Press **Run**. The node shows versions, GPUs and VRAM, optional packages and the download policy, plus recommendations.
3. Nothing is changed automatically. You choose model files in the loader nodes of each template.

## Choosing a template

Each music model has its own template, so every workflow shows only the controls that apply to it. Choosing the template is choosing the music model.

| Template | Use it for |
|---|---|
| 0 · System Check | checking the installation |
| 1 · YuE2 · Song | new songs with YuE2 and an editable score |
| 2 · YuE2 · Cover | new versions of a recording you own or may use |
| 3 · MiniMax · Song | new songs with MiniMax Music 3 |
| 4 · Enhance & Master | finishing an existing audio file |

Templates that are still in development are marked in the README.
