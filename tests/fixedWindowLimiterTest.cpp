#include <cassert>
#include <chrono>
#include <iostream>

#include "fixedWindowLimiter.h"

using namespace std;

int main()
{
    using Clock = chrono::steady_clock;

    fixedWindowLimiter limiter(3, chrono::seconds(10));

    auto start = Clock::now();

    assert(limiter.allow("clientA", start).allowed);
    assert(limiter.allow("clientA", start + chrono::seconds(1)).allowed);
    assert(limiter.allow("clientA", start + chrono::seconds(2)).allowed);
    assert(!limiter.allow("clientA", start + chrono::seconds(3)).allowed);

    assert(limiter.allow("clientA", start + chrono::seconds(10)).allowed);
    assert(limiter.allow("clientA", start + chrono::seconds(11)).allowed);
    assert(limiter.allow("clientA", start + chrono::seconds(12)).allowed);
    assert(!limiter.allow("clientA", start + chrono::seconds(13)).allowed);

    assert(limiter.allow("clientB", start).allowed);
    assert(limiter.allow("clientB", start + chrono::seconds(1)).allowed);
    assert(limiter.allow("clientB", start + chrono::seconds(2)).allowed);
    assert(!limiter.allow("clientB", start + chrono::seconds(3)).allowed);

    cout << "all tests passed" << endl;

    return 0;
}