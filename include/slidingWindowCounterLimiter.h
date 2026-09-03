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
        steady_clock::time_point lastAccess;
    };

    struct Shard
    {
        mutex mtx;
        unordered_map<string, clientState> clients;
        steady_clock::time_point lastCleanup;
    };

    static const int numShards = 64;
    Shard shards[numShards];

    int limit;
    seconds winDuration;
    seconds cleanupInterval;

    size_t getShard(const string &clientId) const;
    void cleanupShard(Shard &shard, steady_clock::time_point currTime);

public:
    slidingWindowCounterLimiter(int limit, seconds winDuration);

    RateLimitResult allow(const string &clientId, steady_clock::time_point currTime);

    void cleanup(steady_clock::time_point currTime);

    int getClientCount() const;
};