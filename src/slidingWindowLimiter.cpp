#include "slidingWindowLimiter.h"

slidingWindowLimiter::slidingWindowLimiter(int limit, seconds winDuration)
{
    this->limit = limit;
    this->winDuration = winDuration;
}

size_t slidingWindowLimiter::getShard(const string &clientId) const
{
    return hash<string>{}(clientId) % numShards;
}

RateLimitResult slidingWindowLimiter::allow(const string &clientId, steady_clock::time_point currTime)
{
    Shard &shard = shards[getShard(clientId)];
    lock_guard<mutex> lock(shard.mtx);

    auto it = shard.clients.find(clientId);

    if (it == shard.clients.end())
    {
        shard.clients[clientId].reqTime.push(currTime);
        return {1, limit - 1, 0};
    }

    clientState &timeWindow = it->second;

    while (!timeWindow.reqTime.empty() && (currTime - timeWindow.reqTime.front() >= winDuration))
    {
        timeWindow.reqTime.pop();
    }

    if (timeWindow.reqTime.size() >= limit)
    {
        auto retryAfter = duration_cast<seconds>(
            timeWindow.reqTime.front() + winDuration - currTime
        ).count();

        return {0, 0, (int)retryAfter};
    }

    timeWindow.reqTime.push(currTime);

    return {1, limit - (int)timeWindow.reqTime.size(), 0};
}