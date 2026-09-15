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
    int reqsPerThread = 1000;

    atomic<int> allowed(0);

    vector<thread> threads;

    auto currTime = chrono::steady_clock::now();

    for(int i = 0;i<threadCnt;i++){
        threads.emplace_back([&](){
            for(int j = 0;j<reqsPerThread;j++){
                
               if(limiter.allow("clientA",currTime).allowed){
                    allowed++;
                }
            }
        });
    }

    for(auto& t : threads){
        t.join();
    }

    cout<<"allowed req's: "<<allowed<<endl;
    cout<<"expected max: 100"<<endl;

    if(allowed <= 100){
        cout<<"concurrency test passed"<<endl;
    }
    else{
        cout<<"concurrency test failed"<<endl;
    }

    return 0;
}