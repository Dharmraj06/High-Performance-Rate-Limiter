#include "slidingWindowLimiter.h"

slidingWindowLimiter::slidingWindowLimiter(int limit,seconds winDuration){
    this->limit = limit;
    this->winDuration = winDuration;
}

RateLimitResult slidingWindowLimiter::allow(const string& clientId,steady_clock::time_point currTime){
    lock_guard<mutex> lock(mtx);
    auto it = clients.find(clientId);

    if(it == clients.end()){
        clients[clientId].reqTime.push(currTime);
        return {1,limit-1,0};
    }

    clientState& timeWindow = it->second;

    while(!timeWindow.reqTime.empty()&&currTime-timeWindow.reqTime.front() >= winDuration){
        timeWindow.reqTime.pop();
    }

    if(timeWindow.reqTime.size() >= limit){
        auto retryAfter=duration_cast<seconds>(
            timeWindow.reqTime.front()+winDuration-currTime
        ).count();

        return {0,0,(int)retryAfter};
    }

    timeWindow.reqTime.push(currTime);

    return {1,limit-(int)timeWindow.reqTime.size(),0};
}