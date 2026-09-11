import Section from '../components/Section.jsx'
import PlaceholderBlock from '../components/PlaceholderBlock.jsx'
import { SectionLabel, PageHeading, SectionHeading, BodyText, Mono } from '../components/Typography.jsx'
import { ArchDiagram, ArchNode, ArchArrow } from '../components/ArchDiagram.jsx'

/* ─── Content width constant ─────────────────────────────────────── */
const MAX_W = { maxWidth: '1100px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }
const PROSE  = { maxWidth: '680px' }

/* ─── Small stat pill ────────────────────────────────────────────── */
function StatPill({ value, label }) {
  return (
    <div
      className="flex flex-col gap-1 rounded px-5 py-4"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
    >
      <span
        className="text-2xl font-semibold tracking-tight"
        style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
      >
        {value}
      </span>
      <span
        className="text-xs"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
      >
        {label}
      </span>
    </div>
  )
}

/* ─── Algorithm card ─────────────────────────────────────────────── */
function AlgoCard({ name, tag, description }) {
  return (
    <div
      className="rounded p-5 transition-colors"
      style={{
        border: '1px solid var(--border)',
        backgroundColor: 'var(--bg-surface)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-strong)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
      }}
    >
      <div className="mb-2 flex items-center justify-between gap-3">
        <span
          className="text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {name}
        </span>
        <span
          className="rounded px-2 py-0.5 text-xs"
          style={{
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border)',
            whiteSpace: 'nowrap',
          }}
        >
          {tag}
        </span>
      </div>
      <p
        className="text-sm leading-relaxed"
        style={{ color: 'var(--text-muted)' }}
      >
        {description}
      </p>
    </div>
  )
}

/* ─── Request flow step ──────────────────────────────────────────── */
function FlowStep({ step, title, detail }) {
  return (
    <div className="flex gap-4">
      <div
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-semibold"
        style={{
          backgroundColor: 'var(--bg-subtle)',
          border: '1px solid var(--border-strong)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-mono)',
        }}
      >
        {step}
      </div>
      <div>
        <p
          className="mb-0.5 text-sm font-medium"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </p>
        <p
          className="text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          {detail}
        </p>
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function Overview() {
  return (
    <main>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <Section id="hero">
        <div style={MAX_W}>
          <SectionLabel>Project</SectionLabel>
          <PageHeading className="mb-5">
            C++ Rate Limiter
          </PageHeading>
          <div style={PROSE}>
            <BodyText>
              A high-performance, production-ready rate limiting library written in C++23.
              Supports four distinct algorithms, 64-shard lock partitioning for concurrent
              workloads, and a Redis-backed distributed limiter for cross-server quota enforcement.
            </BodyText>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatPill value="4" label="algorithms" />
            <StatPill value="64" label="shards" />
            <StatPill value="27M+" label="ops / sec" />
            <StatPill value="36 ns" label="avg latency" />
          </div>
        </div>
      </Section>

      {/* ── Divider */}
      <div style={{ ...MAX_W, paddingTop: 0, paddingBottom: 0 }}>
        <div style={{ height: '1px', backgroundColor: 'var(--border)' }} />
      </div>

      {/* ── Algorithms ────────────────────────────────────────────── */}
      <Section id="algorithms" border={false}>
        <div style={MAX_W}>
          <SectionLabel>Algorithms</SectionLabel>
          <SectionHeading className="mb-3">
            Four Rate Limiting Strategies
          </SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-8">
              Each algorithm offers a different trade-off between accuracy, memory, and performance.
              All in-memory implementations share the same sharded-concurrency architecture.
            </BodyText>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AlgoCard
              name="Fixed Window"
              tag="O(1) memory"
              description="Divides time into fixed-size windows. Simple and extremely cache-friendly. Subject to burst traffic at window boundaries."
            />
            <AlgoCard
              name="Sliding Window Log"
              tag="Exact accuracy"
              description="Maintains a timestamped request log for each client. Guarantees exact boundary enforcement at the cost of per-request heap allocations."
            />
            <AlgoCard
              name="Sliding Window Counter"
              tag="O(1) memory · fastest"
              description="Approximates a sliding window using a weighted counter interpolation between adjacent fixed windows. Fixes boundary bursts without heap allocations."
            />
            <AlgoCard
              name="In-Memory Token Bucket"
              tag="Burst-friendly"
              description="Grants tokens at a fixed refill rate. Allows controlled short bursts above steady-state while maintaining long-term rate guarantees."
            />
          </div>

          {/* Distributed */}
          <div
            className="mt-4 rounded p-5"
            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-3">
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    Redis Token Bucket
                  </span>
                  <span
                    className="rounded px-2 py-0.5 text-xs"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--bg-subtle)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    Distributed
                  </span>
                </div>
                <p
                  className="text-sm"
                  style={{ color: 'var(--text-muted)', maxWidth: '600px' }}
                >
                  Executes a server-side Lua script atomically within Redis 6.0+. Uses Redis&apos; own
                  clock (<Mono>TIME</Mono>) to prevent client-side clock drift. Enables multiple
                  application servers behind a load balancer to share a single unified rate limit.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Architecture ──────────────────────────────────────────── */}
      <Section id="architecture" border>
        <div style={MAX_W}>
          <SectionLabel>Architecture</SectionLabel>
          <SectionHeading className="mb-3">
            64-Shard Lock Partitioning
          </SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-10">
              A global mutex would serialize all requests. Instead, each limiter partitions its
              client state across 64 independent shards, each guarded by its own mutex. Requests
              from different clients hash to different shards and proceed in parallel without
              contention.
            </BodyText>
          </div>

          {/* Architecture diagram placeholder — will be replaced with full ArchDiagram */}
          <div
            className="rounded p-8"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <p
              className="mb-6 text-center text-xs uppercase tracking-widest"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              Multi-Client Request Flow
            </p>

            <ArchDiagram>
              <ArchNode label="Client A" sub="GET /api" />
              <ArchArrow label="hash(id)" />
              <ArchNode label="Shard 12" sub="Mutex + Map" highlight />
              <ArchArrow />
              <ArchNode label="Allow / Deny" sub="RateLimitResult" />
            </ArchDiagram>

            <div
              className="my-6 h-px"
              style={{ backgroundColor: 'var(--border)' }}
            />

            <ArchDiagram>
              <ArchNode label="Client B" sub="GET /api" />
              <ArchArrow label="hash(id)" />
              <ArchNode label="Shard 37" sub="Mutex + Map" highlight />
              <ArchArrow />
              <ArchNode label="Allow / Deny" sub="RateLimitResult" />
            </ArchDiagram>

            <p
              className="mt-6 text-center text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              Different clients hash to different shards — no cross-client blocking.
            </p>
          </div>

          {/* Shard properties */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Isolated Mutexes', detail: 'Each of 64 shards holds its own std::mutex, eliminating global lock contention.' },
              { label: 'Same-Client Safety', detail: 'Same client ID always maps to the same shard, preventing concurrent state corruption.' },
              { label: 'Zero Background Threads', detail: 'Expired client state is cleaned up opportunistically inside shard locks during normal calls.' },
            ].map(({ label, detail }) => (
              <div
                key={label}
                className="rounded p-4"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
              >
                <p
                  className="mb-1 text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {label}
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Request Flow ──────────────────────────────────────────── */}
      <Section id="request-flow" border>
        <div style={MAX_W}>
          <SectionLabel>Request Flow</SectionLabel>
          <SectionHeading className="mb-3">
            Per-Request Execution Path
          </SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-8">
              Every call to <Mono>allow(clientId, now)</Mono> follows a deterministic, lock-minimal path.
            </BodyText>
          </div>

          <div
            className="rounded p-6"
            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)', maxWidth: '580px' }}
          >
            <div className="flex flex-col gap-5">
              <FlowStep step="1" title="Hash to Shard" detail="clientId is hashed to select one of 64 shards." />
              <FlowStep step="2" title="Acquire Shard Mutex" detail="Only that shard's mutex is locked — parallel requests to other clients proceed unimpeded." />
              <FlowStep step="3" title="Find or Create State" detail="Client state is looked up by ID; new clients are initialized on first access." />
              <FlowStep step="4" title="Evaluate Limit" detail="Algorithm-specific logic determines whether to allow or deny the request and computes retry-after." />
              <FlowStep step="5" title="Opportunistic Cleanup" detail="If the shard's cleanup interval has elapsed, expired inactive clients are evicted before unlocking." />
              <FlowStep step="6" title="Return Result" detail="RateLimitResult is returned with allowed/denied status, remaining quota, and retry-after." />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Implementation ────────────────────────────────────────── */}
      <Section id="implementation" border>
        <div style={MAX_W}>
          <SectionLabel>Implementation</SectionLabel>
          <SectionHeading className="mb-3">
            Project Overview
          </SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-8">
              The project ships five limiter implementations, a comprehensive test suite,
              a Google Benchmark micro-benchmarking harness, a standalone chrono benchmark,
              and a built-in HTTP demonstration server.
            </BodyText>
          </div>

          <PlaceholderBlock label="Implementation Details — Coming Soon" height="14rem" />
        </div>
      </Section>

    </main>
  )
}
