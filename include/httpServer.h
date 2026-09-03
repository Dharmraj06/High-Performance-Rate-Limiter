#pragma once

#include <string>
#include "redisTokenBucketLimiter.h"
#include "httplib.h"

using namespace std;

class HttpServer
{
private:
    httplib::Server server;
    redisTokenBucketLimiter limiter;

public:
    HttpServer(double capacity, double refillRate, const string &redisHost = "127.0.0.1", int redisPort = 6379);

    void start(const string &host, int port);
};