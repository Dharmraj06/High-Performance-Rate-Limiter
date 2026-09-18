import { Link } from 'react-router-dom'
import Section from '../components/Section.jsx'
import { SectionLabel, PageHeading, SectionHeading, BodyText, Mono } from '../components/Typography.jsx'
import { InMemoryPipeline, ConcurrentClientsDiagram, SameClientDiagram, RedisDiagram } from '../components/ArchDiagram.jsx'

/* ─── Stat Card ──────────────────────────────────────────────────── */
function StatCard({ value, label, detail }) {
  return (
    <div
      className="surface-card card-pad-md flex h-full flex-col"
    >
      <span
        className="block text-2xl sm:text-3xl font-semibold tabular-nums"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: 'var(--font-mono)' }}
      >
        {value}
      </span>
      <p className="mt-2 text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </p>
      <p className="mt-auto pt-4 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {detail}
      </p>
    </div>
  )
}

/* ─── Algorithm Card ─────────────────────────────────────────────── */
function AlgoCard({ name, tags, description, tradeOff }) {
  return (
    <div
      className="surface-card card-pad-lg flex h-full flex-col"
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {name}
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag}
              className="rounded px-2 py-0.5 text-xs"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <p className="mb-6 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
      <p className="mt-auto pt-5 text-xs leading-relaxed" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--text-primary)' }}>Trade-off: </span>{tradeOff}
      </p>
    </div>
  )
}

/* ─── Flow Step ──────────────────────────────────────────────────── */
function FlowStep({ number, title, detail }) {
  return (
    <div className="surface-card card-pad-lg">
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-semibold"
          style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
        >
          {number}
        </div>
        <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</h4>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{detail}</p>
    </div>
  )
}

/* ─── Overview Page ──────────────────────────────────────────────── */
export default function Overview() {
  return (
    <main>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <Section id="hero">
        <div className="page-container">
          <SectionLabel>C++ · Performance Engineering</SectionLabel>
          <PageHeading className="mb-3">C++ Rate Limiter</PageHeading>
          <div className="prose-narrow">
            <p
              className="text-base leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              A high-performance C++ rate limiter implementing four in-memory algorithms and a distributed
              Redis-backed engine. The project demonstrates how lock partitioning across 64 independent
              shards eliminates global mutex contention and scales throughput with thread count.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard value="C++23" label="Standard" detail="Zero external runtime deps for in-memory limiters." />
            <StatCard value="4" label="In-Memory Limiters" detail="Fixed Window, Sliding Window Log, Sliding Window Counter, Token Bucket." />
            <StatCard value="64" label="Independent Shards" detail="Hash-partitioned mutexes replacing a single global lock." />
            <StatCard value="1" label="Distributed Engine" detail="Redis-backed token bucket with atomic server-side Lua." />
          </div>
        </div>
      </Section>

      <div className="page-container">
        <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />
      </div>

      {/* ── Algorithms ──────────────────────────────────────────────── */}
      <Section id="algorithms">
        <div className="page-container">
          <SectionLabel>Algorithms</SectionLabel>
          <SectionHeading className="mb-2">Rate-Limiting Strategies</SectionHeading>
          <div className="prose-narrow">
            <BodyText className="mb-8">
              Four in-memory algorithms with distinct accuracy and memory trade-offs, plus a Redis-backed
              distributed implementation for cross-server quota enforcement.
            </BodyText>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <AlgoCard
              name="Fixed Window"
              tags={['O(1) memory', 'Approximate']}
              description="Counts requests in fixed-size time windows. Simple and fast."
              tradeOff="Boundary bursts — up to 2× the limit can pass near window transitions."
            />
            <AlgoCard
              name="Sliding Window Log"
              tags={['O(N) memory', 'Exact']}
              description="Stores a timestamped log per client. Evicts expired entries on each check."
              tradeOff="Exact enforcement, but per-request heap allocation proportional to traffic volume."
            />
            <AlgoCard
              name="Sliding Window Counter"
              tags={['O(1) memory', 'Approximate']}
              description="Approximates a sliding window using weighted counts from two adjacent fixed windows."
              tradeOff="Fixes boundary bursts at O(1) memory without storing individual timestamps."
            />
            <AlgoCard
              name="Token Bucket"
              tags={['O(1) memory', 'Burst-tolerant']}
              description="Tokens replenish continuously up to capacity. Requests consume one token each."
              tradeOff="Allows short controlled bursts above steady-state while maintaining average rate guarantees."
            />
          </div>

          {/* Redis distributed block */}
          <div
            className="surface-card surface-card-strong card-pad-lg mt-6"
          >
            <div className="mb-5 flex flex-wrap items-center gap-4">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Redis Token Bucket
              </h3>
              <span
                className="rounded px-2 py-0.5 text-xs"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', border: '1px solid var(--border-strong)', backgroundColor: 'var(--bg-subtle)' }}
              >
                Distributed
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                hiredis · Lua · Redis TIME
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Stores rate-limit state in Redis so multiple application servers share the same quota.
              Rate evaluation runs inside an atomic server-side Lua script using Redis <Mono>TIME</Mono>,
              preventing clock drift across hosts. The trade-off is IPC and network round-trip latency
              versus the sub-microsecond cost of in-memory execution.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Architecture ─────────────────────────────────────────────── */}
      <Section id="architecture" border>
        <div className="page-container">
          <SectionLabel>Architecture</SectionLabel>
          <SectionHeading className="mb-2">64-Shard Partitioned Concurrency</SectionHeading>
          <div className="prose-narrow">
            <BodyText className="mb-8">
              A single global mutex serializes all requests under concurrent load. Instead, each limiter
              partitions its client state across 64 shards. Each shard owns its client map and its own
              <Mono> std::mutex</Mono>. A client ID hashes deterministically to one shard; locking that
              shard leaves the remaining 63 unblocked. Different clients hash to different shards and
              execute in parallel. Same-client requests always reach the same shard, preserving correctness.
            </BodyText>
          </div>


          {/* ── Architecture diagram card ─────────────────────────── */}
          <div className="surface-card" style={{ padding: '32px 28px' }}>

            {/* A: In-memory request pipeline */}
            <InMemoryPipeline />

            <div style={{ margin: '32px 0', height: '1px', backgroundColor: 'var(--border)' }} />

            {/* B: Concurrent multi-client isolation */}
            <ConcurrentClientsDiagram />

            <div style={{ margin: '32px 0', height: '1px', backgroundColor: 'var(--border)' }} />

            {/* C: Same-client serialization */}
            <SameClientDiagram />

            <div style={{ margin: '32px 0', height: '1px', backgroundColor: 'var(--border)' }} />

            {/* D: Distributed Redis path */}
            <RedisDiagram />

          </div>
        </div>
      </Section>

      {/* ── Request Flow ─────────────────────────────────────────────── */}
      <Section id="request-flow" border>
        <div className="page-container">
          <SectionLabel>Execution Path</SectionLabel>
          <SectionHeading className="mb-6">Per-Request Flow</SectionHeading>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <FlowStep number="1" title="Hash to Shard" detail="Client ID is hashed modulo 64 to select the owning shard — no lock taken yet." />
            <FlowStep number="2" title="Acquire Shard Mutex" detail="Only the selected shard's mutex is locked. All other shards remain unblocked." />
            <FlowStep number="3" title="Find or Create State" detail="Client state is looked up in the shard's hash map, or initialized on first access." />
            <FlowStep number="4" title="Evaluate Limit" detail="The algorithm inspects its state and returns an allow or deny decision." />
            <FlowStep number="5" title="Opportunistic Cleanup" detail="Expired client entries are evicted during the shard's maintenance window — no background threads needed." />
            <FlowStep number="6" title="Return Result" detail="RateLimitResult is returned with the decision, remaining quota, and retry-after." />
          </div>
        </div>
      </Section>

      {/* ── Implementation ───────────────────────────────────────────── */}
      <Section id="implementation" border>
        <div className="page-container">
          <SectionLabel>Implementation</SectionLabel>
          <SectionHeading className="mb-6">Project Components</SectionHeading>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Core C++ Library', badge: 'C++23', detail: 'Four sharded in-memory rate limiters with a unified interface.' },
              { title: 'Redis Distributed Limiter', badge: 'hiredis', detail: 'Token bucket backed by Redis with atomic Lua evaluation and server-side TIME.' },
              { title: 'Unit & Concurrency Tests', badge: 'CMake', detail: 'Tests for algorithm correctness, edge transitions, and multi-threaded safety.' },
              { title: 'Google Benchmark Suite', badge: 'Micro-bench', detail: 'Nanosecond-precision baseline benchmarks before sharding.' },
              { title: 'Final Benchmark Suite', badge: 'std::chrono', detail: 'Throughput and latency across single-thread, same-client, and 8-thread multi-client scenarios.' },
              { title: 'HTTP Interface', badge: 'Demo', detail: 'Embedded HTTP server for manual end-to-end rate limiter verification.' },
            ].map(({ title, badge, detail }) => (
              <div
                key={title}
                className="surface-card card-pad-lg"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</h4>
                  <span
                    className="rounded px-2 py-0.5 text-xs whitespace-nowrap shrink-0"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
                  >
                    {badge}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Transition ───────────────────────────────────────────────── */}
      <Section id="benchmarks-link" border>
        <div className="page-container">
          <div
            className="surface-card surface-card-strong card-pad-lg flex flex-col gap-6 md:flex-row md:items-center md:justify-between"
          >
            <div className="min-w-0">
              <SectionLabel>Performance Validation</SectionLabel>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                Empirical Benchmark Results
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)', maxWidth: '36rem' }}>
                Baseline unsharded measurements vs. 64-shard architecture across concurrency scenarios,
                with Redis distributed latency context.
              </p>
            </div>
            <div className="shrink-0">
              <Link
                to="/benchmarks"
                className="inline-flex items-center justify-center gap-2 rounded px-6 py-2.5 text-sm font-medium no-underline transition-opacity hover:opacity-90"
                style={{ color: '#000000', backgroundColor: '#ffffff', border: '1px solid #ffffff' }}
              >
                View benchmarks <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </Section>

    </main>
  )
}
