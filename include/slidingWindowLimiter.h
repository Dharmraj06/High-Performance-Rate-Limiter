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
    slidingWindowLimiter(int limit, seconds winDuration);

    RateLimitResult allow(const string &clientId, steady_clock::time_point currTime);
};