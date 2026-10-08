"""All Plenio nodes. One module per node (target-architecture section 8)."""

from .arrangement import PlenioApplyArrangement, PlenioComposeArrangement
from .audio_model import PlenioAudioModelLoader
from .brief import PlenioSongBrief
from .compose import PlenioComposePrompt
from .cover_brief import PlenioCoverBrief
from .engine import PlenioEngine
from .eq import PlenioEQ
from .export import PlenioExportRelease
from .fit_lyrics import PlenioFitLyrics
from .local_llm import PlenioLocalLLM
from .loudness import PlenioLoudness
from .parse import PlenioParseDraft
from .refine import PlenioRefine
from .score_tools import PlenioScoreTools
from .sheet import PlenioSongSheet
from .song_form import PlenioMatchSongForm
from .stems import PlenioSeparateStems, PlenioStemMixer
from .sung_pitch import PlenioSungPitch
from .system_check import PlenioSystemCheck
from .transcribe_lyrics import PlenioTranscribeLyrics
from .transcribe_score import PlenioTranscribeScore
from .vocal_check import PlenioVocalCheck
from .writer_choice import PlenioWriterChoice

NODES = (
    PlenioSongBrief,
    PlenioCoverBrief,
    PlenioEngine,
    PlenioComposePrompt,
    PlenioParseDraft,
    PlenioFitLyrics,
    PlenioWriterChoice,
    PlenioLocalLLM,
    PlenioSongSheet,
    PlenioScoreTools,
    PlenioComposeArrangement,
    PlenioApplyArrangement,
    PlenioMatchSongForm,
    PlenioTranscribeScore,
    PlenioTranscribeLyrics,
    PlenioSungPitch,
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
