#include "slidingWindowLimiter.h"

slidingWindowLimiter::slidingWindowLimiter(int limit,chrono::seconds winDuration){
    this->limit = limit;
    this->winDuration = winDuration;
}

bool slidingWindowLimiter::allow(const string& clientId,chrono::steady_clock::time_point currTime){
    auto it = clients.find(clientId);

    // new client
    if(it == clients.end()){
        clients[clientId].reqTime.push(currTime);
        return 1;
    }

    clientState& timeWindow = it->second;

    while(!timeWindow.reqTime.empty()&&currTime-timeWindow.reqTime.front() >= winDuration){
        timeWindow.reqTime.pop();
    }

    // over request
    if(timeWindow.reqTime.size() >= limit){
        return 0;
    }

    timeWindow.reqTime.push(currTime);
    return 1;
}