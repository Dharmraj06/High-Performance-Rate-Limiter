#include "slidingWindowLimiter.h"

slidingWindowLimiter::slidingWindowLimiter(int limit, seconds winDuration)
{
    this->limit = limit;
    this->winDuration = winDuration;
    this->deleteInterval = max(seconds(10), winDuration);
}

size_t slidingWindowLimiter::getShard(const string &clientId) const
{
    return hash<string>{}(clientId) % numShards;
}

void slidingWindowLimiter::deleteShard(Shard &shard, steady_clock::time_point currTime)
{
    for (auto it = shard.clients.begin(); it != shard.clients.end(); )
    {
        while (!it->second.reqTime.empty() && (currTime - it->second.reqTime.front() >= winDuration))
        {
            it->second.reqTime.pop();
        }

        if (it->second.reqTime.empty() && (currTime - it->second.lastAccess >= winDuration))
        {
            it = shard.clients.erase(it);
        }
        else
        {
            ++it;
        }
    }
}

RateLimitResult slidingWindowLimiter::allow(const string &clientId, steady_clock::time_point currTime)
{
    Shard &shard = shards[getShard(clientId)];
    lock_guard<mutex> lock(shard.mtx);

    if (shard.lastDelete.time_since_epoch().count() == 0)
    {
        shard.lastDelete = currTime;
    }
    else if (currTime - shard.lastDelete >= deleteInterval)
    {
        deleteShard(shard, currTime);
        shard.lastDelete = currTime;
    }

    auto it = shard.clients.find(clientId);

    if (it == shard.clients.end())
    {
        clientState state;
        state.reqTime.push(currTime);
        state.lastAccess = currTime;
        shard.clients[clientId] = state;
        return {1, limit - 1, 0};
    }

    clientState &timeWindow = it->second;
    timeWindow.lastAccess = currTime;

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

void slidingWindowLimiter::deleteOldClients(steady_clock::time_point currTime)
{
    for (int i = 0; i < numShards; i++)
    {
        lock_guard<mutex> lock(shards[i].mtx);
        deleteShard(shards[i], currTime);
        shards[i].lastDelete = currTime;
    }
}

int slidingWindowLimiter::getClientCount() const
{
    int count = 0;
    for (int i = 0; i < numShards; i++)
    {
        lock_guard<mutex> lock(const_cast<mutex&>(shards[i].mtx));
        count += (int)shards[i].clients.size();
    }
    return count;
}