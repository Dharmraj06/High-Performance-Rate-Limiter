#pragma once

#include <chrono>
#include<bits/stdc++.h>

#include "rateLimitResult.h"

struct redisContext;

using namespace std;
using namespace chrono;

class redisTokenBucketLimiter
{
private:
    //redis server info 
    string host;
    int port;
    seconds ttl;
    string luaScript;

    double capacity;
    double refillRate;

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
