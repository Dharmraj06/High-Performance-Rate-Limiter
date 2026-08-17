#pragma once

#include <chrono>
#include "fixedWindowLimiter.h"
#include "httplib.h"

using namespace std;

class HttpServer
{
private:
    httplib::Server server;
    fixedWindowLimiter limiter;

public:
    HttpServer(int limit,chrono::seconds winDuration);

    void start(const string &host,int port);
};