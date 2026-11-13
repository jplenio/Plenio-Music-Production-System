#include <doctest/doctest.h>

#include "engine/loader.h"
#include "engine/player.h"

#include <cmath>
#include <vector>

using namespace plenio;
using namespace plenio::engine;

namespace
{
/// A take whose sample k is k / 1000 (left) and -k / 1000 (right): every sample says where it is.
std::shared_ptr<TakeAudio> ramp (std::size_t frames, std::int64_t start, int stems = 0)
{
    auto data = std::make_shared<AudioData>();
    auto* t = data.get();
    t->sampleRate = 48000;
    t->mix[0].resize (frames);
    t->mix[1].resize (frames);
    for (std::size_t k = 0; k < frames; ++k)
    {
        t->mix[0][k] = static_cast<float> (k) / 1000.0f;
        t->mix[1][k] = -static_cast<float> (k) / 1000.0f;
    }
    for (int s = 0; s < stems; ++s)
    {
        // the stems add up to the mix: stem s holds the share (s + 1) / sum
        auto share = static_cast<float> (s + 1) / static_cast<float> (stems * (stems + 1) / 2);
        for (int c = 0; c < 2; ++c)
        {
            t->stems[static_cast<std::size_t> (s)][static_cast<std::size_t> (c)].resize (frames);
            for (std::size_t k = 0; k < frames; ++k)
                t->stems[static_cast<std::size_t> (s)][static_cast<std::size_t> (c)][k] = t->mix[static_cast<std::size_t> (c)][k] * share;
        }
        t->hasStem[static_cast<std::size_t> (s)] = true;
    }
    t->stemCount = stems;
    auto take = std::make_shared<TakeAudio>();
    take->audio = data;
    take->startSample = start;
    return take;
}

struct Recorder : MidiSink
{
    struct Sent { std::int64_t sample; std::uint8_t status, data1, data2; };
    std::vector<Sent> sent;
    std::int64_t blockStart = 0;
    void send (int offset, std::uint8_t status, std::uint8_t d1, std::uint8_t d2) override
    {
        sent.push_back ({ blockStart + offset, status, d1, d2 });
    }
};

/// Renders `total` samples from `from` in blocks of `blockSize`; returns the left channel.
std::vector<float> play (Player& p, std::int64_t from, int total, int blockSize, bool playing = true, Recorder* midi = nullptr)
{
    std::vector<float> left (static_cast<std::size_t> (total)), right (static_cast<std::size_t> (total));
    for (int done = 0; done < total; done += blockSize)
    {
        Block b;
        b.projectSample = from + done;
        b.numSamples = std::min (blockSize, total - done);
        b.playing = playing;
        b.main[0] = left.data() + done;
        b.main[1] = right.data() + done;
        if (midi != nullptr)
            midi->blockStart = b.projectSample;
        b.midi = midi;
        p.render (b);
    }
    return left;
}
} // namespace

TEST_CASE ("the take plays at the host's sample position, whatever the block size")
{
    for (int blockSize : { 1, 31, 64, 512, 4096 })
    {
        Player p;
        p.prepare (48000, blockSize);
        p.publish (ramp (10000, 2000));
        // render once so the swap's fade-in is over, then check exact samples
        play (p, 0, 4096, blockSize);
        auto left = play (p, 5000, 3000, blockSize);
        for (int i = 0; i < 3000; ++i)
            REQUIRE_MESSAGE (left[static_cast<std::size_t> (i)] == doctest::Approx ((5000 + i - 2000) / 1000.0f), "block size ", blockSize, " sample ", i);
    }
}

TEST_CASE ("before and after the take there is silence, and nothing plays while the host stands")
{
    Player p;
    p.prepare (48000, 128);
    p.publish (ramp (1000, 500));
    play (p, 0, 2048, 128);
    auto left = play (p, 0, 2000, 128);
    CHECK (left[100] == 0.0f);
    CHECK (left[499] == 0.0f);
    CHECK (left[600] == doctest::Approx (0.1f));
    CHECK (left[1600] == 0.0f);
    auto stopped = play (p, 600, 256, 128, false);
    CHECK (std::all_of (stopped.begin(), stopped.end(), [] (float v) { return v == 0.0f; }));
}

TEST_CASE ("a stem output takes its stem out of the main output")
{
    Player p;
    p.prepare (48000, 256);
    p.publish (ramp (4000, 0, 2));
    play (p, 0, 1024, 256);
    std::vector<float> mainL (256), mainR (256), vocalsL (256), vocalsR (256);
    p.setStemOutputActive (0, true);
    Block b;
    b.projectSample = 3000;
    b.numSamples = 256;
    b.playing = true;
    b.main[0] = mainL.data();
    b.main[1] = mainR.data();
    b.stems[0][0] = vocalsL.data();
    b.stems[0][1] = vocalsR.data();
    p.render (b);
    // stem 0 holds a third, stem 1 two thirds of the mix
    CHECK (vocalsL[10] == doctest::Approx (3.010f / 3.0f));
    CHECK (mainL[10] == doctest::Approx (3.010f * 2.0f / 3.0f));
    // muted vocals: not on their output, not in the main
    p.setStemMuted (0, true);
    p.render (b);
    CHECK (vocalsL[10] == 0.0f);
    CHECK (mainL[10] == doctest::Approx (3.010f * 2.0f / 3.0f));
    // solo vocals with their output off again: only the vocals in the main
    p.setStemMuted (0, false);
    p.setStemSoloed (0, true);
    p.setStemOutputActive (0, false);
    b.stems[0][0] = b.stems[0][1] = nullptr;
    p.render (b);
    CHECK (mainL[10] == doctest::Approx (3.010f / 3.0f));
}

TEST_CASE ("the score's notes come at the audio's times, and end on a jump")
{
    score::Score s;
    s.ppq = 480;
    s.bpm = 120.0; // a quarter is half a second
    s.meters = { { 0, 4, 4 } };
    s.melody = { { 0, 480, 60, 90, 0 }, { 960, 480, 62, 90, 0 } };
    s.endTick = 1920 * 2;
    timeline::TakeTiming timing;
    timing.scoreBpm = 120.0;
    timing.meters = { { 4, 4 }, { 4, 4 } };
    timing.warp = timeline::Warp { 1.0, 0.25 }; // the score's first beat a quarter second into the audio
    auto layout = timeline::layOut (timing);
    auto events = midiEvents (s, timing, layout, 1000.0); // 1000 samples a second: easy numbers
    REQUIRE (events.size() == 4);
    CHECK (layout.scoreAt == doctest::Approx (2.0)); // one lead-in bar of 2 s
    CHECK (events[0].sample == 2000);
    CHECK (events[1].sample == 2500); // the first note ends
    CHECK (events[2].sample == 3000);

    Player p;
    p.prepare (1000, 100);
    auto take = ramp (5000, 1750);
    take->midi = events;
    p.publish (take);
    Recorder rec;
    play (p, 1900, 1200, 100, true, &rec); // through the first note and the second's start
    REQUIRE (rec.sent.size() == 3);
    CHECK (rec.sent[0].sample == 2000);
    CHECK ((rec.sent[0].status & 0xF0) == 0x90);
    CHECK (rec.sent[1].sample == 2500);
    // a jump back while the second note sounds: it ends at once
    rec.sent.clear();
    play (p, 3200, 50, 50, true, &rec);
    play (p, 1000, 50, 50, true, &rec);
    REQUIRE (! rec.sent.empty());
    CHECK ((rec.sent.back().status & 0xF0) == 0x80);
    CHECK (rec.sent.back().data1 == 62);
}

TEST_CASE ("another take fades in without a click, and the old one is freed later")
{
    Player p;
    p.prepare (48000, 64);
    auto first = ramp (100000, 0);
    std::weak_ptr<const TakeAudio> watch = first;
    p.publish (first);
    first.reset();
    play (p, 0, 4096, 64);
    auto second = std::make_shared<TakeAudio> (*ramp (100000, 0));
    auto flat = std::make_shared<AudioData> (*second->audio);
    for (auto& c : flat->mix)
        for (auto& v : c)
            v = 1.0f; // a step from the ramp's ~4.1 to 1.0
    second->audio = flat;
    p.publish (second);
    auto left = play (p, 4096, 1024, 64);
    // no sample jumps by more than the ramp's step and a fade's share
    for (std::size_t i = 1; i < left.size(); ++i)
        CHECK (std::abs (left[i] - left[i - 1]) < 0.2f);
    CHECK (left.back() == doctest::Approx (1.0f));
    CHECK_FALSE (watch.expired()); // still kept until the garbage is collected
    p.collectGarbage();
    CHECK (watch.expired());
}

TEST_CASE ("listening while the host stands, until the host plays")
{
    Player p;
    p.prepare (48000, 128);
    p.publish (ramp (10000, 0));
    play (p, 0, 1024, 128, false);
    p.startPreview (3000);
    auto heard = play (p, 0, 512, 128, false);
    CHECK (p.previewing());
    CHECK (heard[300] == doctest::Approx ((3000 + 300) / 1000.0f).epsilon (0.01));
    play (p, 8000, 128, 128, true); // the host plays: the preview ends
    CHECK_FALSE (p.previewing());
}
