"""Custom IO types of Plenio (target-architecture section 5.1)."""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

Brief = io.Custom("PLENIO_BRIEF")
Engine = io.Custom("PLENIO_ENGINE")
Request = io.Custom("PLENIO_REQUEST")
ReportType = io.Custom("PLENIO_REPORT")
TimelineType = io.Custom("PLENIO_TIMELINE")


@io.comfytype(io_type="PLENIO_SHEET_STATE")
class SheetState(io.ComfyTypeIO):
    """Socketless widget holding the Song Sheet state as a JSON string.

    The frontend extension registers the widget for this type through
    ``getCustomWidgets``; the value is serialised with the workflow and arrives
    in ``execute`` unchanged (ComfyUI only converts INT/FLOAT/STRING/BOOLEAN).
    """

    Type = str

    class Input(io.WidgetInput):
        def __init__(
            self, id: str, display_name: str | None = None, tooltip: str | None = None, default: str = ""
        ):
            super().__init__(
                id, display_name, False, tooltip, None, default, True, None, None, None, None, None
            )

        def as_dict(self) -> dict[str, Any]:
            return super().as_dict()
