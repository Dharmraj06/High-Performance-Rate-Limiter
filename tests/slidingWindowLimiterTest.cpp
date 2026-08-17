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

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(2)).allowed);

        assert(!limiter.allow("clientA",start+chrono::seconds(3)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(4)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(5)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(9)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(10)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(10)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(11)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(11)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(12)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(12)).allowed);
    }

    {
        slidingWindowLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(2)).allowed);

        assert(!limiter.allow("clientA",start+chrono::seconds(3)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(4)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(10)).allowed);

        assert(!limiter.allow("clientA",start+chrono::seconds(10)).allowed);
    }

    {
        slidingWindowLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(2)).allowed);

        assert(limiter.allow("clientB",start).allowed);
        assert(limiter.allow("clientB",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientB",start+chrono::seconds(2)).allowed);

        assert(!limiter.allow("clientA",start+chrono::seconds(3)).allowed);
        assert(!limiter.allow("clientB",start+chrono::seconds(3)).allowed);

        assert(limiter.allow("clientC",start).allowed);
        assert(limiter.allow("clientC",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientC",start+chrono::seconds(2)).allowed);
        assert(!limiter.allow("clientC",start+chrono::seconds(3)).allowed);
    }

    {
        slidingWindowLimiter limiter(1,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(1)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(9)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(10)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(11)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(20)).allowed);
    }

    {
        slidingWindowLimiter limiter(5,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(2)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(3)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(4)).allowed);

        assert(!limiter.allow("clientA",start+chrono::seconds(5)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(9)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(10)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(10)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(11)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(11)).allowed);
    }

    {
        slidingWindowLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(2)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(4)).allowed);

        assert(!limiter.allow("clientA",start+chrono::seconds(5)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(12)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(12)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(14)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(14)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(15)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(15)).allowed);
    }

    {
        slidingWindowLimiter limiter(3,chrono::seconds(10));
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(2)).allowed);

        assert(limiter.allow("clientB",start).allowed);
        assert(limiter.allow("clientB",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientB",start+chrono::seconds(2)).allowed);

        assert(limiter.allow("clientC",start).allowed);
        assert(limiter.allow("clientC",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientC",start+chrono::seconds(2)).allowed);

        assert(!limiter.allow("clientA",start+chrono::seconds(3)).allowed);
        assert(!limiter.allow("clientB",start+chrono::seconds(3)).allowed);
        assert(!limiter.allow("clientC",start+chrono::seconds(3)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(10)).allowed);
        assert(limiter.allow("clientB",start+chrono::seconds(10)).allowed);
        assert(limiter.allow("clientC",start+chrono::seconds(10)).allowed);
    }

    cout<<"All sliding window tests passed"<<endl;

    return 0;
}