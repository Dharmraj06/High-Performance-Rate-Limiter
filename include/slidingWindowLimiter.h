#pragma once

#include <chrono>
#include <queue>
#include <string>
#include <unordered_map>
#include <mutex>

#include "rateLimitResult.h"

using namespace std;
using namespace chrono;

class slidingWindowLimiter
{
private:
    mutex mtx;
    struct clientState
    {
        queue<steady_clock::time_point> reqTime;
    };

    int limit;
    seconds winDuration;
    unordered_map<string,clientState> clients;

public:

    slidingWindowLimiter(int limit,seconds winDuration);

    RateLimitResult allow(const string& clientId,steady_clock::time_point currTime);
};