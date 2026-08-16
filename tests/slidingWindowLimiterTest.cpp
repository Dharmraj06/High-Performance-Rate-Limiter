#include <cassert>
#include <chrono>
#include <iostream>

#include "slidingWindowLimiter.h"

using namespace std;

int main(){
    using Clock = chrono::steady_clock;

    {
        slidingWindowLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start+chrono::seconds(1)));
        assert(limiter.allow("clientA",start+chrono::seconds(2)));

        assert(!limiter.allow("clientA",start+chrono::seconds(3)));
        assert(!limiter.allow("clientA",start+chrono::seconds(4)));
        assert(!limiter.allow("clientA",start+chrono::seconds(5)));
        assert(!limiter.allow("clientA",start+chrono::seconds(9)));

        assert(limiter.allow("clientA",start+chrono::seconds(10)));
        assert(!limiter.allow("clientA",start+chrono::seconds(10)));

        assert(limiter.allow("clientA",start+chrono::seconds(11)));
        assert(!limiter.allow("clientA",start+chrono::seconds(11)));

        assert(limiter.allow("clientA",start+chrono::seconds(12)));
        assert(!limiter.allow("clientA",start+chrono::seconds(12)));
    }

    {
        slidingWindowLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start+chrono::seconds(1)));
        assert(limiter.allow("clientA",start+chrono::seconds(2)));

        assert(!limiter.allow("clientA",start+chrono::seconds(3)));
        assert(!limiter.allow("clientA",start+chrono::seconds(4)));

        assert(limiter.allow("clientA",start+chrono::seconds(10)));

        assert(!limiter.allow("clientA",start+chrono::seconds(10)));
    }

    {
        slidingWindowLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start+chrono::seconds(1)));
        assert(limiter.allow("clientA",start+chrono::seconds(2)));

        assert(limiter.allow("clientB",start));
        assert(limiter.allow("clientB",start+chrono::seconds(1)));
        assert(limiter.allow("clientB",start+chrono::seconds(2)));

        assert(!limiter.allow("clientA",start+chrono::seconds(3)));
        assert(!limiter.allow("clientB",start+chrono::seconds(3)));

        assert(limiter.allow("clientC",start));
        assert(limiter.allow("clientC",start+chrono::seconds(1)));
        assert(limiter.allow("clientC",start+chrono::seconds(2)));
        assert(!limiter.allow("clientC",start+chrono::seconds(3)));
    }

    {
        slidingWindowLimiter limiter(1,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(!limiter.allow("clientA",start+chrono::seconds(1)));
        assert(!limiter.allow("clientA",start+chrono::seconds(9)));

        assert(limiter.allow("clientA",start+chrono::seconds(10)));
        assert(!limiter.allow("clientA",start+chrono::seconds(11)));

        assert(limiter.allow("clientA",start+chrono::seconds(20)));
    }

    {
        slidingWindowLimiter limiter(5,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start+chrono::seconds(1)));
        assert(limiter.allow("clientA",start+chrono::seconds(2)));
        assert(limiter.allow("clientA",start+chrono::seconds(3)));
        assert(limiter.allow("clientA",start+chrono::seconds(4)));

        assert(!limiter.allow("clientA",start+chrono::seconds(5)));
        assert(!limiter.allow("clientA",start+chrono::seconds(9)));

        assert(limiter.allow("clientA",start+chrono::seconds(10)));
        assert(!limiter.allow("clientA",start+chrono::seconds(10)));

        assert(limiter.allow("clientA",start+chrono::seconds(11)));
        assert(!limiter.allow("clientA",start+chrono::seconds(11)));
    }

    {
        slidingWindowLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start+chrono::seconds(2)));
        assert(limiter.allow("clientA",start+chrono::seconds(4)));

        assert(!limiter.allow("clientA",start+chrono::seconds(5)));

        assert(limiter.allow("clientA",start+chrono::seconds(12)));
        assert(!limiter.allow("clientA",start+chrono::seconds(12)));

        assert(limiter.allow("clientA",start+chrono::seconds(14)));
        assert(!limiter.allow("clientA",start+chrono::seconds(14)));

        assert(limiter.allow("clientA",start+chrono::seconds(15)));
        assert(!limiter.allow("clientA",start+chrono::seconds(15)));
    }

    {
        slidingWindowLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start+chrono::seconds(1)));
        assert(limiter.allow("clientA",start+chrono::seconds(2)));

        assert(limiter.allow("clientB",start));
        assert(limiter.allow("clientB",start+chrono::seconds(1)));
        assert(limiter.allow("clientB",start+chrono::seconds(2)));

        assert(limiter.allow("clientC",start));
        assert(limiter.allow("clientC",start+chrono::seconds(1)));
        assert(limiter.allow("clientC",start+chrono::seconds(2)));

        assert(!limiter.allow("clientA",start+chrono::seconds(3)));
        assert(!limiter.allow("clientB",start+chrono::seconds(3)));
        assert(!limiter.allow("clientC",start+chrono::seconds(3)));

        assert(limiter.allow("clientA",start+chrono::seconds(10)));
        assert(limiter.allow("clientB",start+chrono::seconds(10)));
        assert(limiter.allow("clientC",start+chrono::seconds(10)));
    }

    cout<<"All sliding window tests passed"<<endl;

    return 0;
}