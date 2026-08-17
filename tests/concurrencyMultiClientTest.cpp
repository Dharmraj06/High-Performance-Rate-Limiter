#include <atomic>
#include <chrono>
#include <iostream>
#include <thread>
#include <vector>

#include "slidingWindowCounterLimiter.h"

using namespace std;

int main(){
    slidingWindowCounterLimiter limiter(100,chrono::seconds(10));

    int threadCount = 10;
    int requestsPerThread = 1000;

    atomic<int> allowed(0);

    vector<thread> threads;

    auto currTime = chrono::steady_clock::now();

    for(int i = 0;i<threadCount;i++){
        threads.emplace_back([&,i](){
            string clientId = "client"+to_string(i);

            for(int j = 0;j<requestsPerThread;j++){
                if(limiter.allow(clientId,currTime).allowed){
                    allowed++;
                }
            }
        });
    }

    for(auto& t : threads){
        t.join();
    }

    int expected = threadCount*100;

    cout<<"Allowed requests: "<<allowed<<endl;
    cout<<"Expected requests: "<<expected<<endl;

    if(allowed == expected){
        cout<<"Multi client concurrency test passed"<<endl;
    }
    else{
        cout<<"Multi client concurrency test failed"<<endl;
    }

    return 0;
}