"""Model Choice: the file of one model component, chosen for this computer when the workflow runs.

``auto`` follows the model plan (``plenio.core.modelplan``): the file of Plenio's catalogue that suits this
computer's graphics card - an installed one that is nearly as good is kept - unless ``config.toml`` pins one.
Any other entry is the user's own choice, saved with the workflow: a catalogue file or a file of their own (a
finetune). The node outputs the file's name for the loader beside it, as Writer Choice does for the CLIP loader.
"""

from __future__ import annotations

from typing import Any

from comfy_api.latest import io

from ...core.errors import PlenioModelError
from ...core.modelplan import AUTO, fingerprint
from ...core.models import Component
from .. import host, setup

MISSING_EVENT = "plenio.models_missing"
"""Sent to the page that queued the run when the chosen file is not there: it opens Plenio Setup at the row."""


def _files(component: Component) -> list[str]:
    """``auto``, the catalogue's files (best first), then every other file in the component's folder."""
    listed = [v.file for v in sorted(component.variants, key=lambda v: (-v.quality, v.file))]
    try:
        on_disk = sorted(host.model_files(component.folder))
    except Exception as error:  # a broken folder must not take the node definitions down
        host.log.warning("Plenio Model Choice: listing models/%s failed: %s", component.folder, error)
        on_disk = []
    return list(dict.fromkeys([AUTO, *listed, *on_disk]))


def _components() -> dict[str, Component]:
    try:
        return setup.components()
    except Exception as error:  # a broken catalogue must not take the node definitions down
        host.log.warning("Plenio Model Choice: reading the catalogue failed: %s", error)
        return {}


def _value(component: Any) -> tuple[str, str]:
    if isinstance(component, dict):
        return str(component.get("component", "")), str(component.get("file", "") or AUTO)
    return str(component or ""), AUTO


class PlenioModelChoice(io.ComfyNode):
    @classmethod
    def define_schema(cls) -> io.Schema:
        components = _components()
        return io.Schema(
            node_id="PlenioModelChoice",
            display_name="Model Choice",
            category="Plenio/Model",
            # the summary is re-sent on every run, also when the node is cached (ComfyUI keeps its UI)
            has_intermediate_output=True,
            description=(
                "Chooses the file of one model for the loader beside it. auto: the file that suits this "
                "computer's graphics card (Plenio Setup shows which and why; config.toml can pin one). Or any "
                "file of this kind in your model folders - a finetune, too. Press R to refresh the lists."
            ),
            inputs=[
                io.DynamicCombo.Input(
                    "component",
                    options=[
                        io.DynamicCombo.Option(
                            component.id,
                            [
                                io.Combo.Input(
                                    "file",
                                    options=_files(component),
                                    default=AUTO,
                                    tooltip=f"auto: the file of the {component.title} for this computer "
                                    "(Plenio Setup shows which and why). Or any file in "
                                    f"models/{component.folder} - a finetune, too.",
                                )
                            ],
                        )
                        for component in components.values()
                    ],
                    tooltip="Which model this node chooses a file for.",
                ),
            ],
            outputs=[
                io.AnyType.Output(
                    display_name="file",
                    tooltip="The chosen file's name, for the loader beside this node.",
                )
            ],
            hidden=[io.Hidden.unique_id],
        )

    @classmethod
    def validate_inputs(cls, **kwargs: Any) -> bool | str:
        # a file of another computer is no error here: the run says what is missing and opens Setup at it
        name, _file = _value(kwargs.get("component"))
        if name and name not in _components():
            return f"Model Choice: Plenio's catalogue has no model {name!r}; choose one of the list."
        return True

    @classmethod
    def fingerprint_inputs(cls, **kwargs: Any) -> Any:
        # auto depends on what is installed and on the configuration: ComfyUI runs the node again when either
        # changes, and keeps its output while neither does
        name, file = _value(kwargs.get("component"))
        try:
            chosen = setup.choose(name, file)
        except Exception:  # noqa: BLE001 - execute says what is wrong
            return float("nan")
        return f"{chosen.source}:{fingerprint([chosen.pick])}"

    @classmethod
    def execute(cls, component: dict[str, Any]) -> io.NodeOutput:
        name, file = _value(component)
        chosen = setup.choose(name, file)
        found = chosen.pick
        if not found.installed:
            details = {
                "component": name,
                "file": found.file,
                "variant": found.variant.id if found.variant is not None else None,
                "folder": chosen.component.folder,
            }
            try:
                node_id = getattr(cls.hidden, "unique_id", None)  # none when called outside a run
                host.send_event(MISSING_EVENT, {**details, "node": str(node_id or "")})
            except Exception as error:  # noqa: BLE001 - the error below says it all the same
                host.log.debug("Plenio Model Choice: the page was not told: %s", error)
            fetch = (
                "Open Plenio Setup: it downloads the file into the right folder. Or download it yourself "
                f"({found.variant.url}) into models/{chosen.component.folder}."
                if found.variant is not None
                else f"Put it into models/{chosen.component.folder}, or choose another file (auto: the one "
                "Plenio's catalogue has for this computer)."
            )
            raise PlenioModelError(
                f"{chosen.component.title}: {found.file} is not on this computer yet.",
                hint=fetch,
                details=details,
            )
        how = {
            "field": "chosen in this node",
            "config": "pinned in config.toml",
            "plan": found.reason,
        }[chosen.source]
        text = f"{chosen.component.title}: **{found.file}** - {how}"
        if found.warning:
            text += f" - {found.warning}"
        status = "warning" if found.warning else "ok"
        return io.NodeOutput(found.file, ui={"plenio_summary": [{"status": status, "markdown": text}]})
