import { useState, useEffect } from 'react'
import Section from '../components/Section.jsx'
import { SectionLabel, PageHeading, SectionHeading, BodyText, Mono } from '../components/Typography.jsx'

const MAX_W = {
  maxWidth: '1100px',
  marginLeft: 'auto',
  marginRight: 'auto',
  paddingLeft: '1.5rem',
  paddingRight: '1.5rem',
}
const PROSE = { maxWidth: '680px' }

/* ─── Formatting Helpers ─────────────────────────────────────────── */
function fmtInt(v)  { return (v == null || isNaN(v)) ? '—' : Math.round(v).toLocaleString() }
function fmtDec(v, d = 2) { return (v == null || isNaN(v)) ? '—' : Number(v).toFixed(d) }
function fmtPct(v)  { if (v == null || isNaN(v)) return '—'; const s = v > 0 ? '+' : ''; return `${s}${v.toFixed(1)}%` }
function fmtX(v)    { return (v == null || isNaN(v)) ? '—' : `${Number(v).toFixed(1)}×` }

function fmtLatency(ns) {
  if (ns == null || isNaN(ns)) return '—'
  if (ns >= 1000) return `${fmtDec(ns / 1000, 1)} µs`
  return `${fmtDec(ns, 1)} ns`
}

/* ─── Table Primitives ───────────────────────────────────────────── */
function Th({ children, right }) {
  return (
    <th
      className={`px-4 py-3 text-xs font-medium uppercase tracking-wider ${right ? 'text-right' : ''}`}
      style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}
    >
      {children}
    </th>
  )
}

function Td({ children, right, mono, primary, dim }) {
  return (
    <td
      className={`px-4 py-3 text-sm ${right ? 'text-right tabular-nums' : ''}`}
      style={{
        fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        color: dim ? 'var(--text-muted)' : primary ? 'var(--text-primary)' : 'var(--text-secondary)',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </td>
  )
}

function TableWrap({ children }) {
  return (
    <div
      className="overflow-x-auto rounded"
      style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
    >
      <table className="w-full text-left border-collapse">
        {children}
      </table>
    </div>
  )
}

/* ─── Benchmarks Page ────────────────────────────────────────────── */
export default function Benchmarks() {
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [baselineData, setBaselineData] = useState(null)
  const [finalData, setFinalData]     = useState(null)
  const [compData, setCompData]       = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const [bRes, fRes, cRes] = await Promise.all([
        fetch('/api/benchmark/baseline'),
        fetch('/api/benchmark/final'),
        fetch('/api/benchmark/comparison'),
      ])
      if (!bRes.ok) throw new Error(`/api/benchmark/baseline → HTTP ${bRes.status}`)
      if (!fRes.ok) throw new Error(`/api/benchmark/final → HTTP ${fRes.status}`)
      if (!cRes.ok) throw new Error(`/api/benchmark/comparison → HTTP ${cRes.status}`)
      setBaselineData(await bRes.json())
      setFinalData(await fRes.json())
      setCompData(await cRes.json())
    } catch (e) {
      setError(e.message || 'Failed to load benchmark data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  /* Derived data */
  const env      = compData?.summary?.baseline_environment ?? baselineData?.context ?? {}
  const cfg      = compData?.summary?.final_config ?? finalData?.benchmark ?? {}
  const comps    = compData?.comparisons ?? []
  const comparable    = comps.filter(c => c.comparable)
  const nonComparable = comps.filter(c => !c.comparable)
  const redis = finalData?.results?.find(r => r.type === 'Distributed' || r.scenario === 'Redis')

  /* Key stats for observations */
  const multiComps  = comparable.filter(c => c.scenario === 'Multiple Clients')
  const maxSpeedup  = multiComps.reduce((m, c) => c.comparison.speedup_factor > (m?.comparison?.speedup_factor ?? 0) ? c : m, null)

  return (
    <main>

      {/* ── Intro ───────────────────────────────────────────────────── */}
      <Section id="benchmarks-intro">
        <div style={MAX_W}>
          <SectionLabel>Benchmarks</SectionLabel>
          <PageHeading className="mb-5">Performance Analysis</PageHeading>
          <div style={PROSE}>
            <BodyText>
              Two benchmark suites: a Google Benchmark micro-benchmarking harness for nanosecond-precision
              baseline measurements, and a standalone <Mono>std::chrono</Mono> harness measuring the
              64-shard architecture across single-thread, same-client, and multi-client concurrency scenarios.
            </BodyText>
          </div>
        </div>
      </Section>

      {/* ── Loading / Error ─────────────────────────────────────────── */}
      {loading && (
        <Section id="loading">
          <div style={MAX_W}>
            <div
              className="rounded p-8 text-center"
              style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
            >
              <span className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Loading benchmark data…
              </span>
            </div>
          </div>
        </Section>
      )}

      {!loading && error && (
        <Section id="error">
          <div style={MAX_W}>
            <div className="rounded p-6" style={{ border: '1px solid var(--border-strong)', backgroundColor: 'var(--bg-surface)' }}>
              <span className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                API Error
              </span>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{error}</p>
              <button
                type="button" onClick={load}
                className="cursor-pointer rounded px-4 py-2 text-xs font-medium uppercase tracking-wide"
                style={{ backgroundColor: '#ffffff', color: '#000000', border: '1px solid #ffffff', fontFamily: 'var(--font-mono)' }}
              >
                Retry
              </button>
            </div>
          </div>
        </Section>
      )}

      {!loading && !error && (
        <>
          {/* ── Conditions ──────────────────────────────────────────── */}
          <Section id="conditions" border>
            <div style={MAX_W}>
              <SectionLabel>Conditions</SectionLabel>
              <SectionHeading className="mb-6">Benchmark Environment</SectionHeading>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {[
                  ['Build', `-O3 / Release · C++23 · GCC 13+`],
                  ['CPU', `${env.num_cpus ?? 12} cores · ${env.mhz_per_cpu ?? 2496} MHz · scaling disabled`],
                  ['Single-Thread', `${fmtInt(cfg.single_thread_operations)} operations per limiter`],
                  ['Multi-Thread', `${fmtInt(cfg.multi_thread_total_operations)} ops · ${cfg.threads ?? 8} threads · same-client & multi-client`],
                ].map(([label, val]) => (
                  <div key={label} className="rounded p-4" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                    <span className="text-xs uppercase tracking-wider block mb-1" style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{val}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                Baseline: Google Benchmark aggregate mean across 3 repetitions.
                Final: wall-clock <Mono>std::chrono</Mono> harness across {cfg.threads ?? 8} worker threads.
              </p>
            </div>
          </Section>

          {/* ── Baseline Results ────────────────────────────────────── */}
          <Section id="baseline" border>
            <div style={MAX_W}>
              <SectionLabel>Baseline</SectionLabel>
              <SectionHeading className="mb-3">Baseline Measurements — Google Benchmark</SectionHeading>
              <div style={PROSE}>
                <BodyText className="mb-6">
                  Unsharded implementations, measured before the 64-shard architecture. All values are
                  mean aggregates across 3 repetitions.
                </BodyText>
              </div>

              <TableWrap>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
                    <Th>Algorithm</Th>
                    <Th>Scenario</Th>
                    <Th right>Threads</Th>
                    <Th right>Throughput (ops/s)</Th>
                    <Th right>Avg Latency</Th>
                    <Th right>CPU Time</Th>
                  </tr>
                </thead>
                <tbody>
                  {comparable.map(({ name, scenario, baseline }, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <Td primary>{name}</Td>
                      <Td>{scenario}</Td>
                      <Td right mono>{baseline.threads}</Td>
                      <Td right mono primary>{fmtInt(baseline.throughput_ops_sec)}</Td>
                      <Td right mono>{fmtLatency(baseline.avg_latency_ns)}</Td>
                      <Td right mono dim>{fmtDec(baseline.cpu_time_ns, 1)} ns</Td>
                    </tr>
                  ))}
                </tbody>
              </TableWrap>
            </div>
          </Section>

          {/* ── Final Results ────────────────────────────────────────── */}
          <Section id="final" border>
            <div style={MAX_W}>
              <SectionLabel>Final</SectionLabel>
              <SectionHeading className="mb-3">Final Measurements — 64-Shard Architecture</SectionHeading>
              <div style={PROSE}>
                <BodyText className="mb-6">
                  Standalone <Mono>std::chrono</Mono> measurements after sharding. Redis Token Bucket is
                  shown separately; its latency reflects IPC and network round-trip cost, not algorithmic overhead.
                </BodyText>
              </div>

              <TableWrap>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
                    <Th>Algorithm</Th>
                    <Th>Scenario</Th>
                    <Th right>Total Ops</Th>
                    <Th right>Duration</Th>
                    <Th right>Throughput (ops/s)</Th>
                    <Th right>Avg Latency</Th>
                  </tr>
                </thead>
                <tbody>
                  {finalData?.results?.map((item, i) => {
                    const isDist = item.type === 'Distributed' || item.scenario === 'Redis'
                    return (
                      <tr
                        key={i}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          backgroundColor: isDist ? 'rgba(255,255,255,0.02)' : 'transparent',
                        }}
                      >
                        <Td primary>
                          {item.name}
                          {isDist && (
                            <span className="ml-2 rounded px-1.5 py-0.5 text-xs" style={{ fontFamily: 'var(--font-mono)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                              distributed
                            </span>
                          )}
                        </Td>
                        <Td>{item.scenario}</Td>
                        <Td right mono>{fmtInt(item.total_ops)}</Td>
                        <Td right mono>{fmtDec(item.duration_ms, 2)} ms</Td>
                        <Td right mono primary>{fmtInt(item.throughput_ops_sec)}</Td>
                        <Td right mono>{fmtLatency(item.avg_latency_ns)}</Td>
                      </tr>
                    )
                  })}
                </tbody>
              </TableWrap>
            </div>
          </Section>

          {/* ── Comparison ──────────────────────────────────────────── */}
          <Section id="comparison" border>
            <div style={MAX_W}>
              <SectionLabel>Comparison</SectionLabel>
              <SectionHeading className="mb-3">Baseline vs. Final</SectionHeading>
              <div style={PROSE}>
                <BodyText className="mb-6">
                  Throughput and latency change between the unsharded baseline and the 64-shard architecture.
                  Multi-client workloads show the largest gains because requests for distinct clients execute
                  on independent shard mutexes concurrently.
                </BodyText>
              </div>

              <TableWrap>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-strong)' }}>
                    <Th>Algorithm</Th>
                    <Th>Scenario</Th>
                    <Th right>Baseline (ops/s)</Th>
                    <Th right>Final (ops/s)</Th>
                    <Th right>Throughput Δ</Th>
                    <Th right>Baseline Latency</Th>
                    <Th right>Final Latency</Th>
                    <Th right>Speedup</Th>
                  </tr>
                </thead>
                <tbody>
                  {comparable.map(({ name, scenario, baseline, final: fin, comparison: cmp }, i) => {
                    const highGain = cmp.speedup_factor >= 5
                    return (
                      <tr
                        key={i}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          backgroundColor: highGain ? 'rgba(255,255,255,0.025)' : 'transparent',
                        }}
                      >
                        <Td primary>{name}</Td>
                        <Td>{scenario}</Td>
                        <Td right mono>{fmtInt(baseline.throughput_ops_sec)}</Td>
                        <Td right mono primary>{fmtInt(fin.throughput_ops_sec)}</Td>
                        <td
                          className="px-4 py-3 text-right tabular-nums text-sm font-semibold"
                          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}
                        >
                          {fmtPct(cmp.throughput_change_pct)}
                        </td>
                        <Td right mono dim>{fmtLatency(baseline.avg_latency_ns)}</Td>
                        <Td right mono>{fmtLatency(fin.avg_latency_ns)}</Td>
                        <td
                          className="px-4 py-3 text-right tabular-nums text-sm font-bold"
                          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}
                        >
                          {fmtX(cmp.speedup_factor)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </TableWrap>

              {/* Redis non-comparable notice */}
              {nonComparable.length > 0 && (
                <p className="mt-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Redis Token Bucket is excluded from this table — see the Distributed section below.
                </p>
              )}
            </div>
          </Section>

          {/* ── Redis Distributed ───────────────────────────────────── */}
          <Section id="distributed" border>
            <div style={MAX_W}>
              <SectionLabel>Distributed</SectionLabel>
              <SectionHeading className="mb-3">Redis Token Bucket</SectionHeading>
              <div style={PROSE}>
                <BodyText className="mb-6">
                  The Redis Token Bucket executes over IPC sockets and runs an atomic server-side Lua script
                  on Redis. Latency reflects socket round-trips, kernel scheduling, and Redis execution — not
                  the rate-limiting algorithm itself. It is not a direct performance alternative to in-memory
                  limiters; it enables cross-server quota sharing at the cost of network latency.
                </BodyText>
              </div>

              {redis && (
                <div
                  className="rounded p-6"
                  style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}
                >
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 mb-5">
                    {[
                      ['Total Ops', fmtInt(redis.total_ops)],
                      ['Allowed', fmtInt(redis.allowed_ops)],
                      ['Denied', fmtInt(redis.denied_ops)],
                      ['Duration', `${fmtDec(redis.duration_ms, 2)} ms`],
                      ['Throughput', `${fmtInt(redis.throughput_ops_sec)} ops/s`],
                      ['Avg Latency', fmtLatency(redis.avg_latency_ns)],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <span className="text-xs uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>{k}</span>
                        <span className="text-base font-semibold tabular-nums block mt-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <p
                    className="text-xs leading-relaxed pt-4"
                    style={{ borderTop: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  >
                    At {fmtLatency(redis.avg_latency_ns)} average latency, execution is dominated by socket IPC and Redis
                    single-threaded Lua interpretation. This is the expected cost of cross-server rate limit coordination,
                    not an implementation deficiency.
                  </p>
                </div>
              )}
            </div>
          </Section>

          {/* ── Observations ────────────────────────────────────────── */}
          <Section id="observations" border>
            <div style={MAX_W}>
              <SectionLabel>Analysis</SectionLabel>
              <SectionHeading className="mb-6">Key Observations</SectionHeading>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded p-5" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Multi-Client Concurrency Scaling
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {maxSpeedup ? (
                      <>
                        Sharding delivers up to{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>{fmtX(maxSpeedup.comparison.speedup_factor)}</strong> throughput
                        improvement in multi-client workloads ({maxSpeedup.name},{' '}
                        <strong style={{ color: 'var(--text-primary)' }}>{fmtInt(maxSpeedup.final.throughput_ops_sec)} ops/s</strong>).
                      </>
                    ) : 'Sharding delivers significant throughput improvement in multi-client workloads.'}
                    {' '}Independent clients hash to separate shards and execute on separate CPU cores without contention.
                  </p>
                </div>

                <div className="rounded p-5" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Same-Client Serialization
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    When all 8 threads target the same client ID, all requests route to one shard and serialize
                    on that mutex. Throughput plateaus at ~949K–1.5M ops/sec. This is correct behavior —
                    same-client state must be accessed sequentially to preserve consistency.
                  </p>
                </div>

                <div className="rounded p-5" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Algorithm Trade-offs
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Fixed Window reaches the highest throughput (31.7M ops/s in multi-client) due to simple
                    integer arithmetic. Sliding Window Counter achieves 23.0M ops/s with O(1) memory and no
                    boundary burst anomaly. Sliding Window Log runs ~32% slower due to per-request timestamp
                    allocation, but provides exact sliding-window enforcement.
                  </p>
                </div>

                <div className="rounded p-5" style={{ border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)' }}>
                  <h4 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                    Redis vs. In-Memory
                  </h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Redis latency (~81 µs) is roughly 1,700× higher than in-memory execution (~47 ns). The
                    overhead comes from IPC and socket round-trips, not from the token bucket algorithm itself.
                    Redis enables cross-server quota enforcement that in-memory limiters cannot provide.
                  </p>
                </div>
              </div>
            </div>
          </Section>
        </>
      )}

    </main>
  )
}
