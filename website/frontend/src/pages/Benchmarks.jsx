import Section from '../components/Section.jsx'
import PlaceholderBlock from '../components/PlaceholderBlock.jsx'
import { SectionLabel, PageHeading, SectionHeading, BodyText, Mono } from '../components/Typography.jsx'

/* ─── Content width ──────────────────────────────────────────────── */
const MAX_W = { maxWidth: '1100px', marginLeft: 'auto', marginRight: 'auto', paddingLeft: '1.5rem', paddingRight: '1.5rem' }
const PROSE  = { maxWidth: '680px' }

/* ─── Condition item ─────────────────────────────────────────────── */
function ConditionRow({ label, value }) {
  return (
    <div
      className="flex items-baseline justify-between gap-4 py-3"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <span
        className="text-sm"
        style={{ color: 'var(--text-secondary)' }}
      >
        {label}
      </span>
      <span
        className="text-sm font-medium tabular-nums"
        style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}
      >
        {value}
      </span>
    </div>
  )
}

/* ─── Scenario badge ─────────────────────────────────────────────── */
function ScenarioBadge({ label, description }) {
  return (
    <div
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
        {description}
      </p>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function Benchmarks() {
  return (
    <main>

      {/* ── Intro ──────────────────────────────────────────────────── */}
      <Section id="benchmarks-intro">
        <div style={MAX_W}>
          <SectionLabel>Benchmarks</SectionLabel>
          <PageHeading className="mb-5">
            Performance Analysis
          </PageHeading>
          <div style={PROSE}>
            <BodyText>
              Two benchmark suites were used: a Google Benchmark micro-benchmarking harness
              for nanosecond-precision latency measurements, and a standalone{' '}
              <Mono>std::chrono</Mono>-based throughput benchmark covering all five
              rate limiters across three concurrency scenarios.
            </BodyText>
          </div>
        </div>
      </Section>

      {/* ── Conditions ─────────────────────────────────────────────── */}
      <Section id="conditions" border>
        <div style={MAX_W}>
          <SectionLabel>Conditions</SectionLabel>
          <SectionHeading className="mb-3">
            Benchmark Environment
          </SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-8">
              All benchmarks were run in Release mode with <Mono>-O3</Mono> optimization on the
              same host. CPU frequency scaling was disabled to ensure stable measurements.
            </BodyText>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Build conditions */}
            <div
              className="rounded"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}
            >
              <div
                className="px-5 py-3"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <span
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  Build
                </span>
              </div>
              <div className="px-5">
                <ConditionRow label="Build type"      value="Release" />
                <ConditionRow label="Optimization"    value="-O3" />
                <ConditionRow label="Standard"        value="C++23" />
                <ConditionRow label="Compiler"        value="GCC 13+" />
                <ConditionRow label="CPU scaling"     value="Disabled" />
              </div>
            </div>

            {/* System conditions */}
            <div
              className="rounded"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)', overflow: 'hidden' }}
            >
              <div
                className="px-5 py-3"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <span
                  className="text-xs font-medium uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                >
                  System
                </span>
              </div>
              <div className="px-5">
                <ConditionRow label="CPU cores"       value="12" />
                <ConditionRow label="Clock speed"     value="2496 MHz" />
                <ConditionRow label="L1 data cache"   value="48 KiB" />
                <ConditionRow label="L2 cache"        value="1280 KiB" />
                <ConditionRow label="L3 cache"        value="12 MiB" />
              </div>
            </div>
          </div>

          {/* Scenarios */}
          <SectionHeading className="mt-10 mb-4">
            Test Scenarios
          </SectionHeading>
          <div className="grid gap-4 sm:grid-cols-3">
            <ScenarioBadge
              label="Single Thread"
              description="250,000 operations on a single client from one thread. Measures baseline per-operation cost with no lock contention."
            />
            <ScenarioBadge
              label="Same Client · 8 Threads"
              description="2,000,000 total operations from 8 threads all targeting the same client ID. Measures contention under maximum same-shard pressure."
            />
            <ScenarioBadge
              label="Multiple Clients · 8 Threads"
              description="2,000,000 total operations from 8 threads, each using a unique client ID. Measures throughput with shard parallelism fully utilized."
            />
          </div>

          <div
            className="mt-4 rounded p-4"
            style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
          >
            <p
              className="text-sm"
              style={{ color: 'var(--text-secondary)' }}
            >
              <span
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Distributed (Redis):
              </span>
              {' '}20,000 operations against a local Redis 6.0 server via <Mono>hiredis</Mono>.
              Measures full IPC round-trip including socket overhead, kernel context switches,
              protocol serialization, and Redis Lua script interpretation.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Baseline Results ───────────────────────────────────────── */}
      <Section id="baseline" border>
        <div style={MAX_W}>
          <SectionLabel>Baseline</SectionLabel>
          <SectionHeading className="mb-3">
            Baseline Results
          </SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-8">
              Google Benchmark micro-benchmark results measured before the 64-shard optimization.
              Each benchmark was run with 3 repetitions; results show mean real-time latency per operation.
            </BodyText>
          </div>

          <PlaceholderBlock label="Baseline benchmark table — data from /api/benchmark/baseline" height="18rem" />
        </div>
      </Section>

      {/* ── Final Results ──────────────────────────────────────────── */}
      <Section id="final" border>
        <div style={MAX_W}>
          <SectionLabel>Final</SectionLabel>
          <SectionHeading className="mb-3">
            Final Results
          </SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-8">
              Standalone <Mono>std::chrono</Mono> benchmark results after the sharded architecture.
              Covers all five limiters across all three concurrency scenarios.
            </BodyText>
          </div>

          <PlaceholderBlock label="Final benchmark table — data from /api/benchmark/final" height="18rem" />
        </div>
      </Section>

      {/* ── Comparison ─────────────────────────────────────────────── */}
      <Section id="comparison" border>
        <div style={MAX_W}>
          <SectionLabel>Comparison</SectionLabel>
          <SectionHeading className="mb-3">
            Baseline vs. Final
          </SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-8">
              Direct comparison of corresponding baseline and final measurements. The sharded
              architecture delivers meaningful throughput improvements in multi-client workloads,
              where independent mutexes allow shard-level parallelism. Single-threaded and
              same-client results reflect measurement methodology differences between the
              two benchmark suites.
            </BodyText>
          </div>

          <PlaceholderBlock label="Comparison view — data from /api/benchmark/comparison" height="20rem" />
        </div>
      </Section>

      {/* ── Redis / Distributed ────────────────────────────────────── */}
      <Section id="distributed" border>
        <div style={MAX_W}>
          <SectionLabel>Distributed</SectionLabel>
          <SectionHeading className="mb-3">
            Redis Token Bucket
          </SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-4">
              The Redis Token Bucket operates fundamentally differently from the in-memory
              limiters and cannot be directly compared to them. Its measurements capture the
              complete cost of distributed rate limiting: network round-trips, kernel scheduling,
              protocol serialization, and atomic Lua script execution within Redis.
            </BodyText>
            <BodyText className="mb-8">
              This is not a performance regression — it is the expected and accepted cost of
              cross-server quota consistency.
            </BodyText>
          </div>

          <PlaceholderBlock label="Distributed benchmark results" height="14rem" />
        </div>
      </Section>

      {/* ── Observations ───────────────────────────────────────────── */}
      <Section id="observations" border>
        <div style={MAX_W}>
          <SectionLabel>Analysis</SectionLabel>
          <SectionHeading className="mb-3">
            Key Observations
          </SectionHeading>
          <div style={PROSE}>
            <BodyText className="mb-4">
              The results confirm that the 64-shard architecture eliminates the primary bottleneck
              in concurrent workloads. When clients hash to independent shards, threads execute
              in parallel without mutual exclusion, achieving near-linear scaling with thread count.
            </BodyText>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              {
                heading: 'Multi-Client Workload',
                body: 'The sharded architecture achieves up to 8.8× throughput improvement over the unsharded baseline in 8-thread multi-client scenarios by fully eliminating cross-client lock contention.',
              },
              {
                heading: 'Same-Client Workload',
                body: 'Same-client requests always route to the same shard, preserving correctness under concurrent access. Performance here scales with shard throughput, not raw thread count.',
              },
              {
                heading: 'Algorithm Trade-offs',
                body: 'Sliding Window Counter leads in throughput with O(1) fixed memory. Sliding Window Log is ~30% slower due to heap-allocated timestamps but provides exact enforcement.',
              },
              {
                heading: 'Redis Context',
                body: 'At ~12K ops/sec and ~81µs per operation, Redis latency is dominated by IPC and socket overhead — expected for any distributed coordination primitive.',
              },
            ].map(({ heading, body }) => (
              <div
                key={heading}
                className="rounded p-5"
                style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
              >
                <p
                  className="mb-2 text-sm font-medium"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {heading}
                </p>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

    </main>
  )
}
