import { Link } from 'react-router-dom'
import Section from '../components/Section.jsx'
import { SectionLabel, PageHeading, SectionHeading, BodyText, Mono } from '../components/Typography.jsx'
import { ArchDiagram, ArchNode, ArchArrow } from '../components/ArchDiagram.jsx'

const MAX_W = {
  maxWidth: '1100px',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: '1.5rem',
  paddingRight: '1.5rem',
}
const PROSE = { maxWidth: '680px' }

/* ─── Stat Card ──────────────────────────────────────────────────── */
function StatCard({ value, label, detail }) {
  return (
    <div
      className="flex flex-col h-full rounded p-5"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
    >
      <span
        className="block text-2xl sm:text-3xl font-semibold tabular-nums"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: 'var(--font-mono)' }}
      >
        {value}
      </span>
      <p className="mt-1 text-xs uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </p>
      <p className="mt-auto pt-3 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {detail}
      </p>
    </div>
  )
}

/* ─── Algorithm Card ─────────────────────────────────────────────── */
function AlgoCard({ name, tags, description, tradeOff }) {
  return (
    <div
      className="flex flex-col h-full rounded p-6"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
    >
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {name}
        </h3>
        <div className="flex gap-1.5 flex-wrap">
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
      <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
        {description}
      </p>
      <p className="mt-auto text-xs leading-relaxed pt-3" style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border)' }}>
        <span style={{ color: 'var(--text-primary)' }}>Trade-off: </span>{tradeOff}
      </p>
    </div>
  )
}

/* ─── Flow Step ──────────────────────────────────────────────────── */
function FlowStep({ number, title, detail }) {
  return (
    <div className="flex flex-col h-full p-5 rounded" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
      <div className="flex items-center gap-3 mb-2">
        <div
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-semibold"
          style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-strong)', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
        >
          {number}
        </div>
        <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</h4>
      </div>
      <p className="text-sm leading-relaxed mt-auto" style={{ color: 'var(--text-muted)' }}>{detail}</p>
    </div>
  )
}

/* ─── Overview Page ──────────────────────────────────────────────── */
export default function Overview() {
  return (
    <main>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <Section id="hero">
        <div style={MAX_W}>
          <SectionLabel>C++ · Performance Engineering</SectionLabel>
          <PageHeading className="mb-3">C++ Rate Limiter</PageHeading>
          <div style={PROSE}>
            <p
              className="text-base leading-relaxed"
              style={{ color: 'var(--text-secondary)' }}
            >
              A high-performance C++ rate limiter implementing four in-memory algorithms and a distributed
              Redis-backed engine. The project demonstrates how lock partitioning across 64 independent
              shards eliminates global mutex contention and scales throughput with thread count.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard value="C++23" label="Standard" detail="Zero external runtime deps for in-memory limiters." />
            <StatCard value="4" label="In-Memory Limiters" detail="Fixed Window, Sliding Window Log, Sliding Window Counter, Token Bucket." />
            <StatCard value="64" label="Independent Shards" detail="Hash-partitioned mutexes replacing a single global lock." />
            <StatCard value="1" label="Distributed Engine" detail="Redis-backed token bucket with atomic server-side Lua." />
          </div>
        </div>
      </Section>

      <div style={{ ...MAX_W, paddingTop: 0, paddingBottom: 0 }}>
        <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />
      </div>

      {/* ── Algorithms ──────────────────────────────────────────────── */}
      <Section id="algorithms">
        <div style={MAX_W}>
          <SectionLabel>Algorithms</SectionLabel>
          <SectionHeading className="mb-2">Rate-Limiting Strategies</SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-6">
              Four in-memory algorithms with distinct accuracy and memory trade-offs, plus a Redis-backed
              distributed implementation for cross-server quota enforcement.
            </BodyText>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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
            className="mt-4 rounded p-5"
            style={{ border: '1px solid var(--border-strong)', backgroundColor: 'var(--bg-surface)' }}
          >
            <div className="flex flex-wrap items-baseline gap-3 mb-2">
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
        <div style={MAX_W}>
          <SectionLabel>Architecture</SectionLabel>
          <SectionHeading className="mb-2">64-Shard Partitioned Concurrency</SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-6">
              A single global mutex serializes all requests under concurrent load. Instead, each limiter
              partitions its client state across 64 shards. Each shard owns its client map and its own
              <Mono> std::mutex</Mono>. A client ID hashes deterministically to one shard; locking that
              shard leaves the remaining 63 unblocked. Different clients hash to different shards and
              execute in parallel. Same-client requests always reach the same shard, preserving correctness.
            </BodyText>
          </div>

          <div
            className="rounded p-5 sm:p-7"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            {/* Diagram 1: In-Memory Pipeline */}
            <p
              className="mb-5 text-center text-xs uppercase tracking-widest"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
            >
              In-Memory Sharded Pipeline
            </p>

            <div className="hidden lg:block">
              <ArchDiagram>
                <ArchNode label="allow(clientId)" mono />
                <ArchArrow label="hash % 64" />
                <ArchNode label="One of 64 Shards" sub="Shard index" highlight />
                <ArchArrow label="lock" />
                <ArchNode label="Shard Mutex + State" sub="std::mutex + map" highlight />
                <ArchArrow label="eval" />
                <ArchNode label="Algorithm" sub="Fixed / Sliding / Token" />
                <ArchArrow />
                <ArchNode label="RateLimitResult" sub="allow / deny" mono />
              </ArchDiagram>
            </div>
            <div className="lg:hidden flex flex-col items-center gap-1">
              <ArchNode label="allow(clientId)" mono />
              <ArchArrow direction="down" label="hash % 64" />
              <ArchNode label="One of 64 Shards" sub="Shard Mutex + State" highlight />
              <ArchArrow direction="down" label="eval algorithm" />
              <ArchNode label="RateLimitResult" sub="allow / deny" mono />
            </div>

            <div className="my-7 h-px" style={{ backgroundColor: 'var(--border)' }} />

            {/* Diagram 2: Multi-Client Isolation */}
            <p
              className="mb-5 text-center text-xs uppercase tracking-widest"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
            >
              Concurrent Multi-Client Isolation
            </p>
            <div className="flex flex-col gap-3">
              <ArchDiagram>
                <ArchNode label='Client A' sub='Thread 1' mono />
                <ArchArrow label="hash % 64" />
                <ArchNode label="Shard 12" sub="Mutex 12" highlight />
                <ArchArrow />
                <ArchNode label="Allow / Deny" sub="Result A" mono />
              </ArchDiagram>
              <p className="text-center text-xs" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                — parallel, no blocking —
              </p>
              <ArchDiagram>
                <ArchNode label='Client B' sub='Thread 2' mono />
                <ArchArrow label="hash % 64" />
                <ArchNode label="Shard 37" sub="Mutex 37" highlight />
                <ArchArrow />
                <ArchNode label="Allow / Deny" sub="Result B" mono />
              </ArchDiagram>
            </div>

            <div className="my-7 h-px" style={{ backgroundColor: 'var(--border)' }} />

            {/* Diagram 3: Distributed Path */}
            <p
              className="mb-5 text-center text-xs uppercase tracking-widest"
              style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}
            >
              Distributed Redis Path
            </p>
            <ArchDiagram>
              <ArchNode label="Application Host" mono />
              <ArchArrow label="hiredis" />
              <ArchNode label="Atomic Lua Script" sub="Redis TIME" highlight />
              <ArchArrow />
              <ArchNode label="Redis State" sub="Shared keys" highlight />
              <ArchArrow />
              <ArchNode label="Allow / Deny" mono />
            </ArchDiagram>
          </div>
        </div>
      </Section>

      {/* ── Request Flow ─────────────────────────────────────────────── */}
      <Section id="request-flow" border>
        <div style={MAX_W}>
          <SectionLabel>Execution Path</SectionLabel>
          <SectionHeading className="mb-5">Per-Request Flow</SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
        <div style={MAX_W}>
          <SectionLabel>Implementation</SectionLabel>
          <SectionHeading className="mb-5">Project Components</SectionHeading>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
                className="flex flex-col h-full rounded p-5"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</h4>
                  <span
                    className="rounded px-2 py-0.5 text-xs whitespace-nowrap"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
                  >
                    {badge}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mt-auto" style={{ color: 'var(--text-secondary)' }}>{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Transition ───────────────────────────────────────────────── */}
      <Section id="benchmarks-link" border>
        <div style={MAX_W}>
          <div
            className="rounded p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-strong)' }}
          >
            <div className="flex-1 min-w-0">
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
                className="inline-flex items-center justify-center gap-2 rounded px-6 py-3 text-sm font-medium no-underline transition-opacity hover:opacity-90"
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
