#pragma once

#include <chrono>
#include <string>
#include <unordered_map>
#include <mutex>
#include <functional>

#include "rateLimitResult.h"

using namespace std;

class fixedWindowLimiter
{
private:
    struct clientState
    {
        int reqCount;
        chrono::steady_clock::time_point winStart;
        chrono::steady_clock::time_point lastAccess;
    };

    struct Shard
    {
        mutex mtx;
        unordered_map<string, clientState> clients;
        chrono::steady_clock::time_point lastCleanup;
    };

    static const int numShards = 64;
    Shard shards[numShards];

    int limit;
    chrono::seconds winDuration;
    chrono::seconds cleanupInterval;

    size_t getShard(const string &clientId) const;
    void cleanupShard(Shard &shard, chrono::steady_clock::time_point currTime);

public:
    fixedWindowLimiter(int limit, chrono::seconds winDuration);

    RateLimitResult allow(const string &clientId, chrono::steady_clock::time_point currTime);

    void cleanup(chrono::steady_clock::time_point currTime);

    int getClientCount() const;

    int getLimit() const;
};