"""All Plenio nodes. One module per node (target-architecture section 8)."""

from .arrangement import PlenioApplyArrangement, PlenioComposeArrangement
from .audio_model import PlenioAudioModelLoader
from .best_take import PlenioBestTake
from .brief import PlenioSongBrief
from .compose import PlenioComposePrompt
from .cover_brief import PlenioCoverBrief
from .creativity import PlenioCreativity
from .engine import PlenioEngine
from .eq import PlenioEQ
from .export import PlenioExportRelease
from .fit_lyrics import PlenioFitLyrics
from .heard_check import PlenioApplyHeardCheck, PlenioComposeHeardCheck
from .hq import PlenioHQDeReverb, PlenioHQMastering, PlenioHQRegenerateHighs, PlenioHQStereoCleanup
from .local_llm import PlenioLocalLLM
from .loras import PlenioLoras
from .loudness import PlenioLoudness
from .parse import PlenioParseDraft
from .refine import PlenioRefine
from .score_tools import PlenioScoreTools
from .seed import PlenioSeed
from .sheet import PlenioSongSheet
from .song_form import PlenioMatchSongForm
from .stems import PlenioSeparateStems, PlenioStemMixer
from .sung_check import PlenioApplySungCheck, PlenioComposeSungCheck
from .sung_pitch import PlenioSungPitch
from .system_check import PlenioSystemCheck
from .transcribe_lyrics import PlenioTranscribeLyrics
from .transcribe_score import PlenioTranscribeScore
from .vocal_check import PlenioVocalCheck
from .writer_choice import PlenioWriterChoice
from .yue2_decoder import PlenioYuE2Decoder

NODES = (
    PlenioSongBrief,
    PlenioCoverBrief,
    PlenioEngine,
    PlenioLoras,
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
    PlenioComposeHeardCheck,
    PlenioApplyHeardCheck,
    PlenioSungPitch,
    PlenioVocalCheck,
    PlenioBestTake,
    PlenioHQStereoCleanup,
    PlenioHQRegenerateHighs,
    PlenioHQDeReverb,
    PlenioHQMastering,
    PlenioEQ,
    PlenioLoudness,
    PlenioExportRelease,
    PlenioSystemCheck,
    PlenioSeed,
    PlenioCreativity,
    # experimental (next release): audio refinement and stems
    PlenioAudioModelLoader,
    PlenioRefine,
    PlenioSeparateStems,
    PlenioStemMixer,
    # experimental: Ruach Studio's YuE2-VAE-RS x3 decoder in place of the checkpoint's
    PlenioYuE2Decoder,
    # retired, kept so that workflows saved with Check Sung Words still run (they do nothing)
    PlenioComposeSungCheck,
    PlenioApplySungCheck,
)

__all__ = ["NODES"]
