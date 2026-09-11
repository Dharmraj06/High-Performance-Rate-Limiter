import { Link } from 'react-router-dom'
import Section from '../components/Section.jsx'
import { SectionLabel, PageHeading, SectionHeading, BodyText, Mono } from '../components/Typography.jsx'
import { ArchDiagram, ArchNode, ArchArrow } from '../components/ArchDiagram.jsx'

/* ─── Content Width Constants ────────────────────────────────────── */
const MAX_W = {
  maxWidth: '1100px',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: '1.5rem',
  paddingRight: '1.5rem',
}
const PROSE = { maxWidth: '720px' }

/* ─── Project Characteristic Card ────────────────────────────────── */
function CharacteristicCard({ value, label, detail }) {
  return (
    <div
      className="flex flex-col justify-between rounded p-5"
      style={{
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      <div>
        <span
          className="text-2xl sm:text-3xl font-semibold tracking-tight"
          style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: 'var(--font-mono)' }}
        >
          {value}
        </span>
        <p
          className="mt-1 text-xs uppercase tracking-wider font-medium"
          style={{ color: 'var(--text-secondary)' }}
        >
          {label}
        </p>
      </div>
      <p
        className="mt-3 text-xs leading-relaxed"
        style={{ color: 'var(--text-muted)' }}
      >
        {detail}
      </p>
    </div>
  )
}

/* ─── In-Memory Algorithm Card ───────────────────────────────────── */
function AlgoCard({ name, memory, accuracy, description, tradeOff }) {
  return (
    <div
      className="rounded p-6 transition-colors"
      style={{
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3
          className="text-base font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <span
            className="rounded px-2 py-0.5 text-xs"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
            }}
          >
            {memory}
          </span>
          <span
            className="rounded px-2 py-0.5 text-xs"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
            }}
          >
            {accuracy}
          </span>
        </div>
      </div>

      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        {description}
      </p>

      <div
        className="mt-4 pt-3 text-xs"
        style={{
          borderTop: '1px solid var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
          Trade-off:&nbsp;
        </span>
        {tradeOff}
      </div>
    </div>
  )
}

/* ─── Request Flow Step Item ─────────────────────────────────────── */
function FlowStepItem({ number, title, description }) {
  return (
    <div
      className="flex gap-4 p-4 rounded"
      style={{
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-xs font-semibold"
        style={{
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-strong)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {number}
      </div>
      <div>
        <h4
          className="text-sm font-medium mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h4>
        <p
          className="text-xs sm:text-sm leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          {description}
        </p>
      </div>
    </div>
  )
}

/* ─── Implementation Feature Block ───────────────────────────────── */
function ImplementationItem({ title, description, badge }) {
  return (
    <div
      className="rounded p-5"
      style={{
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <h4
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h4>
        {badge && (
          <span
            className="rounded px-2 py-0.5 text-xs"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border)',
            }}
          >
            {badge}
          </span>
        )}
      </div>
      <p
        className="text-xs sm:text-sm leading-relaxed"
        style={{ color: 'var(--text-secondary)' }}
      >
        {description}
      </p>
    </div>
  )
}

/* ─── Overview Page ──────────────────────────────────────────────── */
export default function Overview() {
  return (
    <main>

      {/* ── 1. Hero ─────────────────────────────────────────────────── */}
      <Section id="hero">
        <div style={MAX_W}>
          <SectionLabel>Architecture &amp; Design</SectionLabel>
          <PageHeading className="mb-6">
            C++ Rate Limiter
          </PageHeading>
          <div style={PROSE}>
            <p
              className="text-lg leading-relaxed font-normal mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              A high-performance C++ rate limiter supporting multiple rate-limiting algorithms,
              concurrent workloads, and distributed Redis-backed rate limiting.
            </p>
            <BodyText>
              Designed to study synchronization overhead in high-throughput systems, this library
              implements four in-memory algorithms backed by 64-shard partitioned locking alongside
              an atomic Redis Lua implementation. The project isolates concurrency bottlenecks to
              demonstrate how synchronization structure governs multi-core scaling.
            </BodyText>
          </div>

          {/* ── 2. Project at a Glance ──────────────────────────────── */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <CharacteristicCard
              value="C++23"
              label="Standard"
              detail="Modern standard with strict typing, std::chrono precision, and zero external runtime dependencies for in-memory limiters."
            />
            <CharacteristicCard
              value="4"
              label="In-Memory Limiters"
              detail="Fixed Window, Sliding Window Log, Sliding Window Counter, and Token Bucket implementations."
            />
            <CharacteristicCard
              value="64"
              label="Independent Shards"
              detail="Hash-partitioned mutexes eliminate global lock contention across concurrent multi-client requests."
            />
            <CharacteristicCard
              value="1"
              label="Distributed Engine"
              detail="Redis 6.0+ backed token bucket using atomic server-side Lua scripts and Redis TIME synchronization."
            />
          </div>
        </div>
      </Section>

      {/* ── Divider ─────────────────────────────────────────────────── */}
      <div style={{ ...MAX_W, paddingTop: 0, paddingBottom: 0 }}>
        <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />
      </div>

      {/* ── 3. Algorithms ───────────────────────────────────────────── */}
      <Section id="algorithms" border={false}>
        <div style={MAX_W}>
          <SectionLabel>Algorithms</SectionLabel>
          <SectionHeading className="mb-3">
            Rate-Limiting Strategies
          </SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-8">
              The project implements four in-memory algorithms and one distributed Redis-backed
              implementation. Each algorithm offers a distinct architectural trade-off across
              memory consumption, tracking accuracy, computational complexity, and burst tolerance.
            </BodyText>
          </div>

          {/* 4 In-Memory Algorithms */}
          <div className="grid gap-4 md:grid-cols-2">
            <AlgoCard
              name="Fixed Window Limiter"
              memory="O(1) memory"
              accuracy="Approximate"
              description="Partitions time into static, discrete windows (e.g. 1 second). Incoming requests increment an integer counter in the current window. Once the counter reaches the threshold, subsequent requests are denied until the window rolls over."
              tradeOff="Extremely fast and cache-friendly, but vulnerable to boundary bursts where up to 2× the configured limit can pass if requests arrive near window transitions."
            />
            <AlgoCard
              name="Sliding Window Log"
              memory="O(N) memory"
              accuracy="Exact accuracy"
              description="Maintains individual timestamps for every allowed request per client in a double-ended queue. On every check, timestamps older than (now - window) are evicted, and the remaining count determines request admission."
              tradeOff="Guarantees exact rate enforcement with zero boundary burst anomaly, but requires heap allocation per request and memory overhead proportional to request volume."
            />
            <AlgoCard
              name="Sliding Window Counter"
              memory="O(1) memory"
              accuracy="Hybrid estimate"
              description="Approximates sliding window behavior by combining request counts from adjacent fixed windows. It calculates an estimated count using a weighted linear interpolation: (previous_window_count × overlap_weight) + current_window_count."
              tradeOff="Mitigates the boundary burst flaw of fixed windows while preserving O(1) constant memory per client and avoiding timestamp allocations."
            />
            <AlgoCard
              name="Token Bucket"
              memory="O(1) memory"
              accuracy="Continuous flow"
              description="Maintains a token count that refills continuously at a constant rate up to bucket capacity. Each request consumes tokens. If sufficient tokens exist, the request is allowed; otherwise, it is denied."
              tradeOff="Naturally accommodates controlled short-term traffic bursts up to capacity while guaranteeing a strict long-term average throughput rate."
            />
          </div>

          {/* Distributed Redis Token Bucket */}
          <div
            className="mt-6 rounded p-6"
            style={{
              border: '1px solid var(--border-strong)',
              backgroundColor: 'var(--bg-surface)',
            }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between mb-3">
              <div className="flex items-center gap-3">
                <h3
                  className="text-base font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Redis Token Bucket
                </h3>
                <span
                  className="rounded px-2 py-0.5 text-xs"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-strong)',
                  }}
                >
                  Distributed
                </span>
              </div>
              <span
                className="text-xs"
                style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
              >
                hiredis · Server-side Lua · Shared state
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-3 pt-2">
              <div className="md:col-span-2">
                <p
                  className="text-sm leading-relaxed mb-3"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  The distributed token bucket delegates rate-limit state to a centralized Redis 6.0+ instance.
                  Unlike in-memory limiters that restrict state to a single process, this allows multiple independent
                  application servers behind a load balancer to enforce a shared global quota.
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Rate evaluation executes inside an atomic server-side Lua script. The script obtains the
                  canonical timestamp via Redis <Mono>TIME</Mono> to eliminate clock drift across client hosts,
                  computes token replenishment, verifies bucket capacity, and updates keys in a single
                  non-preemptible transaction.
                </p>
              </div>

              <div
                className="rounded p-4 text-xs leading-relaxed"
                style={{
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                }}
              >
                <p className="font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Architectural Distinction:
                </p>
                In-memory limiters execute within process memory with sub-microsecond latency and no socket round-trips.
                The distributed limiter trades local memory speed for network coordination consistency across multiple nodes.
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 4. Architecture ─────────────────────────────────────────── */}
      <Section id="architecture" border>
        <div style={MAX_W}>
          <SectionLabel>Architecture</SectionLabel>
          <SectionHeading className="mb-3">
            64-Shard Partitioned Concurrency
          </SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-6">
              In concurrent systems, synchronization structure determines performance. A naive rate limiter
              places all client state in a single hash table guarded by one global mutex. Under concurrent
              multi-threaded traffic, every thread contends for that solitary lock, serializing requests and
              causing throughput collapse.
            </BodyText>
            <BodyText className="mb-10">
              To resolve this bottleneck without sacrificing correctness, the library partitions client state
              across 64 independent shards:
            </BodyText>
          </div>

          {/* Shard Architecture Principles */}
          <div className="grid gap-4 sm:grid-cols-3 mb-10">
            <div
              className="rounded p-5"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
            >
              <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Hash-Based Shard Routing
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                A client ID is hashed via <Mono>std::hash</Mono> modulo 64 to determine its owning shard.
                Hashing is deterministic: the same client ID always maps to the same shard.
              </p>
            </div>
            <div
              className="rounded p-5"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
            >
              <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Independent Mutex Partitioning
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Each shard owns its client table and its own <Mono>std::mutex</Mono>. Locking one shard leaves
                the other 63 shards entirely unblocked, enabling concurrent execution across threads.
              </p>
            </div>
            <div
              className="rounded p-5"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
            >
              <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                Same-Client Correctness
              </h4>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                Because a client always maps to the same shard, concurrent requests from the same client
                are safely synchronized by that shard&apos;s mutex without global contention.
              </p>
            </div>
          </div>

          {/* Diagram Container */}
          <div
            className="rounded p-6 sm:p-8"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Pipeline 1: In-Memory Request Pipeline */}
            <div className="mb-10">
              <p
                className="mb-6 text-center text-xs uppercase tracking-widest font-medium"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
              >
                In-Memory Sharded Pipeline
              </p>

              <div className="hidden lg:block">
                <ArchDiagram className="gap-2">
                  <ArchNode label="Client Request" sub="allow(clientId)" mono />
                  <ArchArrow label="hash" />
                  <ArchNode label="Hash Client ID" sub="hash(id) % 64" mono />
                  <ArchArrow label="route" />
                  <ArchNode label="One of 64 Shards" sub="Shard index" highlight />
                  <ArchArrow label="lock" />
                  <ArchNode label="Shard Mutex + State" sub="std::mutex + map" highlight />
                  <ArchArrow label="eval" />
                  <ArchNode label="Algorithm" sub="Fixed/Sliding/Token" />
                  <ArchArrow label="decision" />
                  <ArchNode label="Allow / Deny" sub="RateLimitResult" mono />
                </ArchDiagram>
              </div>

              {/* Mobile/Tablet Fallback for Pipeline */}
              <div className="lg:hidden flex flex-col items-center gap-1">
                <ArchNode label="Client Request" sub="allow(clientId)" mono />
                <ArchArrow direction="down" label="hash(id) % 64" />
                <ArchNode label="One of 64 Shards" sub="Shard Mutex + State" highlight />
                <ArchArrow direction="down" label="eval algorithm" />
                <ArchNode label="Algorithm Logic" sub="Fixed / Sliding / Token" />
                <ArchArrow direction="down" label="decision" />
                <ArchNode label="RateLimitResult" sub="Allow / Deny + Retry-After" mono />
              </div>
            </div>

            <div
              className="my-8 h-px"
              style={{ backgroundColor: 'var(--border)' }}
            />

            {/* Pipeline 2: Multi-Client Shard Isolation */}
            <div className="mb-10">
              <p
                className="mb-6 text-center text-xs uppercase tracking-widest font-medium"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
              >
                Multi-Client Concurrent Isolation
              </p>

              <div className="flex flex-col gap-4">
                <ArchDiagram className="gap-2">
                  <ArchNode label='Client A ("usr_1")' sub="Thread 1" mono />
                  <ArchArrow label="hash % 64" />
                  <ArchNode label="Shard 12" sub="Mutex 12 + State" highlight />
                  <ArchArrow />
                  <ArchNode label="Algorithm" sub="Evaluate limit" />
                  <ArchArrow />
                  <ArchNode label="Allow / Deny" sub="Result A" mono />
                </ArchDiagram>

                <div className="text-center py-1">
                  <span
                    className="text-xs uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                  >
                    || parallel execution — independent mutexes ||
                  </span>
                </div>

                <ArchDiagram className="gap-2">
                  <ArchNode label='Client B ("usr_2")' sub="Thread 2" mono />
                  <ArchArrow label="hash % 64" />
                  <ArchNode label="Shard 37" sub="Mutex 37 + State" highlight />
                  <ArchArrow />
                  <ArchNode label="Algorithm" sub="Evaluate limit" />
                  <ArchArrow />
                  <ArchNode label="Allow / Deny" sub="Result B" mono />
                </ArchDiagram>
              </div>

              <p
                className="mt-6 text-center text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                Requests mapping to distinct shards proceed concurrently on separate CPU cores without lock contention.
              </p>
            </div>

            <div
              className="my-8 h-px"
              style={{ backgroundColor: 'var(--border)' }}
            />

            {/* Pipeline 3: Distributed Architecture */}
            <div>
              <p
                className="mb-6 text-center text-xs uppercase tracking-widest font-medium"
                style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
              >
                Distributed Redis Path
              </p>

              <ArchDiagram className="gap-2">
                <ArchNode label="Application Host" sub="Client request" mono />
                <ArchArrow label="hiredis" />
                <ArchNode label="Redis Token Bucket" sub="Client wrapper" />
                <ArchArrow label="EVALSHA" />
                <ArchNode label="Atomic Lua Script" sub="Redis TIME" highlight />
                <ArchArrow label="in-memory" />
                <ArchNode label="Redis State" sub="Shared keys" highlight />
                <ArchArrow label="reply" />
                <ArchNode label="Allow / Deny" sub="Status reply" mono />
              </ArchDiagram>

              <p
                className="mt-6 text-center text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                Shared across multiple application servers; synchronization is guaranteed by Redis single-threaded execution.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ── 5. Request Flow ─────────────────────────────────────────── */}
      <Section id="request-flow" border>
        <div style={MAX_W}>
          <SectionLabel>Execution Path</SectionLabel>
          <SectionHeading className="mb-3">
            Six-Step Request Flow
          </SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-8">
              Every invocation of <Mono>allow(clientId)</Mono> follows a deterministic, lock-minimal
              path designed to minimize critical section duration and eliminate cross-shard contention:
            </BodyText>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <FlowStepItem
              number="1"
              title="Hash to Shard"
              description="The client ID determines which shard owns the client's state. The hash value modulo 64 selects the shard index without taking any locks."
            />
            <FlowStepItem
              number="2"
              title="Acquire Shard Mutex"
              description="Only the selected shard is locked, allowing unrelated shards to continue processing requests from other clients simultaneously."
            />
            <FlowStepItem
              number="3"
              title="Find or Create Client State"
              description="Existing client state is retrieved from the shard's internal hash table, or newly initialized if this is the client's first request."
            />
            <FlowStepItem
              number="4"
              title="Evaluate Limit"
              description="The selected rate-limiting algorithm evaluates state (window boundary, timestamp log, counter weight, or token count) to decide allow or deny."
            />
            <FlowStepItem
              number="5"
              title="Opportunistic Cleanup"
              description="Expired or inactive client state can be removed as part of shard-level maintenance during normal calls, avoiding dedicated background threads."
            />
            <FlowStepItem
              number="6"
              title="Return Result"
              description="The limiter returns a RateLimitResult containing the allow/deny decision, remaining token/request quota, and retry-after duration."
            />
          </div>
        </div>
      </Section>

      {/* ── 6. Project Implementation ───────────────────────────────── */}
      <Section id="implementation" border>
        <div style={MAX_W}>
          <SectionLabel>Implementation</SectionLabel>
          <SectionHeading className="mb-3">
            Engineering &amp; Test Architecture
          </SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-8">
              The project is structured as a modular C++ library with comprehensive automated test
              suites and dual benchmark harnesses to measure performance across diverse workload patterns:
            </BodyText>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ImplementationItem
              title="Core C++ Library"
              badge="C++23"
              description="Headers and implementations for FixedWindowLimiter, SlidingWindowLimiter, SlidingWindowCounterLimiter, and TokenBucketLimiter, sharing a unified sharded interface."
            />
            <ImplementationItem
              title="Distributed Redis Limiter"
              badge="hiredis"
              description="Production-grade RedisTokenBucketLimiter executing atomic server-side Lua scripts, synchronized against Redis TIME to prevent multi-host clock drift."
            />
            <ImplementationItem
              title="Unit & Concurrency Tests"
              badge="CMake"
              description="Test suites verifying window edge transitions, sliding-window accuracy, token bucket refill mathematics, and high-contention multi-threaded correctness."
            />
            <ImplementationItem
              title="Google Benchmark Suite"
              badge="Micro-bench"
              description="Nanosecond-precision micro-benchmarking harness measuring baseline single-operation execution time and CPU cycles prior to sharding."
            />
            <ImplementationItem
              title="Dedicated Final Benchmark"
              badge="std::chrono"
              description="Throughput benchmark measuring operations per second and latency across single-threaded, same-client contention, and 8-thread multi-client sharded parallel scenarios."
            />
            <ImplementationItem
              title="HTTP Demonstration Interface"
              badge="Network"
              description="An embedded HTTP demonstration interface verifying rate limiter behavior within a live request-response cycle."
            />
          </div>
        </div>
      </Section>

      {/* ── 7. Transition to Benchmarks ─────────────────────────────── */}
      <Section id="transition" border>
        <div style={MAX_W}>
          <div
            className="rounded p-8 sm:p-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6"
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
            }}
          >
            <div style={{ maxWidth: '640px' }}>
              <SectionLabel>Performance Validation</SectionLabel>
              <h3
                className="text-xl sm:text-2xl font-semibold mb-3 tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Empirical Benchmark Results
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Theoretical concurrency models must be verified against actual CPU execution.
                Page 2 presents the empirical measurements: comparing unsharded baseline benchmarks
                against the 64-shard architecture across thread contention patterns, accompanied by
                the distributed Redis latency baseline.
              </p>
            </div>

            <div className="shrink-0">
              <Link
                to="/benchmarks"
                className="inline-flex items-center gap-2 rounded px-5 py-3 text-sm font-medium no-underline transition-colors"
                style={{
                  color: '#000000',
                  backgroundColor: '#ffffff',
                  border: '1px solid #ffffff',
                }}
              >
                <span>Benchmark the system</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </Section>

    </main>
  )
}
