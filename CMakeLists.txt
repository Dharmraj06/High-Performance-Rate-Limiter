cmake_minimum_required(VERSION 3.20)

project(rate_limiter LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

include(FetchContent)

# ── hiredis (Redis C Client) ─────────────────────────────────────────────────
FetchContent_Declare(
    hiredis
    GIT_REPOSITORY https://github.com/redis/hiredis.git
    GIT_TAG        v1.2.0
)

set(DISABLE_TESTS ON CACHE BOOL "" FORCE)
set(ENABLE_SSL    OFF CACHE BOOL "" FORCE)

FetchContent_MakeAvailable(hiredis)


add_executable(rate_limiter
    src/main.cpp
    src/httpServer.cpp
    src/fixedWindowLimiter.cpp
    src/slidingWindowLimiter.cpp
    src/slidingWindowCounterLimiter.cpp
    src/tokenBucketLimiter.cpp
    src/redisTokenBucketLimiter.cpp
)

target_include_directories(rate_limiter PRIVATE
    include
    external
    ${hiredis_SOURCE_DIR}
)

target_link_libraries(rate_limiter PRIVATE
    hiredis
    pthread
)


add_executable(fixed_window_test
    tests/fixedWindowLimiterTest.cpp
    src/fixedWindowLimiter.cpp
)

target_include_directories(fixed_window_test PRIVATE include)


add_executable(sliding_window_test
    tests/slidingWindowLimiterTest.cpp
    src/slidingWindowLimiter.cpp
)

target_include_directories(sliding_window_test PRIVATE include)


add_executable(token_bucket_test
    tests/tokenBucketLimiterTest.cpp
    src/tokenBucketLimiter.cpp
)

target_include_directories(token_bucket_test PRIVATE include)


add_executable(sliding_window_counter_test
    tests/slidingWindowCounterLimiterTest.cpp
    src/slidingWindowCounterLimiter.cpp
)

target_include_directories(sliding_window_counter_test PRIVATE include)


add_executable(concurrency_test
    tests/concurrencyTest.cpp
    src/slidingWindowCounterLimiter.cpp
)

target_include_directories(concurrency_test PRIVATE include)

target_link_libraries(concurrency_test PRIVATE pthread)


add_executable(concurrency_multi_client_test
    tests/concurrencyMultiClientTest.cpp
    src/slidingWindowCounterLimiter.cpp
)

target_include_directories(concurrency_multi_client_test PRIVATE include)

target_link_libraries(concurrency_multi_client_test PRIVATE pthread)


add_executable(cleanup_test
    tests/cleanupTest.cpp
    src/fixedWindowLimiter.cpp
    src/slidingWindowLimiter.cpp
    src/slidingWindowCounterLimiter.cpp
    src/tokenBucketLimiter.cpp
)

target_include_directories(cleanup_test PRIVATE include)

target_link_libraries(cleanup_test PRIVATE pthread)


add_executable(redis_token_bucket_test
    tests/redisTokenBucketLimiterTest.cpp
    src/redisTokenBucketLimiter.cpp
)

target_include_directories(redis_token_bucket_test PRIVATE
    include
    ${hiredis_SOURCE_DIR}
)

target_link_libraries(redis_token_bucket_test PRIVATE
    hiredis
    pthread
)


# ── Google Benchmark ─────────────────────────────────────────────────────────
FetchContent_Declare(
    googlebenchmark
    GIT_REPOSITORY https://github.com/google/benchmark.git
    GIT_TAG        v1.8.3
)

set(BENCHMARK_ENABLE_TESTING     OFF CACHE BOOL "" FORCE)
set(BENCHMARK_ENABLE_GTEST_TESTS OFF CACHE BOOL "" FORCE)
set(BENCHMARK_ENABLE_INSTALL     OFF CACHE BOOL "" FORCE)

FetchContent_MakeAvailable(googlebenchmark)


add_executable(rate_limiter_benchmark
    benchmarks/rate_limiter_benchmark.cpp
    src/fixedWindowLimiter.cpp
    src/slidingWindowLimiter.cpp
    src/slidingWindowCounterLimiter.cpp
    src/tokenBucketLimiter.cpp
)

target_include_directories(rate_limiter_benchmark PRIVATE include)

target_link_libraries(rate_limiter_benchmark PRIVATE
    benchmark::benchmark
    pthread
)