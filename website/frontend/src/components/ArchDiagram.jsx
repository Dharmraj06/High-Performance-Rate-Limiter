/**
 * ArchNode
 *
 * A single node/box in an architecture diagram.
 *
 * Props:
 *   label     — main label text
 *   sub       — small secondary line below label
 *   highlight — if true, uses stronger border contrast + subtle bg
 *   mono      — if true, renders label in monospace
 *   className — additional class names
 *   width     — optional explicit width class (e.g. 'w-40')
 */
export function ArchNode({ label, sub, highlight = false, mono = false, className = '', width = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded px-5 py-3.5 text-center ${width} ${className}`}
      style={{
        backgroundColor: highlight ? 'var(--bg-subtle)' : 'var(--bg-surface)',
        border: `1px solid ${highlight ? 'var(--border-strong)' : 'var(--border)'}`,
        minWidth: '9rem',
      }}
    >
      <span
        className="text-sm font-medium leading-snug"
        style={{
          color: highlight ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontFamily: mono ? 'var(--font-mono)' : 'inherit',
        }}
      >
        {label}
      </span>
      {sub && (
        <span
          className="mt-1.5 text-xs leading-snug"
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
 *
 * Props:
 *   label     — optional small label above (horizontal) or before (vertical) the arrow
 *   direction — 'right' | 'down' (default: 'right')
 */
export function ArchArrow({ label, direction = 'right' }) {
  if (direction === 'down') {
    return (
      <div className="flex flex-col items-center py-1.5">
        {label && (
          <span
            className="mb-1.5 text-xs leading-none"
            style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
          >
            {label}
          </span>
        )}
        <div className="flex flex-col items-center">
          <div
            className="w-px h-6"
            style={{ backgroundColor: 'var(--border-strong)' }}
          />
          <svg
            width="9"
            height="7"
            viewBox="0 0 9 7"
            aria-hidden="true"
            style={{ color: 'var(--text-muted)', marginTop: '-1px' }}
          >
            <path
              d="M4.5 0 L4.5 7 M1.5 4 L4.5 7 L7.5 4"
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

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 px-3">
      {label && (
        <span
          className="text-xs leading-none whitespace-nowrap"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          {label}
        </span>
      )}
      <div className="flex items-center">
        <div
          className="h-px w-8"
          style={{ backgroundColor: 'var(--border-strong)' }}
        />
        <svg
          width="9"
          height="7"
          viewBox="0 0 9 7"
          aria-hidden="true"
          style={{ color: 'var(--text-muted)', flexShrink: 0 }}
        >
          <path
            d="M0 3.5 L9 3.5 M5.5 0.5 L9 3.5 L5.5 6.5"
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
 * ArchPipeline
 *
 * Lays out ArchNodes + ArchArrows in a single vertical column.
 * Used for both the mobile fallback and for vertical-layout diagrams.
 * Children should be ArchNode and ArchArrow elements.
 */
export function ArchPipeline({ children, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center ${className}`}
      role="img"
      aria-label="Architecture diagram"
    >
      {children}
    </div>
  )
}

/**
 * ArchRow
 *
 * Lays out ArchNodes + ArchArrows in a single horizontal row.
 * Content that overflows will NOT wrap — use this only when you know
 * the total width fits. For responsive use, hide/show with Tailwind.
 */
export function ArchRow({ children, className = '' }) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      role="img"
      aria-label="Architecture diagram"
    >
      {children}
    </div>
  )
}

/**
 * ArchDiagram — kept for backward compat, renders a horizontal row.
 * @deprecated Use ArchRow or ArchPipeline directly.
 */
export function ArchDiagram({ children, className = '' }) {
  return (
    <ArchRow className={className}>
      {children}
    </ArchRow>
  )
}
