#include "tokenBucketLimiter.h"
#include <cmath>

tokenBucketLimiter::tokenBucketLimiter(double capacity, double refillRate)
{
    this->capacity = capacity;
    this->refillRate = refillRate;
    this->cleanupInterval = max(seconds(10), seconds((int)ceil(capacity / refillRate)));
}

size_t tokenBucketLimiter::getShard(const string &clientId) const
{
    return hash<string>{}(clientId) % numShards;
}

void tokenBucketLimiter::cleanupShard(Shard &shard, steady_clock::time_point currTime)
{
    auto ttl = max(seconds(10), seconds((int)ceil(capacity / refillRate)));
    for (auto it = shard.clients.begin(); it != shard.clients.end(); )
    {
        if (currTime - it->second.lastAccess >= ttl)
        {
            it = shard.clients.erase(it);
        }
        else
        {
            ++it;
        }
    }
}

RateLimitResult tokenBucketLimiter::allow(const string &clientId, steady_clock::time_point currTime)
{
    Shard &shard = shards[getShard(clientId)];
    lock_guard<mutex> lock(shard.mtx);

    if (shard.lastCleanup.time_since_epoch().count() == 0)
    {
        shard.lastCleanup = currTime;
    }
    else if (currTime - shard.lastCleanup >= cleanupInterval)
    {
        cleanupShard(shard, currTime);
        shard.lastCleanup = currTime;
    }

    auto it = shard.clients.find(clientId);

    //new client
    if (it == shard.clients.end())
    {
        shard.clients[clientId] = {capacity - 1, currTime, currTime};
        return {1, (int)(capacity - 1), 0};
    }

    clientState &client = it->second;
    client.lastAccess = currTime;

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

void tokenBucketLimiter::cleanup(steady_clock::time_point currTime)
{
    for (int i = 0; i < numShards; i++)
    {
        lock_guard<mutex> lock(shards[i].mtx);
        cleanupShard(shards[i], currTime);
        shards[i].lastCleanup = currTime;
    }
}

int tokenBucketLimiter::getClientCount() const
{
    int count = 0;
    for (int i = 0; i < numShards; i++)
    {
        lock_guard<mutex> lock(const_cast<mutex&>(shards[i].mtx));
        count += (int)shards[i].clients.size();
    }
    return count;
}