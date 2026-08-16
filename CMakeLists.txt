cmake_minimum_required(VERSION 3.20)

project(rate_limiter LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_executable(rate_limiter
    src/main.cpp
    src/fixedWindowLimiter.cpp
    src/slidingWindowLimiter.cpp
)

target_include_directories(rate_limiter PRIVATE include)

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