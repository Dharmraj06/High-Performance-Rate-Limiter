#include <cassert>
#include <chrono>
#include <iostream>

#include "slidingWindowCounterLimiter.h"

using namespace std;

int main(){
    using Clock = chrono::steady_clock;

    {
        slidingWindowCounterLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start+chrono::seconds(1)));
        assert(limiter.allow("clientA",start+chrono::seconds(2)));
        assert(!limiter.allow("clientA",start+chrono::seconds(3)));
    }

    {
        slidingWindowCounterLimiter limiter(5,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start+chrono::seconds(1)));
        assert(limiter.allow("clientA",start+chrono::seconds(2)));
        assert(limiter.allow("clientA",start+chrono::seconds(3)));
        assert(limiter.allow("clientA",start+chrono::seconds(4)));

        assert(!limiter.allow("clientA",start+chrono::seconds(5)));

        assert(limiter.allow("clientA",start+chrono::seconds(10)));
    }

    {
        slidingWindowCounterLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start+chrono::seconds(1)));
        assert(limiter.allow("clientA",start+chrono::seconds(2)));

        assert(!limiter.allow("clientA",start+chrono::seconds(3)));

        assert(limiter.allow("clientA",start+chrono::seconds(21)));
        assert(limiter.allow("clientA",start+chrono::seconds(21)));
        assert(limiter.allow("clientA",start+chrono::seconds(21)));
        assert(!limiter.allow("clientA",start+chrono::seconds(21)));
    }

    {
        slidingWindowCounterLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start+chrono::seconds(1)));
        assert(limiter.allow("clientA",start+chrono::seconds(2)));

        assert(limiter.allow("clientB",start));
        assert(limiter.allow("clientB",start+chrono::seconds(1)));
        assert(limiter.allow("clientB",start+chrono::seconds(2)));

        assert(!limiter.allow("clientA",start+chrono::seconds(3)));
        assert(!limiter.allow("clientB",start+chrono::seconds(3)));
    }

    {
        slidingWindowCounterLimiter limiter(2,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start));
        assert(!limiter.allow("clientA",start));
        assert(!limiter.allow("clientA",start+chrono::seconds(5)));

        assert(limiter.allow("clientA",start+chrono::seconds(10)));
    }

    {
        slidingWindowCounterLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start+chrono::seconds(1)));
        assert(limiter.allow("clientA",start+chrono::seconds(2)));

        assert(!limiter.allow("clientA",start+chrono::seconds(10)));

        assert(limiter.allow("clientA",start+chrono::seconds(15)));
    }

    {
        slidingWindowCounterLimiter limiter(5,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start+chrono::seconds(2)));
        assert(limiter.allow("clientA",start+chrono::seconds(4)));
        assert(limiter.allow("clientA",start+chrono::seconds(6)));
        assert(limiter.allow("clientA",start+chrono::seconds(8)));

        assert(!limiter.allow("clientA",start+chrono::seconds(9)));
        assert(!limiter.allow("clientA",start+chrono::seconds(10)));
    }

    cout<<"All sliding window counter tests passed"<<endl;

    return 0;
}