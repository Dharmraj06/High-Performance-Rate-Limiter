#include "httpServer.h"

using namespace std;

using httplib::Request;
using httplib::Response;

HttpServer::HttpServer(int limit,chrono::seconds winDuration)
    : limiter(limit,winDuration)
{
    server.Get("/health",[](const Request &req,Response &res) {
        res.set_content("{\"status\":\"ok\"}","application/json");
    });

    server.Get("/unlimited",[](const Request &req,Response &res) {
        res.set_content("{\"message\":\"Request received\"}","application/json");
    });

    server.Get("/limited",[this](const Request &req,Response &res) {
        string clientIp=req.remote_addr;

        bool allowed=limiter.allow(clientIp,chrono::steady_clock::now());

        if(allowed){
            res.set_content("{\"message\":\"Request allowed\"}","application/json");
        }
        else{
            res.status=429;
            res.set_content("{\"message\":\"Too many requests\"}","application/json");
        }
    });
}

void HttpServer::start(const string &host,int port)
{
    server.listen(host.c_str(),port);
}