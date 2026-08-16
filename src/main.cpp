#include <cassert>
#include <chrono>
#include <iostream>

#include "fixedWindowLimiter.h"

using namespace std;

int main(){
    using Clock = chrono::steady_clock;

    fixedWindowLimiter limiter(3,chrono::seconds(10));

    auto start = Clock::now();

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

    cout<<"All tests passed"<<endl;

    return 0;
}