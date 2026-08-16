#pragma once

#include <chrono>
#include <queue>
#include <string>
#include <unordered_map>

using namespace std;

class slidingWindowLimiter
{
private:
    struct clientState
    {
        queue<chrono::steady_clock::time_point> reqTime;
    };

    int limit;
    chrono::seconds winDuration;
    unordered_map<string,clientState> clients;

public:

    slidingWindowLimiter(int limit,chrono::seconds winDuration);

    bool allow(const string& clientId,chrono::steady_clock::time_point currTime);
};