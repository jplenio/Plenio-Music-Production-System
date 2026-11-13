#include <doctest/doctest.h>

#include "core/client.h"
#include "core/record.h"
#include "core/settings.h"

using namespace plenio;
using namespace plenio::core;

TEST_CASE ("the client speaks Song API v2, and v1 to a Plenio before 2.0")
{
    PlenioClient v2 ("127.0.0.1", 8188);
    CHECK (v2.apiVersion() == 2);
    CHECK (v2.api ("") == "/plenio/api/v2");
    CHECK (v2.api ("/jobs") == "/plenio/api/v2/jobs");
    CHECK (v2.scorePath (true) == "/plenio/api/v2/scores/export/midi");
    CHECK (v2.scorePath (false) == "/plenio/api/v2/scores/import/midi");

    PlenioClient v1 ("127.0.0.1", 8188, {}, {}, 1);
    CHECK (v1.apiVersion() == 1);
    CHECK (v1.api ("/jobs") == "/plenio/api/v1/jobs");
    CHECK (v1.scorePath (true) == "/plenio/score/midi/export");
    CHECK (v1.scorePath (false) == "/plenio/score/midi/import");
}

TEST_CASE ("a job is followed on the API that made it")
{
    // a project saved with a Plenio 1.x job in it still finds that job after the update
    CHECK (PlenioClient::jobPath ("job_0123456789abcdef") == "/plenio/api/v2/jobs/job_0123456789abcdef");
    CHECK (PlenioClient::jobPath ("6f1c2a5e-0000-4000-8000-000000000001") == "/plenio/api/v1/jobs/6f1c2a5e-0000-4000-8000-000000000001");
    CHECK (PlenioClient::jobPath ("a b/c") == "/plenio/api/v1/jobs/a%20b%2Fc");
}

TEST_CASE ("a v2 job: its files, a review stop, a run ComfyUI cut short")
{
    Json done = { { "id", "job_00000000000000aa" }, { "status", "succeeded" },
                  { "result", { { "title", "Paper Boats" }, { "song", "sng_1" },
                                { "files", Json::array ({ { { "name", "a.flac" }, { "url", "/plenio/api/v2/jobs/job_00000000000000aa/files/a.flac" } },
                                                          { { "name", "v.flac" }, { "role", "stem" }, { "stem", "vocals" }, { "url", "/plenio/api/v2/jobs/job_00000000000000aa/files/v.flac" } },
                                                          { { "name", "song" }, { "url", "/plenio/api/v2/songs/sng_1/files/a.flac" } },
                                                          { { "name", "evil" }, { "url", "//elsewhere/plenio/api/v2/jobs/x" } } }) } } } };
    auto job = record::parseJob (done);
    REQUIRE (job);
    CHECK (job->finished());
    CHECK (job->files.size() == 2); // a job's own files only
    CHECK (job->files[1].stem == "vocals");

    auto waiting = record::parseJob (Json { { "id", "job_00000000000000ab" }, { "status", "waiting_for_review" }, { "waiting_at", "text" } });
    REQUIRE (waiting);
    CHECK (waiting->status == record::JobStatus::waiting);
    CHECK (! waiting->finished());

    auto cut = record::parseJob (Json { { "id", "job_00000000000000ac" }, { "status", "failed" },
                                        { "error", { { "code", "interrupted" }, { "message", "ComfyUI stopped while the job ran" } } } });
    REQUIRE (cut);
    CHECK (cut->finished());
    CHECK (cut->errorCode == "interrupted");
    CHECK (cut->error == "ComfyUI stopped while the job ran");
}

TEST_CASE ("the studio's address is a host name, whatever was typed")
{
    CHECK (cleanHost ("studio-pc") == "studio-pc");
    CHECK (cleanHost ("  http://studio-pc:8188/  ") == "studio-pc");
    CHECK (cleanHost ("192.168.1.20:8000") == "192.168.1.20");
    CHECK (cleanHost ("https://studio.local/plenio/api/v2") == "studio.local");
    CHECK (cleanHost ("") == "127.0.0.1");
    CHECK (cleanHost ("a b") == "127.0.0.1");
    CHECK (cleanHost ("studio/?token=plenio_x") == "studio");

    CHECK (isThisComputer ("127.0.0.1"));
    CHECK (isThisComputer ("localhost"));
    CHECK (! isThisComputer ("studio-pc"));

    Settings s;
    s.host = "studio-pc";
    auto again = Settings::fromJson (s.toJson());
    CHECK (again.host == "studio-pc");
    // the token is never part of the settings file
    CHECK (s.toJson().dump().find ("token") == std::string::npos);
}
