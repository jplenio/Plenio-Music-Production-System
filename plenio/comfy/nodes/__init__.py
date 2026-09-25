"""All Plenio nodes. One module per node (target-architecture section 8)."""

from .brief import PlenioSongBrief
from .compose import PlenioComposePrompt
from .cover_brief import PlenioCoverBrief
from .engine import PlenioEngine
from .eq import PlenioEQ
from .export import PlenioExportRelease
from .loudness import PlenioLoudness
from .parse import PlenioParseDraft
from .score_tools import PlenioScoreTools
from .sheet import PlenioSongSheet
from .system_check import PlenioSystemCheck
from .transcribe_lyrics import PlenioTranscribeLyrics
from .transcribe_score import PlenioTranscribeScore
from .vocal_check import PlenioVocalCheck

NODES = (
    PlenioSongBrief,
    PlenioCoverBrief,
    PlenioEngine,
    PlenioComposePrompt,
    PlenioParseDraft,
    PlenioSongSheet,
    PlenioScoreTools,
    PlenioTranscribeScore,
    PlenioTranscribeLyrics,
    PlenioVocalCheck,
    PlenioEQ,
    PlenioLoudness,
    PlenioExportRelease,
    PlenioSystemCheck,
)

__all__ = ["NODES"]
