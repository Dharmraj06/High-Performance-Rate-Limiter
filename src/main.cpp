#include <chrono>

#include "httpServer.h"

using namespace std;

int main()
{
    HttpServer server(10,chrono::seconds(10));

    server.start("0.0.0.0",8080);

    return 0;
}