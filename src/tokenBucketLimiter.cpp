#include "tokenBucketLimiter.h"

tokenBucketLimiter::tokenBucketLimiter(double capacity,double refillRate){
    this->capacity = capacity;
    this->refillRate = refillRate;
}

bool tokenBucketLimiter::allow(const string& clientId,chrono::steady_clock::time_point currTime){
    lock_guard<mutex> lock(mtx);
    auto it = clients.find(clientId);

    // new client
    if(it == clients.end()){
        clients[clientId] = {capacity-1,currTime};
        return 1;
    }

    clientState& client = it->second;

    chrono::duration<double> elapsed = currTime-client.lastRefill;

    client.tokens += elapsed.count()*refillRate;

    if(client.tokens > capacity){
        client.tokens = capacity;
    }

    client.lastRefill = currTime;

    // no token
    if(client.tokens < 1){
        return 0;
    }

    client.tokens--;

    return 1;
}