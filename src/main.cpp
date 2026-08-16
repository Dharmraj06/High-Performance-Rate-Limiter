#include <cassert>
#include <chrono>
#include <iostream>

#include "fixedWindowLimiter.h"
#include "slidingWindowLimiter.h"

using namespace std;

int main(){
    using Clock = chrono::steady_clock;

    fixedWindowLimiter limiter(3,chrono::seconds(10));
    slidingWindowLimiter slidingLimiter(3,chrono::seconds(10));

    auto start = Clock::now();
     cout<<"Fixed Window:"<<endl;
    assert(limiter.allow("clientA",start));
    assert(limiter.allow("clientA",start+chrono::seconds(1)));
    assert(limiter.allow("clientA",start+chrono::seconds(2)));
    assert(!limiter.allow("clientA",start+chrono::seconds(3)));
    assert(!limiter.allow("clientA",start+chrono::seconds(4)));

    assert(limiter.allow("clientA",start+chrono::seconds(10)));
    assert(limiter.allow("clientA",start+chrono::seconds(11)));
    assert(limiter.allow("clientA",start+chrono::seconds(12)));
    assert(!limiter.allow("clientA",start+chrono::seconds(13)));

    assert(limiter.allow("clientB",start));
    assert(limiter.allow("clientB",start+chrono::seconds(1)));
    assert(limiter.allow("clientB",start+chrono::seconds(2)));
    assert(!limiter.allow("clientB",start+chrono::seconds(3)));

    assert(limiter.allow("clientC",start));
    assert(limiter.allow("clientC",start+chrono::seconds(10)));
    cout<<endl;

    cout<<"Sliding Window:"<<endl;

    cout<<slidingLimiter.allow("clientA",start)<<endl;
    cout<<slidingLimiter.allow("clientA",start+chrono::seconds(1))<<endl;
    cout<<slidingLimiter.allow("clientA",start+chrono::seconds(2))<<endl;
    cout<<slidingLimiter.allow("clientA",start+chrono::seconds(3))<<endl;
    cout<<slidingLimiter.allow("clientA",start+chrono::seconds(10))<<endl;
    cout<<"All tests passed"<<endl;

    return 0;
}