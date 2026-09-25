# ADR-0001: One template per music model and path

- Status: accepted
- Date: 2026-09-25
- Design reference: D-01

## Context

The first user decision is the music model (YuE2, YuE2 Cover, MiniMax). One workflow with a model dropdown would need a multiplexer in every engine-dependent block and would show controls that do not apply.

## Decision

Ship one template per path (*0 · System Check*, *1 · YuE2 · Song*, *2 · YuE2 · Cover*, *3 · MiniMax · Song*, *4 · Enhance & Master*). All templates share the same Plenio nodes and blueprints and a common layout. Choosing the template is choosing the music model.

## Consequences

Each graph contains only its path; adding a model means adding blueprints and a template, not editing every block. ComfyUI lists custom-node templates under the package's folder name, so the template browser category is that folder name (`comfyui-plenio-music` when installed from the Registry).
