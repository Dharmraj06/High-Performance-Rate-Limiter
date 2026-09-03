#include "fixedWindowLimiter.h"

fixedWindowLimiter::fixedWindowLimiter(int limit, chrono::seconds winDuration)
{
    this->limit = limit;
    this->winDuration = winDuration;
}

size_t fixedWindowLimiter::getShard(const string &clientId) const
{
    return hash<string>{}(clientId) % numShards;
}

RateLimitResult fixedWindowLimiter::allow(const string &clientId, chrono::steady_clock::time_point currTime)
{
    Shard &shard = shards[getShard(clientId)];
    lock_guard<mutex> lock(shard.mtx);

    auto it = shard.clients.find(clientId);

    if (it == shard.clients.end())
    {
        shard.clients[clientId] = {1, currTime};
        return {1, limit - 1, 0};
    }

    clientState &client = it->second;

    if (currTime - client.winStart >= winDuration)
    {
        client.reqCount = 1;
        client.winStart = currTime;
        return {1, limit - 1, 0};
    }

    if (client.reqCount >= limit)
    {
        auto retryAfter = chrono::duration_cast<chrono::seconds>(
            client.winStart + winDuration - currTime
        ).count();

        return {0, 0, (int)retryAfter};
    }

    client.reqCount++;

    return {1, limit - client.reqCount, 0};
}

int fixedWindowLimiter::getLimit() const
{
    return limit;
}