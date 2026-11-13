#include "ara/document_controller.h"
#include "ara/audio_source.h"
#include "ara/content_reader.h"
#include "ara/playback_renderer.h"

#include <cmath>
#include <thread>

namespace plenio::ara
{

bool DocumentController::rendererWillAccessModelGraph() noexcept
{
    ++renderersAccessing;
    return renderersMayAccess.load();
}

void DocumentController::rendererDidAccessModelGraph() noexcept
{
    --renderersAccessing;
}

void DocumentController::blockRenderers() noexcept
{
    static_assert (decltype (renderersMayAccess)::is_always_lock_free);
    renderersMayAccess = false;
    // renderers hold the model for one block at most
    while (renderersAccessing.load() > 0)
        std::this_thread::yield();
}

void DocumentController::unblockRenderers() noexcept
{
    renderersMayAccess = true;
}

void DocumentController::willBeginEditing() noexcept
{
    blockRenderers();
}

void DocumentController::didEndEditing() noexcept
{
    unblockRenderers();
}

void DocumentController::doUpdateMusicalContextContent (ARA::PlugIn::MusicalContext*, const ARA::ARAContentTimeRange*, ARA::ContentUpdateScopes) noexcept
{
    // the host's tempo, bars and chords are read when needed (phase 7)
}

ARA::PlugIn::AudioSource* DocumentController::doCreateAudioSource (ARA::PlugIn::Document* document, ARA::ARAAudioSourceHostRef hostRef) noexcept
{
    return new AudioSource (document, hostRef);
}

void DocumentController::willEnableAudioSourceSamplesAccess (ARA::PlugIn::AudioSource*, bool) noexcept
{
    if (! isHostEditingDocument())
        blockRenderers();
}

void DocumentController::didEnableAudioSourceSamplesAccess (ARA::PlugIn::AudioSource* audioSource, bool enable) noexcept
{
    auto* source = static_cast<AudioSource*> (audioSource);
    if (enable)
        source->updateCache();
    else
        source->clearCache();

    if (! isHostEditingDocument())
        unblockRenderers();
}

void DocumentController::doUpdateAudioSourceContent (ARA::PlugIn::AudioSource* audioSource, const ARA::ARAContentTimeRange*, ARA::ContentUpdateScopes scopeFlags) noexcept
{
    // the host changed the samples: read them again (only ever called while the host edits the document)
    if (scopeFlags.affectSamples() && audioSource->isSampleAccessEnabled())
        static_cast<AudioSource*> (audioSource)->updateCache();
}

void DocumentController::didDeactivateAudioSourceForUndoHistory (ARA::PlugIn::AudioSource* audioSource, bool deactivate) noexcept
{
    auto* source = static_cast<AudioSource*> (audioSource);
    if (deactivate)
        source->clearCache();
    else if (source->isSampleAccessEnabled())
        source->updateCache();
}

bool DocumentController::doRestoreObjectsFromArchive (ARA::PlugIn::HostArchiveReader*, const ARA::PlugIn::RestoreObjectsFilter*) noexcept
{
    return true;
}

bool DocumentController::doStoreObjectsToArchive (ARA::PlugIn::HostArchiveWriter*, const ARA::PlugIn::StoreObjectsFilter*) noexcept
{
    return true;
}

void DocumentController::didUpdateAudioSourceProperties (ARA::PlugIn::AudioSource* audioSource) noexcept
{
    static_cast<AudioSource*> (audioSource)->forgetTake();
}

namespace
{
bool available (const core::ClipContent* c, ARA::ARAContentType type) noexcept
{
    if (c == nullptr)
        return false;
    switch (type)
    {
        case ARA::kARAContentTypeTempoEntries: return c->tempo.size() >= 2;
        case ARA::kARAContentTypeBarSignatures: return ! c->bars.empty() && c->tempo.size() >= 2;
        case ARA::kARAContentTypeNotes: return ! c->notes.empty();
        case ARA::kARAContentTypeSheetChords: return ! c->chords.empty() && c->tempo.size() >= 2;
        case ARA::kARAContentTypeKeySignatures: return c->key.has_value() && c->tempo.size() >= 2;
        default: return false;
    }
}

ARA::PlugIn::ContentReader* readerFor (const core::ClipContent* c, ARA::ARAContentType type, const ARA::ARAContentTimeRange* range) noexcept
{
    if (! available (c, type))
        return nullptr;
    try
    {
        switch (type)
        {
            case ARA::kARAContentTypeTempoEntries:
            {
                std::vector<ARA::ARAContentTempoEntry> events;
                for (const auto& t : c->tempo)
                    events.push_back ({ t.seconds, t.quarters });
                return new EventsReader<ARA::ARAContentTempoEntry> (std::move (events));
            }
            case ARA::kARAContentTypeBarSignatures:
            {
                std::vector<ARA::ARAContentBarSignature> events;
                for (const auto& b : c->bars)
                    events.push_back ({ b.numerator, b.denominator, b.quarters });
                return new EventsReader<ARA::ARAContentBarSignature> (std::move (events));
            }
            case ARA::kARAContentTypeNotes:
            {
                std::vector<ARA::ARAContentNote> events;
                for (const auto& n : c->notes)
                {
                    if (range != nullptr && (n.start >= range->start + range->duration || n.start + n.duration <= range->start))
                        continue;
                    const float frequency = static_cast<float> (440.0 * std::pow (2.0, (n.pitch - 69) / 12.0));
                    events.push_back ({ frequency, n.pitch, n.volume, n.start, 0.0, n.duration, n.duration });
                }
                return new EventsReader<ARA::ARAContentNote> (std::move (events));
            }
            case ARA::kARAContentTypeSheetChords:
            {
                std::vector<ARA::ARAContentChord> events;
                std::vector<std::string> names;
                for (const auto& ch : c->chords)
                {
                    ARA::ARAContentChord e {};
                    e.root = ch.root;
                    e.bass = ch.bass;
                    for (std::size_t i = 0; i < 12; ++i)
                        e.intervals[i] = ch.degrees[i];
                    e.position = ch.quarters;
                    events.push_back (e);
                    names.push_back (ch.name);
                }
                return new EventsReader<ARA::ARAContentChord> (std::move (events), std::move (names));
            }
            case ARA::kARAContentTypeKeySignatures:
            {
                static constexpr int majorScale[] = { 0, 2, 4, 5, 7, 9, 11 };
                static constexpr int minorScale[] = { 0, 2, 3, 5, 7, 8, 10 };
                ARA::ARAContentKeySignature e {};
                e.root = c->key->root;
                for (int step : (c->key->minor ? minorScale : majorScale))
                    e.intervals[step] = ARA::kARAKeySignatureIntervalUsed;
                e.position = c->key->quarters;
                return new EventsReader<ARA::ARAContentKeySignature> ({ e }, { c->key->name });
            }
            default:
                return nullptr;
        }
    }
    catch (...)
    {
        return nullptr;
    }
}
} // namespace

bool DocumentController::doIsAudioSourceContentAvailable (const ARA::PlugIn::AudioSource* audioSource, ARA::ARAContentType type) noexcept
{
    return available (static_cast<const AudioSource*> (audioSource)->content(), type);
}

ARA::ARAContentGrade DocumentController::doGetAudioSourceContentGrade (const ARA::PlugIn::AudioSource*, ARA::ARAContentType) noexcept
{
    return ARA::kARAContentGradeDetected; // measured in the take (the bars), written for it (notes, chords, key)
}

ARA::PlugIn::ContentReader* DocumentController::doCreateAudioSourceContentReader (ARA::PlugIn::AudioSource* audioSource, ARA::ARAContentType type, const ARA::ARAContentTimeRange* range) noexcept
{
    return readerFor (static_cast<AudioSource*> (audioSource)->content(), type, range);
}

// Plenio ARA changes nothing in a clip: a modification holds what its source holds
bool DocumentController::doIsAudioModificationContentAvailable (const ARA::PlugIn::AudioModification* audioModification, ARA::ARAContentType type) noexcept
{
    return doIsAudioSourceContentAvailable (audioModification->getAudioSource(), type);
}

ARA::ARAContentGrade DocumentController::doGetAudioModificationContentGrade (const ARA::PlugIn::AudioModification* audioModification, ARA::ARAContentType type) noexcept
{
    return doGetAudioSourceContentGrade (audioModification->getAudioSource(), type);
}

ARA::PlugIn::ContentReader* DocumentController::doCreateAudioModificationContentReader (ARA::PlugIn::AudioModification* audioModification, ARA::ARAContentType type, const ARA::ARAContentTimeRange* range) noexcept
{
    return readerFor (audioModification->getAudioSource<AudioSource>()->content(), type, range);
}

ARA::PlugIn::PlaybackRenderer* DocumentController::doCreatePlaybackRenderer() noexcept
{
    return new PlaybackRenderer (this);
}

ARA::PlugIn::EditorView* DocumentController::doCreateEditorView() noexcept
{
    return new ARA::PlugIn::EditorView (this);
}

} // namespace plenio::ara
