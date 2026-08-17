cmake_minimum_required(VERSION 3.20)

project(rate_limiter LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_executable(rate_limiter
    src/main.cpp
    src/httpServer.cpp
    src/fixedWindowLimiter.cpp
    src/slidingWindowLimiter.cpp
    src/tokenBucketLimiter.cpp
)

target_include_directories(rate_limiter PRIVATE
    include
    external
)

target_link_libraries(rate_limiter PRIVATE pthread)


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