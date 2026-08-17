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
        threads.emplace_back([&](){
            for(int j = 0;j<requestsPerThread;j++){
               if(limiter.allow("clientA",currTime).allowed){
                    allowed++;
                }
            }
        });
    }

    for(auto& t : threads){
        t.join();
    }

    cout<<"Allowed requests: "<<allowed<<endl;
    cout<<"Expected maximum: 100"<<endl;

    if(allowed <= 100){
        cout<<"Concurrency test passed"<<endl;
    }
    else{
        cout<<"Concurrency test failed"<<endl;
    }

    return 0;
}