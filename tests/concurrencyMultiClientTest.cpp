#include <atomic>
#include <chrono>
#include <iostream>
#include <thread>
#include <vector>

#include "slidingWindowCounterLimiter.h"

using namespace std;

int main(){
    slidingWindowCounterLimiter limiter(100,chrono::seconds(10));

    int threadCnt = 10;
    int reqPerThread = 1000;

    atomic<int> allowed(0);

    vector<thread> threads;

    auto currTime = chrono::steady_clock::now();

    for(int i = 0;i<threadCnt;i++){
        threads.emplace_back([&,i](){
            string clientId = "client"+to_string(i);

            for(int j = 0;j<reqPerThread;j++){
                if(limiter.allow(clientId,currTime).allowed){
                    allowed++;
                }
            }
        });
    }

    for(auto& t : threads){
        t.join();
    }

    int expected = threadCnt*100;

    cout<<"allowed req's: "<<allowed<<endl;
    cout<<"expected req's: "<<expected<<endl;

    if(allowed == expected){
        cout<<"multi client concurrency test passed"<<endl;
    }
    else{
        cout<<"multi client concurrency test failed"<<endl;
    }

    return 0;
}