/**
 * The first song after ComfyUI started loads its models from disk: it takes longer than the next ones (PD §6.2 P6).
 * The factor is measured with `tools/bench.py` (1.6.0 on a 16 GB card: the first run of a brief took 1.0 to 1.5 times
 * its median; `docs/test-reports/2026-11-11-bench-1.6.0.md`).
 */
export const WARM_UP =
  'The first song after ComfyUI starts takes longer - up to about one and a half times as long, measured on a 16 GB card - while its models load from disk; the songs after it are quicker.'
