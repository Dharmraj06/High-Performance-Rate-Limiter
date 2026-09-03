#pragma once

#include <chrono>
#include <queue>
#include <string>
#include <unordered_map>
#include <mutex>
#include <functional>

#include "rateLimitResult.h"

using namespace std;
using namespace chrono;

class slidingWindowLimiter
{
private:
    struct clientState
    {
        queue<steady_clock::time_point> reqTime;
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
    slidingWindowLimiter(int limit, seconds winDuration);

    RateLimitResult allow(const string &clientId, steady_clock::time_point currTime);

    void cleanup(steady_clock::time_point currTime);

    int getClientCount() const;
};