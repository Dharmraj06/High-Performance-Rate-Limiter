#pragma once

#include <chrono>
#include <string>
#include <unordered_map>
#include <mutex>
#include <functional>

#include "rateLimitResult.h"

using namespace std;
using namespace chrono;

class slidingWindowCounterLimiter
{
private:
    struct clientState
    {
        int prevCount;
        int currCount;
        steady_clock::time_point winStart;
    };

    struct Shard
    {
        mutex mtx;
        unordered_map<string, clientState> clients;
    };

    static const int numShards = 64;
    Shard shards[numShards];

    int limit;
    seconds winDuration;

    size_t getShard(const string &clientId) const;

public:
    slidingWindowCounterLimiter(int limit, seconds winDuration);

    RateLimitResult allow(const string &clientId, steady_clock::time_point currTime);
};