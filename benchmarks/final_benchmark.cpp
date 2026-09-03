#include <chrono>
#include <iostream>
#include <vector>
#include <thread>
#include <atomic>
#include <iomanip>
#include <string>

#include "fixedWindowLimiter.h"
#include "slidingWindowLimiter.h"
#include "slidingWindowCounterLimiter.h"
#include "tokenBucketLimiter.h"
#include "redisTokenBucketLimiter.h"

using namespace std;
using namespace chrono;

struct BenchmarkResult
{
    string name;
    string type;
    int totalOps;
    int allowedOps;
    int deniedOps;
    double durationMs;
    double opsPerSec;
    double avgLatencyNs;
};

template <typename LimiterFunc>
BenchmarkResult runInMemoryBenchmark(const string &name, int numThreads, int opsPerThread, LimiterFunc fn)
{
    atomic<int> allowed(0);
    atomic<int> denied(0);
    vector<thread> threads;

    auto start = high_resolution_clock::now();

    for (int t = 0; t < numThreads; t++)
    {
        threads.emplace_back([&, t]() {
            string clientId = "client_" + to_string(t);
            int localAllowed = 0;
            int localDenied = 0;
            for (int i = 0; i < opsPerThread; i++)
            {
                if (fn(clientId, steady_clock::now()))
                {
                    localAllowed++;
                }
                else
                {
                    localDenied++;
                }
            }
            allowed += localAllowed;
            denied += localDenied;
        });
    }

    for (auto &t : threads)
    {
        t.join();
    }

    auto end = high_resolution_clock::now();
    double durationMs = duration<double, milli>(end - start).count();
    int totalOps = numThreads * opsPerThread;
    double opsPerSec = (totalOps / (durationMs / 1000.0));
    double avgLatencyNs = (durationMs * 1000000.0) / totalOps;

    return {name, "In-Memory", totalOps, allowed.load(), denied.load(), durationMs, opsPerSec, avgLatencyNs};
}

int main()
{
    cout << "========================================================================================================\n";
    cout << "                                FINAL RATE LIMITER BENCHMARK SUITE                                      \n";
    cout << "========================================================================================================\n";

    vector<BenchmarkResult> results;
    int numThreads = 8;
    int inMemoryOpsPerThread = 250000; // 2,000,000 total operations per in-memory limiter

    // 1. Fixed Window Limiter
    {
        fixedWindowLimiter limiter(1000000000, seconds(60));
        results.push_back(runInMemoryBenchmark("Fixed Window Limiter", numThreads, inMemoryOpsPerThread,
            [&limiter](const string &clientId, steady_clock::time_point now) {
                return limiter.allow(clientId, now).allowed;
            }));
    }

    // 2. Sliding Window Log Limiter
    {
        slidingWindowLimiter limiter(1000000000, seconds(60));
        results.push_back(runInMemoryBenchmark("Sliding Window Log", numThreads, inMemoryOpsPerThread,
            [&limiter](const string &clientId, steady_clock::time_point now) {
                return limiter.allow(clientId, now).allowed;
            }));
    }

    // 3. Sliding Window Counter Limiter
    {
        slidingWindowCounterLimiter limiter(1000000000, seconds(60));
        results.push_back(runInMemoryBenchmark("Sliding Window Counter", numThreads, inMemoryOpsPerThread,
            [&limiter](const string &clientId, steady_clock::time_point now) {
                return limiter.allow(clientId, now).allowed;
            }));
    }

    // 4. In-Memory Token Bucket Limiter
    {
        tokenBucketLimiter limiter(1000000000.0, 1000000000.0);
        results.push_back(runInMemoryBenchmark("In-Memory Token Bucket", numThreads, inMemoryOpsPerThread,
            [&limiter](const string &clientId, steady_clock::time_point now) {
                return limiter.allow(clientId, now).allowed;
            }));
    }

    // 5. Redis-backed Token Bucket Limiter
    {
        redisTokenBucketLimiter limiter(1000000000.0, 1000000000.0);
        if (limiter.isConnected())
        {
            int redisOps = 20000;
            int redisAllowed = 0;
            int redisDenied = 0;

            auto start = high_resolution_clock::now();
            for (int i = 0; i < redisOps; i++)
            {
                string clientId = "bench_redis_client_" + to_string(i % 16);
                if (limiter.allow(clientId).allowed)
                {
                    redisAllowed++;
                }
                else
                {
                    redisDenied++;
                }
            }
            auto end = high_resolution_clock::now();

            double durationMs = duration<double, milli>(end - start).count();
            double opsPerSec = (redisOps / (durationMs / 1000.0));
            double avgLatencyNs = (durationMs * 1000000.0) / redisOps;

            results.push_back({"Redis Token Bucket", "Distributed", redisOps, redisAllowed, redisDenied, durationMs, opsPerSec, avgLatencyNs});
        }
        else
        {
            cout << "Warning: Redis not connected. Skipping Redis benchmark.\n";
        }
    }

    // Print summary table
    cout << "\n" << left 
         << setw(26) << "Algorithm"
         << setw(14) << "Backend"
         << setw(12) << "Total Ops"
         << setw(12) << "Allowed"
         << setw(10) << "Denied"
         << setw(14) << "Time (ms)"
         << setw(20) << "Throughput (ops/s)"
         << setw(14) << "Avg Latency"
         << "\n";
    cout << string(120, '-') << "\n";

    for (const auto &r : results)
    {
        cout << left
             << setw(26) << r.name
             << setw(14) << r.type
             << setw(12) << r.totalOps
             << setw(12) << r.allowedOps
             << setw(10) << r.deniedOps
             << setw(14) << fixed << setprecision(2) << r.durationMs
             << setw(20) << fixed << setprecision(0) << r.opsPerSec
             << setw(14) << fixed << setprecision(1) << to_string((int)r.avgLatencyNs) + " ns"
             << "\n";
    }
    cout << string(120, '=') << "\n";

    return 0;
}
