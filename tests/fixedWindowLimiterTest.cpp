#include <cassert>
#include <chrono>
#include <iostream>

#include "fixedWindowLimiter.h"

using namespace std;

int main(){
    using Clock = chrono::steady_clock;

    fixedWindowLimiter limiter(3, chrono::seconds(10));

    auto start = Clock::now();

    assert(limiter.allow("clientA", start));
    assert(limiter.allow("clientA", start + chrono::seconds(1)));
    assert(limiter.allow("clientA", start + chrono::seconds(2)));
    assert(!limiter.allow("clientA", start + chrono::seconds(3)));

    assert(limiter.allow("clientA", start + chrono::seconds(10)));
    
    assert(limiter.allow("clientB", start));
    assert(limiter.allow("clientB", start + chrono::seconds(1)));
    assert(limiter.allow("clientB", start + chrono::seconds(2)));
    assert(!limiter.allow("clientB", start + chrono::seconds(3)));

    cout << "all tests passed"<<endl;

    return 0;
}