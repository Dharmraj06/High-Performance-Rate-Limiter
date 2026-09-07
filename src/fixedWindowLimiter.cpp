#include "fixedWindowLimiter.h"

fixedWindowLimiter::fixedWindowLimiter(int limit, chrono::seconds winDuration)
{
    this->limit = limit;
    this->winDuration = winDuration;
    this->deleteInterval = max(chrono::seconds(10), winDuration);
}

size_t fixedWindowLimiter::getShard(const string &clientId) const
{
    return hash<string>{}(clientId) % numShards; // hash has return value of size_t
}

void fixedWindowLimiter::deleteShard(Shard &shard, chrono::steady_clock::time_point currTime)
{
    for (auto it = shard.clients.begin(); it != shard.clients.end();)
    {
        if (currTime - it->second.lastAccess >= winDuration * 2)
        {
            it = shard.clients.erase(it);
        }
        else
        {
            it++;
        }
    }
}

RateLimitResult fixedWindowLimiter::allow(const string &clientId, chrono::steady_clock::time_point currTime)
{
    Shard &shard = shards[getShard(clientId)];
    lock_guard<mutex> lock(shard.mtx);

    if (shard.lastDelete.time_since_epoch().count() == 0)
    {
        shard.lastDelete = currTime;
        
    } else if (currTime - shard.lastDelete >= deleteInterval)
    {

        deleteShard(shard, currTime);
        shard.lastDelete = currTime;
    }

    auto it = shard.clients.find(clientId);

    if (it == shard.clients.end())
    {
        shard.clients[clientId] = {1, currTime, currTime};
        return {1, limit - 1, 0};
    }

    clientState &client = it->second;
    client.lastAccess = currTime;

    if (currTime - client.winStart >= winDuration)
    {
        client.reqCount = 1;
        client.winStart = currTime;

        return {1, limit - 1, 0};
    }

    if (client.reqCount >= limit)
    {
        auto retryAfter = chrono::duration_cast<chrono::seconds>(client.winStart + winDuration - currTime).count();

        return {0, 0, (int)retryAfter};
    }

    client.reqCount++;

    return {1, limit - client.reqCount, 0};
}

void fixedWindowLimiter::deleteOldClients(chrono::steady_clock::time_point currTime)
{
    for (int i = 0; i < numShards; i++)
    {
        lock_guard<mutex> lock(shards[i].mtx);

        deleteShard(shards[i], currTime);
        shards[i].lastDelete = currTime;
    }
}

int fixedWindowLimiter::getClientCount() const
{
    int count = 0;
    for (int i = 0; i < numShards; i++)
    {
        lock_guard<mutex> lock(const_cast<mutex &>(shards[i].mtx));
        count += shards[i].clients.size();
    }
    return count;
}

int fixedWindowLimiter::getLimit() const
{
    return limit;
}