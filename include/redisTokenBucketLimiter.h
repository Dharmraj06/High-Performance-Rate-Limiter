#pragma once

#include <chrono>
#include <string>
#include <mutex>

#include "rateLimitResult.h"

struct redisContext;

using namespace std;
using namespace chrono;

class redisTokenBucketLimiter
{
private:
    string host;
    int port;
    double capacity;
    double refillRate;
    seconds ttl;
    string luaScript;

    mutex mtx;
    redisContext *ctx;

    bool connect();
    void disconnect();

public:
    redisTokenBucketLimiter(double capacity, double refillRate, const string &host = "127.0.0.1", int port = 6379);
    ~redisTokenBucketLimiter();

    RateLimitResult allow(const string &clientId);

    bool isConnected();
};
