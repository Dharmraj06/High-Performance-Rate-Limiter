#pragma once

#include <chrono>
#include <string>
#include <unordered_map>
#include <mutex>

using namespace std;

class fixedWindowLimiter
{
private:
    mutex mtx;
    struct clientState
    {
        int reqCount;
        chrono::steady_clock::time_point winStart;
    };

    int limit;
    chrono::seconds winDuration;
    unordered_map<string, clientState> clients;

public:
    fixedWindowLimiter(int limit, chrono::seconds winDuration);

    bool allow(const string &clientId, chrono::steady_clock::time_point currTime);
};