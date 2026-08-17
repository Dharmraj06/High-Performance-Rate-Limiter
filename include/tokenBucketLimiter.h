#pragma once

#include <chrono>
#include <string>
#include <unordered_map>
#include <mutex>
#include <cmath>

#include "rateLimitResult.h"

using namespace std;
using namespace chrono;

class tokenBucketLimiter
{
private:
    mutex mtx;
    struct clientState
    {
        double tokens;
        steady_clock::time_point lastRefill;
    };

    double capacity;
    double refillRate;
    unordered_map<string,clientState> clients;

public:

    tokenBucketLimiter(double capacity,double refillRate);

    RateLimitResult allow(const string& clientId,steady_clock::time_point currTime);
};