#include "redisTokenBucketLimiter.h"
#include "hiredis.h"
#include <cmath>

redisTokenBucketLimiter::redisTokenBucketLimiter(double capacity, double refillRate, const string &host, int port)
{
    this->capacity = capacity;
    this->refillRate = refillRate;
    this->host = host;
    this->port = port;
    this->ttl = max(seconds(10), seconds((int)ceil((capacity / refillRate) * 2)));
    this->ctx = nullptr;

    this->luaScript =
        "local key = KEYS[1]\n"
        "local capacity = tonumber(ARGV[1])\n"
        "local refillRate = tonumber(ARGV[2])\n"
        "local ttl = tonumber(ARGV[3])\n"
        "local timeArr = redis.call('TIME')\n"
        "local now = tonumber(timeArr[1]) + (tonumber(timeArr[2]) / 1000000.0)\n"
        "local data = redis.call('HMGET', key, 'tokens', 'last_refill')\n"
        "local tokens = tonumber(data[1])\n"
        "local last_refill = tonumber(data[2])\n"
        "if not tokens then\n"
        "    tokens = capacity - 1.0\n"
        "    last_refill = now\n"
        "    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill)\n"
        "    redis.call('EXPIRE', key, ttl)\n"
        "    return {1, math.floor(tokens), 0}\n"
        "end\n"
        "local elapsed = math.max(0.0, now - last_refill)\n"
        "tokens = math.min(capacity, tokens + elapsed * refillRate)\n"
        "last_refill = now\n"
        "if tokens < 1.0 then\n"
        "    local retryAfter = math.ceil((1.0 - tokens) / refillRate)\n"
        "    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill)\n"
        "    redis.call('EXPIRE', key, ttl)\n"
        "    return {0, 0, retryAfter}\n"
        "else\n"
        "    tokens = tokens - 1.0\n"
        "    redis.call('HMSET', key, 'tokens', tokens, 'last_refill', last_refill)\n"
        "    redis.call('EXPIRE', key, ttl)\n"
        "    return {1, math.floor(tokens), 0}\n"
        "end\n";

    connect();
}

redisTokenBucketLimiter::~redisTokenBucketLimiter()
{
    disconnect();
}

bool redisTokenBucketLimiter::connect()
{
    if (ctx)
    {
        return true;
    }

    struct timeval timeout = {1, 500000}; // 1.5 seconds timeout
    ctx = redisConnectWithTimeout(host.c_str(), port, timeout);

    if (!ctx || ctx->err)
    {
        disconnect();
        return false;
    }

    return true;
}

void redisTokenBucketLimiter::disconnect()
{
    if (ctx)
    {
        redisFree(ctx);
        ctx = nullptr;
    }
}

bool redisTokenBucketLimiter::isConnected()
{
    lock_guard<mutex> lock(mtx);
    return connect();
}

RateLimitResult redisTokenBucketLimiter::allow(const string &clientId)
{
    lock_guard<mutex> lock(mtx);

    if (!ctx && !connect())
    {
        return {0, 0, 1};
    }

    string key = "ratelimit:tb:" + clientId;
    string capStr = to_string(capacity);
    string rateStr = to_string(refillRate);
    string ttlStr = to_string(ttl.count());

    redisReply *reply = (redisReply *)redisCommand(
        ctx,
        "EVAL %s 1 %s %s %s %s",
        luaScript.c_str(),
        key.c_str(),
        capStr.c_str(),
        rateStr.c_str(),
        ttlStr.c_str());

    if (!reply)
    {
        disconnect();
        return {0, 0, 1};
    }

    if (reply->type == REDIS_REPLY_ARRAY && reply->elements >= 3)
    {
        bool allowed = (reply->element[0]->integer == 1);
        int remaining = (int)reply->element[1]->integer;
        int retryAfter = (int)reply->element[2]->integer;
        freeReplyObject(reply);
        return {allowed, remaining, retryAfter};
    }

    freeReplyObject(reply);
    return {0, 0, 1};
}
