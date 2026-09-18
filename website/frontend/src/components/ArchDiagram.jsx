/**
 * Architecture Diagram Components
 *
 * Four purpose-built, self-contained diagram components:
 *   - InMemoryPipeline      — request → shard → algorithm → result
 *   - ConcurrentClientsDiagram  — Client A → Shard X, Client B → Shard Y (parallel)
 *   - SameClientDiagram     — two threads, same shard, serialized (bracket SVG)
 *   - RedisDiagram          — application → Lua script → Redis State → result
 *
 * Internal layout primitives (not exported):
 *   - Node        — single bordered box
 *   - HConn       — horizontal connector with optional label above line
 *   - VConn       — vertical connector with optional label to the right
 *
 * Design rules:
 *   - No flex-wrap in any diagram. Each layout is explicit.
 *   - Node labels never touch borders (min 16px horizontal, 12px vertical padding).
 *   - Connector labels live in a dedicated area; they never overlap a node edge.
 *   - Arrow lines use border-strong color so they read clearly on dark bg.
 *   - All pixel values are chosen to fit the 1100px container after card padding.
 */

/* ── Design-system token shortcuts ──────────────────────────────────── */
const C = {
  bg:       'var(--bg-surface)',
  bgHl:     'var(--bg-subtle)',
  border:   'var(--border)',
  borderHl: 'var(--border-strong)',
  text:     'var(--text-secondary)',
  textHl:   'var(--text-primary)',
  muted:    'var(--text-muted)',
  mono:     'var(--font-mono)',
}

/* ── Node ────────────────────────────────────────────────────────────── */
/**
 * Single bordered box.
 * padding: 12px top/bottom (vertical), 20px left/right (horizontal).
 * Estimated rendered height (with sub): ~62px. Without sub: ~43px.
 */
function Node({ label, sub, highlight = false, mono = false, style = {} }) {
  return (
    <div style={{
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      textAlign:       'center',
      padding:         '12px 20px',
      borderRadius:    '4px',
      border:          `1px solid ${highlight ? C.borderHl : C.border}`,
      backgroundColor: highlight ? C.bgHl : C.bg,
      flexShrink:      0,
      ...style,
    }}>
      <span style={{
        fontSize:   '13px',
        fontWeight: 500,
        lineHeight: 1.35,
        color:      highlight ? C.textHl : C.text,
        fontFamily: mono ? C.mono : 'inherit',
      }}>
        {label}
      </span>
      {sub && (
        <span style={{
          display:    'block',
          marginTop:  '4px',
          fontSize:   '11px',
          lineHeight: 1.3,
          color:      C.muted,
          fontFamily: C.mono,
        }}>
          {sub}
        </span>
      )}
    </div>
  )
}

/* ── HConn (Horizontal Connector) ────────────────────────────────────── */
/**
 * Horizontal connector: label lives ABOVE the arrow line in a dedicated slot.
 * Total width: labelSlotWidth (default 80px). Label is centered in that slot.
 * The line + arrowhead occupy the full width.
 *
 * This prevents the label from colliding with adjacent node borders because
 * the connector has an explicit, fixed width that the diagram accounts for.
 */
function HConn({ label, width = 80 }) {
  const LINE_W = width - 9  // 9px reserved for SVG arrowhead
  return (
    <div style={{
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      width:          `${width}px`,
      gap:            '5px',
      flexShrink:     0,
    }}>
      {/* Label slot — always present to keep vertical alignment stable */}
      <span style={{
        fontSize:    '10px',
        color:       label ? C.muted : 'transparent',
        fontFamily:  C.mono,
        whiteSpace:  'nowrap',
        userSelect:  'none',
        letterSpacing: '0.02em',
        maxWidth:    `${width}px`,
        overflow:    'hidden',
        textOverflow: 'ellipsis',
        textAlign:   'center',
        lineHeight:  1.2,
      }}>
        {label || '·'}
      </span>
      {/* Arrow line + head */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ width: `${LINE_W}px`, height: '1px', backgroundColor: C.borderHl }} />
        <svg width="9" height="7" viewBox="0 0 9 7" aria-hidden="true"
             style={{ color: C.borderHl, flexShrink: 0 }}>
          <path d="M0 3.5 L9 3.5 M5 0.5 L9 3.5 L5 6.5"
                stroke="currentColor" strokeWidth="1.3" fill="none"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

/* ── VConn (Vertical Connector) ──────────────────────────────────────── */
/**
 * Vertical connector: label lives to the RIGHT of the arrow line.
 * The pipeline column stays centered; label does not shift nodes.
 * Height: line (22px) + arrowhead (6px) + padding (4px top/bot) ≈ 36px.
 */
function VConn({ label }) {
  return (
    <div style={{
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '2px 0',
      gap:            '10px',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{ width: '1px', height: '22px', backgroundColor: C.borderHl }} />
        <svg width="8" height="6" viewBox="0 0 8 6" aria-hidden="true"
             style={{ color: C.borderHl, marginTop: '-1px', flexShrink: 0 }}>
          <path d="M4 0 L4 6 M1 3 L4 6 L7 3"
                stroke="currentColor" strokeWidth="1.3" fill="none"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {label && (
        <span style={{
          fontSize:    '10px',
          color:       C.muted,
          fontFamily:  C.mono,
          whiteSpace:  'nowrap',
          letterSpacing: '0.02em',
          lineHeight:  1.2,
        }}>
          {label}
        </span>
      )}
    </div>
  )
}

/* ── Sub-diagram title ───────────────────────────────────────────────── */
function SubTitle({ children }) {
  return (
    <p style={{
      marginBottom:    '20px',
      textAlign:       'center',
      fontSize:        '11px',
      textTransform:   'uppercase',
      letterSpacing:   '0.14em',
      color:           C.text,
      fontFamily:      C.mono,
    }}>
      {children}
    </p>
  )
}

/* ── Annotation ──────────────────────────────────────────────────────── */
function Annotation({ children, mt = 10 }) {
  return (
    <p style={{
      marginTop:     `${mt}px`,
      marginBottom:  0,
      textAlign:     'center',
      fontSize:      '11px',
      color:         C.muted,
      fontFamily:    C.mono,
      letterSpacing: '0.02em',
      lineHeight:    1.4,
    }}>
      {children}
    </p>
  )
}

/* ── Divider ─────────────────────────────────────────────────────────── */
function Divider() {
  return (
    <div style={{ margin: '32px 0', height: '1px', backgroundColor: C.border }} />
  )
}

/* ══════════════════════════════════════════════════════════════════════
   A. InMemoryPipeline
   Desktop (≥lg): 5 nodes in a single non-wrapping horizontal row.
   Node widths are explicit so total width ≤ 1052px (1100px – 48px padding).

   Budget at lg (content width ≈ 1052px):
     Nodes: ~148 + 130 + 148 + 148 + 110 = 684px
     HConn: 4 × 92px = 368px
     Total: 684 + 368 = 1052px ✓

   Mobile/tablet (<lg): vertical pipeline.
══════════════════════════════════════════════════════════════════════ */
export function InMemoryPipeline() {
  return (
    <div role="img" aria-label="In-memory request pipeline diagram">
      <SubTitle>In-Memory Sharded Pipeline</SubTitle>

      {/* Desktop: single horizontal row, no wrapping */}
      <div className="hidden lg:flex" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <Node label="Application Request" sub="allow(clientId)" style={{ width: '148px' }} />
        <HConn label="hash(clientId) % 64" width={92} />
        <Node label="One of 64 Shards" highlight style={{ width: '130px' }} />
        <HConn label="lock mutex" width={92} />
        <Node label="Shard Mutex + State" sub="std::mutex + client map" highlight style={{ width: '148px' }} />
        <HConn label="eval algorithm" width={92} />
        <Node label="Rate-Limit Algorithm" sub="Fixed / Sliding / Token" style={{ width: '148px' }} />
        <HConn label="return result" width={92} />
        <Node label="Allow / Deny" mono style={{ width: '110px' }} />
      </div>

      {/* Mobile + tablet: vertical pipeline, centered */}
      <div className="lg:hidden" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Node label="Application Request" sub="allow(clientId)" />
        <VConn label="hash(clientId) % 64" />
        <Node label="One of 64 Shards" highlight />
        <VConn label="lock mutex" />
        <Node label="Shard Mutex + State" sub="std::mutex + client map" highlight />
        <VConn label="eval algorithm" />
        <Node label="Rate-Limit Algorithm" sub="Fixed / Sliding / Token" />
        <VConn label="return result" />
        <Node label="Allow / Deny" mono />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   B. ConcurrentClientsDiagram
   Two horizontal rows (Client A and Client B) stacked vertically.
   An annotation between them explains the parallel execution model.
   Works at all screen sizes — each row is compact (3 nodes + 2 connectors).
══════════════════════════════════════════════════════════════════════ */
export function ConcurrentClientsDiagram() {
  return (
    <div role="img" aria-label="Concurrent multi-client isolation diagram">
      <SubTitle>Concurrent Multi-Client Isolation</SubTitle>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        {/* Row A */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Node label="Client A" sub="Thread 1" mono />
          <HConn label="hash → Shard X" width={100} />
          <Node label="Shard X" sub="Mutex X" highlight />
          <HConn width={68} />
          <Node label="Allow / Deny" sub="Result A" mono />
        </div>

        <Annotation mt={10}>independent shards → parallel execution</Annotation>

        {/* Row B */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '10px' }}>
          <Node label="Client B" sub="Thread 2" mono />
          <HConn label="hash → Shard Y" width={100} />
          <Node label="Shard Y" sub="Mutex Y" highlight />
          <HConn width={68} />
          <Node label="Allow / Deny" sub="Result B" mono />
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   C. SameClientDiagram
   Desktop (≥md): two input nodes stacked left, a bracket SVG with
   converging lines, shard node centered, output connector + result node.
   The bracket SVG geometry is calculated from known node dimensions:
     Node height (with sub): padding(12) + label(18) + gap(4) + sub(14) + padding(12) = 60px
     Two-node stack height: 60 + 16(gap) + 60 = 136px
     Top node center Y: 30px
     Bottom node center Y: 106px
     Midpoint Y: 68px

   Mobile (<md): a top-converging SVG above a vertical pipeline.
══════════════════════════════════════════════════════════════════════ */

/** Bracket SVG: two inputs fan-in to one center output arrow. */
function BracketSVG() {
  const H    = 136  // total height = two node heights + gap
  const topY = 30   // center of top node
  const botY = 106  // center of bottom node
  const midY = 68   // midpoint between centers
  const vx   = 32   // x of vertical bracket bar
  const W    = 50   // total SVG width (bracket + arrow space)

  return (
    <svg width={W} height={H} style={{ flexShrink: 0 }} aria-hidden="true">
      {/* Top horizontal branch */}
      <line x1="0" y1={topY} x2={vx} y2={topY}
            stroke={C.borderHl} strokeWidth="1" />
      {/* Bottom horizontal branch */}
      <line x1="0" y1={botY} x2={vx} y2={botY}
            stroke={C.borderHl} strokeWidth="1" />
      {/* Vertical bracket bar */}
      <line x1={vx} y1={topY} x2={vx} y2={botY}
            stroke={C.borderHl} strokeWidth="1" />
      {/* Horizontal from bracket midpoint to arrowhead */}
      <line x1={vx} y1={midY} x2={W - 10} y2={midY}
            stroke={C.borderHl} strokeWidth="1" />
      {/* Arrowhead */}
      <path d={`M ${W - 15} ${midY - 4} L ${W - 9} ${midY} L ${W - 15} ${midY + 4}`}
            stroke={C.borderHl} strokeWidth="1.3" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Top-converging SVG for mobile: two diagonal curves meet at bottom center. */
function ConvergeSVG() {
  // Fixed geometry; parent constrains to max-width: 280px.
  // Left node center: x=64 (within 128px half); right: x=216 (128px half at 152px offset)
  const W = 280, H = 36
  const lx = 64, rx = 216, mx = W / 2

  return (
    <svg width={W} height={H} style={{ display: 'block' }} aria-hidden="true">
      <path d={`M ${lx} 0 C ${lx} ${H}, ${mx} ${H * 0.4}, ${mx} ${H}`}
            stroke={C.borderHl} strokeWidth="1" fill="none" strokeLinecap="round" />
      <path d={`M ${rx} 0 C ${rx} ${H}, ${mx} ${H * 0.4}, ${mx} ${H}`}
            stroke={C.borderHl} strokeWidth="1" fill="none" strokeLinecap="round" />
      {/* Arrowhead at bottom center */}
      <path d={`M ${mx - 4} ${H - 7} L ${mx} ${H} L ${mx + 4} ${H - 7}`}
            stroke={C.borderHl} strokeWidth="1.3" fill="none"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function SameClientDiagram() {
  return (
    <div role="img" aria-label="Same-client serialization diagram">
      <SubTitle>Same-Client Serialization</SubTitle>

      {/* ── Desktop (≥md): bracket layout ── */}
      <div className="hidden md:flex" style={{ alignItems: 'center', justifyContent: 'center' }}>
        {/* Two stacked input nodes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Node label="Client C" sub="Thread 3" mono />
          <Node label="Client C" sub="Thread 4" mono />
        </div>

        {/* Bracket SVG — centers itself vertically against the two-node stack */}
        <BracketSVG />

        {/* Shard — centered via parent align-items: center */}
        <Node label="Shard Z" sub="Mutex Z" highlight />

        {/* Output */}
        <HConn label="sequential" width={88} />
        <Node label="Allow / Deny" sub="both requests" mono />
      </div>

      <Annotation mt={12}>same client → same shard → serialized access</Annotation>

      {/* ── Mobile (<md): top-converging layout ── */}
      <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '24px' }}>
        {/* Two input nodes side by side, max-width constrains to 280px */}
        <div style={{ display: 'flex', width: '280px', gap: '24px' }}>
          <div style={{ flex: 1 }}><Node label="Client C" sub="Thread 3" mono /></div>
          <div style={{ flex: 1 }}><Node label="Client C" sub="Thread 4" mono /></div>
        </div>
        {/* Converging SVG below the two nodes */}
        <ConvergeSVG />
        {/* Shard node */}
        <Node label="Shard Z" sub="Mutex Z" highlight />
        <VConn label="sequential" />
        <Node label="Allow / Deny" sub="both requests" mono />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   D. RedisDiagram
   Always vertical — makes the network-hop overhead clear by showing
   each step as a distinct pipeline stage below the previous one.
   Desktop centers the pipeline and keeps it compact.
══════════════════════════════════════════════════════════════════════ */
export function RedisDiagram() {
  return (
    <div role="img" aria-label="Distributed Redis path diagram">
      <SubTitle>Distributed Redis Path</SubTitle>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Node label="Application Host" />
        <VConn label="hiredis / network IPC" />
        <Node label="Atomic Lua Script" sub="Redis TIME — clock-drift safe" highlight />
        <VConn label="eval + update" />
        <Node label="Shared Redis State" sub="cross-server quota keys" highlight />
        <VConn label="return decision" />
        <Node label="Allow / Deny" mono />
      </div>

      <Annotation mt={12}>
        Redis enables cross-server quota sharing · latency ~81 µs vs ~47 ns in-memory
      </Annotation>
    </div>
  )
}

/* ── Legacy re-exports for any file that still imports ArchDiagram ─── */
/** @deprecated Use InMemoryPipeline, ConcurrentClientsDiagram, etc. instead. */
export function ArchNode(props) { return <Node {...props} /> }
/** @deprecated */
export function ArchArrow() { return null }
/** @deprecated */
export function ArchRow({ children }) { return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div> }
/** @deprecated */
export function ArchPipeline({ children }) { return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>{children}</div> }
