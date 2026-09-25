# EQ

A parametric EQ for finished audio (up to 8 bands: peak, low/high shelf, high/low-pass, notch).

**mode**

- **flat** - no change (the audio passes through bit-identical).
- **manual** - your bands. Edit them on the curve under the node: drag a handle to change frequency and gain, use the wheel for the width (Q), double-click the curve to add a band; the preset menu fills in one of the shipped recipes (for example *YuE2 - Smooth highs*). The bands are stored as JSON (`plenio.eq/1`), so you can also paste them.
- **match preset** - a shipped tone-match recipe: Plenio measures the audio and proposes gentle peak bands that move it towards a **warm** or **bright** tilt, or towards the **reference** recording (connect *reference*).
- **custom match** - the same with your own strength, largest gain and number of bands.

The match never boosts or cuts by more than *max gain* on the summed curve, and removes the loudness difference first (it changes tone, not level). The curve and the bands that were applied are shown on the node and stored in the report.

There is no hidden normalisation: boosts can raise the peak level. Put **Loudness & Dynamics** after the EQ.
