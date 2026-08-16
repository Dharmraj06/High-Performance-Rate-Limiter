#include "fixedWindowLimiter.h"

fixedWindowLimiter::fixedWindowLimiter(int limit, chrono::seconds winDuration)
{
    this->limit = limit;
    this->winDuration = winDuration;
}

bool fixedWindowLimiter::allow(const string &clientId,chrono::steady_clock::time_point currTime){
    auto it = clients.find(clientId);

    if (it == clients.end())
    {
        clients[clientId] = {1, currTime};
        return 1;
    }

    clientState &client = it->second;

    if (currTime - client.winStart >= winDuration)
    {
        client.reqCount = 1;
        client.winStart = currTime;
        return 1;
    }

    if (client.reqCount >= limit)
    {
        return 0;
    }

    client.reqCount++;
    return 1;
}