/**
 * ArchNode
 *
 * A single node/box in an architecture diagram.
 *
 * Props:
 *   label     — main label text
 *   sub       — small secondary line below label
 *   highlight — if true, uses stronger border contrast
 *   mono      — if true, renders label in monospace
 */
export function ArchNode({ label, sub, highlight = false, mono = false }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded px-5 py-3 text-center"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: `1px solid ${highlight ? 'var(--border-strong)' : 'var(--border)'}`,
        minWidth: '130px',
      }}
    >
      <span
        className="text-sm font-medium"
        style={{
          color: 'var(--text-primary)',
          fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        }}
      >
        {label}
      </span>
      {sub && (
        <span
          className="mt-1 text-xs"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {sub}
        </span>
      )}
    </div>
  )
}

/**
 * ArchArrow
 *
 * A directional arrow connector between ArchNodes.
 * Renders a horizontal arrow line with optional label.
 *
 * Props:
 *   label  — optional small label above the arrow
 */
export function ArchArrow({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-2">
      {label && (
        <span
          className="text-xs"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {label}
        </span>
      )}
      <div className="flex items-center">
        <div
          className="h-px w-10"
          style={{ backgroundColor: 'var(--border)' }}
        />
        <svg
          width="8"
          height="8"
          viewBox="0 0 8 8"
          aria-hidden="true"
          style={{ color: 'var(--text-muted)', flexShrink: 0 }}
        >
          <path
            d="M0 4 L8 4 M5 1 L8 4 L5 7"
            stroke="currentColor"
            strokeWidth="1.2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

/**
 * ArchDiagram
 *
 * Wrapper that lays out ArchNodes and ArchArrows horizontally (desktop)
 * or vertically (mobile).
 */
export function ArchDiagram({ children }) {
  return (
    <div
      className="flex flex-wrap items-center justify-center gap-2"
      role="img"
      aria-label="Architecture diagram"
    >
      {children}
    </div>
  )
}
