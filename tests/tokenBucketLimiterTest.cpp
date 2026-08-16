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

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start));

        assert(!limiter.allow("clientA",start));
    }

    {
        tokenBucketLimiter limiter(3,1);
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start));

        assert(!limiter.allow("clientA",start+chrono::milliseconds(500)));

        assert(limiter.allow("clientA",start+chrono::seconds(1)));
        assert(!limiter.allow("clientA",start+chrono::seconds(1)));
    }

    {
        tokenBucketLimiter limiter(3,1);
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start));

        assert(limiter.allow("clientB",start));
        assert(limiter.allow("clientB",start));
        assert(limiter.allow("clientB",start));

        assert(!limiter.allow("clientA",start));
        assert(!limiter.allow("clientB",start));
    }

    {
        tokenBucketLimiter limiter(5,2);
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start));

        assert(!limiter.allow("clientA",start));

        assert(limiter.allow("clientA",start+chrono::milliseconds(500)));
        assert(!limiter.allow("clientA",start+chrono::milliseconds(500)));
    }

    {
        tokenBucketLimiter limiter(3,1);
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start));

        assert(limiter.allow("clientA",start+chrono::seconds(10)));
        assert(limiter.allow("clientA",start+chrono::seconds(10)));
        assert(limiter.allow("clientA",start+chrono::seconds(10)));

        assert(!limiter.allow("clientA",start+chrono::seconds(10)));
    }

    {
        tokenBucketLimiter limiter(3,1);
        auto start = Clock::now();

        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start));
        assert(limiter.allow("clientA",start));

        assert(limiter.allow("clientA",start+chrono::seconds(1)));
        assert(limiter.allow("clientA",start+chrono::seconds(2)));
        assert(limiter.allow("clientA",start+chrono::seconds(3)));

        assert(!limiter.allow("clientA",start+chrono::seconds(3)));
    }

    cout<<"All token bucket tests passed"<<endl;

    return 0;
}