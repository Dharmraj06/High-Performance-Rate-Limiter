#pragma once

struct RateLimitResult
{
    bool allowed;
    int remaining;
    int retryAfter;
};