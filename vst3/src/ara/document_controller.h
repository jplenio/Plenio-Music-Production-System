// Plenio ARA's document controller: the host's clips (audio sources, modifications, playback regions) as Plenio
// sees them. Phase 1: sources cached for the pass-through renderer; recognition of Plenio takes, content for the
// host and the editor follow in phase 7 (docs/PLAN.md).
#pragma once

#include "ARA_Library/PlugIn/ARAPlug.h"

#include <atomic>

namespace plenio::ara
{

class DocumentController : public ARA::PlugIn::DocumentController
{
public:
    using ARA::PlugIn::DocumentController::DocumentController;

    /// Renderers (audio thread) ask before they read the model and report when done; the main thread blocks
    /// them while the host edits the document or changes sample access.
    bool rendererWillAccessModelGraph() noexcept;
    void rendererDidAccessModelGraph() noexcept;

    /// Changes what renderers read (another take in a clip) while they wait. Main thread.
    template <typename Change>
    void whileRenderersWait (Change&& change) noexcept
    {
        const bool editing = isHostEditingDocument(); // then they wait already, until the host's edit ends
        if (! editing)
            blockRenderers();
        change();
        if (! editing)
            unblockRenderers();
    }

protected:
    void willBeginEditing() noexcept override;
    void didEndEditing() noexcept override;

    void doUpdateMusicalContextContent (ARA::PlugIn::MusicalContext* musicalContext, const ARA::ARAContentTimeRange* range, ARA::ContentUpdateScopes scopeFlags) noexcept override;

    ARA::PlugIn::AudioSource* doCreateAudioSource (ARA::PlugIn::Document* document, ARA::ARAAudioSourceHostRef hostRef) noexcept override;
    void willEnableAudioSourceSamplesAccess (ARA::PlugIn::AudioSource* audioSource, bool enable) noexcept override;
    void didEnableAudioSourceSamplesAccess (ARA::PlugIn::AudioSource* audioSource, bool enable) noexcept override;
    void doUpdateAudioSourceContent (ARA::PlugIn::AudioSource* audioSource, const ARA::ARAContentTimeRange* range, ARA::ContentUpdateScopes scopeFlags) noexcept override;
    void didDeactivateAudioSourceForUndoHistory (ARA::PlugIn::AudioSource* audioSource, bool deactivate) noexcept override;

    bool doRestoreObjectsFromArchive (ARA::PlugIn::HostArchiveReader* archiveReader, const ARA::PlugIn::RestoreObjectsFilter* filter) noexcept override;
    bool doStoreObjectsToArchive (ARA::PlugIn::HostArchiveWriter* archiveWriter, const ARA::PlugIn::StoreObjectsFilter* filter) noexcept override;

    bool doIsAudioModificationPreservingAudioSourceSignal (ARA::PlugIn::AudioModification*) noexcept override { return true; }

    // what a clip that is a Plenio take holds: tempo, bars, the sung notes, the chords, the key
    void didUpdateAudioSourceProperties (ARA::PlugIn::AudioSource* audioSource) noexcept override;
    bool doIsAudioSourceContentAvailable (const ARA::PlugIn::AudioSource* audioSource, ARA::ARAContentType type) noexcept override;
    ARA::ARAContentGrade doGetAudioSourceContentGrade (const ARA::PlugIn::AudioSource* audioSource, ARA::ARAContentType type) noexcept override;
    ARA::PlugIn::ContentReader* doCreateAudioSourceContentReader (ARA::PlugIn::AudioSource* audioSource, ARA::ARAContentType type, const ARA::ARAContentTimeRange* range) noexcept override;
    bool doIsAudioModificationContentAvailable (const ARA::PlugIn::AudioModification* audioModification, ARA::ARAContentType type) noexcept override;
    ARA::ARAContentGrade doGetAudioModificationContentGrade (const ARA::PlugIn::AudioModification* audioModification, ARA::ARAContentType type) noexcept override;
    ARA::PlugIn::ContentReader* doCreateAudioModificationContentReader (ARA::PlugIn::AudioModification* audioModification, ARA::ARAContentType type, const ARA::ARAContentTimeRange* range) noexcept override;
    // nothing to analyse: the take's content is known (or the clip is no Plenio take)
    bool doIsAudioSourceContentAnalysisIncomplete (const ARA::PlugIn::AudioSource*, ARA::ARAContentType) noexcept override { return false; }
    void doRequestAudioSourceContentAnalysis (ARA::PlugIn::AudioSource*, std::vector<ARA::ARAContentType> const&) noexcept override {}

    ARA::PlugIn::PlaybackRenderer* doCreatePlaybackRenderer() noexcept override;
    ARA::PlugIn::EditorView* doCreateEditorView() noexcept override;

private:
    void blockRenderers() noexcept;
    void unblockRenderers() noexcept;

    std::atomic<bool> renderersMayAccess { true };
    std::atomic<int> renderersAccessing { 0 };
};

} // namespace plenio::ara
