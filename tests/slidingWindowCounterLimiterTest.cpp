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

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(2)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(3)).allowed);
    }

    {
        slidingWindowCounterLimiter limiter(5,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(2)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(3)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(4)).allowed);

        assert(!limiter.allow("clientA",start+chrono::seconds(5)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(10)).allowed);
    }

    {
        slidingWindowCounterLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(2)).allowed);

        assert(!limiter.allow("clientA",start+chrono::seconds(3)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(21)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(21)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(21)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(21)).allowed);
    }

    {
        slidingWindowCounterLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(2)).allowed);

        assert(limiter.allow("clientB",start).allowed);
        assert(limiter.allow("clientB",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientB",start+chrono::seconds(2)).allowed);

        assert(!limiter.allow("clientA",start+chrono::seconds(3)).allowed);
        assert(!limiter.allow("clientB",start+chrono::seconds(3)).allowed);
    }

    {
        slidingWindowCounterLimiter limiter(2,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start).allowed);
        assert(!limiter.allow("clientA",start).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(5)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(10)).allowed);
    }

    {
        slidingWindowCounterLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(2)).allowed);

        assert(!limiter.allow("clientA",start+chrono::seconds(10)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(15)).allowed);
    }

    {
        slidingWindowCounterLimiter limiter(5,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(2)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(4)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(6)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(8)).allowed);

        assert(!limiter.allow("clientA",start+chrono::seconds(9)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(10)).allowed);
    }

    cout<<"All sliding window counter tests passed"<<endl;

    return 0;
}