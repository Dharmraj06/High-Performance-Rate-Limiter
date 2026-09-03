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

    double capacity;
    double refillRate;
    seconds cleanupInterval;

    size_t getShard(const string &clientId) const;
    void cleanupShard(Shard &shard, steady_clock::time_point currTime);

public:
    tokenBucketLimiter(double capacity, double refillRate);

    RateLimitResult allow(const string &clientId, steady_clock::time_point currTime);

    void cleanup(steady_clock::time_point currTime);

    int getClientCount() const;
};