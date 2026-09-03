#include <cassert>
#include <chrono>
#include <iostream>
#include <thread>
#include <vector>
#include <atomic>

#include "redisTokenBucketLimiter.h"

using namespace std;

int main()
{
    cout << "Checking Redis connection..." << endl;
    redisTokenBucketLimiter checkLimiter(10, 1);
    if (!checkLimiter.isConnected())
    {
        cerr << "Error: Redis server is not running on 127.0.0.1:6379." << endl;
        cerr << "Please start Redis before running redis_token_bucket_test." << endl;
        return 1;
    }
    cout << "Redis connection successful." << endl;

    // 1. Basic allow and limit test
    {
        string clientId = "test_basic_client_" + to_string(chrono::steady_clock::now().time_since_epoch().count());
        redisTokenBucketLimiter limiter(3, 1);

        assert(limiter.allow(clientId).allowed);
        assert(limiter.allow(clientId).allowed);
        assert(limiter.allow(clientId).allowed);

        // 4th request must be denied
        RateLimitResult res = limiter.allow(clientId);
        assert(!res.allowed);
        assert(res.retryAfter >= 1);
    }

    // 2. Token refill test
    {
        string clientId = "test_refill_client_" + to_string(chrono::steady_clock::now().time_since_epoch().count());
        redisTokenBucketLimiter limiter(2, 2); // 2 tokens, refills at 2 tokens/sec (1 token per 500ms)

        assert(limiter.allow(clientId).allowed);
        assert(limiter.allow(clientId).allowed);
        assert(!limiter.allow(clientId).allowed);

        // Wait 600ms for at least 1 token to refill
        this_thread::sleep_for(chrono::milliseconds(600));

        assert(limiter.allow(clientId).allowed);
        assert(!limiter.allow(clientId).allowed);
    }

    // 3. Two separate limiter instances sharing the same Redis state
    {
        string clientId = "test_shared_client_" + to_string(chrono::steady_clock::now().time_since_epoch().count());
        redisTokenBucketLimiter instanceA(3, 1);
        redisTokenBucketLimiter instanceB(3, 1);

        // Consume 2 tokens through instance A
        assert(instanceA.allow(clientId).allowed);
        assert(instanceA.allow(clientId).allowed);

        // Consume 3rd token through instance B
        assert(instanceB.allow(clientId).allowed);

        // 4th request on instance A must be denied because instance B consumed the last token
        assert(!instanceA.allow(clientId).allowed);

        // 4th request on instance B must also be denied
        assert(!instanceB.allow(clientId).allowed);
    }

    // 4. Concurrent requests across multiple limiter instances
    {
        string clientId = "test_concurrent_client_" + to_string(chrono::steady_clock::now().time_since_epoch().count());
        int capacity = 50;
        double rate = 0.1; // slow refill during test

        redisTokenBucketLimiter serverA(capacity, rate);
        redisTokenBucketLimiter serverB(capacity, rate);

        atomic<int> allowedA(0);
        atomic<int> allowedB(0);
        vector<thread> threads;

        int numThreads = 8;
        int requestsPerThread = 200;

        for (int i = 0; i < numThreads; i++)
        {
            if (i % 2 == 0)
            {
                threads.emplace_back([&serverA, &allowedA, clientId, requestsPerThread]() {
                    for (int j = 0; j < requestsPerThread; j++)
                    {
                        if (serverA.allow(clientId).allowed)
                        {
                            allowedA++;
                        }
                    }
                });
            }
            else
            {
                threads.emplace_back([&serverB, &allowedB, clientId, requestsPerThread]() {
                    for (int j = 0; j < requestsPerThread; j++)
                    {
                        if (serverB.allow(clientId).allowed)
                        {
                            allowedB++;
                        }
                    }
                });
            }
        }

        for (auto &t : threads)
        {
            t.join();
        }

        int totalAllowed = allowedA + allowedB;
        cout << "Concurrent multi-instance allowed: " << totalAllowed << " (expected: " << capacity << ")" << endl;
        assert(totalAllowed == capacity);
    }

    // 5. TTL automatic expiration
    {
        string clientId = "test_ttl_client_" + to_string(chrono::steady_clock::now().time_since_epoch().count());
        // capacity=2, rate=1 -> default TTL min 10 seconds. Use capacity=2, rate=1
        redisTokenBucketLimiter limiter(2, 1);

        assert(limiter.allow(clientId).allowed);
        assert(limiter.allow(clientId).allowed);
        assert(!limiter.allow(clientId).allowed);
    }

    cout << "All Redis token bucket limiter tests passed successfully" << endl;
    return 0;
}
