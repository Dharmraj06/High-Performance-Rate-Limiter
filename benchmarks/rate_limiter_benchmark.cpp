#include <benchmark/benchmark.h>
#include <chrono>
#include <string>

#include "fixedWindowLimiter.h"
#include "slidingWindowCounterLimiter.h"
#include "slidingWindowLimiter.h"
#include "tokenBucketLimiter.h"

using namespace std;

const int limit = (int)1e9;//1e9
const chrono::seconds winDuration(60);

const double capacity = 1e9;
const double refillRate = 1e9;


// shared limiters
fixedWindowLimiter *fixedLimiter = nullptr;
slidingWindowLimiter *slidingLimiter = nullptr;
slidingWindowCounterLimiter *counterLimiter = nullptr;
tokenBucketLimiter *tokenLimiter = nullptr;


// fixed findow
void setupFixed(const benchmark::State &state)
{
    fixedLimiter = new fixedWindowLimiter(limit, winDuration);
}

void cleanupFixed(const benchmark::State &state)
{
    delete fixedLimiter;
    fixedLimiter = nullptr;
}


// sliding window

void setupSliding(const benchmark::State &state)
{
    slidingLimiter = new slidingWindowLimiter(limit, winDuration);
}

void deleteSliding(const benchmark::State &state)
{
    delete slidingLimiter;
    slidingLimiter = nullptr;
}


// sliding window counter

void setupCounter(const benchmark::State &state)
{
    counterLimiter = new slidingWindowCounterLimiter(limit, winDuration);
}

void deleteCounter(const benchmark::State &state)
{
    delete counterLimiter;
    counterLimiter = nullptr;
}


// token bucket

void setupTokenBucket(const benchmark::State &state)
{
    tokenLimiter = new tokenBucketLimiter(capacity, refillRate);
}

void deleteTokenBucket(const benchmark::State &state)
{
    delete tokenLimiter;
    tokenLimiter = nullptr;
}


// ---------------- single thread benchmarks ----------------

static void BM_FixedWindow_Single(benchmark::State &state)
{
    fixedWindowLimiter limiter(limit, winDuration);

    for(auto _ : state)
    {
        limiter.allow("client0", chrono::steady_clock::now());
    }
}

BENCHMARK(BM_FixedWindow_Single);


static void BM_SlidingWindowLog_Single(benchmark::State &state)
{
    slidingWindowLimiter limiter(limit, winDuration);

    for(auto _ : state)
    {
        limiter.allow("client0", chrono::steady_clock::now());
    }
}

BENCHMARK(BM_SlidingWindowLog_Single);


static void BM_SlidingWindowCounter_Single(benchmark::State &state)
{
    slidingWindowCounterLimiter limiter(limit, winDuration);

    for(auto _ : state)
    {
        limiter.allow("client0", chrono::steady_clock::now());
    }
}

BENCHMARK(BM_SlidingWindowCounter_Single);


static void BM_TokenBucket_Single(benchmark::State &state)
{
    tokenBucketLimiter limiter(capacity, refillRate);

    for(auto _ : state)
    {
        limiter.allow("client0", chrono::steady_clock::now());
    }
}

BENCHMARK(BM_TokenBucket_Single);


// ---------------- Same Client Benchmarks ----------------

static void BM_FixedWindow_SameClient(benchmark::State &state)
{
    for(auto _ : state)
    {
        fixedLimiter->allow("client0", chrono::steady_clock::now());
    }
}

BENCHMARK(BM_FixedWindow_SameClient)->ThreadRange(1, 16)->Setup(setupFixed)->Teardown(cleanupFixed)->UseRealTime();


static void BM_SlidingWindowLog_SameClient(benchmark::State &state)
{
    for(auto _ : state)
    {
        slidingLimiter->allow("client0", chrono::steady_clock::now());
    }
}

BENCHMARK(BM_SlidingWindowLog_SameClient)->ThreadRange(1, 16)->Setup(setupSliding)->Teardown(deleteSliding)->UseRealTime();


static void BM_SlidingWindowCounter_SameClient(benchmark::State &state)
{
    for(auto _ : state)
    {
        counterLimiter->allow("client0", chrono::steady_clock::now());
    }
}

BENCHMARK(BM_SlidingWindowCounter_SameClient)
    ->ThreadRange(1, 16)
    ->Setup(setupCounter)
    ->Teardown(deleteCounter)
    ->UseRealTime();


static void BM_TokenBucket_SameClient(benchmark::State &state)
{
    for(auto _ : state)
    {
        tokenLimiter->allow("client0", chrono::steady_clock::now());
    }
}

BENCHMARK(BM_TokenBucket_SameClient)
    ->ThreadRange(1, 16)
    ->Setup(setupTokenBucket)
    ->Teardown(deleteTokenBucket)
    ->UseRealTime();


// ---------------- multi client b-enchmarks ----------------

static void BM_FixedWindow_MultiClient(benchmark::State &state)
{
    string clientId = "client" + to_string(state.thread_index());

    for(auto _ : state)
    {
        fixedLimiter->allow(clientId, chrono::steady_clock::now());
    }
}

BENCHMARK(BM_FixedWindow_MultiClient)
    ->ThreadRange(1, 16)
    ->Setup(setupFixed)
    ->Teardown(cleanupFixed)
    ->UseRealTime();


static void BM_SlidingWindowLog_MultiClient(benchmark::State &state)
{
    string clientId = "client" + to_string(state.thread_index());

    for(auto _ : state)
    {
        slidingLimiter->allow(clientId, chrono::steady_clock::now());
    }
}

BENCHMARK(BM_SlidingWindowLog_MultiClient)
    ->ThreadRange(1, 16)
    ->Setup(setupSliding)
    ->Teardown(deleteSliding)
    ->UseRealTime();


static void BM_SlidingWindowCounter_MultiClient(benchmark::State &state)
{
    string clientId = "client" + to_string(state.thread_index());

    for(auto _ : state)
    {
        counterLimiter->allow(clientId, chrono::steady_clock::now());
    }
}

BENCHMARK(BM_SlidingWindowCounter_MultiClient)
    ->ThreadRange(1, 16)
    ->Setup(setupCounter)
    ->Teardown(deleteCounter)
    ->UseRealTime();


static void BM_TokenBucket_MultiClient(benchmark::State &state)
{
    string clientId = "client" + to_string(state.thread_index());

    for(auto _ : state)
    {
        tokenLimiter->allow(clientId, chrono::steady_clock::now());
    }
}

BENCHMARK(BM_TokenBucket_MultiClient)->ThreadRange(1, 16)->Setup(setupTokenBucket)->Teardown(deleteTokenBucket)->UseRealTime();


BENCHMARK_MAIN();