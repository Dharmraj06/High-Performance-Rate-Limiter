#pragma once

#include <chrono>
#include <string>
#include <unordered_map>
#include <mutex>
#include <cmath>
#include <functional>

#include "rateLimitResult.h"

using namespace std;
using namespace chrono;

class tokenBucketLimiter
{
private:
    struct clientState
    {
        double tokens;
        steady_clock::time_point lastRefill;
    };

    struct Shard
    {
        mutex mtx;
        unordered_map<string, clientState> clients;
    };

    static const int numShards = 64;
    Shard shards[numShards];

    double capacity;
    double refillRate;

    size_t getShard(const string &clientId) const;

public:
    tokenBucketLimiter(double capacity, double refillRate);

    RateLimitResult allow(const string &clientId, steady_clock::time_point currTime);
};