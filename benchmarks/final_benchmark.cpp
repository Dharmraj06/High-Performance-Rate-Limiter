#include <chrono>
#include <iostream>
#include <vector>
#include <thread>
#include <atomic>
#include <iomanip>
#include <string>
#include <fstream>

#include "fixedWindowLimiter.h"
#include "slidingWindowLimiter.h"
#include "slidingWindowCounterLimiter.h"
#include "tokenBucketLimiter.h"
#include "redisTokenBucketLimiter.h"

using namespace std;
using namespace chrono;

const int limit = (int)1e9;
const chrono::seconds winDuration(60);

const double capacity = 1e9;
const double refillRate = 1e9;


// Result structure
struct BenchmarkResult
{
    string name;
    string type;
    string scenario;

    int totalOps;
    int allowedOps;
    int deniedOps;

    double durationMs;
    double opsPerSec;
    double avgLatencyNs;
};


// Shared limiters
fixedWindowLimiter *fixedLimiter = nullptr;
slidingWindowLimiter *slidingLimiter = nullptr;
slidingWindowCounterLimiter *counterLimiter = nullptr;
tokenBucketLimiter *tokenLimiter = nullptr;


// ============================================================
// Setup and cleanup functions
// ============================================================

// Fixed Window
void setupFixed()
{
    fixedLimiter = new fixedWindowLimiter(limit, winDuration);
}

void cleanupFixed()
{
    delete fixedLimiter;
    fixedLimiter = nullptr;
}


// Sliding Window Log
void setupSliding()
{
    slidingLimiter = new slidingWindowLimiter(limit, winDuration);
}

void cleanupSliding()
{
    delete slidingLimiter;
    slidingLimiter = nullptr;
}


// Sliding Window Counter
void setupCounter()
{
    counterLimiter = new slidingWindowCounterLimiter(limit, winDuration);
}

void cleanupCounter()
{
    delete counterLimiter;
    counterLimiter = nullptr;
}


// Token Bucket
void setupTokenBucket()
{
    tokenLimiter = new tokenBucketLimiter(capacity, refillRate);
}

void cleanupTokenBucket()
{
    delete tokenLimiter;
    tokenLimiter = nullptr;
}


// ============================================================
// Single Thread Benchmark
// ============================================================

template <typename LimiterFunc>
BenchmarkResult runSingleThreadBenchmark(
    const string &name,
    LimiterFunc fn,
    int totalOps)
{
    int allowed = 0;
    int denied = 0;

    auto start = high_resolution_clock::now();

    for (int i = 0; i < totalOps; i++)
    {
        if (fn())
        {
            allowed++;
        }
        else
        {
            denied++;
        }
    }

    auto end = high_resolution_clock::now();

    double durationMs =
        duration<double, milli>(end - start).count();

    double opsPerSec =
        totalOps / (durationMs / 1000.0);

    double avgLatencyNs =
        (durationMs * 1000000.0) / totalOps;

    return {
        name,
        "In-Memory",
        "Single Thread",
        totalOps,
        allowed,
        denied,
        durationMs,
        opsPerSec,
        avgLatencyNs
    };
}


// ============================================================
// Multi-thread Benchmark
// ============================================================

template <typename LimiterFunc>
BenchmarkResult runMultiThreadBenchmark(
    const string &name,
    const string &scenario,
    int numThreads,
    int opsPerThread,
    LimiterFunc fn)
{
    atomic<int> allowed(0);
    atomic<int> denied(0);

    vector<thread> threads;

    auto start = high_resolution_clock::now();

    for (int t = 0; t < numThreads; t++)
    {
        threads.emplace_back([&, t]() {

            string clientId = "client" + to_string(t);

            int localAllowed = 0;
            int localDenied = 0;

            for (int i = 0; i < opsPerThread; i++)
            {
                if (fn(clientId))
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

    double durationMs =
        duration<double, milli>(end - start).count();

    int totalOps =
        numThreads * opsPerThread;

    double opsPerSec =
        totalOps / (durationMs / 1000.0);

    double avgLatencyNs =
        (durationMs * 1000000.0) / totalOps;

    return {
        name,
        "In-Memory",
        scenario,
        totalOps,
        allowed.load(),
        denied.load(),
        durationMs,
        opsPerSec,
        avgLatencyNs
    };
}


// ============================================================
// Main
// ============================================================

int main()
{
    cout << "========================================================================================================\n";
    cout << "                                FINAL RATE LIMITER BENCHMARK SUITE                                      \n";
    cout << "========================================================================================================\n";

    vector<BenchmarkResult> results;


    // ========================================================
    // Benchmark configuration
    // ========================================================

    int singleThreadOps = 250000;

    int numThreads = 8;

    int opsPerThread = 250000;

    int redisOps = 20000;


    // ========================================================
    // 1. Single Thread Benchmarks
    // ========================================================

    {
        fixedWindowLimiter limiter(limit, winDuration);

        results.push_back(
            runSingleThreadBenchmark(
                "Fixed Window Limiter",
                [&limiter]() {
                    return limiter.allow(
                        "client0",
                        steady_clock::now()).allowed;
                },
                singleThreadOps
            )
        );
    }


    {
        slidingWindowLimiter limiter(limit, winDuration);

        results.push_back(
            runSingleThreadBenchmark(
                "Sliding Window Log",
                [&limiter]() {
                    return limiter.allow(
                        "client0",
                        steady_clock::now()).allowed;
                },
                singleThreadOps
            )
        );
    }


    {
        slidingWindowCounterLimiter limiter(limit, winDuration);

        results.push_back(
            runSingleThreadBenchmark(
                "Sliding Window Counter",
                [&limiter]() {
                    return limiter.allow(
                        "client0",
                        steady_clock::now()).allowed;
                },
                singleThreadOps
            )
        );
    }


    {
        tokenBucketLimiter limiter(capacity, refillRate);

        results.push_back(
            runSingleThreadBenchmark(
                "In-Memory Token Bucket",
                [&limiter]() {
                    return limiter.allow(
                        "client0",
                        steady_clock::now()).allowed;
                },
                singleThreadOps
            )
        );
    }


    // ========================================================
    // 2. Same Client Concurrent Benchmarks
    // ========================================================

    setupFixed();

    results.push_back(
        runMultiThreadBenchmark(
            "Fixed Window Limiter",
            "Same Client",
            numThreads,
            opsPerThread,
            [](const string &clientId) {
                return fixedLimiter->allow(
                    "client0",
                    steady_clock::now()).allowed;
            }
        )
    );

    cleanupFixed();


    setupSliding();

    results.push_back(
        runMultiThreadBenchmark(
            "Sliding Window Log",
            "Same Client",
            numThreads,
            opsPerThread,
            [](const string &clientId) {
                return slidingLimiter->allow(
                    "client0",
                    steady_clock::now()).allowed;
            }
        )
    );

    cleanupSliding();


    setupCounter();

    results.push_back(
        runMultiThreadBenchmark(
            "Sliding Window Counter",
            "Same Client",
            numThreads,
            opsPerThread,
            [](const string &clientId) {
                return counterLimiter->allow(
                    "client0",
                    steady_clock::now()).allowed;
            }
        )
    );

    cleanupCounter();


    setupTokenBucket();

    results.push_back(
        runMultiThreadBenchmark(
            "In-Memory Token Bucket",
            "Same Client",
            numThreads,
            opsPerThread,
            [](const string &clientId) {
                return tokenLimiter->allow(
                    "client0",
                    steady_clock::now()).allowed;
            }
        )
    );

    cleanupTokenBucket();


    // ========================================================
    // 3. Multi Client Concurrent Benchmarks
    // ========================================================

    setupFixed();

    results.push_back(
        runMultiThreadBenchmark(
            "Fixed Window Limiter",
            "Multiple Clients",
            numThreads,
            opsPerThread,
            [](const string &clientId) {
                return fixedLimiter->allow(
                    clientId,
                    steady_clock::now()).allowed;
            }
        )
    );

    cleanupFixed();


    setupSliding();

    results.push_back(
        runMultiThreadBenchmark(
            "Sliding Window Log",
            "Multiple Clients",
            numThreads,
            opsPerThread,
            [](const string &clientId) {
                return slidingLimiter->allow(
                    clientId,
                    steady_clock::now()).allowed;
            }
        )
    );

    cleanupSliding();


    setupCounter();

    results.push_back(
        runMultiThreadBenchmark(
            "Sliding Window Counter",
            "Multiple Clients",
            numThreads,
            opsPerThread,
            [](const string &clientId) {
                return counterLimiter->allow(
                    clientId,
                    steady_clock::now()).allowed;
            }
        )
    );

    cleanupCounter();


    setupTokenBucket();

    results.push_back(
        runMultiThreadBenchmark(
            "In-Memory Token Bucket",
            "Multiple Clients",
            numThreads,
            opsPerThread,
            [](const string &clientId) {
                return tokenLimiter->allow(
                    clientId,
                    steady_clock::now()).allowed;
            }
        )
    );

    cleanupTokenBucket();


    // ========================================================
    // 4. Redis Token Bucket Benchmark
    // ========================================================

    {
        redisTokenBucketLimiter limiter(
            capacity,
            refillRate
        );

        if (limiter.isConnected())
        {
            int redisAllowed = 0;
            int redisDenied = 0;

            auto start = high_resolution_clock::now();

            for (int i = 0; i < redisOps; i++)
            {
                string clientId =
                    "bench_redis_client_" +
                    to_string(i % 16);

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

            double durationMs =
                duration<double, milli>(end - start).count();

            double opsPerSec =
                redisOps / (durationMs / 1000.0);

            double avgLatencyNs =
                (durationMs * 1000000.0) / redisOps;

            results.push_back({
                "Redis Token Bucket",
                "Distributed",
                "Redis",
                redisOps,
                redisAllowed,
                redisDenied,
                durationMs,
                opsPerSec,
                avgLatencyNs
            });
        }
        else
        {
            cout << "Warning: Redis not connected. "
                 << "Skipping Redis benchmark.\n";
        }
    }


    // ========================================================
    // Print Results
    // ========================================================

    cout << "\n"
         << left
         << setw(26) << "Algorithm"
         << setw(18) << "Type"
         << setw(20) << "Scenario"
         << setw(12) << "Total Ops"
         << setw(12) << "Allowed"
         << setw(10) << "Denied"
         << setw(14) << "Time (ms)"
         << setw(20) << "Throughput (ops/s)"
         << setw(14) << "Avg Latency"
         << "\n";

    cout << string(146, '-') << "\n";


    for (const auto &r : results)
    {
        cout << left
             << setw(26) << r.name
             << setw(18) << r.type
             << setw(20) << r.scenario
             << setw(12) << r.totalOps
             << setw(12) << r.allowedOps
             << setw(10) << r.deniedOps
             << setw(14)
             << fixed
             << setprecision(2)
             << r.durationMs
             << setw(20)
             << fixed
             << setprecision(0)
             << r.opsPerSec
             << setw(14)
             << fixed
             << setprecision(1)
             << r.avgLatencyNs
             << " ns"
             << "\n";
    }


    cout << string(146, '=') << "\n";


    // ========================================================
    // Save Results to JSON
    // ========================================================

    ofstream jsonFile("final.json");

    if (!jsonFile.is_open())
    {
        cout << "Error: Could not create final.json\n";
        return 1;
    }


    jsonFile << "{\n";


    // Benchmark configuration
    jsonFile << "  \"benchmark\": {\n";

    jsonFile << "    \"single_thread_operations\": "
             << singleThreadOps << ",\n";

    jsonFile << "    \"threads\": "
             << numThreads << ",\n";

    jsonFile << "    \"operations_per_thread\": "
             << opsPerThread << ",\n";

    jsonFile << "    \"multi_thread_total_operations\": "
             << numThreads * opsPerThread << ",\n";

    jsonFile << "    \"redis_operations\": "
             << redisOps << "\n";

    jsonFile << "  },\n";


    // Results
    jsonFile << "  \"results\": [\n";


    for (int i = 0; i < results.size(); i++)
    {
        BenchmarkResult r = results[i];

        jsonFile << "    {\n";

        jsonFile << "      \"name\": \""
                 << r.name << "\",\n";

        jsonFile << "      \"type\": \""
                 << r.type << "\",\n";

        jsonFile << "      \"scenario\": \""
                 << r.scenario << "\",\n";

        jsonFile << "      \"total_ops\": "
                 << r.totalOps << ",\n";

        jsonFile << "      \"allowed_ops\": "
                 << r.allowedOps << ",\n";

        jsonFile << "      \"denied_ops\": "
                 << r.deniedOps << ",\n";

        jsonFile << "      \"duration_ms\": "
                 << fixed
                 << setprecision(2)
                 << r.durationMs << ",\n";

        jsonFile << "      \"throughput_ops_sec\": "
                 << fixed
                 << setprecision(0)
                 << r.opsPerSec << ",\n";

        jsonFile << "      \"avg_latency_ns\": "
                 << fixed
                 << setprecision(1)
                 << r.avgLatencyNs
                 << "\n";

        jsonFile << "    }";


        if (i != results.size() - 1)
        {
            jsonFile << ",";
        }

        jsonFile << "\n";
    }


    jsonFile << "  ]\n";
    jsonFile << "}\n";


    jsonFile.close();


    cout << "\nResults saved to final.json\n";


    return 0;
}