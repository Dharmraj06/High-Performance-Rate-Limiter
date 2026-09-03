#include "slidingWindowCounterLimiter.h"
#include <cmath>

slidingWindowCounterLimiter::slidingWindowCounterLimiter(int limit, seconds winDuration)
{
    this->limit = limit;
    this->winDuration = winDuration;
    this->cleanupInterval = max(seconds(10), winDuration);
}

size_t slidingWindowCounterLimiter::getShard(const string &clientId) const
{
    return hash<string>{}(clientId) % numShards;
}

void slidingWindowCounterLimiter::cleanupShard(Shard &shard, steady_clock::time_point currTime)
{
    for (auto it = shard.clients.begin(); it != shard.clients.end(); )
    {
        if (currTime - it->second.lastAccess >= winDuration * 2)
        {
            it = shard.clients.erase(it);
        }
        else
        {
            ++it;
        }
    }
}

RateLimitResult slidingWindowCounterLimiter::allow(const string &clientId, steady_clock::time_point currTime)
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

    if (it == shard.clients.end())
    {
        shard.clients[clientId] = {0, 1, currTime, currTime};
        return {1, limit - 1, 0};
    }

    clientState &client = it->second;
    client.lastAccess = currTime;

    auto elapsed = currTime - client.winStart;

    // time diff b/w the previous window and the current reponse
    if (elapsed >= winDuration)
    {
        if (elapsed >= winDuration * 2)
        {
            client.prevCount = 0;
        }
        else
        {
            client.prevCount = client.currCount;
        }

        client.currCount = 0;
        client.winStart += winDuration;
    }

    double progress = (double)duration_cast<milliseconds>(currTime - client.winStart).count() / (double)duration_cast<milliseconds>(winDuration).count();

    double estimatedCount = client.prevCount * (1 - progress) + client.currCount;

    if (estimatedCount >= limit)
    {
        double reqProgress = (client.prevCount + client.currCount - limit) / (double)client.prevCount;
        auto retryAfter = chrono::duration<double>(reqProgress * winDuration.count()).count();

        int retrySeconds = (int)ceil(retryAfter);

        if (retrySeconds * 1.0 == retryAfter)
        {
            retrySeconds++;
        }

        return {0, 0, retrySeconds};
    }

    client.currCount++;

    return {1, limit - (int)ceil(estimatedCount) - 1, 0};
}

void slidingWindowCounterLimiter::cleanup(steady_clock::time_point currTime)
{
    for (int i = 0; i < numShards; i++)
    {
        lock_guard<mutex> lock(shards[i].mtx);
        cleanupShard(shards[i], currTime);
        shards[i].lastCleanup = currTime;
    }
}

int slidingWindowCounterLimiter::getClientCount() const
{
    int count = 0;
    for (int i = 0; i < numShards; i++)
    {
        lock_guard<mutex> lock(const_cast<mutex&>(shards[i].mtx));
        count += (int)shards[i].clients.size();
    }
    return count;
}