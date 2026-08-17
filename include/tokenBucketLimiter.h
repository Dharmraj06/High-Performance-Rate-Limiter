#pragma once

#include <chrono>
#include <string>
#include <unordered_map>
#include <mutex>

using namespace std;

class tokenBucketLimiter
{
private:
    mutex mtx;
    struct clientState
    {
        double tokens;
        chrono::steady_clock::time_point lastRefill;
    };

    double capacity;
    double refillRate;
    unordered_map<string,clientState> clients;

public:

    tokenBucketLimiter(double capacity,double refillRate);

    bool allow(const string& clientId,chrono::steady_clock::time_point currTime);
};