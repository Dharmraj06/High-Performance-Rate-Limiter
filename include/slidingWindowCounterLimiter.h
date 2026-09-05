#pragma once

#include <chrono>
#include<bits/stdc++.h>

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
        steady_clock::time_point lastDelete;
    };

    static const int numShards = 64;
    Shard shards[numShards];

    int limit;
    seconds winDuration;
    seconds deleteInterval;

    size_t getShard(const string &clientId) const;
    void deleteShard(Shard &shard, steady_clock::time_point currTime);

public:
    slidingWindowCounterLimiter(int limit, seconds winDuration);

    RateLimitResult allow(const string &clientId, steady_clock::time_point currTime);

    void deleteOldClients(steady_clock::time_point currTime);

    int getClientCount() const;
};