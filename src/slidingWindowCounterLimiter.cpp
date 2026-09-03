#include "slidingWindowCounterLimiter.h"
#include <cmath>

slidingWindowCounterLimiter::slidingWindowCounterLimiter(int limit, seconds winDuration)
{
    this->limit = limit;
    this->winDuration = winDuration;
}

size_t slidingWindowCounterLimiter::getShard(const string &clientId) const
{
    return hash<string>{}(clientId) % numShards;
}

RateLimitResult slidingWindowCounterLimiter::allow(const string &clientId, steady_clock::time_point currTime)
{
    Shard &shard = shards[getShard(clientId)];
    lock_guard<mutex> lock(shard.mtx);

    auto it = shard.clients.find(clientId);

    if (it == shard.clients.end())
    {
        shard.clients[clientId] = {0, 1, currTime};
        return {1, limit - 1, 0};
    }

    clientState &client = it->second;

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