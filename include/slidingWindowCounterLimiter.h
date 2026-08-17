#pragma once

#include <chrono>
#include <string>
#include <unordered_map>
#include <mutex>

#include "rateLimitResult.h"

using namespace std;
using namespace chrono;

class slidingWindowCounterLimiter
{
private:
    mutex mtx;
    struct clientState
    {
        int prevCount;
        int currCount;
        steady_clock::time_point winStart;
    };

    int limit;
    seconds winDuration;
    unordered_map<string,clientState> clients;

public:
    slidingWindowCounterLimiter(int limit,seconds winDuration);

    RateLimitResult allow(const string &clientId,steady_clock::time_point currTime);
};