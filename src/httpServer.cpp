#include "httpServer.h"

using namespace std;

using httplib::Request;
using httplib::Response;

HttpServer::HttpServer(double capacity, double refillRate, const string &redisHost, int redisPort)
    : limiter(capacity, refillRate, redisHost, redisPort)
{
    server.Get("/health", [](const Request &req, Response &res)
      { res.set_content("{\"status\":\"ok\"}", "application/json"); });

    server.Get("/unlimited", [](const Request &req, Response &res)
        { res.set_content("{\"message\":\"Request received\"}", "application/json"); });

    server.Get("/limited", [this](const Request &req, Response &res)
    {
        string clientIp = req.remote_addr;

        RateLimitResult result = limiter.allow(clientIp);

        if (result.allowed){
            res.status = 200;

            res.set_header("X-RateLimit-Remaining", to_string(result.remaining));

            res.set_content(
                "{\"message\":\"Request allowed\"}",
                "application/json");

        }
        else {
            res.status = 429;

            res.set_header("Retry-After", to_string(result.retryAfter));

            res.set_header("X-RateLimit-Remaining", "0");

            res.set_content(
                "{\"message\":\"Too many requests\"}",
                "application/json"
            );
        }
    });
}

void HttpServer::start(const string &host, int port)
{
    server.listen(host.c_str(), port);
}