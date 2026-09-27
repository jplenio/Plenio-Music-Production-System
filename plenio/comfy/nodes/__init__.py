"""All Plenio nodes. One module per node (target-architecture section 8)."""

from .audio_model import PlenioAudioModelLoader
from .brief import PlenioSongBrief
from .compose import PlenioComposePrompt
from .cover_brief import PlenioCoverBrief
from .engine import PlenioEngine
from .eq import PlenioEQ
from .export import PlenioExportRelease
from .loudness import PlenioLoudness
from .parse import PlenioParseDraft
from .refine import PlenioRefine
from .score_tools import PlenioScoreTools
from .sheet import PlenioSongSheet
from .stems import PlenioSeparateStems, PlenioStemMixer
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
    # experimental (next release): audio refinement and stems
    PlenioAudioModelLoader,
    PlenioRefine,
    PlenioSeparateStems,
    PlenioStemMixer,
)

__all__ = ["NODES"]
