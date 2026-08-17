#include <cassert>
#include <chrono>
#include <iostream>

#include "tokenBucketLimiter.h"

using namespace std;

int main(){
    using Clock = chrono::steady_clock;

    {
        tokenBucketLimiter limiter(3,1);
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start).allowed);

        assert(!limiter.allow("clientA",start).allowed);
    }

    {
        tokenBucketLimiter limiter(3,1);
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start).allowed);

        assert(!limiter.allow("clientA",start+chrono::milliseconds(500)).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(1)).allowed);
        assert(!limiter.allow("clientA",start+chrono::seconds(1)).allowed);
    }

    {
        tokenBucketLimiter limiter(3,1);
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start).allowed);

        assert(limiter.allow("clientB",start).allowed);
        assert(limiter.allow("clientB",start).allowed);
        assert(limiter.allow("clientB",start).allowed);

        assert(!limiter.allow("clientA",start).allowed);
        assert(!limiter.allow("clientB",start).allowed);
    }

    {
        tokenBucketLimiter limiter(5,2);
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start).allowed);

        assert(!limiter.allow("clientA",start).allowed);

        assert(limiter.allow("clientA",start+chrono::milliseconds(500)).allowed);
        assert(!limiter.allow("clientA",start+chrono::milliseconds(500)).allowed);
    }

    {
        tokenBucketLimiter limiter(3,1);
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(10)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(10)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(10)).allowed);

        assert(!limiter.allow("clientA",start+chrono::seconds(10)).allowed);
    }

    {
        tokenBucketLimiter limiter(3,1);
        auto start = Clock::now();

        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start).allowed);
        assert(limiter.allow("clientA",start).allowed);

        assert(limiter.allow("clientA",start+chrono::seconds(1)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(2)).allowed);
        assert(limiter.allow("clientA",start+chrono::seconds(3)).allowed);

        assert(!limiter.allow("clientA",start+chrono::seconds(3)).allowed);
    }

    cout<<"All token bucket tests passed"<<endl;

    return 0;
}