"""Creative modes and the section plan: a writer plans, Plenio writes the notes (pure, no ComfyUI).

mode = ModeLibrary(package_dir, user_dir).by_name("varied")
rules = policy(mode, kind="song", closeness=60, melody="vocal")
summary = summarize(score_model, melody="vocal")
text = prompt(summary, rules, brief_text=..., genre=...)      # -> the writer (any LLM)
result = arrange(abc, answer, rules, seed=...)                 # -> a valid score, or the old one
"""

from .apply import STATUSES, Arrangement, SectionResult, arrange, skipped
from .modes import LEAD_ROLES, SIMPLE, SIMPLE_MODE, CreativeMode, ModeLibrary, parse_mode
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
    "MELODY",
    "NEEDS_CHORDS",
    "SIMPLE",
    "SIMPLE_MODE",
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
    "closeness_text",
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
