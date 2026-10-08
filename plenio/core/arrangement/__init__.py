"""Creative modes and the section plan: a writer plans, Plenio writes the notes (pure, no ComfyUI).

mode = ModeLibrary(package_dir, user_dir).by_name("varied")
rules = policy(mode, kind="song", closeness=60, melody="vocal")
summary = summarize(score_model, melody="vocal")
text = prompt(summary, rules, brief_text=..., genre=...)      # -> the writer (any LLM)
result = arrange(abc, answer, rules, seed=...)                 # -> a valid score, or the old one
                                                               #    (harmony: the guard of its chords)
"""

from . import harmony, reask
from .apply import STATUSES, Arrangement, SectionResult, arrange, skipped
from .modes import (
    LEAD_ROLES,
    LEGACY_NAMES,
    OFF,
    OFF_MODE,
    CreativeMode,
    ModeLibrary,
    canonical_name,
    parse_mode,
)
from .plan import (
    MELODY,
    NEEDS_CHORDS,
    SKIP_FROM,
    Plan,
    PlanError,
    Policy,
    ScoreSummary,
    SectionPlan,
    closeness_text,
    for_score,
    melody_of,
    melody_voice,
    policy,
    prompt,
    read_plan,
    schema,
    section_ranges,
    summarize,
    writer_lines,
)

__all__ = [
    "LEAD_ROLES",
    "LEGACY_NAMES",
    "MELODY",
    "NEEDS_CHORDS",
    "OFF",
    "OFF_MODE",
    "SKIP_FROM",
    "STATUSES",
    "Arrangement",
    "CreativeMode",
    "ModeLibrary",
    "Plan",
    "PlanError",
    "Policy",
    "ScoreSummary",
    "SectionPlan",
    "SectionResult",
    "arrange",
    "canonical_name",
    "closeness_text",
    "for_score",
    "harmony",
    "reask",
    "melody_of",
    "melody_voice",
    "parse_mode",
    "policy",
    "prompt",
    "read_plan",
    "schema",
    "section_ranges",
    "skipped",
    "summarize",
    "writer_lines",
]
