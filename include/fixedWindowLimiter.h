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
    };

    struct Shard
    {
        mutex mtx;
        unordered_map<string, clientState> clients;
    };

    static const int numShards = 64;
    Shard shards[numShards];

    int limit;
    chrono::seconds winDuration;

    size_t getShard(const string &clientId) const;

public:
    fixedWindowLimiter(int limit, chrono::seconds winDuration);

    RateLimitResult allow(const string &clientId, chrono::steady_clock::time_point currTime);

    int getLimit() const;
};