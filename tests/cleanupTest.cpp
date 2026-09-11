// #include <cassert>
// #include <chrono>
// #include <iostream>
// #include <thread>
// #include <vector>

// #include "fixedWindowLimiter.h"
// #include "slidingWindowLimiter.h"
// #include "slidingWindowCounterLimiter.h"
// #include "tokenBucketLimiter.h"

// using namespace std;

// int main()
// {
//     using Clock = chrono::steady_clock;
//     auto start = Clock::now();

//     // 1. Fixed Window Limiter Cleanup Test
//     {
//         fixedWindowLimiter limiter(3, chrono::seconds(5));

//         // Add 3 clients
//         assert(limiter.allow("client1", start).allowed);
//         assert(limiter.allow("client2", start).allowed);
//         assert(limiter.allow("client3", start).allowed);
//         assert(limiter.getClientCount() == 3);

//         // Keep client1 active at t=4s
//         assert(limiter.allow("client1", start + chrono::seconds(4)).allowed);

//         // Run cleanup at t=6s (client2, client3 are inactive since t=0s, but window*2=10s has not passed yet)
//         limiter.deleteOldClients(start + chrono::seconds(6));
//         assert(limiter.getClientCount() == 3);

//         // Run cleanup at t=11s (client2 and client3 inactive for > 10s -> removed; client1 inactive for 7s < 10s -> kept)
//         limiter.deleteOldClients(start + chrono::seconds(11));
//         assert(limiter.getClientCount() == 1);

//         // Client2 comes back after cleanup, works correctly
//         assert(limiter.allow("client2", start + chrono::seconds(12)).allowed);
//         assert(limiter.getClientCount() == 2);
//     }

//     // 2. Sliding Window Log Limiter Cleanup Test
//     {
//         slidingWindowLimiter limiter(3, chrono::seconds(5));

//         assert(limiter.allow("clientA", start).allowed);
//         assert(limiter.allow("clientB", start).allowed);
//         assert(limiter.getClientCount() == 2);

//         // Keep clientA active at t=3s
//         assert(limiter.allow("clientA", start + chrono::seconds(3)).allowed);

//         // At t=4s, clientB is within window (5s) -> not removed
//         limiter.cleanup(start + chrono::seconds(4));
//         assert(limiter.getClientCount() == 2);

//         // At t=6s, clientB has passed 5s window -> removed; clientA has request at t=3s -> kept
//         limiter.cleanup(start + chrono::seconds(6));
//         assert(limiter.getClientCount() == 1);

//         // ClientB returns -> works correctly
//         assert(limiter.allow("clientB", start + chrono::seconds(7)).allowed);
//         assert(limiter.getClientCount() == 2);
//     }

//     // 3. Sliding Window Counter Limiter Cleanup Test
//     {
//         slidingWindowCounterLimiter limiter(3, chrono::seconds(5));

//         assert(limiter.allow("clientX", start).allowed);
//         assert(limiter.allow("clientY", start).allowed);
//         assert(limiter.getClientCount() == 2);

//         // Advance to t=4s (client within 2 windows = 10s)
//         limiter.cleanup(start + chrono::seconds(4));
//         assert(limiter.getClientCount() == 2);

//         // Advance to t=11s (exceeded 2*winDuration = 10s) -> removed
//         limiter.cleanup(start + chrono::seconds(11));
//         assert(limiter.getClientCount() == 0);

//         // New request works correctly
//         assert(limiter.allow("clientX", start + chrono::seconds(12)).allowed);
//         assert(limiter.getClientCount() == 1);
//     }

//     // 4. Token Bucket Limiter Cleanup Test
//     {
//         tokenBucketLimiter limiter(5, 1); // 5 tokens, 1 token/sec -> full refill takes 5s, cleanup TTL=10s

//         assert(limiter.allow("user1", start).allowed);
//         assert(limiter.allow("user2", start).allowed);
//         assert(limiter.getClientCount() == 2);

//         // Keep user1 active at t=6s
//         assert(limiter.allow("user1", start + chrono::seconds(6)).allowed);

//         // Cleanup at t=8s -> user2 inactive for 8s (< 10s) -> kept
//         limiter.cleanup(start + chrono::seconds(8));
//         assert(limiter.getClientCount() == 2);

//         // Cleanup at t=12s -> user2 inactive for 12s (> 10s) -> removed; user1 inactive for 6s (< 10s) -> kept
//         limiter.cleanup(start + chrono::seconds(12));
//         assert(limiter.getClientCount() == 1);

//         // User2 returns -> works correctly with full capacity
//         assert(limiter.allow("user2", start + chrono::seconds(13)).allowed);
//         assert(limiter.getClientCount() == 2);
//     }

//     // 5. Concurrent Cleanup and Request Safety Test
//     {
//         fixedWindowLimiter limiter(100, chrono::seconds(1));

//         atomic<bool> running(true);
//         vector<thread> workers;

//         // 8 worker threads making requests
//         for (int i = 0; i < 8; i++)
//         {
//             workers.emplace_back([&limiter, &running, i]() {
//                 int req = 0;
//                 while (running)
//                 {
//                     string clientId = "client" + to_string(i * 100 + (req % 50));
//                     limiter.allow(clientId, Clock::now());
//                     req++;
//                     this_thread::yield();
//                 }
//             });
//         }

//         // Cleaner thread running cleanup continuously
//         thread cleaner([&limiter, &running]() {
//             while (running)
//             {
//                 limiter.deleteOldClients(Clock::now());
//                 this_thread::sleep_for(chrono::milliseconds(2));
//             }
//         });

//         this_thread::sleep_for(chrono::milliseconds(200));
//         running = false;

//         for (auto &w : workers)
//         {
//             w.join();
//         }
//         cleaner.join();

//         cout << "Concurrent cleanup safety verified successfully" << endl;
//     }

//     cout << "All cleanup tests passed" << endl;
//     return 0;
// }
