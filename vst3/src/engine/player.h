// The real-time player: the active take (and its stems) at the host's sample position, whatever the host's tempo
// map says, so the audio is always where it belongs; the score as MIDI at the same times.
//
// The audio thread never allocates, locks or waits: a loader builds a TakeAudio off the audio thread and publishes
// it with an atomic pointer swap; the old one is freed on the main thread once the audio thread has moved past it.
// A swap fades over a few milliseconds, so choosing another take never clicks.
#pragma once

#include <array>
#include <atomic>
#include <cstdint>
#include <memory>
#include <mutex>
#include <vector>

namespace plenio::engine
{

inline constexpr int maxStems = 5; // vocals, drums, bass, other, rest (the order of the stem outputs)

struct MidiEvent
{
    std::int64_t sample = 0; // project sample
    std::uint8_t status = 0; // 0x90 / 0x80 | channel
    std::uint8_t data1 = 0;
    std::uint8_t data2 = 0;
};

/// A take's audio at the host's rate (shared: new MIDI for edited notes does not copy it).
struct AudioData
{
    double sampleRate = 0.0;
    std::array<std::vector<float>, 2> mix;           // left, right
    int stemCount = 0;
    std::array<std::array<std::vector<float>, 2>, maxStems> stems; // by output order; empty when the take has none
    std::array<bool, maxStems> hasStem {};

    std::size_t frames() const { return mix[0].size(); }
};

/// One take ready to play: its audio, where it starts, its MIDI. Never changed after it is published.
struct TakeAudio
{
    std::shared_ptr<const AudioData> audio;
    std::int64_t startSample = 0;                    // the project sample where the take's first sample plays
    std::vector<MidiEvent> midi;                     // sorted by sample
    int takeNumber = 0;

    std::size_t frames() const { return audio ? audio->frames() : 0; }
};

/// Where MIDI goes (the plug-in turns it into VST3 events).
struct MidiSink
{
    virtual ~MidiSink() = default;
    virtual void send (int sampleOffset, std::uint8_t status, std::uint8_t data1, std::uint8_t data2) = 0;
};

struct Block
{
    std::int64_t projectSample = 0;  // the host's position at the block's first sample
    int numSamples = 0;
    bool playing = false;            // the host's transport
    float* main[2] = { nullptr, nullptr };
    float* stems[maxStems][2] = {};  // a stem output's channels (null when the host has not activated it)
    MidiSink* midi = nullptr;
};

class Player
{
public:
    Player();
    ~Player();

    // --- main thread ---
    void publish (std::shared_ptr<const TakeAudio> take);
    void clear() { publish (nullptr); }
    /// Frees takes the audio thread no longer reads (call from a timer).
    void collectGarbage();
    std::shared_ptr<const TakeAudio> current() const;

    void setStemMuted (int stem, bool muted) { stemMuted[static_cast<std::size_t> (stem)].store (muted); }
    void setStemSoloed (int stem, bool soloed) { stemSoloed[static_cast<std::size_t> (stem)].store (soloed); }
    void setStemGain (int stem, float level) { stemGain[static_cast<std::size_t> (stem)].store (level); }
    void setStemOutputActive (int stem, bool active) { stemOutputActive[static_cast<std::size_t> (stem)].store (active); }
    void setMidiOut (bool on) { midiOut.store (on); }
    /// Quiet while the host plays (the song plays from the DAW's own tracks); listening while it stands stays.
    void setSilentWhilePlaying (bool on) { silentWhilePlaying.store (on); }
    void setGain (float g) { gain.store (g); }

    /// Listening while the host stands: from a project sample, until stop or the host plays.
    void startPreview (std::int64_t fromSample) { previewStart.store (fromSample); previewRequest.fetch_add (1); }
    void stopPreview() { previewStop.fetch_add (1); }
    bool previewing() const { return previewOn.load(); }

    /// The position the audio thread played last (for the UI's playhead), and whether it moved.
    std::int64_t position() const { return lastPosition.load(); }
    bool moving() const { return lastMoving.load(); }

    // --- audio thread ---
    void prepare (double sampleRate, int maxBlock);
    void render (const Block& block);
    /// Ends every sounding MIDI note (the host stopped, the plug-in is switched off).
    void silenceMidi (MidiSink* sink, int sampleOffset = 0);

private:
    void renderTake (const TakeAudio& take, const Block& block, std::int64_t position, float fromGain, float toGain, bool add);

    std::atomic<const TakeAudio*> live { nullptr };
    std::atomic<const TakeAudio*> fadingRef { nullptr }; // the take the audio thread still fades out
    std::atomic<std::uint64_t> epoch { 0 };   // blocks the audio thread finished
    mutable std::mutex keepLock;                // main thread only
    std::shared_ptr<const TakeAudio> keepCurrent;
    struct Retired { std::shared_ptr<const TakeAudio> take; std::uint64_t epoch; };
    std::vector<Retired> retired;

    // audio thread state
    const TakeAudio* playing = nullptr;
    const TakeAudio* fadingOut = nullptr;
    int fadeLeft = 0;
    int fadeLength = 256;
    std::int64_t expectedNext = -1;
    std::array<std::array<bool, 128>, 16> notesOn {};
    std::uint64_t seenPreviewRequest = 0, seenPreviewStop = 0;
    std::int64_t previewPosition = 0;
    double rate = 44100.0;

    std::array<std::atomic<bool>, maxStems> stemMuted {};
    std::array<std::atomic<bool>, maxStems> stemSoloed {};
    std::array<std::atomic<float>, maxStems> stemGain;
    std::array<std::atomic<bool>, maxStems> stemOutputActive {};
    std::atomic<bool> midiOut { true };
    std::atomic<bool> silentWhilePlaying { false };
    std::atomic<float> gain { 1.0f };
    std::atomic<std::int64_t> previewStart { 0 };
    std::atomic<std::uint64_t> previewRequest { 0 }, previewStop { 0 };
    std::atomic<bool> previewOn { false };
    std::atomic<std::int64_t> lastPosition { 0 };
    std::atomic<bool> lastMoving { false };
};

} // namespace plenio::engine
