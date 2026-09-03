#include "tokenBucketLimiter.h"
#include <cmath>

tokenBucketLimiter::tokenBucketLimiter(double capacity, double refillRate)
{
    this->capacity = capacity;
    this->refillRate = refillRate;
}

size_t tokenBucketLimiter::getShard(const string &clientId) const
{
    return hash<string>{}(clientId) % numShards;
}

RateLimitResult tokenBucketLimiter::allow(const string &clientId, steady_clock::time_point currTime)
{
    Shard &shard = shards[getShard(clientId)];
    lock_guard<mutex> lock(shard.mtx);

    auto it = shard.clients.find(clientId);

    //new client
    if (it == shard.clients.end())
    {
        shard.clients[clientId] = {capacity - 1, currTime};
        return {1, (int)(capacity - 1), 0};
    }

    clientState &client = it->second;

    duration<double> elapsed = currTime - client.lastRefill;

    client.tokens += elapsed.count() * refillRate;

    if (client.tokens > capacity)
    {
        client.tokens = capacity;
    }

    client.lastRefill = currTime;

    //no token
    if (client.tokens < 1)
    {
        int retryAfter = (int)ceil((1 - client.tokens) / refillRate);

        return {0, 0, retryAfter};
    }

    client.tokens--;

    //tokens left after accepting the req
    return {1, (int)client.tokens, 0};
}