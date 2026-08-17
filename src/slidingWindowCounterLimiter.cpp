#include "slidingWindowCounterLimiter.h"

slidingWindowCounterLimiter::slidingWindowCounterLimiter(int limit,chrono::seconds winDuration){
    this->limit = limit;
    this->winDuration = winDuration;
}

bool slidingWindowCounterLimiter::allow(const string& clientId,chrono::steady_clock::time_point currTime){
    lock_guard<mutex> lock(mtx);
    auto it = clients.find(clientId);

    if(it == clients.end()){
        clients[clientId] = {0,1,currTime};
        return 1;
    }

    clientState& client = it->second;

    auto elapsed = currTime-client.winStart;

    //time diff b/w the previous window and the current reponse
    if(elapsed >= winDuration){
        if(elapsed >= winDuration*2){
            client.prevCount=0;
        }
        else{
            client.prevCount=client.currCount;
        }

        client.currCount=0;
        client.winStart+=winDuration;
    }

    double progress = (double)chrono::duration_cast<chrono::milliseconds>(currTime-client.winStart).count()/(double)chrono::duration_cast<chrono::milliseconds>(winDuration).count();

    double estimatedCount = client.prevCount*(1-progress)+client.currCount;
    
    if(estimatedCount >= limit){
        return 0;
    }

    client.currCount++;
    return 1;
}