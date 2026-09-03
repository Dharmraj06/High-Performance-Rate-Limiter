#include <benchmark/benchmark.h>
#include <chrono>
#include <string>

#include "fixedWindowLimiter.h"
#include "slidingWindowCounterLimiter.h"
#include "slidingWindowLimiter.h"
#include "tokenBucketLimiter.h"

using namespace std;

// Limit large enough that no benchmark run saturates it, so every
// iteration exercises the allowed path.
static const int             winLimit    = 1000000000;
static const chrono::seconds winDuration = chrono::seconds(60);
static const double          bucketCap   = 1000000000.0;
static const double          fillRate    = 1000000000.0;

// ---------------------------------------------------------------------------
// Shared limiter pointers for concurrent benchmarks.
//
// Setup callbacks construct a fresh instance before each benchmark
// configuration (thread count × repetition) starts. Teardown destroys it
// afterward. This means different thread-count variants never share state,
// and setup cost is excluded from the measured region.
// ---------------------------------------------------------------------------

static fixedWindowLimiter*          fwLimiter  = nullptr;
static slidingWindowLimiter*        swLimiter  = nullptr;
static slidingWindowCounterLimiter* swcLimiter = nullptr;
static tokenBucketLimiter*          tbLimiter  = nullptr;

static void setupFW(const benchmark::State&)
{
    delete fwLimiter;
    fwLimiter = new fixedWindowLimiter(winLimit, winDuration);
}
static void teardownFW(const benchmark::State&)
{
    delete fwLimiter;
    fwLimiter = nullptr;
}

static void setupSW(const benchmark::State&)
{
    delete swLimiter;
    swLimiter = new slidingWindowLimiter(winLimit, winDuration);
}
static void teardownSW(const benchmark::State&)
{
    delete swLimiter;
    swLimiter = nullptr;
}

static void setupSWC(const benchmark::State&)
{
    delete swcLimiter;
    swcLimiter = new slidingWindowCounterLimiter(winLimit, winDuration);
}
static void teardownSWC(const benchmark::State&)
{
    delete swcLimiter;
    swcLimiter = nullptr;
}

static void setupTB(const benchmark::State&)
{
    delete tbLimiter;
    tbLimiter = new tokenBucketLimiter(bucketCap, fillRate);
}
static void teardownTB(const benchmark::State&)
{
    delete tbLimiter;
    tbLimiter = nullptr;
}

// ---------------------------------------------------------------------------
// Workload A - single-thread baseline
// ---------------------------------------------------------------------------

static void BM_FixedWindow_Single(benchmark::State& state)
{
    fixedWindowLimiter limiter(winLimit, winDuration);
    for (auto _ : state)
        limiter.allow("client0", chrono::steady_clock::now());
}
BENCHMARK(BM_FixedWindow_Single);

static void BM_SlidingWindowLog_Single(benchmark::State& state)
{
    slidingWindowLimiter limiter(winLimit, winDuration);
    for (auto _ : state)
        limiter.allow("client0", chrono::steady_clock::now());
}
BENCHMARK(BM_SlidingWindowLog_Single);

static void BM_SlidingWindowCounter_Single(benchmark::State& state)
{
    slidingWindowCounterLimiter limiter(winLimit, winDuration);
    for (auto _ : state)
        limiter.allow("client0", chrono::steady_clock::now());
}
BENCHMARK(BM_SlidingWindowCounter_Single);

static void BM_TokenBucket_Single(benchmark::State& state)
{
    tokenBucketLimiter limiter(bucketCap, fillRate);
    for (auto _ : state)
        limiter.allow("client0", chrono::steady_clock::now());
}
BENCHMARK(BM_TokenBucket_Single);

// ---------------------------------------------------------------------------
// Workload B - concurrent same-client
// ---------------------------------------------------------------------------

static void BM_FixedWindow_SameClient(benchmark::State& state)
{
    for (auto _ : state)
        fwLimiter->allow("client0", chrono::steady_clock::now());
}
BENCHMARK(BM_FixedWindow_SameClient)
    ->ThreadRange(1, 16)
    ->Setup(setupFW)->Teardown(teardownFW)
    ->UseRealTime();

static void BM_SlidingWindowLog_SameClient(benchmark::State& state)
{
    for (auto _ : state)
        swLimiter->allow("client0", chrono::steady_clock::now());
}
BENCHMARK(BM_SlidingWindowLog_SameClient)
    ->ThreadRange(1, 16)
    ->Setup(setupSW)->Teardown(teardownSW)
    ->UseRealTime();

static void BM_SlidingWindowCounter_SameClient(benchmark::State& state)
{
    for (auto _ : state)
        swcLimiter->allow("client0", chrono::steady_clock::now());
}
BENCHMARK(BM_SlidingWindowCounter_SameClient)
    ->ThreadRange(1, 16)
    ->Setup(setupSWC)->Teardown(teardownSWC)
    ->UseRealTime();

static void BM_TokenBucket_SameClient(benchmark::State& state)
{
    for (auto _ : state)
        tbLimiter->allow("client0", chrono::steady_clock::now());
}
BENCHMARK(BM_TokenBucket_SameClient)
    ->ThreadRange(1, 16)
    ->Setup(setupTB)->Teardown(teardownTB)
    ->UseRealTime();

// ---------------------------------------------------------------------------
// Workload C - concurrent multi-client
// ---------------------------------------------------------------------------

static void BM_FixedWindow_MultiClient(benchmark::State& state)
{
    string clientId = "client" + to_string(state.thread_index());
    for (auto _ : state)
        fwLimiter->allow(clientId, chrono::steady_clock::now());
}
BENCHMARK(BM_FixedWindow_MultiClient)
    ->ThreadRange(1, 16)
    ->Setup(setupFW)->Teardown(teardownFW)
    ->UseRealTime();

static void BM_SlidingWindowLog_MultiClient(benchmark::State& state)
{
    string clientId = "client" + to_string(state.thread_index());
    for (auto _ : state)
        swLimiter->allow(clientId, chrono::steady_clock::now());
}
BENCHMARK(BM_SlidingWindowLog_MultiClient)
    ->ThreadRange(1, 16)
    ->Setup(setupSW)->Teardown(teardownSW)
    ->UseRealTime();

static void BM_SlidingWindowCounter_MultiClient(benchmark::State& state)
{
    string clientId = "client" + to_string(state.thread_index());
    for (auto _ : state)
        swcLimiter->allow(clientId, chrono::steady_clock::now());
}
BENCHMARK(BM_SlidingWindowCounter_MultiClient)
    ->ThreadRange(1, 16)
    ->Setup(setupSWC)->Teardown(teardownSWC)
    ->UseRealTime();

static void BM_TokenBucket_MultiClient(benchmark::State& state)
{
    string clientId = "client" + to_string(state.thread_index());
    for (auto _ : state)
        tbLimiter->allow(clientId, chrono::steady_clock::now());
}
BENCHMARK(BM_TokenBucket_MultiClient)
    ->ThreadRange(1, 16)
    ->Setup(setupTB)->Teardown(teardownTB)
    ->UseRealTime();

BENCHMARK_MAIN();
