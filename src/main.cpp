#include "httpServer.h"

using namespace std;

int main()
{
    // Token bucket with capacity=10, refillRate=1.0 token/sec, connecting to redis on 127.0.0.1:6379
    HttpServer server(10, 1.0, "127.0.0.1", 6379);

    server.start("0.0.0.0", 8080);

    return 0;
}